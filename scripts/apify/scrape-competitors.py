#!/usr/bin/env python3
"""
Apify Competitor Content Scraper for Jackson's Operation

Scrapes competitor Instagram, YouTube, and TikTok content via Apify actors
and loads it into SQLite (and optionally Supabase).

Competitors:
  Business:  @ifstanwasrich, @officialjaymaska
  Content:   higherupwellness, JuulianBecerra, SantaCruzmedicinals

Usage:
  python3 scripts/apify/scrape-competitors.py --platform instagram
  python3 scripts/apify/scrape-competitors.py --platform youtube
  python3 scripts/apify/scrape-competitors.py --platform tiktok
  python3 scripts/apify/scrape-competitors.py --all
  python3 scripts/apify/scrape-competitors.py --competitor ifstanwasrich --platform instagram

Env vars required:
  APIFY_API_TOKEN  -- your Apify API token

Optional:
  SUPABASE_URL, SUPABASE_SERVICE_KEY  -- for cloud sync
"""

import argparse
import json
import os
import sqlite3
import ssl
import sys
import time
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

try:
    import certifi
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSL_CONTEXT = ssl.create_default_context()

# ── Config ──────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DB_PATH = PROJECT_ROOT / "store" / "rawclaw.db"
ENV_PATH = PROJECT_ROOT / ".env"

APIFY_BASE = "https://api.apify.com/v2"

# Apify actor IDs -- use tilde format (username~actor-name)
ACTORS = {
    "instagram": "apify~instagram-scraper",
    "youtube": "streamers~youtube-scraper",
    "tiktok": "clockworks~tiktok-scraper",
}

# Jackson's competitors
COMPETITORS = {
    # Business competitors
    "ifstanwasrich": {
        "type": "business",
        "instagram": "ifstanwasrich",
        "youtube": "@ifstanwasrich",
        "tiktok": "ifstanwasrich",
    },
    "officialjaymaska": {
        "type": "business",
        "instagram": "officialjaymaska",
        "youtube": "@officialjaymaska",
        "tiktok": "officialjaymaska",
    },
    # Content competitors
    "higherupwellness": {
        "type": "content",
        "instagram": "higherupwellness",
        "youtube": "@higherupwellness",
        "tiktok": "higherupwellness",
    },
    "juulianbecerra": {
        "type": "content",
        "instagram": "JuulianBecerra",
        "youtube": "@JuulianBecerra",
        "tiktok": "juulianbecerra",
    },
    "santacruzmedicinals": {
        "type": "content",
        "instagram": "santacruzmedicinals",
        "youtube": "@SantaCruzMedicinals",
        "tiktok": "santacruzmedicinals",
    },
}


# ── Helpers ─────────────────────────────────────────────────────────

def load_env():
    """Load .env file into environment."""
    if ENV_PATH.exists():
        with open(ENV_PATH) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def apify_request(method, path, body=None):
    """Make a request to the Apify API."""
    token = os.environ.get("APIFY_API_TOKEN")
    if not token:
        print("ERROR: APIFY_API_TOKEN not set. Add it to your .env file.")
        sys.exit(1)

    url = f"{APIFY_BASE}{path}?token={token}"
    headers = {"Content-Type": "application/json"}
    data = json.dumps(body).encode() if body else None

    req = Request(url, data=data, headers=headers, method=method)
    try:
        with urlopen(req, timeout=120, context=SSL_CONTEXT) as resp:
            return json.loads(resp.read().decode())
    except HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        print(f"Apify API error {e.code}: {error_body}")
        sys.exit(1)
    except URLError as e:
        print(f"Network error: {e.reason}")
        sys.exit(1)


