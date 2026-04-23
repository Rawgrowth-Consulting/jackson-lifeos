---
name: client-onboard-pipeline
description: Full client onboarding pipeline triggered by Stripe payment or manual "new client [email]". Finds all sales calls, searches Gmail for agreement, creates Supabase records, creates Discord channels, sends welcome email, and builds a fulfillment plan from call intelligence. Triggers on "new client [email]", "onboard [name]", "client paid", or Stripe webhook via n8n.
user-invocable: true
---

# Client Onboard Pipeline

**Flow:** Payment → Find All Intel → Create Records → Discord Channels → Welcome Email → Fulfillment Plan → Bring to Chris

No pauses. Runs end to end.

---

## Step 1: Gather All Client Intelligence

Run the onboard script to find sales calls, intake forms, and create the Supabase record:

```bash
source ~/.zshrc && python3 ~/.claude/skills/client-onboard-pipeline/scripts/onboard-client.py \
  --email "<CLIENT_EMAIL>" \
  --name "<CLIENT_NAME>" \
  --amount <PAYMENT_AMOUNT>
```

This searches `sales_calls` by email and name, checks `brand_intake`, creates/updates the `clients` record, and outputs a JSON summary to `/tmp/onboard-<name>.json`.

Read the output JSON — it contains pain points, objections, call history, and outcomes.

## Step 2: Search Gmail for Agreement

Search for any agreement or proposal sent to the client:

```bash
mcp__google-workspace__search_drive_files -> query: "<CLIENT_EMAIL>", user_google_email: "team.chriswestt@gmail.com"
```

Also search Gmail (if available) for emails to/from the client email containing "agreement", "proposal", or "contract". Read any found documents to extract scope of work.

## Step 3: Create Discord Channels

Check existing channel naming by reading the server. Pattern is: `👤・{first-last}`

Create the client channel:

```
mcp__discord__send-message -> server: "Rawgrowth Consulting", channel: "🐙・scan-bot",
  message: "🎉 NEW CLIENT ONBOARDED\nName: <CLIENT_NAME>\nTier: <TIER>\nPayment: $<AMOUNT>\nEmail: <EMAIL>\nStatus: Onboarding started"
```

**Discord channel creation requires admin/bot with manage-channels permission.** If the Discord MCP can't create channels, post in `🐙・scan-bot` and tell Chris:
```
"New client <NAME> is onboarded in Supabase. Need Discord channels created:
  👤・<first-last>
Ready when channels are up."
```

Once channels exist, post a welcome message:
```
mcp__discord__send-message -> server: "Rawgrowth Consulting", channel: "👤・<client-name>",
  message: "Welcome to Rawgrowth, <NAME>! 🚀\n\nYour Signal Engine install starts now. This is your private channel — drop any questions, files, or ideas here.\n\nYour team is already reviewing your calls and building your Month 1 plan. We'll share it here within 48 hours.\n\n— Chris & The Rawgrowth Team"
```

## Step 4: Send Welcome Email

Use Google Workspace to send the welcome email:

```bash
# Create a welcome doc (or send via Gmail if MCP supports it)
mcp__google-workspace__create_doc -> title: "Welcome — <CLIENT_NAME>",
  user_google_email: "team.chriswestt@gmail.com"
```

**Email content (short, not corporate):**

```
Subject: Welcome to Rawgrowth — let's build 🚀

Hey <FIRST_NAME>,

Payment received — you're officially in.

We're already reviewing your calls and building your Month 1 plan. You'll see it within 48 hours.

In the meantime, join your private Discord channel. This is where we'll share deliverables, updates, and you can drop questions anytime:

👉 [Discord Invite Link]

Talk soon.

— Chris
```

## Step 5: Build Fulfillment Plan

This is the key step. Read all sales call transcripts and the agreement to understand what was promised.

### 5a. Load Sales Call Transcripts

Read the full transcripts from the sales calls found in Step 1. The onboard script stored them in the summary JSON. For full transcripts, query Supabase:

