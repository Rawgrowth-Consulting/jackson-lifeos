/**
 * Recruiting Database — PostgreSQL (Supabase)
 *
 * All recruiting data lives in Supabase PostgreSQL.
 * This module provides the same CRUD interface that was previously in db.ts (SQLite).
 */

import pg from 'pg';
import crypto from 'crypto';
import { readEnvFile } from './env.js';
import { logger } from './logger.js';

const { Pool } = pg;

// ── Configuration ───────────────────────────────────────────────────

const envConfig = readEnvFile(['SUPABASE_DATABASE_URL']);
const DATABASE_URL = process.env.SUPABASE_DATABASE_URL || envConfig.SUPABASE_DATABASE_URL || '';

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    if (!DATABASE_URL) {
      throw new Error('SUPABASE_DATABASE_URL not set — recruiting database unavailable');
    }
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
    pool.on('error', (err) => {
      logger.error({ err }, 'Recruiting database pool error');
    });
  }
  return pool;
}

// ── Pipeline Stages & Phases ────────────────────────────────────────

export const RECRUIT_PIPELINE_STAGES = [
  'interested',
  'getting_started',
  'pre_licensing',
  'exam_prep',
  'licensed',
  'contracting',
  'appointed',
] as const;

export type RecruitPipelineStage = (typeof RECRUIT_PIPELINE_STAGES)[number];

export interface RecruitPhase {
  label: string;
  pipelineStage: RecruitPipelineStage;
  steps: { key: string; label: string }[];
}

export const RECRUIT_PHASES: Record<string, RecruitPhase> = {
  getting_started: {
    label: 'Step 1: Schedule Your State Exam',
    pipelineStage: 'getting_started',
    steps: [
      { key: 'getting_started.find_state', label: 'Find your state exam instructions on Prepare2Pass' },
      { key: 'getting_started.register_exam', label: 'Register and pay for your LIFE exam' },
      { key: 'getting_started.schedule_exam', label: 'Choose your exam date and time' },
      { key: 'getting_started.forward_confirmation', label: 'Forward your exam confirmation email to admin' },
    ],
  },
  pre_licensing: {
    label: 'Step 2: Enroll in Pre-Licensing Course (XCEL)',
    pipelineStage: 'pre_licensing',
    steps: [
      { key: 'pre_licensing.visit_xcel', label: 'Visit the XCEL Solutions enrollment page' },
      { key: 'pre_licensing.select_course', label: 'Select your state, Life pre-licensing, and course type' },
      { key: 'pre_licensing.create_account', label: 'Create your XCEL account and complete checkout' },
      { key: 'pre_licensing.complete_course', label: 'Complete the pre-licensing coursework' },
      { key: 'pre_licensing.confirm_enrolled', label: 'Reply ENROLLED to admin email' },
    ],
  },
  exam_prep: {
    label: 'Step 3: Pass Your State Exam',
    pipelineStage: 'exam_prep',
    steps: [
      { key: 'exam_prep.study', label: 'Study and prepare for the exam' },
      { key: 'exam_prep.take_exam', label: 'Take and pass your state Life exam' },
      { key: 'exam_prep.get_npn', label: 'Get your NPN (National Producer Number) from NIPR' },
    ],
  },
  licensed: {
    label: 'Step 3: Gather Contracting Requirements',
    pipelineStage: 'licensed',
    steps: [
      { key: 'licensed.eo_insurance', label: 'Purchase E&O insurance via NAPA ($1M/$1M minimum)' },
      { key: 'licensed.voided_check', label: 'Get a voided check or bank letter for direct deposit' },
      { key: 'licensed.pro_email', label: 'Create a professional email address' },
      { key: 'licensed.send_docs', label: 'Send NPN, E&O, voided check, and email to admin' },
    ],
  },
  contracting: {
    label: 'Step 4: Create Your SureLC Account',
    pipelineStage: 'contracting',
    steps: [
      { key: 'contracting.create_surelc', label: 'Create your SureLC account using the provided link' },
      { key: 'contracting.watch_videos', label: 'Watch the SureLC walkthrough videos' },
      { key: 'contracting.complete_profile', label: 'Complete your SureLC profile (no red/yellow dots)' },
      { key: 'contracting.aml_training', label: 'Complete Anti-Money Laundering (AML) training' },
      { key: 'contracting.save_aml_cert', label: 'Save your AML certificate' },
    ],
  },
  appointed: {
    label: 'Step 5: Complete NLC Onboarding',
    pipelineStage: 'appointed',
    steps: [
      { key: 'appointed.login_gateway', label: 'Log in to Gateway using your HCMS login' },
      { key: 'appointed.complete_onboarding', label: 'Complete NLC onboarding profile' },
      { key: 'appointed.upload_aml', label: 'Upload AML certificate to NLC Trainings tab' },
      { key: 'appointed.submit_contracts', label: 'Submit carrier contracts (Aetna, Americo, American Amicable, Corebridge, Ethos, Mutual of Omaha, TransAmerica)' },
      { key: 'appointed.enter_codes', label: 'Enter verification codes and confirm submissions' },
      { key: 'appointed.notify_admin', label: 'Notify admin that all contracts have been submitted' },
      { key: 'appointed.new_agent_bootcamp', label: 'Complete New Agent Bootcamp videos' },
    ],
  },
};

