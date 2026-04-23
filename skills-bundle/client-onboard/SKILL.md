---
name: client-onboard
description: Generate a client CLAUDE.md and knowledge base from brand intake form responses and Fathom discovery call transcript. Use when onboarding a new client.
user-invocable: true
---

# Client Onboard — Intake to Context Pipeline

This skill converts raw client intake data into the structured files that power their AI operating system.

## Input Sources
1. **Brand Intake Form** (33 questions) — stored in Supabase `brand_intake` table or provided as JSON
2. **Fathom Discovery Call Transcript** — provided as text or file path

## Process

### Step 1: Extract from Intake Form
Read the 33-question responses and extract:
- Company name, owner name, mission
- ICP (who they serve, revenue range, team size)
- Offer details (pricing, deliverables, guarantee)
- Brand voice (tone, words they use, words to avoid)
- Competitors (who they watch, what they admire)
- Current tools and systems
- Goals and challenges

### Step 2: Extract from Fathom Transcript
Read the discovery call transcript and extract:
- Owner's speaking style (actual phrases, metaphors, energy)
- Unstated assumptions about their business
- Pain points they emphasized
- What excites them about AI
- Objections or concerns they raised
- Stories they told (for story bank)

### Step 3: Generate Client CLAUDE.md
Use the template at `_system/agents/_template/CLAUDE.md` and fill in:
- `{{CLIENT_NAME}}` — company name
- `{{OWNER_NAME}}` — owner's first name
- `{{MISSION_STATEMENT}}` — one-line mission from intake

Save to: `clients/[client-name]/CLAUDE.md`

### Step 4: Generate Brand Voice Profile
Create `clients/[client-name]/brand/voice-profile.md` with:
- Core tone (extracted from transcript)
- Signature phrases (actual words they used)
- Metaphors they use naturally
- Words to avoid
- Communication style (formal/casual, long/short, data-driven/story-driven)

### Step 5: Generate Brand Docs
Create these files in `clients/[client-name]/brand/`:
- `01-company-profile.md` — company overview, history, team
- `02-icp.md` — ideal customer profile
- `03-offer.md` — what they sell, pricing, guarantee
- `04-story-bank.md` — proof points, case studies, founder story
- `05-brand-voice.md` — full voice framework
- `06-competitors.md` — competitive landscape

### Step 6: Populate Supabase
Insert the brand profile into the client's `knowledge_base` table with embeddings for semantic search.

### Step 7: Create Install Package
Copy the template structure:
```bash
cp -r _system/agents/_template clients/[client-name]/install/
```
Fill in all placeholders. Ready for deployment.

## Output
A complete client install package at `clients/[client-name]/` containing:
- Filled CLAUDE.md (no placeholders)
- Brand docs (6 files)
- Voice profile
- Install package ready for bootstrap.sh
- Supabase populated with brand knowledge

## Quality Check
- [ ] All {{PLACEHOLDERS}} replaced with real values
- [ ] Voice profile uses actual words from the transcript (not generic descriptions)
- [ ] ICP is specific (revenue range, team size, industry)
- [ ] Offer details include real pricing
- [ ] No fabricated proof points
- [ ] Supabase knowledge_base populated

## Knowledge Graph Ingest (After Onboarding Complete)
After the client install package is created and Supabase is populated, ingest their docs into the shared knowledge graph:
```
ingest_folder("/Users/scanbot/RawgrowthOS/clients/[ClientName]/", metadata={"client_id": "ClientName", "agent": "cleo", "date": "YYYY-MM-DD"})
```
Use the `raganything` MCP tool (`ingest_folder`). This makes all client documents — brand decks, SOPs, transcripts, voice profiles — queryable by any agent. Enables intelligent context-aware support throughout the retainer.
