import { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN } from './config.js';
import { logger } from './logger.js';

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REFRESH_TOKEN) {
    throw new Error(
      'YouTube OAuth not configured. Set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, and YOUTUBE_REFRESH_TOKEN in .env (run `npm run youtube:auth`).',
    );
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

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

  const body = await res.json() as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !body.access_token) {
    throw new Error(`YouTube token refresh failed: ${body.error ?? res.statusText}`);
  }

  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

async function ytFetch<T>(url: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const text = await res.text();
    logger.warn({ status: res.status, body: text.slice(0, 300) }, 'YouTube API call failed');
    throw new Error(`YouTube API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export interface ChannelStats {
  id: string;
  title: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  thumbnail: string;
}

export async function getChannelStats(): Promise<ChannelStats> {
  const data = await ytFetch<{
    items: Array<{
      id: string;
      snippet: { title: string; thumbnails: { default: { url: string } } };
      statistics: { subscriberCount: string; viewCount: string; videoCount: string };
    }>;
  }>('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true');

  const c = data.items[0];
  if (!c) throw new Error('No channel found on this account');

  return {
    id: c.id,
    title: c.snippet.title,
    subscribers: parseInt(c.statistics.subscriberCount, 10),
    totalViews: parseInt(c.statistics.viewCount, 10),
    videoCount: parseInt(c.statistics.videoCount, 10),
    thumbnail: c.snippet.thumbnails.default.url,
  };
}

export interface VideoStats {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
}

export async function getRecentVideos(limit = 10): Promise<VideoStats[]> {
  const channel = await ytFetch<{
    items: Array<{ contentDetails: { relatedPlaylists: { uploads: string } } }>;
  }>('https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true');

  const uploadsId = channel.items[0]?.contentDetails.relatedPlaylists.uploads;
  if (!uploadsId) return [];

  const playlist = await ytFetch<{
    items: Array<{ contentDetails: { videoId: string } }>;
  }>(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsId}&maxResults=${limit}`);

  const videoIds = playlist.items.map((i) => i.contentDetails.videoId);
  if (videoIds.length === 0) return [];

  const videos = await ytFetch<{
    items: Array<{
      id: string;
      snippet: { title: string; publishedAt: string; thumbnails: { medium: { url: string } } };
      statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
    }>;
  }>(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}`);

  return videos.items.map((v) => ({
    id: v.id,
    title: v.snippet.title,
    publishedAt: v.snippet.publishedAt,
    thumbnail: v.snippet.thumbnails.medium.url,
    views: parseInt(v.statistics.viewCount ?? '0', 10),
    likes: parseInt(v.statistics.likeCount ?? '0', 10),
    comments: parseInt(v.statistics.commentCount ?? '0', 10),
  }));
}

/**
 * Pull channel-level analytics for a date range (YYYY-MM-DD).
 * Uses YouTube Analytics API — richer than the basic Data API (watch time, avg view duration, etc.).
 */
export async function getChannelAnalytics(startDate: string, endDate: string): Promise<{
  views: number;
  watchTimeMinutes: number;
  averageViewDuration: number;
  subscribersGained: number;
  subscribersLost: number;
}> {
  const metrics = 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost';
  const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}`;

  const data = await ytFetch<{ rows?: number[][] }>(url);
  const row = data.rows?.[0] ?? [0, 0, 0, 0, 0];

  return {
    views: row[0],
    watchTimeMinutes: row[1],
    averageViewDuration: row[2],
    subscribersGained: row[3],
    subscribersLost: row[4],
  };
}
