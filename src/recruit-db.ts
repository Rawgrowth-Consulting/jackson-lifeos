/**
 * Recruiting Database — Supabase REST API
 *
 * All recruiting data lives in Supabase PostgreSQL, accessed via the PostgREST API.
 * This avoids IPv6/IPv4 issues with direct PostgreSQL connections.
 * Tables are pre-created via direct PG or the Supabase dashboard.
 */

import { readEnvFile } from './env.js';
import { logger } from './logger.js';

// ── Configuration ───────────────────────────────────────────────────

const envConfig = readEnvFile(['SUPABASE_RECRUIT_URL', 'SUPABASE_RECRUIT_KEY']);
const SUPABASE_URL = (process.env.SUPABASE_RECRUIT_URL || envConfig.SUPABASE_RECRUIT_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_RECRUIT_KEY || envConfig.SUPABASE_RECRUIT_KEY || '';

function headers(prefer?: string): Record<string, string> {
  const h: Record<string, string> = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };
  if (prefer) h['Prefer'] = prefer;
  return h;
}

function api(table: string, query = ''): string {
  return `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`;
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
  sales_experience: string;
  sales_years: string;
  why_insurance: string;
  income_goal: string;
  hours_per_week: string;
  financial_runway: string;
  coachability: string;
  start_timeline: string;
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

// ── Migration (no-op for REST — tables created via direct PG or dashboard) ──

export async function runRecruitingMigrations(): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    logger.warn('SUPABASE_RECRUIT_URL or SUPABASE_RECRUIT_KEY not set — recruiting disabled');
    return;
  }
  // Verify connection by hitting the API
  try {
    const resp = await fetch(api('recruits', 'select=id&limit=1'), { headers: headers() });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`${resp.status}: ${text}`);
    }
    logger.info('Recruiting Supabase REST API connected');
  } catch (err) {
    logger.error({ err }, 'Failed to connect to recruiting database');
  }
}

// ── Lead Scoring ────────────────────────────────────────────────────

export function calculateLeadScore(q: RecruitQualification): number {
  let score = 0;
  let weights = 0;

  const salesExpScores: Record<string, number> = { none: 2, some: 6, strong: 10 };
  score += (salesExpScores[q.sales_experience] ?? 5) * 3;
  weights += 3;

  const salesYearsScores: Record<string, number> = { '0': 2, '1-2': 5, '3-5': 8, '5+': 10 };
  score += (salesYearsScores[q.sales_years] ?? 3) * 2;
  weights += 2;

  const incomeScores: Record<string, number> = { '50k': 4, '75k': 6, '100k': 8, '150k+': 10 };
  score += (incomeScores[q.income_goal] ?? 5) * 1;
  weights += 1;

  const hoursScores: Record<string, number> = { part_10: 2, part_20: 5, full_30: 7, 'full_40+': 10 };
  score += (hoursScores[q.hours_per_week] ?? 5) * 2;
  weights += 2;

  const runwayScores: Record<string, number> = { none: 1, '1_month': 4, '3_months': 7, '6_months+': 10 };
  score += (runwayScores[q.financial_runway] ?? 3) * 2;
  weights += 2;

  const coachScores: Record<string, number> = { low: 2, medium: 6, high: 10 };
  score += (coachScores[q.coachability] ?? 5) * 1.5;
  weights += 1.5;

  const timelineScores: Record<string, number> = { asap: 10, '2_weeks': 8, '1_month': 5, not_sure: 2 };
  score += (timelineScores[q.start_timeline] ?? 4) * 1.5;
  weights += 1.5;

  const raw = score / weights;
  return Math.max(1, Math.min(10, Math.round(raw)));
}

// ── Helper: compute meta fields client-side ─────────────────────────

function addMeta(recruit: Recruit, steps: RecruitStep[]): RecruitWithMeta {
  const stepsForRecruit = steps.filter((s) => s.recruit_id === recruit.id);
  const completed = stepsForRecruit.filter((s) => s.completed).length;
  const daysInStage = Math.floor((Date.now() / 1000 - recruit.last_active_at) / 86400);
  return { ...recruit, steps_completed: completed, steps_total: stepsForRecruit.length, days_in_stage: daysInStage };
}

// ── CRUD Functions ──────────────────────────────────────────────────

