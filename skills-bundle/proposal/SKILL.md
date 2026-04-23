# /proposal Skill

Generate a full custom proposal for a Rawgrowth prospect. Gathers CRM data, call transcripts, and business research, then produces a personalized proposal page, draft email, and Slack approval request.

## Usage

```
/proposal Chance Mitchell
/proposal [lead name or context like "my last call"]
```

## Steps

### STEP 1 -- Identify the Lead

Search GoHighLevel (GHL) for the contact by name.

```bash
source ~/.zshrc 2>/dev/null
curl -s "https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=FWPUqF4sHxuzMmY97yL4&name=[NAME]" \
  -H "Authorization: Bearer $HIGHLEVEL_TOKEN" \
  -H "Version: 2021-07-28" \
  -H "Content-Type: application/json"
```

If no result, try the contacts list endpoint:

```bash
curl -s "https://services.leadconnectorhq.com/contacts/?locationId=FWPUqF4sHxuzMmY97yL4&query=[NAME]&limit=10" \
  -H "Authorization: Bearer $HIGHLEVEL_TOKEN" \
  -H "Version: 2021-07-28"
```

- If "last call" or similar context is given, check Google Calendar (use the `google-calendar` skill) for the most recent completed meeting, then match the attendee name against GHL.
- Extract from the contact: `contactId`, name (first + last), email, company, tags, custom fields.
- Build the contact object:
  - `firstName` = first name (fallback: "there")
  - `fullName` = first + last
  - `email` = primary email
  - `revenue` = custom field or tag indicating revenue
  - `teamSize` = custom field or tag
  - `industry` = custom field or tag
  - `company` = companyName field

If no contact is found in GHL, check Granola for the call transcript by name (Step 2 Source B) and build the contact from call context. If neither source has the person, report back and stop.

---

### STEP 2 -- Gather Intelligence (run all in parallel)

Run these three data-gathering steps concurrently.

#### Source A -- GHL Contact History

Pull activity and opportunities from GHL for the contact.

```bash
# Get contact details + custom fields
curl -s "https://services.leadconnectorhq.com/contacts/{contactId}" \
  -H "Authorization: Bearer $HIGHLEVEL_TOKEN" \
  -H "Version: 2021-07-28"

# Get opportunities (pipeline stage, status)
curl -s "https://services.leadconnectorhq.com/opportunities/search?location_id=FWPUqF4sHxuzMmY97yL4&contact_id={contactId}" \
  -H "Authorization: Bearer $HIGHLEVEL_TOKEN" \
  -H "Version: 2021-07-28"

# Get notes on the contact
curl -s "https://services.leadconnectorhq.com/contacts/{contactId}/notes" \
  -H "Authorization: Bearer $HIGHLEVEL_TOKEN" \
  -H "Version: 2021-07-28"

# Get tasks
curl -s "https://services.leadconnectorhq.com/contacts/{contactId}/tasks" \
  -H "Authorization: Bearer $HIGHLEVEL_TOKEN" \
  -H "Version: 2021-07-28"
```

Format into labeled sections:
- **Pipeline Stage:** Current stage name + opportunity status
- **Tags:** All tags on contact
- **Notes:** Note text with dates
- **Custom Fields:** Any populated custom fields

If any endpoint fails, continue without it.

#### Source B -- Call Transcript

Try these sources in order until a transcript is found:

1. **User-provided link:** If the user provided a Granola or Google Doc link, fetch it directly via Playwright (navigate to URL, snapshot the page content). This is the most reliable source.

2. **Fireflies API** (primary transcription tool):
```
POST https://api.fireflies.ai/graphql
Authorization: Bearer $FIREFLIES_API_KEY
Body: { "query": "{ transcripts(limit: 50) { id title date participants organizer_email } }" }
```
Match by prospect name or email in title/participants. If found, fetch full transcript.

3. **Granola API** (legacy, key may be in old .env):
```
GET https://public-api.granola.ai/v1/notes
Authorization: Bearer $GRANOLA_API_KEY
```
Score notes against prospect name. If matched, fetch with `?include=transcript`.
Note: Granola API only returns last 10 notes and ignores pagination. For older calls, use the share link via Playwright instead.

