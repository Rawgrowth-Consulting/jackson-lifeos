#!/usr/bin/env python3
"""
Competitor Content Analysis Tool

Query and analyze scraped competitor content from the database.
Designed to be called by the Research and Content agents.

Usage:
  python3 scripts/apify/analyze-competitors.py top --limit 20
  python3 scripts/apify/analyze-competitors.py compare
  python3 scripts/apify/analyze-competitors.py hooks --competitor ifstanwasrich
  python3 scripts/apify/analyze-competitors.py trends --days 30
  python3 scripts/apify/analyze-competitors.py gaps
"""

import argparse
import json
import sqlite3
import sys
from datetime import datetime, timedelta
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DB_PATH = PROJECT_ROOT / "store" / "rawclaw.db"


def get_db():
    if not DB_PATH.exists():
        print("Database not found. Run scrape-competitors.py first.")
        sys.exit(1)
    return sqlite3.connect(str(DB_PATH))


def cmd_top(args):
    """Show top performing competitor content by engagement."""
    db = get_db()
    platform_filter = f"AND platform = '{args.platform}'" if args.platform else ""
    competitor_filter = f"AND competitor = '{args.competitor}'" if args.competitor else ""

    cursor = db.execute(f"""
        SELECT competitor, platform, post_type, caption, likes, comments,
               views, shares, engagement_rate, post_url, posted_at
        FROM competitor_content
        WHERE engagement_rate > 0 {platform_filter} {competitor_filter}
        ORDER BY engagement_rate DESC
        LIMIT {args.limit}
    """)

    print(f"{'TOP PERFORMING COMPETITOR CONTENT':=^70}")
    for i, row in enumerate(cursor, 1):
        comp, platform, ptype, caption, likes, comments, views, shares, eng, url, posted = row
        caption_clean = (caption or "").replace("\n", " ")[:100]
        print(f"\n{i}. @{comp} [{platform}/{ptype}]")
        print(f"   Engagement: {eng:.2f}% | Likes: {likes:,} | Comments: {comments:,} | Views: {views:,}")
        print(f"   Posted: {posted or 'unknown'}")
        print(f"   Caption: {caption_clean}")
        if url:
            print(f"   URL: {url}")


def cmd_compare(args):
    """Compare all competitors side by side."""
    db = get_db()

    print(f"{'COMPETITOR COMPARISON':=^70}")
    print(f"\n{'Competitor':<25} {'Platform':<12} {'Posts':>6} {'Avg Eng%':>10} {'Total Likes':>12} {'Total Views':>12}")
    print("-" * 80)

    cursor = db.execute("""
        SELECT competitor, platform, COUNT(*) as posts,
               ROUND(AVG(engagement_rate), 2) as avg_eng,
               SUM(likes) as total_likes, SUM(views) as total_views
        FROM competitor_content
        GROUP BY competitor, platform
        ORDER BY avg_eng DESC
    """)

    for row in cursor:
        comp, platform, posts, avg_eng, likes, views = row
        print(f"{comp:<25} {platform:<12} {posts:>6} {avg_eng or 0:>9.2f}% {likes or 0:>11,} {views or 0:>11,}")


def cmd_hooks(args):
    """Extract hook patterns from top-performing content."""
    db = get_db()
    competitor_filter = f"AND competitor = '{args.competitor}'" if args.competitor else ""

    cursor = db.execute(f"""
        SELECT competitor, platform, caption, engagement_rate, likes, views
        FROM competitor_content
        WHERE caption IS NOT NULL AND caption != '' AND engagement_rate > 0
        {competitor_filter}
        ORDER BY engagement_rate DESC
        LIMIT {args.limit}
    """)

    print(f"{'HOOK PATTERNS FROM TOP CONTENT':=^70}")
    print("(First line/sentence of highest-engaging posts)\n")

    for i, row in enumerate(cursor, 1):
        comp, platform, caption, eng, likes, views = row
        # Extract the hook (first line or first sentence)
        lines = (caption or "").strip().split("\n")
        hook = lines[0].strip() if lines else ""
        if len(hook) > 150:
            hook = hook[:147] + "..."

        print(f"{i}. [{comp}/{platform}] ({eng:.1f}% eng, {likes:,} likes)")
        print(f"   HOOK: {hook}")
        print()