export async function insertRecruit(recruit: Recruit): Promise<void> {
  // Insert recruit
  const resp = await fetch(api('recruits'), {
    method: 'POST',
    headers: headers('return=minimal'),
    body: JSON.stringify({
      id: recruit.id, name: recruit.name, email: recruit.email, phone: recruit.phone,
      state: recruit.state, source: recruit.source, access_token: recruit.access_token,
      pipeline_stage: recruit.pipeline_stage, notes: recruit.notes,
      lead_score: recruit.lead_score, qualification: recruit.qualification,
      created_at: recruit.created_at, last_active_at: recruit.last_active_at,
    }),
  });
  if (!resp.ok) throw new Error(`Insert recruit failed: ${await resp.text()}`);

  // Seed all steps
  const stepRows = ALL_RECRUIT_STEP_KEYS.map((key) => ({
    recruit_id: recruit.id, step_key: key, completed: 0,
  }));
  const stepsResp = await fetch(api('recruit_steps'), {
    method: 'POST',
    headers: headers('return=minimal'),
    body: JSON.stringify(stepRows),
  });
  if (!stepsResp.ok) throw new Error(`Insert steps failed: ${await stepsResp.text()}`);
}

export async function getRecruits(stage?: string): Promise<RecruitWithMeta[]> {
  let query = 'select=*&order=created_at.desc';
  if (stage) query += `&pipeline_stage=eq.${stage}`;
  const resp = await fetch(api('recruits', query), { headers: headers() });
  const recruits = await resp.json() as Recruit[];

  // Fetch all steps for computing meta
  const ids = recruits.map((r) => r.id);
  if (ids.length === 0) return [];
  const stepsResp = await fetch(api('recruit_steps', `recruit_id=in.(${ids.join(',')})&select=recruit_id,completed`), { headers: headers() });
  const steps = await stepsResp.json() as RecruitStep[];

  return recruits.map((r) => addMeta(r, steps));
}

export async function getStaleRecruits(days: number): Promise<RecruitWithMeta[]> {
  const cutoff = Math.floor(Date.now() / 1000) - days * 86400;
  const query = `select=*&last_active_at=lt.${cutoff}&pipeline_stage=neq.appointed&order=last_active_at.asc`;
  const resp = await fetch(api('recruits', query), { headers: headers() });
  const recruits = await resp.json() as Recruit[];

  const ids = recruits.map((r) => r.id);
  if (ids.length === 0) return [];
  const stepsResp = await fetch(api('recruit_steps', `recruit_id=in.(${ids.join(',')})&select=recruit_id,completed`), { headers: headers() });
  const steps = await stepsResp.json() as RecruitStep[];

  return recruits.map((r) => addMeta(r, steps));
}

export async function getRecruit(id: string): Promise<Recruit | undefined> {
  const resp = await fetch(api('recruits', `id=eq.${id}&select=*`), { headers: headers('return=representation') });
  const rows = await resp.json() as Recruit[];
  return rows[0];
}

export async function getRecruitByToken(token: string): Promise<Recruit | undefined> {
  const resp = await fetch(api('recruits', `access_token=eq.${token}&select=*`), { headers: headers() });
  const rows = await resp.json() as Recruit[];
  return rows[0];
}

export async function updateRecruitStage(id: string, stage: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await fetch(api('recruits', `id=eq.${id}`), {
    method: 'PATCH',
    headers: headers('return=minimal'),
    body: JSON.stringify({ pipeline_stage: stage, last_active_at: now }),
  });
}

export async function updateRecruitLastActive(id: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await fetch(api('recruits', `id=eq.${id}`), {
    method: 'PATCH',
    headers: headers('return=minimal'),
    body: JSON.stringify({ last_active_at: now }),
  });
}

export async function updateRecruitNotes(id: string, notes: string): Promise<void> {
  await fetch(api('recruits', `id=eq.${id}`), {
    method: 'PATCH',
    headers: headers('return=minimal'),
    body: JSON.stringify({ notes }),
  });
}

