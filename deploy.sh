#!/bin/bash
# Deploy Jackson's Life OS to his VPS
# Usage: ./deploy.sh [command]

VPS="root@5.78.179.49"
REMOTE_DIR="/opt/rawclaw"

set -e

case "${1:-}" in
  --push)
    echo "==> Pushing to GitHub..."
    git push
    echo "==> Pulling on VPS..."
    ssh "$VPS" "cd $REMOTE_DIR && git pull && npx tsc && chown -R rawclaw:rawclaw $REMOTE_DIR && systemctl restart rawclaw"
    echo "==> Deployed."
    ;;
  --restart)
    echo "==> Restarting..."
    ssh "$VPS" "systemctl restart rawclaw && sleep 2 && systemctl status rawclaw --no-pager | head -5"
    ;;
  --logs)
    ssh "$VPS" "journalctl -u rawclaw --no-pager -n 30"
    ;;
  --status)
    ssh "$VPS" "systemctl status rawclaw --no-pager | head -8"
    ;;
  --tunnel)
    echo "==> Dashboard at http://localhost:3141"
    echo "    Press Ctrl+C to close"
    ssh -N -L 3141:localhost:3141 "$VPS"
    ;;
  *)
    echo "Jackson Life OS Deploy (VPS: 5.78.179.49)"
    echo ""
    echo "  ./deploy.sh --push      Commit, push, build, restart on VPS"
    echo "  ./deploy.sh --restart   Restart the service"
    echo "  ./deploy.sh --logs      View recent logs"
    echo "  ./deploy.sh --status    Check service status"
    echo "  ./deploy.sh --tunnel    SSH tunnel to dashboard (localhost:3141)"
    ;;
esac