4. **DM follow-ups DB** (extraction from past pipeline runs):
```sql
SELECT prospect_name, call_outcome, dm_content, extraction_json
FROM dm_follow_ups WHERE prospect_name LIKE '%{name}%'
```
The `extraction_json` field contains structured call data (business, pain, pricing, next steps).

5. **Local files:** Check `sales/calls/` for markdown transcripts matching the prospect name.

If no transcript found from any source, flag it and continue with CRM data only.

#### Source C -- Business Research

1. **Website scrape:** If the lead has a URL, fetch it with WebFetch. Strip scripts/styles/tags, keep first 4000 chars of text.
2. **AI research:** Call OpenRouter (`anthropic/claude-sonnet-4`) with this prompt:

```
Research this company and return a brief profile (max 500 words):

Company: {company}
Industry: {industry}
Revenue: {revenue}
Location: {addresses}
Website: {url}
Contact: {fullName}, {title}

Return:
1. What the company does (2-3 sentences)
2. Their likely pain points based on their industry and size
3. Key competitors
4. What AI automation would help them most
5. Any notable public info (funding, press, awards)

Be factual. If you don't know something, say so. Don't fabricate.
```

---

### STEP 3 -- Generate the Proposal

Call OpenRouter with model `anthropic/claude-sonnet-4`, max_tokens 4000.

**System context:** Rawgrowth brand voice. Short sentences, engineering vocabulary, peer-to-peer energy. No em dashes. Contractions always. No AI cliches.

**CRITICAL: The call transcript is the source of truth.** Every proposal must be shaped by what actually happened on the call. Do NOT fall back to generic templates. If the transcript says $8K setup, the proposal says $8K setup. If the call was about agent access, the proposal frames agent access. If it was a DFY install, frame DFY install.

**Step 3a -- Detect Engagement Type**

Before generating, analyze the transcript and context to determine:
1. **Engagement type:** DFY install | Agent access | Consulting | Hybrid | Other
2. **Pricing from the call:** Extract the EXACT numbers discussed (setup fee, retainer, payment terms)
3. **What was promised:** What specific deliverables or access was discussed
4. **Their situation:** What they told us about their business, goals, pain points
5. **What resonated:** What parts of the pitch landed, what quotes they said

Use this analysis to drive EVERYTHING in the proposal. No generic phases. No default pricing. No assumed framing.

**Prompt** (inject the gathered data into this template):

