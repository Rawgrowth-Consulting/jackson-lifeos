// Recruit stage change notification callback
// Separated to avoid circular dependencies between bot.ts and dashboard.ts

let recruitStageCallback: ((name: string, stage: string, stepsComplete: number, stepsTotal: number) => void) | null = null;

export function setRecruitStageCallback(cb: typeof recruitStageCallback): void {
  recruitStageCallback = cb;
}

export function notifyRecruitStageChange(name: string, stage: string, stepsComplete: number, stepsTotal: number): void {
  if (recruitStageCallback) {
    recruitStageCallback(name, stage, stepsComplete, stepsTotal);
  }
}