/** Flat list of all step keys across all phases. */
export const ALL_RECRUIT_STEP_KEYS = Object.values(RECRUIT_PHASES).flatMap((p) => p.steps.map((s) => s.key));

/** Map from step key → phase key for quick lookup. */
const stepToPhase: Record<string, string> = {};
for (const [phaseKey, phase] of Object.entries(RECRUIT_PHASES)) {
  for (const step of phase.steps) {
    stepToPhase[step.key] = phaseKey;
  }
}

// ── Types ────────────────────────────────────────────────────────────

export interface RecruitQualification {
  sales_experience: string;       // 'none' | 'some' | 'strong'
  sales_years: string;            // '0' | '1-2' | '3-5' | '5+'
  why_insurance: string;          // free text
  income_goal: string;            // '50k' | '75k' | '100k' | '150k+'
  hours_per_week: string;         // 'part_10' | 'part_20' | 'full_30' | 'full_40+'
  financial_runway: string;       // 'none' | '1_month' | '3_months' | '6_months+'
  coachability: string;           // 'low' | 'medium' | 'high'
  start_timeline: string;         // 'asap' | '2_weeks' | '1_month' | 'not_sure'
}

export interface Recruit {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  source: string;
  access_token: string;
  pipeline_stage: string;
  notes: string;
  lead_score: number;
  qualification: RecruitQualification | null;
  created_at: number;
  last_active_at: number;
}

export interface RecruitWithMeta extends Recruit {
  steps_completed: number;
  steps_total: number;
  days_in_stage: number;
}

export interface RecruitStep {
  id: number;
  recruit_id: string;
  step_key: string;
  completed: number;
  completed_at: number | null;
}

export interface RecruitChatMessage {
  id: number;
  recruit_id: string;
  role: string;
  content: string;
  created_at: number;
}

// ── Schema Migration ────────────────────────────────────────────────