def run_actor(actor_id, input_data):
    """Run an Apify actor and wait for results."""
    print(f"  Starting actor: {actor_id}")
    result = apify_request("POST", f"/acts/{actor_id}/runs", input_data)
    run_id = result["data"]["id"]
    dataset_id = result["data"]["defaultDatasetId"]

    # Poll for completion
    while True:
        status = apify_request("GET", f"/acts/{actor_id}/runs/{run_id}")
        state = status["data"]["status"]
        if state in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"):
            break
        print(f"  Status: {state}... waiting")
        time.sleep(10)

    if state != "SUCCEEDED":
        print(f"  Actor run {state}. Skipping.")
        return []

    # Fetch dataset items
    items = apify_request("GET", f"/datasets/{dataset_id}/items")
    print(f"  Got {len(items)} items")
    return items


# ── Database ────────────────────────────────────────────────────────

def init_db():
    """Create competitor_content table if it doesn't exist."""
    db = sqlite3.connect(str(DB_PATH))
    db.execute("""
        CREATE TABLE IF NOT EXISTS competitor_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            competitor TEXT NOT NULL,
            competitor_type TEXT NOT NULL,
            platform TEXT NOT NULL,
            post_id TEXT,
            post_url TEXT,
            post_type TEXT,
            caption TEXT,
            description TEXT,
            hashtags TEXT,
            likes INTEGER DEFAULT 0,
            comments INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            shares INTEGER DEFAULT 0,
            engagement_rate REAL DEFAULT 0,
            posted_at TEXT,
            scraped_at TEXT NOT NULL,
            thumbnail_url TEXT,
            duration_seconds INTEGER,
            raw_data TEXT,
            UNIQUE(competitor, platform, post_id)
        )
    """)
    db.execute("""
        CREATE INDEX IF NOT EXISTS idx_competitor_content_competitor
        ON competitor_content(competitor)
    """)
    db.execute("""
        CREATE INDEX IF NOT EXISTS idx_competitor_content_platform
        ON competitor_content(platform)
    """)
    db.execute("""
        CREATE INDEX IF NOT EXISTS idx_competitor_content_engagement
        ON competitor_content(engagement_rate DESC)
    """)
    db.commit()
    return db


