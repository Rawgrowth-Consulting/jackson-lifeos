# Jackson LifeOS -- Global Rules

These rules apply to ALL agents and all work in this repo. Agent-specific CLAUDE.md files inherit from this one.

## Deployment: VPS Always

**This entire system lives on the VPS. Every change deploys to the VPS. No exceptions.**

- **VPS**: Hetzner Ubuntu -- IP `5.78.179.49`, hostname `RawClaw`
- **Project directory on VPS**: `/opt/rawclaw`
- **Service**: `rawclaw.service` (systemd)
- **User**: `rawclaw`

Local machines are ONLY used for editing code. The system runs on the VPS. When you build, test, configure, reference paths, or deploy -- you are targeting the VPS environment (Ubuntu Linux), not macOS or any local machine.

This means:
- All file paths in code should work on the VPS (`/opt/rawclaw/...`)
- All systemd service management targets the VPS
- Database files live on the VPS (`/opt/rawclaw/store/`)
- Environment variables are configured on the VPS
- Any "does this work?" testing means testing on the VPS
- Never assume a local dev server is the production environment
