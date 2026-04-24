import fs from 'fs';
import path from 'path';

import { loadAgentConfig, resolveAgentDir, resolveAgentClaudeMd } from './agent-config.js';
import { createBot } from './bot.js';
import { checkPendingMigrations } from './migrations.js';
import { ALLOWED_CHAT_ID, activeBotToken, STORE_DIR, PROJECT_ROOT, GOOGLE_API_KEY, setAgentOverrides, SECURITY_PIN_HASH, IDLE_LOCK_MINUTES, EMERGENCY_KILL_PHRASE } from './config.js';
import { startDashboard } from './dashboard.js';
import { initDatabase, cleanupOldMissionTasks, insertAuditLog, getDbTableNames, getMemoryCount, getAllScheduledTasks, insertHeartbeatRun, updateHeartbeatRun, getTokenSpendForBudget, getBudgetPolicies, clearSessionForAgent } from './db.js';
import { initSecurity, setAuditCallback } from './security.js';
import { logger } from './logger.js';
import { cleanupOldUploads } from './media.js';
import { runConsolidation } from './memory-consolidate.js';
import { runDecaySweep } from './memory.js';
import { initOrchestrator } from './orchestrator.js';
import { initScheduler } from './scheduler.js';
import { setTelegramConnected, setBotInfo } from './state.js';

// v2 modules
import { registerHeartbeatDb } from './heartbeat.js';
import { registerBudgetDb } from './budget.js';
import { registerHealthDb } from './health.js';
import { registerSessionDb } from './session-compaction.js';
import { startHealthMonitor, stopHealthMonitor } from './health.js';
import { loadPlugins, shutdownPlugins } from './plugins.js';
import { syncMcpToClaudeSettings } from './mcp-config.js';

// Parse --agent flag
const agentFlagIndex = process.argv.indexOf('--agent');
const AGENT_ID = agentFlagIndex !== -1 ? process.argv[agentFlagIndex + 1] : 'main';

// Export AGENT_ID to env so child processes (schedule-cli, etc.) inherit it
process.env.RAWCLAW_AGENT_ID = AGENT_ID;

if (AGENT_ID !== 'main') {
  const agentConfig = loadAgentConfig(AGENT_ID);
  const agentDir = resolveAgentDir(AGENT_ID);
  const claudeMdPath = resolveAgentClaudeMd(AGENT_ID);
  let systemPrompt: string | undefined;
  if (claudeMdPath) {
    try {
      systemPrompt = fs.readFileSync(claudeMdPath, 'utf-8');
    } catch { /* no CLAUDE.md */ }
  }
  setAgentOverrides({
    agentId: AGENT_ID,
    botToken: agentConfig.botToken,
    cwd: agentDir,
    model: agentConfig.model,
    systemPrompt,
  });
  logger.info({ agentId: AGENT_ID, name: agentConfig.name }, 'Running as agent');
} else {
  const projectClaudeMd = path.join(PROJECT_ROOT, 'CLAUDE.md');
  if (fs.existsSync(projectClaudeMd)) {
    let systemPrompt: string | undefined;
    try {
      systemPrompt = fs.readFileSync(projectClaudeMd, 'utf-8');
    } catch { /* unreadable */ }
    if (systemPrompt) {
      setAgentOverrides({
        agentId: 'main',
        botToken: activeBotToken,
        cwd: PROJECT_ROOT,
        systemPrompt,
      });
      logger.info({ source: projectClaudeMd }, 'Loaded CLAUDE.md');
    }
  } else {
    logger.warn('No CLAUDE.md found at %s.', projectClaudeMd);
  }
}

const PID_FILE = path.join(STORE_DIR, `${AGENT_ID === 'main' ? 'rawclaw' : `agent-${AGENT_ID}`}.pid`);

function showBanner(): void {
  const bannerPath = path.join(PROJECT_ROOT, 'banner.txt');
  try {
    const banner = fs.readFileSync(bannerPath, 'utf-8');
    console.log('\n' + banner);
  } catch {
    console.log('\n  RawClaw\n');
  }
}

