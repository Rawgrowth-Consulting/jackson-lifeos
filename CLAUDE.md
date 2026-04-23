# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment: VPS Always

**This entire system lives on the VPS. Every change deploys to the VPS. No exceptions.**

- **VPS**: Hetzner Ubuntu — IP `5.78.179.49`, hostname `RawClaw`
- **Project dir on VPS**: `/opt/rawclaw`
- **Service**: `rawclaw.service` (systemd, user `rawclaw`)

Local machines are for editing only. All paths in code must resolve on the VPS (`/opt/rawclaw/...`, `/opt/rawclaw/store/`). "Does this work?" means testing on the VPS, not a local dev server.

### Deploy workflow

```bash
./deploy.sh --push      # git push + ssh: git pull, tsc, chown, systemctl restart
./deploy.sh --restart   # restart service only
./deploy.sh --logs      # journalctl -u rawclaw, last 30 lines
./deploy.sh --status    # systemctl status
./deploy.sh --tunnel    # SSH -L tunnel dashboard to localhost:3141
```

The dashboard is never exposed publicly — it's reached via `--tunnel`.

## Commands

```bash
npm run dev              # tsx src/index.ts (local smoke test only)
npm run build            # tsc → dist/
npm run typecheck        # tsc --noEmit
npm test                 # vitest run
npm run test:watch       # vitest
npx vitest run src/memory.test.ts   # single test file
npm run migrate          # apply migrations/*.sql
npm run setup            # interactive first-run wizard
npm run status           # scripts/status.ts — runtime/db health
npm run agent:create     # scaffold a new agent dir from agents/_template
```

Tests colocated in `src/` as `*.test.ts`; vitest config inline in `package.json`.

## Architecture

RawClaw is a **multi-agent system for one human** — a Telegram/Slack/Discord-facing bot backed by Claude Agent SDK, with specialized agents that share memory, budget, and audit logs.

### Agent layer (`agents/`)

Each subdirectory is a persona: a `CLAUDE.md` defining voice/responsibilities and an `agent.yaml` with routing metadata. **Gurt** is the CEO/chief-of-staff agent; the rest (engineering, content, comms, ops, research, ali, cleo, larry, ovi, quilly, sam, scan) are departments Gurt delegates to via `orchestrator.ts`.

**Persona rule — inherited by every agent:** agents stay in character as staff. They never identify as Claude, never reference Anthropic. When editing agent `CLAUDE.md` files, preserve this.

### Runtime core (`src/`)

- `index.ts` — boots bot + dashboard + scheduler + plugin loader. Supports `--agent <name>` to run a single named agent as the main process.
- `agent.ts` — the `runAgent()` primitive wrapping the Claude Agent SDK.
- `heartbeat.ts` — wraps every `runAgent()` call in a `heartbeat_runs` row (tokens, cost, duration, exit code). Single point of visibility for all agent executions.
- `budget.ts` — per-agent daily/monthly USD caps. Warns at 80%, hard-stops at 100%, auto-pauses offender.
- `audit.ts` — `logActivity()` called from bot/scheduler/orchestrator/dashboard; every mutation is logged.
- `orchestrator.ts` — Gurt → department routing.
- `memory.ts` / `memory-ingest.ts` / `memory-consolidate.ts` — layered memory with session-compaction (rotates at 200 runs / 2M tokens / 72h).
- `scheduler.ts` — cron-like task runner for recurring agent jobs.
- `bot.ts` — Telegram (grammy) entry point; Slack via `slack.ts`, Discord via `discord.ts`, WhatsApp via `whatsapp.ts` + `scripts/wa-daemon.ts`.
- `dashboard.ts` + `dashboard-html.ts` + `lifeos-html.ts` — single-file inline HTML admin UI served by Hono. Zero build step on the frontend — edit the template string, redeploy.

### Data layer

**Dual-write (SQLite + Supabase).** `db.ts` is the SQLite primary (via `better-sqlite3`, file in `store/`). `supabase.ts` is the optional cloud secondary. Writes to memories, heartbeats, budget, and audit go through `dualWrite()` — SQLite always, Supabase if configured. Reads prefer SQLite.

Supabase credentials and migrations live separately from the SQLite schema; `migrations/` is the SQL for Supabase, `db.ts` owns the SQLite schema.

### Plugins (`plugins/` if present)

In-process TypeScript. Each plugin has `plugin.yaml` + `index.ts` with an `init()` function. No JSON-RPC, no subprocess isolation — plugins are trusted code.

### Skills (`skills/`, `skills-bundle/`)

Model-callable capabilities (Gmail, Calendar, gemini-api-dev, etc). Loaded via `skill-ingest.ts` / `skill-manage.ts`.

## Conventions

- TypeScript ESM (`"type": "module"`); Node ≥ 20.
- After editing `src/**`, run `npm run typecheck` before `./deploy.sh --push` — the VPS runs `tsc` on pull and will fail the service restart if types are broken.
- Don't commit `store/` or `.env`. Local `store/` files are disposable; the authoritative DB lives on the VPS.
- Inline-HTML dashboard: edit the template literal, no frontend build.