def cmd_trends(args):
    """Show posting frequency and engagement trends."""
    db = get_db()
    cutoff = (datetime.utcnow() - timedelta(days=args.days)).isoformat()

    print(f"{'POSTING TRENDS (Last ' + str(args.days) + ' days)':=^70}")

    cursor = db.execute("""
        SELECT competitor, platform,
               COUNT(*) as posts,
               ROUND(AVG(engagement_rate), 2) as avg_eng,
               MAX(posted_at) as last_post
        FROM competitor_content
        WHERE posted_at >= ?
        GROUP BY competitor, platform
        ORDER BY posts DESC
    """, (cutoff,))

    print(f"\n{'Competitor':<25} {'Platform':<12} {'Posts':>6} {'Avg Eng%':>10} {'Last Post':<20}")
    print("-" * 75)
    for row in cursor:
        comp, platform, posts, avg_eng, last_post = row
        print(f"{comp:<25} {platform:<12} {posts:>6} {avg_eng or 0:>9.2f}% {(last_post or 'unknown')[:19]:<20}")


def cmd_gaps(args):
    """Identify content gaps -- topics competitors aren't covering well."""
    db = get_db()

    print(f"{'CONTENT GAP ANALYSIS':=^70}")

    # Platform coverage gaps
    print("\n1. PLATFORM COVERAGE")
    cursor = db.execute("""
        SELECT competitor,
               GROUP_CONCAT(DISTINCT platform) as platforms,
               COUNT(DISTINCT platform) as platform_count
        FROM competitor_content
        GROUP BY competitor
        ORDER BY platform_count
    """)
    for row in cursor:
        comp, platforms, count = row
        missing = {"instagram", "youtube", "tiktok"} - set(platforms.split(","))
        if missing:
            print(f"   @{comp}: Missing on {', '.join(missing)}")

    # Low engagement content types
    print("\n2. LOW ENGAGEMENT AREAS (avg engagement < 1%)")
    cursor = db.execute("""
        SELECT competitor, platform, post_type,
               COUNT(*) as posts,
               ROUND(AVG(engagement_rate), 2) as avg_eng
        FROM competitor_content
        WHERE post_type IS NOT NULL AND post_type != ''
        GROUP BY competitor, platform, post_type
        HAVING AVG(engagement_rate) < 1 AND COUNT(*) >= 3
        ORDER BY avg_eng ASC
    """)
    for row in cursor:
        comp, platform, ptype, posts, avg_eng = row
        print(f"   @{comp} [{platform}/{ptype}]: {avg_eng}% avg engagement ({posts} posts)")

    # Posting frequency comparison
    print("\n3. POSTING FREQUENCY (posts/week avg)")
    cursor = db.execute("""
        SELECT competitor, platform,
               COUNT(*) as total_posts,
               ROUND(
                   CAST(COUNT(*) AS REAL) /
                   MAX(1, (julianday('now') - julianday(MIN(posted_at))) / 7),
               1) as posts_per_week
        FROM competitor_content
        WHERE posted_at IS NOT NULL AND posted_at != ''
        GROUP BY competitor, platform
        ORDER BY posts_per_week DESC
    """)
    for row in cursor:
        comp, platform, total, ppw = row
        print(f"   @{comp} [{platform}]: {ppw} posts/week ({total} total)")

    print("\n4. OPPORTUNITIES FOR JACKSON")
    print("   (Run after scraping to get data-driven recommendations)")
    print("   - Topics competitors avoid that align with faith/finance/fitness")
    print("   - Platform gaps where competitors are absent")
    print("   - Content formats competitors underuse (carousels, long-form, etc.)")


def main():
    parser = argparse.ArgumentParser(description="Analyze competitor content")
    sub = parser.add_subparsers(dest="command")

    p_top = sub.add_parser("top", help="Top performing content")
    p_top.add_argument("--limit", type=int, default=20)
    p_top.add_argument("--platform", choices=["instagram", "youtube", "tiktok"])
    p_top.add_argument("--competitor")

    p_compare = sub.add_parser("compare", help="Compare competitors")

    p_hooks = sub.add_parser("hooks", help="Extract hook patterns")
    p_hooks.add_argument("--competitor")
    p_hooks.add_argument("--limit", type=int, default=30)

    p_trends = sub.add_parser("trends", help="Posting trends")
    p_trends.add_argument("--days", type=int, default=30)

    p_gaps = sub.add_parser("gaps", help="Content gap analysis")

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return

    commands = {
        "top": cmd_top,
        "compare": cmd_compare,
        "hooks": cmd_hooks,
        "trends": cmd_trends,
        "gaps": cmd_gaps,
    }
    commands[args.command](args)


if __name__ == "__main__":
    main()
