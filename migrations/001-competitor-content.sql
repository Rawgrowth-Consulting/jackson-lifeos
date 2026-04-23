-- Migration 001: Create competitor_content table for Apify scraper data
-- Used by: Research Agent, Content Agent, Engineering Agent

CREATE TABLE IF NOT EXISTS competitor_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor TEXT NOT NULL,
    competitor_type TEXT NOT NULL,         -- 'business' or 'content'
    platform TEXT NOT NULL,               -- 'instagram', 'youtube', 'tiktok'
    post_id TEXT,
    post_url TEXT,
    post_type TEXT,                        -- 'reel', 'post', 'video', 'short', etc.
    caption TEXT,
    description TEXT,
    hashtags TEXT,                         -- JSON array
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    engagement_rate REAL DEFAULT 0,
    posted_at TEXT,
    scraped_at TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    raw_data TEXT,                         -- Full JSON from Apify
    UNIQUE(competitor, platform, post_id)
);

CREATE INDEX IF NOT EXISTS idx_competitor_content_competitor ON competitor_content(competitor);
CREATE INDEX IF NOT EXISTS idx_competitor_content_platform ON competitor_content(platform);
CREATE INDEX IF NOT EXISTS idx_competitor_content_engagement ON competitor_content(engagement_rate DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_content_posted ON competitor_content(posted_at DESC);
