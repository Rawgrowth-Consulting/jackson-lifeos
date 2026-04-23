---
name: client-onboarding
description: Load the complete client onboarding SOP. Use when a new client signs up, when setting up client infrastructure, or for onboarding-related tasks.
user-invocable: true
---

# Client Onboarding — Rawgrowth

Read `ops/delivery/sops/sop-client-onboarding.md` for the complete 8-step process.

## Quick Reference

### The 8 Steps (3-7 days total)
1. **Payment detected** — Stripe webhook fires
2. **Welcome email** — Automated via GHL workflow
3. **Onboarding form sent** — 33 questions covering business model, tech stack, goals
4. **Form received** — Ovi generates brand profile, Quilly builds voice profile
5. **Discord channels created** — 5 channels per DFY client (general, requests, deliverables, meetings, admin)
6. **AI agents activated** — Trained on client's brand docs and data
7. **Kickoff call scheduled** — 30-min walkthrough of dashboard and system
8. **2-week support** — Daily check-ins, then transition to retainer

### What They Get (Deliverables)
- Custom War Room dashboard (Next.js on Vercel)
- 8+ trained AI agents
- All agents trained on their brand docs
- Telegram chat window to CEO agent
- Supabase backend with pgvector KB
- Discord channel with 24/7 support
- Security guardrails

### Related SOPs
- `ops/delivery/sops/sop-client-portal.md` — Portal implementation
- `ops/delivery/sops/sop-company-database.md` — Database installation process
- `ops/delivery/sops/sop-client-win-to-content.md` — Turning wins into content
- `ops/delivery/templates/client-research-template.md` — Research report structure
- `ops/delivery/templates/company-database-schema.sql` — Base DB schema
