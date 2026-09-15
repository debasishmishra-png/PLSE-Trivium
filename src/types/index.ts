export interface Account {
  id: string;
  name: string;
  ind: string;
  hq: string;
  entity: string;
  arr: number;
  health: number;
  stage: 'Steady State' | 'Hypercare' | 'Onboarding' | 'At Risk';
  csm: string;
  since: string;
  svc: string[];
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  acct: string;
  email: string;
  ph: string;
  primary: boolean;
}

export interface Lead {
  id: string;
  co: string;
  ind: string;
  val: number;
  src: string;
  stage: 'New' | 'Contacted' | 'Discovery' | 'Qualified' | 'Proposal Sent';
  owner: string;
  next: string;
}

export interface Rfx {
  id: string;
  co: string;
  type: 'RFI' | 'RFP' | 'RFQ';
  val: number;
  due: string;
  stage: 'Intake' | 'Qualification' | 'Go / No-Go' | 'Drafting' | 'Internal Review' | 'Submitted' | 'Awarded' | 'Lost';
  owner: string;
  score: number;
  scope: string;
  proposalDraft?: string;
}

export interface OnboardingRisk {
  d: string;
  sev: 'Critical' | 'High' | 'Medium' | 'Low';
  o: string;
  m: string;
  s: 'Open' | 'Mitigating' | 'Escalated' | 'Closed';
}

export interface OnboardingDoc {
  n: string;
  t: string;
  s: string;
  st: 'Draft' | 'Sent' | 'In Review' | 'Signed' | 'Published' | 'Active' | 'Pending' | 'Uploaded';
  fileId?: string;
}

export interface Onboarding {
  id: string;
  acct: string;
  entityCode: string;
  owner: string;
  start: string;
  golive: string;
  phase: number;
  doneIds: number[];
  risks: OnboardingRisk[];
  docs: OnboardingDoc[];
}

export interface Issue {
  id: string;
  t: string;
  co: string;
  sev: 'Critical' | 'High' | 'Medium' | 'Low';
  cat: 'AP' | 'AR' | 'GL / Recon' | 'Payroll' | 'US Tax' | 'Technology' | 'Automation' | 'Client Dependency' | 'General';
  st: 'New' | 'Triaged' | 'In Progress' | 'Client Pending' | 'Blocked' | 'Resolved';
  o: string;
  age: number;
  sla: string;
  opened: string;
  resolution?: string;
  rca?: string;
}

export interface Message {
  who: string;
  dir: 'in' | 'out';
  t: string;
  time: string;
}

export interface Thread {
  id: string;
  subj: string;
  co: string;
  with: string;
  last: string;
  unread: number;
  msgs: Message[];
}

export interface Workstream {
  id: string;
  co: string;
  ws: string;
  vol: string;
  sla: number;
  st: 'On Track' | 'Watch' | 'Breach';
  o: string;
  auto: string;
}

export interface TaxCalendarItem {
  id: string;
  d: string;
  n: string;
  co: string;
  type: 'Federal' | 'State';
  st: 'Not Started' | 'In Preparation' | 'Data Collection' | 'Blocked' | 'Delivered' | 'Executed' | 'Pending' | 'Drafting' | 'Filed' | string;
  o: string;
  f?: string;
  entityCode?: string;
  due?: string;
}

export interface CommunicationItem {
  id: string;
  acct: string;
  from: string;
  to: string;
  subj: string;
  body: string;
  channel: 'Email' | 'Portal' | 'Slack' | 'Meeting';
  dir: 'Inbound' | 'Outbound';
  st: 'Delivered' | 'Pending' | 'Read';
  date: string;
}

export interface DocFolder {
  id: string;
  name: string;
  c: string;
  i: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  folder: string;
  size: number;
  uploaded: number;
  fileId?: string;
}

export interface ActivityItem {
  id: string;
  t: string;
  d: number;
  c: string;
  i: string;
  ic: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  d: number;
  read: boolean;
}

export interface EntityDefinition {
  code: string;
  name: string;
  cat: 'proprietorship' | 'partnership' | 'llc' | 'corporation' | 'professional' | 'trust' | 'npc' | 'foreign';
  desc: string;
  taxDefault: string;
  taxElectable: string | null;
  liability: string;
  minOwners: number;
  maxOwners: number | null;
  formation: string;
  governingLaw: string;
  federalForm: string;
  filingDeadline: string;
  k1: boolean | string;
  extension: string;
  stateCompliance: string[];
  selfEmploymentTax: string;
  onboardingTasks: string[];
  auditChecks: string[];
  notes: string;
}

export interface ComplianceMilestone {
  d: string;
  n: string;
  type: string;
  freq: string;
}

export interface EntityRiskFactor {
  r: string;
  sev: 'High' | 'Medium' | 'Low';
  m: string;
}

export interface PhaseDefinition {
  id: number;
  name: string;
  short: string;
  weeks: string;
  desc?: string;
}

export interface TaskDefinition {
  id: number;
  p: number;
  n: string;
  o: string;
  r: 'A/R' | 'R' | 'C' | 'A';
  d: number;
  entity?: boolean;
}