```
You are a proposal generator for Rawgrowth. Your job is to create a proposal that matches EXACTLY what was discussed on the call. Not a generic template. A document that reflects the actual conversation.

STEP 1: Read the transcript/call notes and determine:
- What type of engagement was discussed? (DFY install, agent access, consulting, hybrid)
- What EXACT pricing was quoted? (setup fee, retainer, payment terms)
- What specific deliverables or access was promised?
- What is their specific situation? (industry, team size, goals, pain points)
- What resonated with them? (quotes, reactions, what landed)

STEP 2: Generate the proposal to match.

=== PROSPECT INFO (from CRM) ===
- Name: {fullName}
- Title: {title}
- Company: {company}
- Industry: {industry}
- Revenue: {revenue}
- Team Size: {teamSize}
- Location: {addresses}
- Website: {url}
- CRM Description: {description}

=== DISCOVERY CALL TRANSCRIPT / NOTES ===
{transcript or "(No transcript available. Use CRM data and business research instead.)"}

=== FULL CRM CONVERSATION HISTORY ===
{conversationHistory}

=== BUSINESS RESEARCH ===
{businessResearch}

Generate a JSON object with this exact structure. Output ONLY valid JSON, no markdown, no code fences.

{
  "engagementType": "DFY install | Agent access | Consulting | Hybrid",
  "narrative": {
    "heroHeadline": "2-line headline that matches the engagement type. If DFY, talk about what gets built. If agent access, talk about what they get access to. Use their company name or industry.",
    "heroSubheadline": "1-2 sentences matching their specific situation and what was discussed on the call.",
    "painPoints": [
      { "pain": "Use their exact words from the call if possible. Frame as what they told us they need.", "severity": "high|medium|low", "proposedSolution": "The specific thing we discussed that addresses this" }
    ],
    "phases": [
      { "title": "Phase that matches what was discussed", "description": "What actually happens", "deliverables": ["Specific to this deal"] }
    ],
    "pricing": {
      "setup": "EXACT number from the call transcript. e.g. '$8,000' or '$15,000' or '$20,000'",
      "retainer": "EXACT retainer from call. e.g. '$10,000/mo' or 'optional $10,000/mo'",
      "includes": "What the setup fee covers, pulled from the call",
      "terms": "Any payment terms discussed (hardware, Amex accepted, etc.)"
    },
    "summary": "2-3 paragraphs that read like a recap of the call and what they get. Reference specific things they said. Use their quotes. Match the engagement type."
  },
  "emailDraft": {
    "subject": "Short, specific subject line",
    "body": "WRITE THE EMAIL TO MATCH THE CALL. Use the actual pricing discussed. Reference what they specifically said they wanted. Include {{PROPOSAL_URL}} and https://demo.rawgrowth.ai. Keep it short, casual, peer-to-peer."
  }
}

PHASE RULES:
- Create 2-4 phases that match what was ACTUALLY DISCUSSED on the call.
- Do NOT default to Discovery/Foundation/Activation/Intelligence unless that was literally the conversation.
- If its agent access: phases might be Setup, Agent Deployment, Training.
- If its DFY install: phases match the actual build plan discussed.
- If its consulting: phases match the advisory engagement discussed.

PRICING RULES:
- Use EXACT pricing from the call. Not defaults. Not minimums. The actual numbers Chris quoted.
- If no pricing was discussed, say "custom to your business."
- Include what the setup fee covers (pulled from the call).
- Include retainer details and whether its optional or required.

GENERAL RULES:
- The call transcript is your primary source. Everything flows from it.
- No ROI projection section.
- Use engineering vocabulary: install, deploy, build, plug in, stack, source of truth.
- No em dashes. Contractions always. No AI cliches.
- The emailDraft must reference something specific from the call.
- Do NOT generate dashboard data. Demo link is demo.rawgrowth.ai.
- Banned words: game-changer, unlock, leverage, streamline, utilize, deep dive, certainly, revolutionary.
- Banned constructions: "Not X, it's Y", parallel negation, stop/start swaps.
```

**Parse the response:** Strip any markdown code fences. Parse as JSON. If parsing fails, extract the first `{...}` block and retry.

---

### STEP 4 -- Save to Supabase

Generate the slug from the company name (or prospect name if no company):
- Lowercase
- Replace non-alphanumeric characters with hyphens
- Strip leading/trailing hyphens

Insert into the `proposals` table:

```bash
source ~/.zshrc 2>/dev/null
curl -s -X POST "$SUPABASE_URL/rest/v1/proposals" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates,return=minimal" \
  -d '{
    "slug": "{slug}",
    "lead_id": "{contactId_or_manual_identifier}",
    "company": "{company}",
    "contact_name": "{firstName}",
    "contact_email": "{email}",
    "industry": "{industry}",
    "revenue": "{revenue}",
    "team_size": "{teamSize}",
    "narrative": {narrativeJSON},
    "dashboard_data": {},
    "status": "draft",
    "view_count": 0
  }'
```

If the write fails, report the error and stop.

---

### STEP 5 -- Post to Slack for Approval

Post to **#sales** (channel ID: `C0ASH1V2Y81`) using Slack Block Kit.

**Important:** Source the Slack token from `.env` at the project root, not `~/.zshrc`:
```bash
source /Users/scanbot/RawgrowthOS/.env 2>/dev/null
export $(grep -v '^#' /Users/scanbot/RawgrowthOS/.env | xargs) 2>/dev/null
```