export async function runRecruitingMigrations(): Promise<void> {
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS recruits (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      email           TEXT NOT NULL DEFAULT '',
      phone           TEXT NOT NULL DEFAULT '',
      state           TEXT NOT NULL DEFAULT '',
      source          TEXT NOT NULL DEFAULT 'form',
      access_token    TEXT NOT NULL UNIQUE,
      pipeline_stage  TEXT NOT NULL DEFAULT 'interested',
      notes           TEXT NOT NULL DEFAULT '',
      created_at      BIGINT NOT NULL,
      last_active_at  BIGINT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_recruits_stage ON recruits(pipeline_stage);
    CREATE INDEX IF NOT EXISTS idx_recruits_token ON recruits(access_token);
    CREATE INDEX IF NOT EXISTS idx_recruits_time ON recruits(created_at DESC);

    CREATE TABLE IF NOT EXISTS recruit_steps (
      id          SERIAL PRIMARY KEY,
      recruit_id  TEXT NOT NULL REFERENCES recruits(id) ON DELETE CASCADE,
      step_key    TEXT NOT NULL,
      completed   INTEGER NOT NULL DEFAULT 0,
      completed_at BIGINT,
      UNIQUE(recruit_id, step_key)
    );

    CREATE INDEX IF NOT EXISTS idx_recruit_steps_recruit ON recruit_steps(recruit_id);

    CREATE TABLE IF NOT EXISTS recruit_chat_messages (
      id          SERIAL PRIMARY KEY,
      recruit_id  TEXT NOT NULL REFERENCES recruits(id) ON DELETE CASCADE,
      role        TEXT NOT NULL,
      content     TEXT NOT NULL,
      created_at  BIGINT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_recruit_chat_recruit ON recruit_chat_messages(recruit_id, created_at DESC);
  `);

  // Add qualification columns (idempotent)
  await db.query(`
    DO $$ BEGIN
      ALTER TABLE recruits ADD COLUMN IF NOT EXISTS lead_score INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE recruits ADD COLUMN IF NOT EXISTS qualification JSONB;
    EXCEPTION WHEN others THEN NULL;
    END $$;
  `);

  logger.info('Recruiting PostgreSQL migrations complete');
}

// ── Lead Scoring ────────────────────────────────────────────────────

export function calculateLeadScore(q: RecruitQualification): number {
  let score = 0;
  let weights = 0;

  // Sales experience (weight: 3)
  const salesExpScores: Record<string, number> = { none: 2, some: 6, strong: 10 };
  score += (salesExpScores[q.sales_experience] ?? 5) * 3;
  weights += 3;

  // Years in sales (weight: 2)
  const salesYearsScores: Record<string, number> = { '0': 2, '1-2': 5, '3-5': 8, '5+': 10 };
  score += (salesYearsScores[q.sales_years] ?? 3) * 2;
  weights += 2;

  // Income goal — higher goals = more motivated (weight: 1)
  const incomeScores: Record<string, number> = { '50k': 4, '75k': 6, '100k': 8, '150k+': 10 };
  score += (incomeScores[q.income_goal] ?? 5) * 1;
  weights += 1;

  // Hours per week (weight: 2)
  const hoursScores: Record<string, number> = { part_10: 2, part_20: 5, full_30: 7, 'full_40+': 10 };
  score += (hoursScores[q.hours_per_week] ?? 5) * 2;
  weights += 2;

  // Financial runway (weight: 2)
  const runwayScores: Record<string, number> = { none: 1, '1_month': 4, '3_months': 7, '6_months+': 10 };
  score += (runwayScores[q.financial_runway] ?? 3) * 2;
  weights += 2;

  // Coachability (weight: 1.5)
  const coachScores: Record<string, number> = { low: 2, medium: 6, high: 10 };
  score += (coachScores[q.coachability] ?? 5) * 1.5;
  weights += 1.5;

  // Start timeline (weight: 1.5)
  const timelineScores: Record<string, number> = { asap: 10, '2_weeks': 8, '1_month': 5, not_sure: 2 };
  score += (timelineScores[q.start_timeline] ?? 4) * 1.5;
  weights += 1.5;

  // Normalize to 1-10
  const raw = score / weights;
  return Math.max(1, Math.min(10, Math.round(raw)));
}

// ── CRUD Functions ──────────────────────────────────────────────────

export async function insertRecruit(recruit: Recruit): Promise<void> {
  const db = getPool();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO recruits (id, name, email, phone, state, source, access_token, pipeline_stage, notes, lead_score, qualification, created_at, last_active_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [recruit.id, recruit.name, recruit.email, recruit.phone, recruit.state,
       recruit.source, recruit.access_token, recruit.pipeline_stage, recruit.notes,
       recruit.lead_score, recruit.qualification ? JSON.stringify(recruit.qualification) : null,
       recruit.created_at, recruit.last_active_at],
    );
    for (const key of ALL_RECRUIT_STEP_KEYS) {
      await client.query(
        'INSERT INTO recruit_steps (recruit_id, step_key, completed) VALUES ($1, $2, 0)',
        [recruit.id, key],
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getRecruits(stage?: string): Promise<RecruitWithMeta[]> {
  const db = getPool();
  let query = `
    SELECT r.*,
      (SELECT COUNT(*) FROM recruit_steps WHERE recruit_id = r.id AND completed = 1)::int AS steps_completed,
      (SELECT COUNT(*) FROM recruit_steps WHERE recruit_id = r.id)::int AS steps_total,
      EXTRACT(EPOCH FROM (NOW() - TO_TIMESTAMP(r.last_active_at)))::int / 86400 AS days_in_stage
    FROM recruits r
  `;
  const params: unknown[] = [];
  if (stage) {
    query += ' WHERE r.pipeline_stage = $1';
    params.push(stage);
  }
  query += ' ORDER BY r.created_at DESC';
  const result = await db.query(query, params);
  return result.rows as RecruitWithMeta[];
}

export async function getStaleRecruits(days: number): Promise<RecruitWithMeta[]> {
  const db = getPool();
  const cutoff = Math.floor(Date.now() / 1000) - days * 86400;
  const result = await db.query(`
    SELECT r.*,
      (SELECT COUNT(*) FROM recruit_steps WHERE recruit_id = r.id AND completed = 1)::int AS steps_completed,
      (SELECT COUNT(*) FROM recruit_steps WHERE recruit_id = r.id)::int AS steps_total,
      EXTRACT(EPOCH FROM (NOW() - TO_TIMESTAMP(r.last_active_at)))::int / 86400 AS days_in_stage
    FROM recruits r
    WHERE r.last_active_at < $1 AND r.pipeline_stage != 'appointed'
    ORDER BY r.last_active_at ASC
  `, [cutoff]);
  return result.rows as RecruitWithMeta[];
}

export async function getRecruit(id: string): Promise<Recruit | undefined> {
  const db = getPool();
  const result = await db.query('SELECT * FROM recruits WHERE id = $1', [id]);
  return result.rows[0] as Recruit | undefined;
}

export async function getRecruitByToken(token: string): Promise<Recruit | undefined> {
  const db = getPool();
  const result = await db.query('SELECT * FROM recruits WHERE access_token = $1', [token]);
  return result.rows[0] as Recruit | undefined;
}

export async function updateRecruitStage(id: string, stage: string): Promise<void> {
  const db = getPool();
  const now = Math.floor(Date.now() / 1000);
  await db.query('UPDATE recruits SET pipeline_stage = $1, last_active_at = $2 WHERE id = $3', [stage, now, id]);
}

export async function updateRecruitLastActive(id: string): Promise<void> {
  const db = getPool();
  const now = Math.floor(Date.now() / 1000);
  await db.query('UPDATE recruits SET last_active_at = $1 WHERE id = $2', [now, id]);
}

export async function updateRecruitNotes(id: string, notes: string): Promise<void> {
  const db = getPool();
  await db.query('UPDATE recruits SET notes = $1 WHERE id = $2', [notes, id]);
}

export async function deleteRecruit(id: string): Promise<boolean> {
  const db = getPool();
  // ON DELETE CASCADE handles recruit_steps and recruit_chat_messages
  const result = await db.query('DELETE FROM recruits WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function getRecruitSteps(recruitId: string): Promise<RecruitStep[]> {
  const db = getPool();
  const result = await db.query(
    'SELECT * FROM recruit_steps WHERE recruit_id = $1 ORDER BY id ASC',
    [recruitId],
  );
  return result.rows as RecruitStep[];
}

/**
 * Mark a step as completed. If all steps in the step's phase are now done,
 * returns the next pipeline stage so the caller can auto-advance.
 */
export async function completeRecruitStep(recruitId: string, stepKey: string): Promise<{ completed: boolean; newStage?: string }> {
  const db = getPool();
  const now = Math.floor(Date.now() / 1000);
  const result = await db.query(
    'UPDATE recruit_steps SET completed = 1, completed_at = $1 WHERE recruit_id = $2 AND step_key = $3 AND completed = 0',
    [now, recruitId, stepKey],
  );

  if ((result.rowCount ?? 0) === 0) return { completed: false };

  await updateRecruitLastActive(recruitId);

  // Check if all steps in this phase are complete
  const phaseKey = stepToPhase[stepKey];
  if (!phaseKey) return { completed: true };

  const phase = RECRUIT_PHASES[phaseKey];
  const phaseStepKeys = phase.steps.map((s) => s.key);
  const countResult = await db.query(
    `SELECT COUNT(*) AS cnt FROM recruit_steps WHERE recruit_id = $1 AND step_key = ANY($2) AND completed = 1`,
    [recruitId, phaseStepKeys],
  );
  const completedCount = parseInt(countResult.rows[0].cnt, 10);

  if (completedCount >= phaseStepKeys.length) {
    // All steps in this phase are done — find the next stage
    const stageIndex = RECRUIT_PIPELINE_STAGES.indexOf(phase.pipelineStage);
    if (stageIndex >= 0 && stageIndex < RECRUIT_PIPELINE_STAGES.length - 1) {
      const nextStage = RECRUIT_PIPELINE_STAGES[stageIndex + 1];
      await updateRecruitStage(recruitId, nextStage);
      return { completed: true, newStage: nextStage };
    }
  }

  return { completed: true };
}

export async function uncompleteRecruitStep(recruitId: string, stepKey: string): Promise<void> {
  const db = getPool();
  await db.query(
    'UPDATE recruit_steps SET completed = 0, completed_at = NULL WHERE recruit_id = $1 AND step_key = $2',
    [recruitId, stepKey],
  );
  await updateRecruitLastActive(recruitId);
}

export async function getRecruitStats(): Promise<{ total: number; inPipeline: number; conversionRate: number; avgDays: number }> {
  const db = getPool();
  const result = await db.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE pipeline_stage NOT IN ('interested', 'appointed'))::int AS in_pipeline,
      COUNT(*) FILTER (WHERE pipeline_stage = 'appointed')::int AS appointed,
      COALESCE(AVG(EXTRACT(EPOCH FROM (NOW() - TO_TIMESTAMP(created_at))) / 86400) FILTER (WHERE pipeline_stage != 'appointed'), 0)::int AS avg_days
    FROM recruits
  `);
  const row = result.rows[0];
  const total = row.total || 0;
  const appointed = row.appointed || 0;
  const conversionRate = total > 0 ? Math.round((appointed / total) * 100) : 0;

  return {
    total,
    inPipeline: row.in_pipeline || 0,
    conversionRate,
    avgDays: row.avg_days || 0,
  };
}

export async function insertRecruitChatMessage(msg: Omit<RecruitChatMessage, 'id'>): Promise<number> {
  const db = getPool();
  const result = await db.query(
    'INSERT INTO recruit_chat_messages (recruit_id, role, content, created_at) VALUES ($1, $2, $3, $4) RETURNING id',
    [msg.recruit_id, msg.role, msg.content, msg.created_at],
  );
  return result.rows[0].id;
}

export async function getRecruitChatMessages(recruitId: string, limit = 50): Promise<RecruitChatMessage[]> {
  const db = getPool();
  const result = await db.query(
    'SELECT * FROM recruit_chat_messages WHERE recruit_id = $1 ORDER BY created_at ASC LIMIT $2',
    [recruitId, limit],
  );
  return result.rows as RecruitChatMessage[];
}
