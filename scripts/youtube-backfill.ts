#!/usr/bin/env -S tsx
/**
 * One-time YouTube historical backfill.
 *
 * Pulls daily subscribersGained/Lost + views from YouTube Analytics API
 * from channel creation to today, back-computes daily subscriber count,
 * and upserts into the youtube_snapshots table. Safe to re-run: rows
 * are UPSERTed by date.
 *
 * Requires OAuth on the channel-owning account (Analytics API is gated).
 * Run: npm run youtube:backfill
 */
import { initDatabase, recordYouTubeSnapshot } from '../src/db.js';
import { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN } from '../src/config.js';
import { getChannelStats } from '../src/youtube.js';

const CHANNEL_CREATED = '2014-01-27'; // @jacksonrapaport creation date

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID,
      client_secret: YOUTUBE_CLIENT_SECRET,
      refresh_token: YOUTUBE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const body = await res.json() as { access_token?: string; error?: string };
  if (!body.access_token) throw new Error(`Token refresh failed: ${body.error}`);
  return body.access_token;
}

async function fetchDailyMetrics(token: string, startDate: string, endDate: string) {
  const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=subscribersGained,subscribersLost,views&dimensions=day&maxResults=10000`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Analytics API ${res.status}: ${await res.text()}`);
  const data = await res.json() as { rows?: [string, number, number, number][] };
  return data.rows ?? [];
}

async function main() {
  console.log('Initializing DB...');
  initDatabase();

  console.log('Fetching channel stats...');
  const channel = await getChannelStats();
  console.log(`  ${channel.title} — ${channel.subscribers} subs, ${channel.totalViews} views, ${channel.videoCount} videos`);

  const today = new Date().toISOString().slice(0, 10);
  console.log(`Fetching Analytics API history from ${CHANNEL_CREATED} to ${today}...`);
  const token = await getAccessToken();
  const rows = await fetchDailyMetrics(token, CHANNEL_CREATED, today);
  console.log(`  Got ${rows.length} daily rows.`);

  const deltaSubs = rows.reduce((s, r) => s + (r[1] - r[2]), 0);
  const deltaViews = rows.reduce((s, r) => s + r[3], 0);
  console.log(`  Sum of daily (gained - lost): ${deltaSubs}  (current subs: ${channel.subscribers})`);
  console.log(`  Sum of daily views: ${deltaViews}  (current total views: ${channel.totalViews})`);

  // Back-compute daily cumulative subscribers + total views.
  // Use current totals as the anchor — working forward from 0 would drift if Analytics API
  // cuts off older data. Work backward instead: today's count minus future deltas = past count.
  let runningSubs = channel.subscribers;
  let runningViews = channel.totalViews;

  // Process rows in reverse chronological order
  const reversed = [...rows].reverse();

  // First, record today's current state (video_count is "now"; we have no history for videos).
  recordYouTubeSnapshot(channel.subscribers, channel.totalViews, channel.videoCount, today);

  // Walk backwards: after processing each row, running counts reflect the state at the START of that day.
  let inserted = 0;
  for (const [date, gained, lost, views] of reversed) {
    // Record the END-of-day state for this date (which is the current running value).
    recordYouTubeSnapshot(runningSubs, runningViews, channel.videoCount, date);
    inserted++;
    // Step back: subtract today's change to get yesterday's end-of-day count.
    runningSubs -= (gained - lost);
    runningViews -= views;
  }

  console.log(`Inserted ${inserted} daily snapshots.`);
  console.log(`Done. Reload /brand/youtube to see the full growth curve.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Backfill failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