```bash
curl -s -X POST "https://slack.com/api/chat.postMessage" \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

Block structure:

1. **Header block:** `Proposal Ready: {company}`
2. **Section block (fields):**
   - Contact: `{fullName} ({email})`
   - Industry: `{industry}`
   - Engagement: `{engagementType}`
   - Pricing: `{setup} + {retainer}`
3. **Divider**
4. **Section:** Proposal link: `proposal.rawgrowth.ai/{slug}`
5. **Section:** Demo link: `demo.rawgrowth.ai`
6. **Divider**
7. **Section:** Email preview (subject + body with `{{PROPOSAL_URL}}` replaced with actual URL)
8. **Divider**
9. **Actions block:** Two buttons:
    - **"Approve & Send"** (style: primary, action_id: `proposal_approve`)
      - value: JSON with `slug`, `contactId`, `email`, `firstName`, `company`, `subject`, `body` (with URL filled in)
    - **"Disapprove"** (style: danger, action_id: `proposal_disapprove`)
      - value: JSON with `slug`, `company`

Fallback text: `Proposal ready for {company}. Approve or disapprove.`

---

### STEP 6 -- Confirm

Report back with:

- **Proposal URL:** `proposal.rawgrowth.ai/{slug}`
- **Status:** Posted to #sales for approval
- **Email draft preview:** Subject and body
- **Engagement type:** What was detected from the call
- **Pricing:** Exact numbers from the call
- **Flags:** Note any missing data (no transcript found, missing email, missing revenue, etc.)

Remind: the email won't send until Chris approves in Slack.

---

## Follow-Up Sequence

After proposal approval, the 5-touch follow-up sequence activates via GHL workflows (Pipeline stage: Proposal Sent, Stage ID: `d8623254-e4df-400b-a018-436328dbf150`):

| Touch | Day | Purpose |
|-------|-----|---------|
| 1 | Day 0 | Proposal sent + Loom walkthrough |
| 2 | Day 2 | Targeted question based on objection profile |
| 3 | Day 5 | Case study + ROI math |
| 4 | Day 8 | Live demo offer |
| 5 | Day 12 | Final check, close or archive |

Exit rule: any reply pulls them out into manual conversation.

---

## Important Rules

- All env vars: `source ~/.zshrc 2>/dev/null` for OpenRouter/GHL keys. Source `.env` at project root for Slack/Supabase/Granola keys.
- GHL API uses Bearer token auth: `Authorization: Bearer $HIGHLEVEL_TOKEN` with `Version: 2021-07-28` header.
- GHL Location ID: `FWPUqF4sHxuzMmY97yL4`
- GHL Pipeline ID: `ZKAPeVGLEx6lqTytAMMG`
- **Never send the email directly.** Always go through Slack approval first.
- `demo.rawgrowth.ai` is the demo link. All prospects see the same generic demo.
- Proposal pages live at `proposal.rawgrowth.ai/{slug}`.
- Booking link: `calendly.com/chriswestt/rawgrowth-discovery` (never cal.com).
- **Pricing comes from the call.** Use exact numbers discussed. If no pricing discussed, say "custom to your business." Never invent pricing.
- Brand voice: no em dashes, contractions always, engineering vocabulary, peer-to-peer energy.
- Banned words: game-changer, unlock, leverage, streamline, utilize, deep dive, certainly, revolutionary.
- Banned constructions: "Not X, it's Y", "Not theory, the actual...", parallel negation, stop/start swaps. Just state the thing directly.

## Environment Variables

| Variable | Purpose | Location |
|----------|---------|----------|
| `HIGHLEVEL_TOKEN` | GoHighLevel API Bearer token | ~/.zshrc |
| `OPENROUTER_API_KEY` | OpenRouter for AI generation | ~/.zshrc |
| `GRANOLA_API_KEY` | Granola call transcript API | .env (project root) |
| `FIREFLIES_API_KEY` | Fireflies transcript API | .env (project root) |
| `SUPABASE_URL` | Supabase project URL | .env (project root) |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | .env (project root) |
| `SLACK_BOT_TOKEN` | Slack bot token for posting | .env (project root) |
