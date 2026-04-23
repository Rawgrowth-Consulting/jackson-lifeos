---
name: ops-reference
description: Rawgrowth operational reference -- workspace architecture, Supabase schema, API connections, agent registry, cron schedule. Load when you need system-level context.
user-invocable: true
---

# Ops Reference -- Rawgrowth System

## Agent Registry

| Agent | Handles | Primary Workspace |
|-------|---------|------------------|
| **Scan** | Strategy, orchestration, decisions | ops/strategy/ |
| **Ali** | Code, deploys, APIs, MCP servers | src/ + api/ + apps/ |
| **Quilly** | Content, scripts, social, reels | content/ |
| **Larry** | Sales copy, DMs, proposals, CRM | sales/ |
| **Ovi** | Research, competitive intel, AI watch | research/ |
| **Cleo** | Client success, onboarding, health | clients/ |
| **Sam** | Finance, costs, pricing | ops/finance/ |
| **Vinny** | Product, dashboard, company LLM | apps/ |

Shared protocols: `agents/_base/CONTEXT.md`

## Workspace Architecture

```
/Users/scanbot/RawgrowthOS/          THE workspace (this IS the knowledge vault)
  CLAUDE.md                         Master routing map (~66 lines)
  agents/                           Agent configs (CLAUDE.md + agent.yaml per agent)
    _base/CONTEXT.md                Shared protocols for all agents
  marketing/                        brand/ + content/ + research/
  sales/                            scripts/ + objections/ + crm/ + calls/ + intel/ + sops/ + reference/
  clients/                          One folder per active client + templates/
  ops/                              delivery/ + finance/ + strategy/ + infrastructure/
  apps/                             One folder per product/app
    dashboard/                      CEO dashboard (React + Vite, port 3141)
  src/                              Core TypeScript engine (tsconfig constraint -- stays)
  api/                              Vercel serverless functions (hardcoded -- stays)
  mcp/                              MCP server definitions
  scripts/                          Operational scripts (ops/, pipelines/, setup/, test/)
  store/                            SQLite: rawgrowthos.db
  _scratch/                        Generated artifacts, tmp, uploads
    artifacts/                      Agent outputs by type
    content/                        Content in production
    tmp/                            Scratch space (auto-cleared)
```

## Supabase Schema

**Credentials:** `~/.zshrc` → SUPABASE_URL + SUPABASE_SERVICE_KEY

**Core Tables:**
- `task_queue` -- agent task assignments (agent, prompt, status, priority, result)
- `deliverables` -- all agent output (title, type, content_url, agent, status, tags)
- `agent_activity` -- agent status tracking (agent_name, action, status)
- `knowledge_base` -- semantic search with pgvector (content, embedding, source, tags)
- `clients` -- client records and status
- `sales_calls` -- call transcripts, objections, outcomes (from Granola)
- `content_pipeline` -- content production queue and status

**Content Tables:**
- `youtube_content` -- YouTube video data and metrics
- `instagram_content` -- Instagram content data
- `brand_intake` -- client intake form responses

**Communication Tables:**
- `chat_messages` / `chat_sessions` -- RawClaw conversation history

**Analytics Tables:**
- `revenue` -- Stripe revenue by month, client, type
- `funnel_analytics` -- funnel metrics

**Reference Tables:**
- `skills`, `sops`, `org_chart`, `thoughts`, `research`, `system_config`

**RPCs:** `search_knowledge_base`, `submit_task`, `get_funnel_stats`

## Automated Jobs (Cron)

**SIGNAL (Input):**
- Twitter scraping: daily 6am
- IG competitor Reels: Wed+Sat 7am
- YouTube sync: every 6hrs

**INTELLIGENCE (Processing):**
- Competitor analysis: Wed+Sat 9am
- Objection mining: Mon 7am
- Monthly outlier rollup: 1st of month 6am

**EXPRESSION (Output):**
- Daily Reel scripts: 5/day at 5am
- Weekly strategy report: Mon 11am

**OPERATIONS:**
- Larry SDR: every 2hrs (9am-9pm)
- Cleo onboarding check: every 4hrs
- Cost tracking: daily midnight

## API Connections (all in ~/.zshrc)

| Service | Env Var | Purpose |
|---------|---------|---------|
| Supabase | SUPABASE_URL + SUPABASE_SERVICE_KEY | Primary DB |
| GoHighLevel | HIGHLEVEL_TOKEN | CRM |
| OpenRouter | OPENROUTER_API_KEY | Model routing (Kimi K2 etc) |
| Google | GOOGLE_API_KEY | Gemini, Imagen, Drive, Docs |
| YouTube | YOUTUBE_API_KEY | Data API v3 |
| Stripe | STRIPE_SECRET_KEY | Payments |
| Calendly | CALENDLY_API_KEY | Booking webhooks |
| Slack | SLACK_BOT_TOKEN | Notifications |
| n8n | n8n.rawgrowth.ai | Workflow automation |
| Trigger.dev | TRIGGER_SECRET_KEY | Background jobs |
| ClickUp | CLICKUP_API_KEY | Project management |
| GitHub | GITHUB_TOKEN | Repo management |

## ICP Quick Reference

- **Who:** Consultants/agency owners $3M-$15M/yr
- **Offer:** Multi-five-figure install + $10K/mo retainer. In-house AI department.
- **Full details:** `ops/strategy/offer/undeniable-offer.md` and `brand/identity/02-icp.md`

## The Flywheel

```
SIGNAL (Input)               INTELLIGENCE (Processing)     EXPRESSION (Output)
Sales calls (Granola)   ->   Ovi analyzes patterns    ->  Quilly writes scripts
Client forms (33 Q's)   ->   What converts + why      ->  Larry writes sales copy
Social engagement       ->   Objection mining         ->  Dashboard updates
Competitor content      ->   Content perf loops       ->  Research briefs
```

Expression creates new Signal. The loop compounds. That's the product.