export async function deleteRecruit(id: string): Promise<boolean> {
  // Delete steps and chat first (REST API doesn't cascade)
  await fetch(api('recruit_chat_messages', `recruit_id=eq.${id}`), { method: 'DELETE', headers: headers() });
  await fetch(api('recruit_steps', `recruit_id=eq.${id}`), { method: 'DELETE', headers: headers() });
  const resp = await fetch(api('recruits', `id=eq.${id}`), { method: 'DELETE', headers: headers('return=representation') });
  const deleted = await resp.json();
  return Array.isArray(deleted) && deleted.length > 0;
}

export async function getRecruitSteps(recruitId: string): Promise<RecruitStep[]> {
  const resp = await fetch(api('recruit_steps', `recruit_id=eq.${recruitId}&select=*&order=id.asc`), { headers: headers() });
  return await resp.json() as RecruitStep[];
}

export async function completeRecruitStep(recruitId: string, stepKey: string): Promise<{ completed: boolean; newStage?: string }> {
  const now = Math.floor(Date.now() / 1000);

  // Update step
  const resp = await fetch(api('recruit_steps', `recruit_id=eq.${recruitId}&step_key=eq.${stepKey}&completed=eq.0`), {
    method: 'PATCH',
    headers: headers('return=representation'),
    body: JSON.stringify({ completed: 1, completed_at: now }),
  });
  const updated = await resp.json();
  if (!Array.isArray(updated) || updated.length === 0) return { completed: false };

  await updateRecruitLastActive(recruitId);

  // Check if all steps in this phase are complete
  const phaseKey = stepToPhase[stepKey];
  if (!phaseKey) return { completed: true };

  const phase = RECRUIT_PHASES[phaseKey];
  const phaseStepKeys = phase.steps.map((s) => s.key);

  const stepsResp = await fetch(
    api('recruit_steps', `recruit_id=eq.${recruitId}&step_key=in.(${phaseStepKeys.join(',')})&completed=eq.1&select=id`),
    { headers: headers('count=exact') },
  );
  const contentRange = stepsResp.headers.get('content-range');
  const completedCount = contentRange ? parseInt(contentRange.split('/')[1] || '0', 10) : 0;
  // fallback: count the array
  const stepsArr = await stepsResp.json();
  const count = completedCount || (Array.isArray(stepsArr) ? stepsArr.length : 0);

  if (count >= phaseStepKeys.length) {
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
  await fetch(api('recruit_steps', `recruit_id=eq.${recruitId}&step_key=eq.${stepKey}`), {
    method: 'PATCH',
    headers: headers('return=minimal'),
    body: JSON.stringify({ completed: 0, completed_at: null }),
  });
  await updateRecruitLastActive(recruitId);
}

export async function getRecruitStats(): Promise<{ total: number; inPipeline: number; conversionRate: number; avgDays: number }> {
  // Fetch all recruits (lightweight — just stage and created_at)
  const resp = await fetch(api('recruits', 'select=pipeline_stage,created_at'), { headers: headers() });
  const rows = await resp.json() as { pipeline_stage: string; created_at: number }[];

  const total = rows.length;
  const appointed = rows.filter((r) => r.pipeline_stage === 'appointed').length;
  const inPipeline = rows.filter((r) => r.pipeline_stage !== 'interested' && r.pipeline_stage !== 'appointed').length;
  const conversionRate = total > 0 ? Math.round((appointed / total) * 100) : 0;

  const nonAppointed = rows.filter((r) => r.pipeline_stage !== 'appointed');
  const avgDays = nonAppointed.length > 0
    ? Math.round(nonAppointed.reduce((sum, r) => sum + (Date.now() / 1000 - r.created_at) / 86400, 0) / nonAppointed.length)
    : 0;

  return { total, inPipeline, conversionRate, avgDays };
}

export async function insertRecruitChatMessage(msg: Omit<RecruitChatMessage, 'id'>): Promise<number> {
  const resp = await fetch(api('recruit_chat_messages'), {
    method: 'POST',
    headers: headers('return=representation'),
    body: JSON.stringify(msg),
  });
  const rows = await resp.json();
  return Array.isArray(rows) && rows[0]?.id ? rows[0].id : 0;
}

export async function getRecruitChatMessages(recruitId: string, limit = 50): Promise<RecruitChatMessage[]> {
  const resp = await fetch(
    api('recruit_chat_messages', `recruit_id=eq.${recruitId}&select=*&order=created_at.asc&limit=${limit}`),
    { headers: headers() },
  );
  return await resp.json() as RecruitChatMessage[];
}