def insert_content(db, rows):
    """Insert scraped content into the database."""
    inserted = 0
    for row in rows:
        try:
            db.execute("""
                INSERT OR REPLACE INTO competitor_content
                (competitor, competitor_type, platform, post_id, post_url, post_type,
                 caption, description, hashtags, likes, comments, views, shares,
                 engagement_rate, posted_at, scraped_at, thumbnail_url,
                 duration_seconds, raw_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row["competitor"], row["competitor_type"], row["platform"],
                row.get("post_id", ""), row.get("post_url", ""),
                row.get("post_type", ""), row.get("caption", ""),
                row.get("description", ""), row.get("hashtags", ""),
                row.get("likes", 0), row.get("comments", 0),
                row.get("views", 0), row.get("shares", 0),
                row.get("engagement_rate", 0), row.get("posted_at", ""),
                row["scraped_at"], row.get("thumbnail_url", ""),
                row.get("duration_seconds"), row.get("raw_data", ""),
            ))
            inserted += 1
        except sqlite3.Error as e:
            print(f"  DB error: {e}")
    db.commit()
    return inserted


# ── Platform Scrapers ───────────────────────────────────────────────

def scrape_instagram(competitor_key, competitor_info):
    """Scrape Instagram posts for a competitor."""
    handle = competitor_info["instagram"]
    print(f"\n[Instagram] Scraping @{handle}...")

    input_data = {
        "directUrls": [f"https://www.instagram.com/{handle}/"],
        "resultsType": "posts",
        "resultsLimit": 50,
        "searchType": "hashtag",
        "searchLimit": 1,
    }

    items = run_actor(ACTORS["instagram"], input_data)
    now = datetime.utcnow().isoformat()

    rows = []
    for item in items:
        likes = item.get("likesCount", 0) or 0
        comments_count = item.get("commentsCount", 0) or 0
        views = item.get("videoViewCount", 0) or item.get("videoPlayCount", 0) or 0
        followers = item.get("ownerFollowerCount", 1) or 1

        total_engagement = likes + comments_count
        engagement_rate = (total_engagement / followers * 100) if followers > 0 else 0

        rows.append({
            "competitor": competitor_key,
            "competitor_type": competitor_info["type"],
            "platform": "instagram",
            "post_id": item.get("id", ""),
            "post_url": item.get("url", ""),
            "post_type": item.get("type", ""),
            "caption": (item.get("caption", "") or "")[:2000],
            "description": "",
            "hashtags": json.dumps(item.get("hashtags", [])),
            "likes": likes,
            "comments": comments_count,
            "views": views,
            "shares": 0,
            "engagement_rate": round(engagement_rate, 4),
            "posted_at": item.get("timestamp", ""),
            "scraped_at": now,
            "thumbnail_url": item.get("displayUrl", ""),
            "duration_seconds": item.get("videoDuration"),
            "raw_data": json.dumps(item),
        })

    return rows


def scrape_youtube(competitor_key, competitor_info):
    """Scrape YouTube videos for a competitor."""
    handle = competitor_info.get("youtube", "")
    if not handle:
        print(f"  No YouTube handle for {competitor_key}, skipping")
        return []

    print(f"\n[YouTube] Scraping {handle}...")

    input_data = {
        "startUrls": [{"url": f"https://www.youtube.com/{handle}/videos"}],
        "maxResults": 50,
        "maxResultsShorts": 20,
    }

    items = run_actor(ACTORS["youtube"], input_data)
    now = datetime.utcnow().isoformat()

    rows = []
    for item in items:
        views = item.get("viewCount", 0) or 0
        likes = item.get("likes", 0) or 0
        comments_count = item.get("commentsCount", 0) or 0

        total_engagement = likes + comments_count
        engagement_rate = (total_engagement / views * 100) if views > 0 else 0

        rows.append({
            "competitor": competitor_key,
            "competitor_type": competitor_info["type"],
            "platform": "youtube",
            "post_id": item.get("id", ""),
            "post_url": item.get("url", ""),
            "post_type": "short" if item.get("isShort") else "video",
            "caption": (item.get("title", "") or "")[:500],
            "description": (item.get("description", "") or "")[:2000],
            "hashtags": json.dumps(item.get("hashtags", [])),
            "likes": likes,
            "comments": comments_count,
            "views": views,
            "shares": 0,
            "engagement_rate": round(engagement_rate, 4),
            "posted_at": item.get("date", ""),
            "scraped_at": now,
            "thumbnail_url": item.get("thumbnailUrl", ""),
            "duration_seconds": item.get("duration"),
            "raw_data": json.dumps(item),
        })

    return rows


def scrape_tiktok(competitor_key, competitor_info):
    """Scrape TikTok videos for a competitor."""
    handle = competitor_info.get("tiktok", "")
    if not handle:
        print(f"  No TikTok handle for {competitor_key}, skipping")
        return []

    print(f"\n[TikTok] Scraping @{handle}...")

    input_data = {
        "profiles": [handle],
        "resultsPerPage": 50,
        "shouldDownloadVideos": False,
    }

    items = run_actor(ACTORS["tiktok"], input_data)
    now = datetime.utcnow().isoformat()

    rows = []
    for item in items:
        views = item.get("playCount", 0) or 0
        likes = item.get("diggCount", 0) or 0
        comments_count = item.get("commentCount", 0) or 0
        shares = item.get("shareCount", 0) or 0

        total_engagement = likes + comments_count + shares
        engagement_rate = (total_engagement / views * 100) if views > 0 else 0

        rows.append({
            "competitor": competitor_key,
            "competitor_type": competitor_info["type"],
            "platform": "tiktok",
            "post_id": item.get("id", ""),
            "post_url": item.get("webVideoUrl", ""),
            "post_type": "video",
            "caption": (item.get("text", "") or "")[:2000],
            "description": "",
            "hashtags": json.dumps([h.get("name", "") for h in item.get("hashtags", [])]),
            "likes": likes,
            "comments": comments_count,
            "views": views,
            "shares": shares,
            "engagement_rate": round(engagement_rate, 4),
            "posted_at": datetime.fromtimestamp(item.get("createTime", 0)).isoformat() if item.get("createTime") else "",
            "scraped_at": now,
            "thumbnail_url": item.get("covers", {}).get("default", ""),
            "duration_seconds": item.get("videoMeta", {}).get("duration"),
            "raw_data": json.dumps(item),
        })

    return rows


# ── Analysis ────────────────────────────────────────────────────────

def print_summary(db, competitor=None):
    """Print a summary of scraped content."""
    where = f"WHERE competitor = '{competitor}'" if competitor else ""

    print("\n" + "=" * 60)
    print("SCRAPE SUMMARY")
    print("=" * 60)

    cursor = db.execute(f"""
        SELECT competitor, platform, COUNT(*) as posts,
               SUM(likes) as total_likes, SUM(views) as total_views,
               ROUND(AVG(engagement_rate), 2) as avg_engagement
        FROM competitor_content {where}
        GROUP BY competitor, platform
        ORDER BY competitor, platform
    """)

    current_competitor = None
    for row in cursor:
        comp, platform, posts, likes, views, eng = row
        if comp != current_competitor:
            print(f"\n  {comp} ({COMPETITORS.get(comp, {}).get('type', 'unknown')})")
            current_competitor = comp
        print(f"    {platform:12s}  {posts:4d} posts | {likes or 0:8,} likes | {views or 0:10,} views | {eng or 0:.2f}% avg engagement")

    # Top performers
    print(f"\n{'TOP 10 BY ENGAGEMENT':=^60}")
    cursor = db.execute(f"""
        SELECT competitor, platform, caption, engagement_rate, likes, views, post_url
        FROM competitor_content {where}
        WHERE engagement_rate > 0
        ORDER BY engagement_rate DESC
        LIMIT 10
    """)
    for i, row in enumerate(cursor, 1):
        comp, platform, caption, eng, likes, views, url = row
        caption_short = (caption or "")[:60].replace("\n", " ")
        print(f"  {i}. [{comp}/{platform}] {eng:.2f}% eng | {likes:,} likes | {views:,} views")
        print(f"     {caption_short}...")

    print()


# ── Main ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Scrape competitor content via Apify")
    parser.add_argument("--platform", choices=["instagram", "youtube", "tiktok"],
                        help="Platform to scrape")
    parser.add_argument("--competitor", help="Specific competitor key to scrape")
    parser.add_argument("--all", action="store_true", help="Scrape all competitors on all platforms")
    parser.add_argument("--summary", action="store_true", help="Just show summary of existing data")
    args = parser.parse_args()

    load_env()
    db = init_db()

    if args.summary:
        print_summary(db, args.competitor)
        return

    if not args.all and not args.platform:
        parser.error("Specify --platform or --all")

    # Determine what to scrape
    platforms = ["instagram", "youtube", "tiktok"] if args.all else [args.platform]
    competitors = {args.competitor: COMPETITORS[args.competitor]} if args.competitor else COMPETITORS

    if args.competitor and args.competitor not in COMPETITORS:
        print(f"Unknown competitor: {args.competitor}")
        print(f"Available: {', '.join(COMPETITORS.keys())}")
        sys.exit(1)

    scrapers = {
        "instagram": scrape_instagram,
        "youtube": scrape_youtube,
        "tiktok": scrape_tiktok,
    }

    total_inserted = 0
    for comp_key, comp_info in competitors.items():
        for platform in platforms:
            scraper = scrapers[platform]
            rows = scraper(comp_key, comp_info)
            if rows:
                inserted = insert_content(db, rows)
                total_inserted += inserted
                print(f"  Inserted {inserted} rows for {comp_key}/{platform}")

    print(f"\nTotal: {total_inserted} rows inserted")
    print_summary(db, args.competitor)

    db.close()


if __name__ == "__main__":
    main()