/**
 * Acquire the single-instance lock. Returns true if we had to terminate a
 * predecessor process — caller can use this to delay Telegram polling until
 * any stale getUpdates long-poll has timed out on Telegram's side (otherwise
 * the new process races the old one's dying poll and gets 409'd).
 */
function acquireLock(): boolean {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  let killedPredecessor = false;
  try {
    if (fs.existsSync(PID_FILE)) {
      const old = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);
      if (!isNaN(old) && old !== process.pid) {
        try {
          process.kill(old, 'SIGTERM');
          killedPredecessor = true;
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
        } catch { /* already dead */ }
      }
    }
  } catch { /* ignore */ }
  fs.writeFileSync(PID_FILE, String(process.pid), { mode: 0o600 });
  return killedPredecessor;
}

function releaseLock(): void {
  try { fs.unlinkSync(PID_FILE); } catch { /* ignore */ }
}

async function main(): Promise<void> {
  
  checkPendingMigrations(PROJECT_ROOT);

  if (AGENT_ID === 'main') {
    showBanner();
  }

  if (!activeBotToken) {
    if (AGENT_ID === 'main') {
      logger.error('Bot token is not set. Run npm run setup to configure it.');
    } else {
      logger.error({ agentId: AGENT_ID }, `Configuration for agent "${AGENT_ID}" is broken: bot token not set. Check .env or re-run npm run agent:create.`);
    }
    process.exit(1);
  }

  const killedPredecessor = acquireLock();

  initDatabase();
  logger.info('Database ready');

  // v2: Wire up module registrations (avoids circular imports)
  registerHeartbeatDb({
    insertRun: insertHeartbeatRun,
    updateRun: updateHeartbeatRun,
  });
  registerBudgetDb({
    getSpend: getTokenSpendForBudget,
    getPolicies: getBudgetPolicies,
  });
  registerHealthDb({
    getDbTableNames,
    getMemoryCount,
    getScheduledTasks: getAllScheduledTasks,
  });
  registerSessionDb({
    clearSession: clearSessionForAgent,
  });
  logger.info('v2 modules registered');

  // Initialize security (PIN lock, kill phrase, destructive confirmation, audit)
  initSecurity({
    pinHash: SECURITY_PIN_HASH || undefined,
    idleLockMinutes: IDLE_LOCK_MINUTES,
    killPhrase: EMERGENCY_KILL_PHRASE || undefined,
  });
  setAuditCallback((entry) => {
    insertAuditLog(entry.agentId, entry.chatId, entry.action, entry.detail, entry.blocked);
  });

  initOrchestrator();

  // Sync MCP server configs to Claude Code's settings
  syncMcpToClaudeSettings();

  // v2: Load plugins and start health monitor (main process only)
  if (AGENT_ID === 'main') {
    try {
      await loadPlugins();
      logger.info('Plugins loaded');
    } catch (e) {
      logger.warn({ error: String(e) }, 'Plugin loading failed (non-fatal)');
    }
    startHealthMonitor();
  }

  // Decay and consolidation run ONLY in the main process to prevent
  // multi-process over-decay (5x decay on simultaneous restart) and
  // duplicate consolidation records from overlapping memory batches.
  if (AGENT_ID === 'main') {
    runDecaySweep();
    cleanupOldMissionTasks(7);
    setInterval(() => { runDecaySweep(); cleanupOldMissionTasks(7); }, 24 * 60 * 60 * 1000);

    // Memory consolidation: find patterns across recent memories every 30 minutes
    if (ALLOWED_CHAT_ID && GOOGLE_API_KEY) {
      // Delay first consolidation 2 minutes after startup to let things settle
      setTimeout(() => {
        void runConsolidation(ALLOWED_CHAT_ID).catch((err) =>
          logger.error({ err }, 'Initial consolidation failed'),
        );
      }, 2 * 60 * 1000);
      setInterval(() => {
        void runConsolidation(ALLOWED_CHAT_ID).catch((err) =>
          logger.error({ err }, 'Periodic consolidation failed'),
        );
      }, 30 * 60 * 1000);
      logger.info('Memory consolidation enabled (every 30 min)');
    }
  } else {
    logger.info({ agentId: AGENT_ID }, 'Skipping decay/consolidation (main process owns these)');
  }

  cleanupOldUploads();

  const bot = createBot();

  // Start dashboard. When running as a named agent (e.g. --agent gurt)
  // that serves as the primary process, the dashboard still needs to run.
  startDashboard(bot.api);

  if (ALLOWED_CHAT_ID) {
    initScheduler(
      async (text) => {
        // Split long messages to respect Telegram's 4096 char limit.
        // The scheduler's splitMessage handles chunking, but the sender
        // callback is also called directly for status messages which may exceed the limit.
        const { splitMessage } = await import('./bot.js');
        for (const chunk of splitMessage(text)) {
          await bot.api.sendMessage(ALLOWED_CHAT_ID, chunk, { parse_mode: 'HTML' }).catch((err) =>
            logger.error({ err }, 'Scheduler failed to send message'),
          );
        }
      },
      AGENT_ID,
    );
  } else {
    logger.warn('ALLOWED_CHAT_ID not set — scheduler disabled (no destination for results)');
  }

  const shutdown = async () => {
    logger.info('Shutting down...');
    stopHealthMonitor();
    await shutdownPlugins();
    setTelegramConnected(false);
    releaseLock();
    await bot.stop();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  logger.info({ agentId: AGENT_ID }, 'Starting RawClaw...');

  // Telegram's getUpdates long-poll can linger for ~30s after a crash/SIGTERM
  // before Telegram releases the session. If we terminated a predecessor
  // during acquireLock, wait out that window before our first poll to avoid
  // the new process racing the dying one's poll and flapping on 409.
  if (killedPredecessor) {
    const WARMUP_MS = 30_000;
    logger.info({ warmupMs: WARMUP_MS }, 'Killed a predecessor process — waiting out its stale Telegram long-poll before starting.');
    await new Promise((r) => setTimeout(r, WARMUP_MS));
  }

  // Retry bot.start() on 409 conflicts. Between attempts we must (a) fully
  // stop the Bot to reset grammy's internal polling state and (b) pass
  // drop_pending_updates on retry so Telegram flushes the offset that caused
  // the conflict — otherwise the second start races its own stale poll and
  // flaps every 30s (bug: observed 2026-04-24).
  const MAX_RETRIES = 10;
  const RETRY_DELAY_MS = 10_000;

  const onStart = (botInfo: { username?: string; first_name?: string }) => {
    setTelegramConnected(true);
    setBotInfo(botInfo.username ?? '', botInfo.first_name ?? 'RawClaw');
    logger.info({ username: botInfo.username }, 'RawClaw is running');
    if (AGENT_ID === 'main') {
      console.log(`\n  RawClaw online: @${botInfo.username}`);
      if (!ALLOWED_CHAT_ID) {
        console.log(`  Send /chatid to get your chat ID for ALLOWED_CHAT_ID`);
      }
      console.log();
    } else {
      console.log(`\n  RawClaw agent [${AGENT_ID}] online: @${botInfo.username}\n`);
    }
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await bot.start({
        drop_pending_updates: attempt > 1,
        onStart,
      });
      break;
    } catch (err: unknown) {
      const is409 = err instanceof Error && err.message.includes('409');
      if (is409 && attempt < MAX_RETRIES) {
        logger.warn(
          { attempt, maxRetries: MAX_RETRIES },
          'Telegram 409 conflict (stale poll). Retrying in %ds...',
          RETRY_DELAY_MS / 1000,
        );
        // Release grammy's internal polling state so the next start() gets a
        // clean slate. Without this, re-calling start() on the same Bot keeps
        // the old offset and immediately re-triggers the 409.
        await bot.stop().catch(() => { /* already stopped */ });
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
      throw err;
    }
  }
}

main().catch((err: unknown) => {
  logger.error({ err }, 'Fatal error');
  releaseLock();
  process.exit(1);
});