```bash
source ~/.zshrc && python3 -c "
import sys, json; sys.path.insert(0, '$HOME/tools')
from lib.supabase_client import supabase_select
calls = supabase_select('sales_calls', '?select=transcript,summary,pain_points,objections,outcome&client_email=ilike.*<EMAIL>*', limit=10)
for c in calls:
    print(json.dumps(c, indent=2, default=str))
"
```

### 5b. Load into NotebookLM (Optional — for deep analysis)

If there are 3+ calls, load transcripts into NotebookLM for grounded analysis:

```bash
python ~/.claude/skills/notebooklm/scripts/run.py ask_question.py \
  --question "Based on all calls with this client, what did we promise to deliver? What are their biggest pain points? What would a Month 1 plan look like?" \
  --notebook-url "<NOTEBOOK_URL>"
```

### 5c. Generate Fulfillment Plan

Based on call intel + agreement, create a plan:

```
## Fulfillment Plan: <CLIENT_NAME>
**Tier:** <TIER>  |  **Payment:** $<AMOUNT>  |  **Start Date:** [today]

### What Was Promised (from calls + agreement)
[Extract specific deliverables, timelines, expectations from call transcripts]

### Client Pain Points (from calls)
1. [Pain point — with specific quote from call]
2. [Pain point]
3. [Pain point]

### Month 1 Deliverables
| Deliverable | Owner | Deadline | Notes |
|-------------|-------|----------|-------|
| Brand profile | Ovi + Quilly | Week 1 | From intake + calls |
| Content ideas (first 5) | Quilly | Week 1 | Based on their niche |
| Competitor analysis | Ovi | Week 1 | Their top 3 competitors |
| Content calendar | Quilly | Week 2 | Month 1 plan |
| [Custom deliverable from call] | [Agent] | [Date] | [From what was discussed] |

### Team Members (if mentioned in call)
[List any team members the client mentioned — they may need separate onboarding]

### Risks / Watch Items
[Anything from calls that flags potential issues]
```

## Step 6: Bring Plan to Chris

Post the fulfillment plan summary and notify:

```bash
bash ~/tools/scripts/notify.sh "New client onboarded: <NAME> ($<AMOUNT>). Fulfillment plan ready for review."
```

Post the plan in `🐙・scan-bot` on Discord for Chris to review:

```
mcp__discord__send-message -> server: "Rawgrowth Consulting", channel: "🐙・scan-bot",
  message: "<FULFILLMENT PLAN SUMMARY — key deliverables and timeline>"
```

Save as deliverable:

```bash
python3 ~/tools/scripts/save-deliverable.py \
  --title "Fulfillment Plan: <CLIENT_NAME>" \
  --type document \
  --agent scan \
  --file /tmp/fulfillment-plan-<name>.md \
  --tags '["client", "onboarding", "<CLIENT_NAME>"]' \
  --status completed
```

## n8n Webhook Setup (Stripe → Auto-Trigger)

Create an n8n workflow at `http://localhost:5678`:

1. **Trigger:** Webhook node — receives Stripe `checkout.session.completed` or `invoice.paid` event
2. **Extract:** Pull `customer_email`, `customer_name`, `amount_total` from the Stripe payload
3. **Execute:** Run shell command:
   ```bash
   /Users/scanbot/.claude/skills/client-onboard-pipeline/scripts/onboard-client.py \
     --email "{{ $json.customer_email }}" \
     --name "{{ $json.customer_name }}" \
     --amount {{ $json.amount_total / 100 }}
   ```
4. **Notify:** Send notification to Chris via notify.sh

Then register the webhook URL in Stripe Dashboard → Developers → Webhooks → Add endpoint.

**Until webhook is wired:** manually trigger with `/client-onboard-pipeline` and provide the email.

## Error Handling

| Problem | Solution |
|---------|----------|
| No sales calls found | Onboard with available data, flag to Chris for context |
| No agreement in email | Ask Chris what was promised, or proceed with standard DFY scope |
| Discord channel creation fails | Post in scan-bot, ask Chris to create manually |
| Client already exists in Supabase | Update their record, don't duplicate |
| Multiple team members | Create one primary channel, note team members in plan |

## Cleanup

```bash
rm -f /tmp/onboard-*.json /tmp/fulfillment-plan-*.md
```
