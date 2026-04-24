#!/usr/bin/env -S tsx
/**
 * One-time YouTube OAuth flow for Desktop app credentials.
 * Run: npm run youtube:auth
 *
 * Reads YOUTUBE_CLIENT_ID + YOUTUBE_CLIENT_SECRET from .env, spins up a
 * loopback HTTP server, opens the browser, captures the auth code, and
 * exchanges it for a refresh token. Paste the printed refresh token into
 * .env as YOUTUBE_REFRESH_TOKEN.
 */
import http from 'http';
import { URL } from 'url';
import { exec } from 'child_process';
import type { AddressInfo } from 'net';

import { readEnvFile } from '../src/env.js';

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];

const env = readEnvFile(['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET']);
const CLIENT_ID = env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = env.YOUTUBE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET in .env');
  process.exit(1);
}

let redirectUri = '';

const server = http.createServer(async (req, res) => {
  if (!req.url) return;
  const url = new URL(req.url, redirectUri);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(`<h1>Auth failed</h1><p>${error}</p>`);
    console.error('OAuth error:', error);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400);
    res.end('No code in callback');
    return;
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokens = await tokenRes.json() as {
      access_token?: string;
      refresh_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !tokens.refresh_token) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h1>Token exchange failed</h1><pre>${JSON.stringify(tokens, null, 2)}</pre>`);
      console.error('Token exchange failed:', tokens);
      server.close();
      process.exit(1);
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Success</h1><p>You can close this tab and return to the terminal.</p>');

    console.log('\n✓ Auth complete.\n');
    console.log('Add this line to .env (both local and VPS):\n');
    console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    server.close();
    process.exit(0);
  } catch (err) {
    res.writeHead(500);
    res.end('Token exchange threw');
    console.error(err);
    server.close();
    process.exit(1);
  }
});

server.listen(0, '127.0.0.1', () => {
  const port = (server.address() as AddressInfo).port;
  redirectUri = `http://127.0.0.1:${port}`;

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  console.log(`\nOpen this URL in your browser (the script will auto-open too):\n`);
  console.log(authUrl.toString());
  console.log('\nWaiting for callback on', redirectUri, '...\n');

  const cmd = process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start'
    : 'xdg-open';
  exec(`${cmd} "${authUrl.toString()}"`, () => { /* ignore — URL is printed above */ });
});
