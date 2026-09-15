import { PhaseDefinition, TaskDefinition, Onboarding } from '../types/index.ts';
import { ENTITY_MASTER } from './entityMaster.ts';

export const PHASES: PhaseDefinition[] = [
  { id: 0, name: 'Discovery & Scoping', short: 'Discovery', weeks: 'Wk 1–2', desc: 'Current-state walkthroughs, volume baseline, systems access & compliance screening' },
  { id: 1, name: 'Solution Design & TOM', short: 'Design', weeks: 'Wk 2–4', desc: 'Target Operating Model, org chart, RACI, SOP library architecture & SLA agreements' },
  { id: 2, name: 'Knowledge Transfer & Docs', short: 'KT & Docs', weeks: 'Wk 4–7', desc: 'Deep dive shadowing, chart of accounts mapping, opening balance validation & security review' },
  { id: 3, name: 'System Setup & Parallel', short: 'Parallel', weeks: 'Wk 6–9', desc: 'PLSE workspace & queue config, OCR automation rules, dual-execution parallel runs & reconciliation' },
  { id: 4, name: 'Go-Live & Cutover', short: 'Go-Live', weeks: 'Wk 10', desc: 'Formal Go/No-Go steering decision, cutover checklist execution & live service commencement' },
  { id: 5, name: 'Hypercare & Stabilisation', short: 'Hypercare', weeks: 'Wk 10–14', desc: 'Daily hypercare standups, triage RCA, KPI baseline benchmarking & exit criteria validation' },
  { id: 6, name: 'Steady-State Governance', short: 'BAU', weeks: 'Wk 14+', desc: 'Monthly governance, quarterly business reviews (QBR), continuous automation backlog & annual benchmarking' }
];

