import { APIFY_API_TOKEN, INSTAGRAM_USERNAME } from './config.js';
import { logger } from './logger.js';

// Apify's `apify/instagram-profile-scraper` actor — public profile data (no Meta app review).
// https://apify.com/apify/instagram-profile-scraper
const ACTOR = 'apify~instagram-profile-scraper';
const RUN_URL = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items`;

// Runs take 20-60s and each run burns credits — keep a short in-memory cache so
// rapid reloads of /brand/instagram hit one actor run per window.
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
let cached: { at: number; data: ApifyProfile } | null = null;

interface ApifyLatestPost {
  id?: string;
  shortCode?: string;
  type?: string;                // "Image" | "Video" | "Sidecar"
  productType?: string;         // "clips" for reels
  caption?: string;
  url?: string;
  commentsCount?: number;
  likesCount?: number;
  timestamp?: string;
  displayUrl?: string;
  videoUrl?: string;
  videoViewCount?: number;
  videoPlayCount?: number;
}

interface ApifyProfile {
  username?: string;
  fullName?: string;
  biography?: string;
  externalUrl?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  verified?: boolean;
  private?: boolean;
  profilePicUrl?: string;
  profilePicUrlHD?: string;
  latestPosts?: ApifyLatestPost[];
}

async function runActor(): Promise<ApifyProfile> {
  if (!APIFY_API_TOKEN) {
    throw new Error('Apify not configured. Set APIFY_API_TOKEN in .env.');
  }

  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  const res = await fetch(`${RUN_URL}?token=${APIFY_API_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usernames: [INSTAGRAM_USERNAME],
      resultsLimit: 12,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.warn({ status: res.status, body: text.slice(0, 300) }, 'Apify Instagram actor failed');
    throw new Error(`Apify ${res.status}: ${text.slice(0, 200)}`);
  }

  const items = (await res.json()) as ApifyProfile[];
  const profile = items[0];
  if (!profile || !profile.username) {
    throw new Error(`Apify returned no profile for @${INSTAGRAM_USERNAME}`);
  }

  cached = { at: Date.now(), data: profile };
  return profile;
}

export interface InstagramProfile {
  username: string;
  fullName: string;
  biography: string;
  followers: number;
  following: number;
  posts: number;
  verified: boolean;
  profilePic: string;
  externalUrl: string;
}

export interface InstagramPost {
  id: string;
  shortCode: string;
  url: string;
  type: 'Image' | 'Video' | 'Reel' | 'Carousel';
  caption: string;
  thumbnail: string;
  likes: number;
  comments: number;
  views: number;                // 0 for non-video
  timestamp: string;
}

function normalizeType(p: ApifyLatestPost): InstagramPost['type'] {
  if (p.productType === 'clips') return 'Reel';
  if (p.type === 'Video') return 'Video';
  if (p.type === 'Sidecar') return 'Carousel';
  return 'Image';
}

export async function getProfile(): Promise<InstagramProfile> {
  const p = await runActor();
  return {
    username: p.username ?? INSTAGRAM_USERNAME,
    fullName: p.fullName ?? '',
    biography: p.biography ?? '',
    followers: p.followersCount ?? 0,
    following: p.followsCount ?? 0,
    posts: p.postsCount ?? 0,
    verified: Boolean(p.verified),
    profilePic: p.profilePicUrlHD ?? p.profilePicUrl ?? '',
    externalUrl: p.externalUrl ?? '',
  };
}

export async function getRecentPosts(limit = 12): Promise<InstagramPost[]> {
  const p = await runActor();
  const posts = p.latestPosts ?? [];
  return posts.slice(0, limit).map((post) => ({
    id: post.id ?? post.shortCode ?? '',
    shortCode: post.shortCode ?? '',
    url: post.url ?? (post.shortCode ? `https://www.instagram.com/p/${post.shortCode}/` : ''),
    type: normalizeType(post),
    caption: post.caption ?? '',
    thumbnail: post.displayUrl ?? '',
    likes: post.likesCount ?? 0,
    comments: post.commentsCount ?? 0,
    views: post.videoViewCount ?? post.videoPlayCount ?? 0,
    timestamp: post.timestamp ?? '',
  }));
}