export const BASE_TASKS: TaskDefinition[] = [
  { id: 1, p: 0, n: 'Kickoff call & stakeholder mapping', o: 'Delivery Lead', r: 'A/R', d: -30 },
  { id: 2, p: 0, n: 'Current-state process walkthroughs (AP/AR/GL/Payroll/Tax)', o: 'Process SME', r: 'R', d: -28 },
  { id: 3, p: 0, n: 'Systems & access inventory (ERP, banks, payroll, tax portals)', o: 'Tech Lead', r: 'R', d: -25 },
  { id: 4, p: 0, n: 'Volume, TAT & SLA baseline data collection', o: 'Ops Analyst', r: 'R', d: -22 },
  { id: 5, p: 0, n: 'Risk & compliance screening (US nexus, sales tax, 1099)', o: 'Tax Lead', r: 'C', d: -20 },
  { id: 6, p: 0, n: 'Discovery report + scoping sign-off', o: 'Delivery Lead', r: 'A', d: -18 },
  { id: 7, p: 1, n: 'Target Operating Model (TOM) design', o: 'Solution Arch', r: 'A/R', d: -15 },
  { id: 8, p: 1, n: 'Org chart, RACI & escalation matrix', o: 'Delivery Lead', r: 'R', d: -13 },
  { id: 9, p: 1, n: 'SOP library drafting (process-level)', o: 'Process SME', r: 'R', d: -11 },
  { id: 10, p: 1, n: 'SLA / KPI framework & credit mechanism agreement', o: 'Delivery Lead', r: 'A', d: -9 },
  { id: 11, p: 1, n: 'Tech stack & integration architecture (PLSE config)', o: 'Solution Arch', r: 'R', d: -8 },
  { id: 12, p: 1, n: 'Client sign-off on TOM, SLA & pricing', o: 'Account Lead', r: 'A', d: -6 },
  { id: 13, p: 2, n: 'Process deep-dive sessions (recorded, 12 sessions)', o: 'Process SME', r: 'R', d: -4 },
  { id: 14, p: 2, n: 'Shadowing — client performs, Trivium observes', o: 'Ops Team', r: 'R', d: 0 },
  { id: 15, p: 2, n: 'Chart of accounts & master data mapping', o: 'GL Lead', r: 'R', d: 2 },
  { id: 16, p: 2, n: 'Opening balances & trial balance validation', o: 'GL Lead', r: 'R', d: 5 },
  { id: 17, p: 2, n: 'Access provisioning (read/write) & security review', o: 'Tech Lead', r: 'R', d: 7 },
  { id: 18, p: 2, n: 'SOP v1.0 published to PLSE document vault', o: 'Process SME', r: 'R', d: 9 },
  { id: 19, p: 3, n: 'PLSE workspace, workflow & queue configuration', o: 'Solution Arch', r: 'R', d: 11 },
  { id: 20, p: 3, n: 'Approval matrix & delegation-of-authority setup', o: 'Delivery Lead', r: 'R', d: 13 },
  { id: 21, p: 3, n: 'Automation rules (OCR, 3-way match, dunning, recon)', o: 'Automation Eng', r: 'R', d: 15 },
  { id: 22, p: 3, n: 'Parallel run — Cycle 1 (dual execution)', o: 'Ops Team', r: 'R', d: 20 },
  { id: 23, p: 3, n: 'Parallel run — Cycle 2 + variance analysis', o: 'Ops Team', r: 'R', d: 27 },
  { id: 24, p: 3, n: 'Reconciliation & accuracy sign-off', o: 'Delivery Lead', r: 'A', d: 30 },
  { id: 25, p: 4, n: 'Cutover checklist, rollback & contingency plan', o: 'Delivery Lead', r: 'R', d: 32 },
  { id: 26, p: 4, n: 'Go / No-Go decision meeting', o: 'Steering Cmte', r: 'A', d: 34 },
  { id: 27, p: 4, n: 'First live cycle execution (full scope)', o: 'Ops Team', r: 'R', d: 38 },
  { id: 28, p: 4, n: 'Client comms, access handover & contact tree', o: 'Account Lead', r: 'R', d: 39 },
  { id: 29, p: 4, n: 'Go-Live sign-off & formal service commencement', o: 'Account Lead', r: 'A', d: 40 },
  { id: 30, p: 5, n: 'Daily hypercare stand-ups (first 10 business days)', o: 'Delivery Lead', r: 'R', d: 45 },
  { id: 31, p: 5, n: 'Issue triage, RCA & resolution tracking', o: 'Quality Lead', r: 'R', d: 50 },
  { id: 32, p: 5, n: 'KPI baseline review vs. contracted SLA', o: 'Ops Analyst', r: 'R', d: 54 },
  { id: 33, p: 5, n: 'Hypercare exit-criteria review', o: 'Delivery Lead', r: 'A', d: 56 },
  { id: 34, p: 5, n: 'Transition-to-BAU sign-off', o: 'Account Lead', r: 'A', d: 58 },
  { id: 35, p: 6, n: 'Monthly governance & quarterly business review cadence', o: 'Account Lead', r: 'R', d: 65 },
  { id: 36, p: 6, n: 'Continuous-improvement & automation backlog', o: 'Automation Eng', r: 'R', d: 70 },
  { id: 37, p: 6, n: 'Annual SLA refresh & benchmarking', o: 'Delivery Lead', r: 'R', d: 90 }
];

export function getEntityTasks(entityCode: string): TaskDefinition[] {
  const entity = ENTITY_MASTER[entityCode];
  if (!entity || !entity.onboardingTasks) return [];
  return entity.onboardingTasks.map((name, index) => ({
    id: 1000 + index,
    p: 0,
    n: name,
    o: 'Entity Specialist',
    r: 'R',
    d: -25,
    entity: true
  }));
}

export function getAllTasksForOnboarding(ob: Onboarding): TaskDefinition[] {
  return [...BASE_TASKS, ...getEntityTasks(ob.entityCode)];
}

export function getPhaseStats(ob: Onboarding, phaseId: number) {
  const allTasks = getAllTasksForOnboarding(ob).filter((t) => t.p === phaseId);
  const doneTasks = allTasks.filter((t) => ob.doneIds.includes(t.id));
  const total = allTasks.length;
  const done = doneTasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { total, done, pct };
}

export function getOnboardingCurrentPhase(ob: Onboarding): number {
  for (const p of PHASES) {
    if (getPhaseStats(ob, p.id).pct < 100) return p.id;
  }
  return 6;
}

export function getOnboardingProgress(ob: Onboarding): number {
  const total = BASE_TASKS.length + getEntityTasks(ob.entityCode).length;
  return total ? Math.round((ob.doneIds.length / total) * 100) : 0;
}
