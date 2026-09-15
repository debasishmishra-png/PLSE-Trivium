import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { 
  Account, Contact, Lead, Rfx, Onboarding, Issue, Thread, Workstream, 
  TaxCalendarItem, DocFolder, DocumentItem, ActivityItem, NotificationItem,
  CommunicationItem 
} from '../types/index.ts';

const STORAGE_KEY = 'plse:data:v2';
const THEME_KEY = 'plse:theme';

export interface ToastMessage {
  id: string;
  msg: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface DataContextType {
  accounts: Account[];
  contacts: Contact[];
  leads: Lead[];
  rfxs: Rfx[];
  onboardings: Onboarding[];
  issues: Issue[];
  threads: Thread[];
  comms: CommunicationItem[];
  workstreams: Workstream[];
  taxCalendar: TaxCalendarItem[];
  docFolders: DocFolder[];
  documents: DocumentItem[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
  user: User | null;
  theme: 'light' | 'dark';
  activeView: string;
  viewParams: Record<string, any>;
  toasts: ToastMessage[];
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  navigate: (view: string, params?: Record<string, any>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  toast: (msg: string, actionLabel?: string, onAction?: () => void) => void;
  removeToast: (id: string) => void;
  addAccount: (account: Partial<Account>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addLead: (lead: Partial<Lead>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addRfx: (rfx: Partial<Rfx>) => void;
  updateRfx: (id: string, updates: Partial<Rfx>) => void;
  deleteRfx: (id: string) => void;
  advanceRfxStage: (id: string) => void;
  addOnboarding: (ob: Partial<Onboarding>, accountDetails?: Partial<Account>) => string;
  toggleOnboardingTask: (obId: string, taskId: number) => void;
  addRiskToOnboarding: (obId: string, risk: any) => void;
  deleteRiskFromOnboarding: (obId: string, index: number) => void;
  addDocToOnboarding: (obId: string, docItem: any) => void;
  deleteDocFromOnboarding: (obId: string, index: number) => void;
  deleteOnboarding: (id: string) => void;
  addIssue: (issue: Partial<Issue>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  setIssueStatus: (id: string, status: Issue['st']) => void;
  resolveIssue: (id: string) => void;
  deleteIssue: (id: string) => void;
  sendThreadReply: (threadId: string, text: string) => void;
  addCommunication: (comm: Partial<CommunicationItem>) => void;
  updateWorkstream: (id: string, updates: Partial<Workstream>) => void;
  updateTaxEvent: (id: string, updates: Partial<TaxCalendarItem>) => void;
  addDocument: (docItem: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;
  clearNotifications: () => void;
  resetDemoData: () => void;
  exportAllData: () => void;
}

const initialAccounts: Account[] = [
  { id: 'A-1001', name: 'Northwind Labs', ind: 'SaaS / Enterprise', hq: 'Austin, TX', entity: 'DLC', arr: 186000, health: 92, stage: 'Steady State', csm: 'Priya Nair', since: 'Apr 2023', svc: ['AP', 'AR', 'GL / Close', 'US Tax'] },
  { id: 'A-1002', name: 'Vertex Robotics', ind: 'Hardware / Robotics', hq: 'San Jose, CA', entity: 'DLC', arr: 240000, health: 78, stage: 'Hypercare', csm: 'Priya Nair', since: 'Mar 2024', svc: ['AP', 'AR', 'GL / Close', 'Payroll', 'Fractional CFO'] },
  { id: 'A-1003', name: 'Lumen Health', ind: 'HealthTech / MedDev', hq: 'Boston, MA', entity: 'DLC', arr: 310000, health: 88, stage: 'Steady State', csm: 'Dana Whitfield', since: 'Jan 2023', svc: ['AP', 'AR', 'GL / Close', 'US Tax', 'Audit Readiness'] },
  { id: 'A-1004', name: 'Brightpath Logistics', ind: 'Logistics & Supply Chain', hq: 'Chicago, IL', entity: 'LLC', arr: 145000, health: 64, stage: 'At Risk', csm: 'Marcus Bell', since: 'Sep 2023', svc: ['AP', 'AR', 'Payroll'] },
  { id: 'A-1005', name: 'Cobalt Fintech', ind: 'Fintech / Payments', hq: 'New York, NY', entity: 'DLC', arr: 275000, health: 95, stage: 'Steady State', csm: 'Dana Whitfield', since: 'Jun 2022', svc: ['GL / Close', 'US Tax', 'Fractional CFO'] },
  { id: 'A-1006', name: 'Greenleaf Foods', ind: 'CPG / D2C Organic', hq: 'Portland, OR', entity: 'LLC', arr: 120000, health: 81, stage: 'Onboarding', csm: 'Priya Nair', since: 'May 2024', svc: ['AP', 'AR', 'GL / Close'] },
  { id: 'A-1007', name: 'Atlas Legal Tech', ind: 'LegalTech SaaS', hq: 'Denver, CO', entity: 'PC', arr: 98000, health: 71, stage: 'Onboarding', csm: 'Marcus Bell', since: 'Jun 2024', svc: ['US Tax', 'Audit Readiness'] },
  { id: 'A-1008', name: 'Nimbus AI', ind: 'Generative AI & ML', hq: 'San Francisco, CA', entity: 'DLC', arr: 160000, health: 89, stage: 'Steady State', csm: 'Dana Whitfield', since: 'Nov 2023', svc: ['AP', 'AR', 'GL / Close', 'Payroll'] }
];

const initialContacts: Contact[] = [
  { id: 'C-01', name: 'Elena Ruiz', role: 'VP Finance', acct: 'Northwind Labs', email: 'elena.ruiz@northwind.io', ph: '+1 512 555 0142', primary: true },
  { id: 'C-02', name: 'David Chen', role: 'Controller', acct: 'Vertex Robotics', email: 'd.chen@vertexrobotics.com', ph: '+1 408 555 0198', primary: true },
  { id: 'C-03', name: 'Aisha Bello', role: 'CFO', acct: 'Lumen Health', email: 'aisha@lumenhealth.com', ph: '+1 617 555 0177', primary: true },
  { id: 'C-04', name: 'Tom Wozniak', role: 'Head of Ops', acct: 'Brightpath Logistics', email: 'twozniak@brightpath.com', ph: '+1 312 555 0165', primary: true },
  { id: 'C-05', name: 'Priyanka Rao', role: 'Founder & CEO', acct: 'Cobalt Fintech', email: 'priyanka@cobaltfin.com', ph: '+1 212 555 0110', primary: true },
  { id: 'C-06', name: 'Sam Okafor', role: 'COO', acct: 'Greenleaf Foods', email: 'sam@greenleaffoods.com', ph: '+1 503 555 0133', primary: true },
  { id: 'C-07', name: 'Rachel Kim', role: 'Finance Manager', acct: 'Atlas Legal Tech', email: 'rkim@atlaslegal.io', ph: '+1 720 555 0154', primary: true },
  { id: 'C-08', name: 'Marcus Hale', role: 'VP Finance', acct: 'Nimbus AI', email: 'mhale@nimbus.ai', ph: '+1 415 555 0188', primary: true }
];

const initialLeads: Lead[] = [
  { id: 'L-201', co: 'Meridian Bio', ind: 'Biotech', val: 420000, src: 'Referral', stage: 'Proposal Sent', owner: 'Dana Whitfield', next: '2024-07-08' },
  { id: 'L-202', co: 'Halcyon Retail', ind: 'Omnichannel Retail', val: 180000, src: 'Inbound RFI', stage: 'Qualified', owner: 'Priya Nair', next: '2024-07-03' },
  { id: 'L-203', co: 'Tidewater Energy', ind: 'Clean Energy', val: 260000, src: 'Conference', stage: 'Discovery', owner: 'Marcus Bell', next: '2024-07-11' },
  { id: 'L-204', co: 'Pixelworks Media', ind: 'Digital Media', val: 95000, src: 'Outbound', stage: 'Contacted', owner: 'Dana Whitfield', next: '2024-07-05' },
  { id: 'L-205', co: 'BlueOak Capital', ind: 'Venture Capital', val: 150000, src: 'Partner', stage: 'New', owner: 'Priya Nair', next: '2024-07-02' },
  { id: 'L-206', co: 'Kestrel Aerospace', ind: 'Aerospace & Defense', val: 540000, src: 'RFP Portal', stage: 'Qualified', owner: 'Marcus Bell', next: '2024-07-09' }
];

const initialRfxs: Rfx[] = [
  { id: 'RFP-2024-018', co: 'Meridian Bio', type: 'RFP', val: 420000, due: '2024-07-12', stage: 'Drafting', owner: 'Dana Whitfield', score: 78, scope: 'Full F&A + US Tax + Audit Readiness for 3 global entities' },
  { id: 'RFI-2024-011', co: 'Halcyon Retail', type: 'RFI', val: 180000, due: '2024-07-05', stage: 'Qualification', owner: 'Priya Nair', score: 62, scope: 'High-volume AP / AR OCR automation with NetSuite sync' },
  { id: 'RFP-2024-019', co: 'Tidewater Energy', type: 'RFP', val: 260000, due: '2024-07-19', stage: 'Internal Review', owner: 'Marcus Bell', score: 84, scope: 'Fractional CFO + 3-Day Month-end Close + Board Reporting' },
  { id: 'RFQ-2024-007', co: 'Pixelworks Media', type: 'RFQ', val: 95000, due: '2024-07-02', stage: 'Submitted', owner: 'Dana Whitfield', score: 71, scope: 'Multi-state Payroll + 1099 compliance + HR / Admin' },
  { id: 'RFP-2024-014', co: 'Kestrel Aerospace', type: 'RFP', val: 540000, due: '2024-07-26', stage: 'Go / No-Go', owner: 'Marcus Bell', score: 55, scope: 'End-to-end F&A, multi-entity defense contractor compliance' },
  { id: 'RFI-2024-009', co: 'BlueOak Capital', type: 'RFI', val: 150000, due: '2024-07-30', stage: 'Intake', owner: 'Priya Nair', score: 50, scope: 'Fund accounting & portfolio company reporting' },
  { id: 'RFP-2024-012', co: 'Solstice Biotech', type: 'RFP', val: 210000, due: '2024-06-14', stage: 'Awarded', owner: 'Dana Whitfield', score: 91, scope: 'Audit readiness & Big 4 liaison support' },
  { id: 'RFP-2024-016', co: 'Ironclad Mfg.', type: 'RFP', val: 300000, due: '2024-06-07', stage: 'Lost', owner: 'Marcus Bell', score: 68, scope: 'AP / AR + GL, 3 manufacturing plants' }
];

const initialOnboardings: Onboarding[] = [
  {
    id: 'OB-2024-001',
    acct: 'Greenleaf Foods',
    entityCode: 'LLC',
    owner: 'Priya Nair',
    start: '2024-05-06',
    golive: '2024-07-15',
    phase: 3,
    doneIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    risks: [
      { d: 'Legacy ERP (NetSuite) has no API for bank feeds', sev: 'High', o: 'Tech Lead', m: 'Evaluate Celigo connector; manual bridge for 2 cycles', s: 'Mitigating' },
      { d: 'Client AP approver unavailable 2 weeks in July', sev: 'Medium', o: 'Delivery Lead', m: 'Delegate authority to Controller', s: 'Open' },
      { d: 'Sales-tax nexus in 3 new states not registered', sev: 'High', o: 'Tax Lead', m: 'Registration sprint + voluntary disclosure agreement', s: 'Escalated' }
    ],
    docs: [
      { n: 'Discovery Report v1.2', t: 'PDF', s: '2.4 MB', st: 'Signed' },
      { n: 'TOM & RACI Matrix', t: 'XLSX', s: '640 KB', st: 'Signed' },
      { n: 'SOP Library v1.0', t: 'ZIP', s: '18 MB', st: 'Published' },
      { n: 'Chart of Accounts Mapping', t: 'XLSX', s: '310 KB', st: 'In Review' },
      { n: 'Opening TB Validation', t: 'XLSX', s: '220 KB', st: 'Pending' }
    ]
  },
  {
    id: 'OB-2024-002',
    acct: 'Atlas Legal Tech',
    entityCode: 'PC',
    owner: 'Marcus Bell',
    start: '2024-06-03',
    golive: '2024-08-12',
    phase: 1,
    doneIds: [1, 2, 3, 4, 5, 6, 7, 8],
    risks: [
      { d: 'Client has no documented close checklist', sev: 'Medium', o: 'Process SME', m: 'Build checklist from shadowing recordings', s: 'Open' },
      { d: 'Delaware franchise tax history incomplete', sev: 'High', o: 'Tax Lead', m: 'Reconstruct from bank statements & state records', s: 'Mitigating' }
    ],
    docs: [
      { n: 'Discovery Report v1.0', t: 'PDF', s: '1.8 MB', st: 'Signed' },
      { n: 'Draft TOM & RACI', t: 'DOCX', s: '420 KB', st: 'In Review' }
    ]
  },
  {
    id: 'OB-2024-003',
    acct: 'Vertex Robotics',
    entityCode: 'DLC',
    owner: 'Priya Nair',
    start: '2024-03-04',
    golive: '2024-05-13',
    phase: 5,
    doneIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    risks: [
      { d: 'Payroll parallel run variance 0.7%', sev: 'Low', o: 'Payroll Lead', m: 'Root-caused to PTO accrual calculation difference', s: 'Closed' },
      { d: 'Multi-entity intercompany eliminations manual', sev: 'Medium', o: 'GL Lead', m: 'Automation script scheduled for Q3 release', s: 'Open' }
    ],
    docs: [
      { n: 'Cutover Plan v2', t: 'PDF', s: '900 KB', st: 'Signed' },
      { n: 'Go-Live Sign-off', t: 'PDF', s: '180 KB', st: 'Signed' },
      { n: 'Hypercare Log', t: 'XLSX', s: '560 KB', st: 'Active' }
    ]
  },
  {
    id: 'OB-2024-004',
    acct: 'Halcyon Retail',
    entityCode: 'LLC',
    owner: 'Dana Whitfield',
    start: '2024-06-17',
    golive: '2024-09-09',
    phase: 0,
    doneIds: [1, 2, 3],
    risks: [
      { d: 'Peak-season blackout window Oct–Dec requires accelerated parallel run', sev: 'High', o: 'Delivery Lead', m: 'Add 1 additional FTE to complete parallel run in August', s: 'Open' }
    ],
    docs: [
      { n: 'NDA & MSA (executed)', t: 'PDF', s: '1.1 MB', st: 'Signed' },
      { n: 'Data Request Pack', t: 'XLSX', s: '140 KB', st: 'Sent' }
    ]
  }
];

const initialIssues: Issue[] = [
  { id: 'ISS-1041', t: 'Bank reconciliation break — $42K unreconciled across 2 accounts', co: 'Brightpath Logistics', sev: 'Critical', cat: 'GL / Recon', st: 'In Progress', o: 'R. Kumar', age: 3, sla: '4h left', opened: '2024-06-28' },
  { id: 'ISS-1042', t: 'AP invoice backlog — 340 invoices unprocessed due to missing POs', co: 'Brightpath Logistics', sev: 'Critical', cat: 'AP', st: 'Blocked', o: 'S. Iyer', age: 6, sla: 'BREACHED', opened: '2024-06-25' },
  { id: 'ISS-1043', t: 'Sales tax nexus flagged in TX ($500k+ gross sales threshold)', co: 'Greenleaf Foods', sev: 'High', cat: 'US Tax', st: 'Client Pending', o: 'A. Fernandez', age: 9, sla: '2d left', opened: '2024-06-22' },
  { id: 'ISS-1044', t: 'NetSuite bank feed API unavailable', co: 'Greenleaf Foods', sev: 'High', cat: 'Technology', st: 'In Progress', o: 'V. Menon', age: 12, sla: '5d left', opened: '2024-06-19' },
  { id: 'ISS-1045', t: '1099-NEC vendor W-9 collection incomplete (42 vendors)', co: 'Nimbus AI', sev: 'Medium', cat: 'US Tax', st: 'New', o: 'A. Fernandez', age: 1, sla: '10d left', opened: '2024-06-30' },
  { id: 'ISS-1046', t: 'Payroll PTO accrual variance 0.7%', co: 'Vertex Robotics', sev: 'Medium', cat: 'Payroll', st: 'In Progress', o: 'N. Shah', age: 5, sla: '1d left', opened: '2024-06-26' },
  { id: 'ISS-1047', t: 'Intercompany eliminations still manual for 3 sub-entities', co: 'Vertex Robotics', sev: 'Medium', cat: 'GL / Recon', st: 'Triaged', o: 'R. Kumar', age: 14, sla: '12d left', opened: '2024-06-17' },
  { id: 'ISS-1048', t: 'Client approval SLA breached — 6 invoices pending executive sign-off', co: 'Lumen Health', sev: 'Medium', cat: 'Client Dependency', st: 'Client Pending', o: 'Dana Whitfield', age: 7, sla: 'BREACHED', opened: '2024-06-24' },
  { id: 'ISS-1049', t: 'Duplicate vendor master records resolved', co: 'Northwind Labs', sev: 'High', cat: 'AP', st: 'Resolved', o: 'S. Iyer', age: 11, sla: 'Met', opened: '2024-06-20' },
  { id: 'ISS-1050', t: 'Auto-dunning sequence fixed for >60d overdue receivables', co: 'Cobalt Fintech', sev: 'Low', cat: 'AR', st: 'Resolved', o: 'V. Menon', age: 4, sla: 'Met', opened: '2024-06-27' },
  { id: 'ISS-1051', t: 'Delaware franchise tax filing history gap', co: 'Atlas Legal Tech', sev: 'High', cat: 'US Tax', st: 'Triaged', o: 'A. Fernandez', age: 2, sla: '8d left', opened: '2024-06-29' },
  { id: 'ISS-1052', t: 'Expense OCR confidence threshold calibration needed', co: 'Nimbus AI', sev: 'Low', cat: 'Automation', st: 'New', o: 'V. Menon', age: 1, sla: '14d left', opened: '2024-06-30' }
];

const initialThreads: Thread[] = [
  {
    id: 'T-01',
    subj: 'Greenleaf Foods — Parallel Run Cycle 1 variance reconciliation',
    co: 'Greenleaf Foods',
    with: 'Sam Okafor (COO)',
    last: '10:42 AM',
    unread: 2,
    msgs: [
      { who: 'Sam Okafor', dir: 'in', t: 'Hi team — we reviewed the Cycle 1 output. AR aging looks right but there are 3 customer credits that don\'t tie to our sales ledger.', time: '9:12 AM' },
      { who: 'Priya Nair', dir: 'out', t: 'Thanks Sam. We identified those — they relate to the March returns credit memo that was posted in April. We\'ll reclassify and re-run tonight.', time: '9:40 AM' },
      { who: 'Sam Okafor', dir: 'in', t: 'Perfect. Also, can we get the variance report in Excel rather than PDF going forward?', time: '10:42 AM' }
    ]
  },
  {
    id: 'T-02',
    subj: 'Brightpath Logistics — AP backlog escalation & recovery plan',
    co: 'Brightpath Logistics',
    with: 'Tom Wozniak (Head of Ops)',
    last: 'Yesterday',
    unread: 0,
    msgs: [
      { who: 'Tom Wozniak', dir: 'in', t: 'We have vendors calling about unpaid invoices. This is now impacting our supply chain credit terms. Need a recovery plan today.', time: 'Yesterday 8:05 AM' },
      { who: 'Marcus Bell', dir: 'out', t: 'Tom — top priority. We have deployed 2 additional senior AP processors and will clear the 340-invoice backlog within 72 hours.', time: 'Yesterday 11:30 AM' }
    ]
  },
  {
    id: 'T-03',
    subj: 'Vertex Robotics — Hypercare Day 8 standup notes & PTO fix',
    co: 'Vertex Robotics',
    with: 'David Chen (Controller)',
    last: '2 days ago',
    unread: 0,
    msgs: [
      { who: 'David Chen', dir: 'in', t: 'Standup notes attached. Only open item is the PTO accrual variance — happy with the fix in the staging environment.', time: '2 days ago' }
    ]
  },
  {
    id: 'T-04',
    subj: 'Meridian Bio — RFP clarification questions & multi-entity references',
    co: 'Meridian Bio',
    with: 'Procurement Director',
    last: '3 days ago',
    unread: 1,
    msgs: [
      { who: 'Meridian Procurement', dir: 'in', t: 'Please confirm your multi-entity consolidation experience with US/UK subsidiaries and provide 2 client references of similar scale.', time: '3 days ago' }
    ]
  },
  {
    id: 'T-05',
    subj: 'Atlas Legal Tech — Delaware franchise tax transcript retrieval',
    co: 'Atlas Legal Tech',
    with: 'Rachel Kim (Finance Mgr)',
    last: '4 days ago',
    unread: 0,
    msgs: [
      { who: 'Rachel Kim', dir: 'in', t: 'Our prior CPA has gone dark. Do you have the 2022 and 2023 filings on record or should we order transcripts?', time: '4 days ago' },
      { who: 'A. Fernandez', dir: 'out', t: 'We are pulling transcripts directly from the Delaware Division of Corporations portal. Will have complete figures within 48 hours.', time: '4 days ago' }
    ]
  }
];

const initialWorkstreams: Workstream[] = [
  { id: 'W-01', co: 'Northwind Labs', ws: 'AP', vol: '1,240 inv/mo', sla: 98, st: 'On Track', o: 'R. Kumar', auto: 'OCR + 3-way match' },
  { id: 'W-02', co: 'Northwind Labs', ws: 'AR', vol: '380 inv/mo', sla: 96, st: 'On Track', o: 'S. Iyer', auto: 'Auto-dunning' },
  { id: 'W-03', co: 'Lumen Health', ws: 'AP', vol: '2,110 inv/mo', sla: 94, st: 'Watch', o: 'S. Iyer', auto: 'OCR + 2-way match' },
  { id: 'W-04', co: 'Lumen Health', ws: 'US Tax', vol: '4 filings/qtr', sla: 100, st: 'On Track', o: 'A. Fernandez', auto: 'Calendar bot' },
  { id: 'W-05', co: 'Cobalt Fintech', ws: 'Month-End Close', vol: 'Day 3 close', sla: 99, st: 'On Track', o: 'R. Kumar', auto: 'Full automation' },
  { id: 'W-06', co: 'Cobalt Fintech', ws: 'Fractional CFO', vol: '40 hrs/mo', sla: 100, st: 'On Track', o: 'Dana Whitfield', auto: 'Board pack gen' },
  { id: 'W-07', co: 'Brightpath Logistics', ws: 'AP', vol: '3,480 inv/mo', sla: 71, st: 'Breach', o: 'S. Iyer', auto: 'Manual (no OCR)' },
  { id: 'W-08', co: 'Brightpath Logistics', ws: 'Payroll', vol: '620 HC semi-mo', sla: 88, st: 'Watch', o: 'N. Shah', auto: 'Semi-automated' },
  { id: 'W-09', co: 'Vertex Robotics', ws: 'Payroll', vol: '310 HC semi-mo', sla: 93, st: 'Watch', o: 'N. Shah', auto: 'Semi-automated' },
  { id: 'W-10', co: 'Nimbus AI', ws: 'AP', vol: '860 inv/mo', sla: 97, st: 'On Track', o: 'R. Kumar', auto: 'OCR + 3-way match' },
  { id: 'W-11', co: 'Greenleaf Foods', ws: 'GL / Recon', vol: '6 accts / mo', sla: 82, st: 'Watch', o: 'R. Kumar', auto: 'Manual bridge' }
];

const initialTaxCalendar: TaxCalendarItem[] = [
  { id: 'TX-01', d: '2024-07-15', due: '2024-07-15', n: 'Form 941 — Q2 Payroll Tax Return', f: 'Form 941 — Q2 Payroll Tax Return', co: 'Multiple (6 clients)', entityCode: 'DLC', type: 'Federal', st: 'In Preparation', o: 'A. Fernandez' },
  { id: 'TX-02', d: '2024-07-31', due: '2024-07-31', n: 'Form 720 — Quarterly Federal Excise Tax', f: 'Form 720 — Quarterly Federal Excise Tax', co: 'Nimbus AI', entityCode: 'DLC', type: 'Federal', st: 'Not Started', o: 'A. Fernandez' },
  { id: 'TX-03', d: '2024-08-15', due: '2024-08-15', n: 'DE Franchise Tax — Annual Report Filing', f: 'DE Franchise Tax — Annual Report Filing', co: 'Atlas Legal Tech', entityCode: 'PC', type: 'State', st: 'Blocked', o: 'A. Fernandez' },
  { id: 'TX-04', d: '2024-09-15', due: '2024-09-15', n: 'Form 1120 — C-Corp Return (Extended)', f: 'Form 1120 — C-Corp Return (Extended)', co: 'Northwind Labs', entityCode: 'DLC', type: 'Federal', st: 'In Preparation', o: 'A. Fernandez' },
  { id: 'TX-05', d: '2024-09-15', due: '2024-09-15', n: 'Form 1065 — Partnership Return (Extended)', f: 'Form 1065 — Partnership Return (Extended)', co: 'Greenleaf Foods', entityCode: 'LLC', type: 'Federal', st: 'Not Started', o: 'A. Fernandez' },
  { id: 'TX-06', d: '2024-09-30', due: '2024-09-30', n: 'Sales Tax — TX & CA Monthly Filings', f: 'Sales Tax — TX & CA Monthly Filings', co: 'Greenleaf Foods', entityCode: 'LLC', type: 'State', st: 'Blocked', o: 'A. Fernandez' },
  { id: 'TX-07', d: '2024-10-31', due: '2024-10-31', n: 'Form 941 — Q3 Payroll Tax Return', f: 'Form 941 — Q3 Payroll Tax Return', co: 'Multiple (6 clients)', entityCode: 'DLC', type: 'Federal', st: 'Not Started', o: 'A. Fernandez' },
  { id: 'TX-08', d: '2025-01-31', due: '2025-01-31', n: 'Form 1099-NEC — Vendor 1099 Filings', f: 'Form 1099-NEC — Vendor 1099 Filings', co: 'Multiple (4 clients)', entityCode: 'DLC', type: 'Federal', st: 'Data Collection', o: 'A. Fernandez' }
];

const initialComms: CommunicationItem[] = [
  {
    id: 'COMM-01',
    acct: 'Greenleaf Foods',
    from: 'Sam Okafor (COO)',
    to: 'Priya Nair (Trivium)',
    subj: 'Parallel Run Cycle 1 variance reconciliation',
    body: 'Hi team — we reviewed the Cycle 1 output. AR aging looks right but there are 3 customer credits that don\'t tie to our sales ledger. Can we re-run tonight?',
    channel: 'Email',
    dir: 'Inbound',
    st: 'Delivered',
    date: '10:42 AM'
  },
  {
    id: 'COMM-02',
    acct: 'Brightpath Logistics',
    from: 'Tom Wozniak (Head of Ops)',
    to: 'Marcus Bell (Trivium)',
    subj: 'AP backlog escalation & recovery plan',
    body: 'We have vendors calling about unpaid invoices. This is now impacting our supply chain credit terms. Need a recovery plan today with dedicated resources.',
    channel: 'Portal',
    dir: 'Inbound',
    st: 'Delivered',
    date: 'Yesterday'
  },
  {
    id: 'COMM-03',
    acct: 'Vertex Robotics',
    from: 'David Chen (Controller)',
    to: 'Priya Nair (Trivium)',
    subj: 'Hypercare Day 8 standup notes & PTO fix',
    body: 'Standup notes attached. Only open item is the PTO accrual variance — happy with the fix in the staging environment. Good to proceed to live sync.',
    channel: 'Slack',
    dir: 'Inbound',
    st: 'Delivered',
    date: '2 days ago'
  },
  {
    id: 'COMM-04',
    acct: 'Meridian Bio',
    from: 'Procurement Director',
    to: 'Dana Whitfield (Trivium)',
    subj: 'RFP clarification questions & multi-entity references',
    body: 'Please confirm your multi-entity consolidation experience with US/UK subsidiaries and provide 2 client references of similar scale.',
    channel: 'Email',
    dir: 'Inbound',
    st: 'Delivered',
    date: '3 days ago'
  },
  {
    id: 'COMM-05',
    acct: 'Atlas Legal Tech',
    from: 'Rachel Kim (Finance Mgr)',
    to: 'A. Fernandez (Trivium)',
    subj: 'Delaware franchise tax transcript retrieval',
    body: 'Our prior CPA has gone dark. Do you have the 2022 and 2023 filings on record or should we order transcripts directly?',
    channel: 'Email',
    dir: 'Inbound',
    st: 'Delivered',
    date: '4 days ago'
  }
];

const initialFolders: DocFolder[] = [
  { id: 'F-01', name: 'Contracts & MSAs', c: '#eef2ff', i: '#4338ca' },
  { id: 'F-02', name: 'SOP Library', c: '#ccfbf1', i: '#0f766e' },
  { id: 'F-03', name: 'TOM & RACI', c: '#ede9fe', i: '#6d28d9' },
  { id: 'F-04', name: 'Tax Filings', c: '#fef3c7', i: '#b45309' },
  { id: 'F-05', name: 'Audit Readiness', c: '#fee2e2', i: '#b91c1c' },
  { id: 'F-06', name: 'Client Deliverables', c: '#dbeafe', i: '#1d4ed8' }
];

const initialActivities: ActivityItem[] = [
  { id: 'ACT-1', t: '<b>Priya Nair</b> completed task "Automation rules" for Greenleaf Foods', d: Date.now() - 12 * 60000, c: '#dcfce7', i: '#15803d', ic: 'check' },
  { id: 'ACT-2', t: '<b>A. Fernandez</b> escalated <b>ISS-1043</b> — TX sales tax nexus', d: Date.now() - 48 * 60000, c: '#fee2e2', i: '#b91c1c', ic: 'issues' },
  { id: 'ACT-3', t: '<b>RFP-2024-019</b> moved to <b>Internal Review</b>', d: Date.now() - 2 * 3600000, c: '#e0e7ff', i: '#4338ca', ic: 'rfx' },
  { id: 'ACT-4', t: 'New onboarding kicked off — <b>Halcyon Retail</b>', d: Date.now() - 5 * 3600000, c: '#ccfbf1', i: '#0f766e', ic: 'onboard' },
  { id: 'ACT-5', t: '<b>Vertex Robotics</b> passed Hypercare Day 8 standup review', d: Date.now() - 24 * 3600000, c: '#fef3c7', i: '#b45309', ic: 'delivery' }
];

const initialNotifications: NotificationItem[] = [
  { id: 'N-1', title: 'Critical AP backlog at Brightpath Logistics', body: '340 invoices pending PO verification', d: Date.now() - 3600000, read: false },
  { id: 'N-2', title: 'New RFx: Meridian Bio submitted requirements', body: 'Target value $420,000', d: Date.now() - 10800000, read: false }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [viewParams, setViewParams] = useState<Record<string, any>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);

  // Core Data
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [rfxs, setRfxs] = useState<Rfx[]>(initialRfxs);
  const [onboardings, setOnboardings] = useState<Onboarding[]>(initialOnboardings);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [comms, setComms] = useState<CommunicationItem[]>(initialComms);
  const [workstreams, setWorkstreams] = useState<Workstream[]>(initialWorkstreams);
  const [taxCalendar, setTaxCalendar] = useState<TaxCalendarItem[]>(initialTaxCalendar);
  const [docFolders] = useState<DocFolder[]>(initialFolders);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Initialize from LocalStorage or Firestore
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Local Data
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.accounts) setAccounts(parsed.accounts);
        if (parsed.contacts) setContacts(parsed.contacts);
        if (parsed.leads) setLeads(parsed.leads);
        if (parsed.rfxs) setRfxs(parsed.rfxs);
        if (parsed.onboardings) setOnboardings(parsed.onboardings);
        if (parsed.issues) setIssues(parsed.issues);
        if (parsed.threads) setThreads(parsed.threads);
        if (parsed.workstreams) setWorkstreams(parsed.workstreams);
        if (parsed.taxCalendar) setTaxCalendar(parsed.taxCalendar);
        if (parsed.documents) setDocuments(parsed.documents);
        if (parsed.activities) setActivities(parsed.activities);
        if (parsed.notifications) setNotifications(parsed.notifications);
      }
    } catch (e) {
      console.warn('LocalStorage load failed', e);
    }

    // Auth State Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Handle Hash Navigation
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        setActiveView('dashboard');
        setViewParams({});
        return;
      }
      const parts = hash.split('/');
      const view = parts[0] || 'dashboard';
      const params: Record<string, any> = {};
      if (parts[1]) params.id = parts[1];
      if (parts[2]) params.tab = parts[2];
      if (view === 'entityDetail' && parts[1]) {
        params.code = parts[1];
      }
      setActiveView(view);
      setViewParams(params);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => {
      unsubscribeAuth();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Save changes to LocalStorage
  const persistLocally = (newData: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.warn('Persist failed', e);
    }
  };

  const syncState = (updated: any) => {
    persistLocally({
      accounts: updated.accounts || accounts,
      contacts: updated.contacts || contacts,
      leads: updated.leads || leads,
      rfxs: updated.rfxs || rfxs,
      onboardings: updated.onboardings || onboardings,
      issues: updated.issues || issues,
      threads: updated.threads || threads,
      workstreams: updated.workstreams || workstreams,
      taxCalendar: updated.taxCalendar || taxCalendar,
      documents: updated.documents || documents,
      activities: updated.activities || activities,
      notifications: updated.notifications || notifications
    });
  };

  // Toast Helper
  const toast = (msg: string, actionLabel?: string, onAction?: () => void) => {
    const id = 'toast-' + Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, msg, actionLabel, onAction }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigate = (view: string, params: Record<string, any> = {}) => {
    const parts = [view];
    if (params.id) parts.push(params.id);
    if (params.tab) parts.push(params.tab);
    if (view === 'entityDetail' && params.code) parts[1] = params.code;
    window.location.hash = '#/' + parts.join('/');
  };

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(THEME_KEY, t);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const signIn = async () => {
    try {
      const u = await loginWithGoogle();
      if (u) {
        toast(`Signed in as ${u.displayName || u.email}`);
      }
    } catch (err: any) {
      toast(`Sign in error: ${err.message}`);
    }
  };

  const signOut = async () => {
    await logoutUser();
    toast('Signed out');
  };

  const logActivity = (t: string, ic: string = 'check', c: string = '#dcfce7', i: string = '#15803d') => {
    const newAct: ActivityItem = {
      id: 'ACT-' + Math.random().toString(36).slice(2, 8),
      t,
      d: Date.now(),
      c,
      i,
      ic
    };
    setActivities((prev) => {
      const next = [newAct, ...prev.slice(0, 49)];
      syncState({ activities: next });
      return next;
    });
  };

  // Actions
  const addAccount = (acc: Partial<Account>) => {
    const newAcc: Account = {
      id: acc.id || `A-${1000 + accounts.length + 1}`,
      name: acc.name || 'New Client',
      ind: acc.ind || 'Technology',
      hq: acc.hq || 'United States',
      entity: acc.entity || 'DLC',
      arr: acc.arr || 120000,
      health: acc.health || 90,
      stage: acc.stage || 'Onboarding',
      csm: acc.csm || 'Priya Nair',
      since: acc.since || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      svc: acc.svc || ['AP', 'AR', 'GL / Close']
    };
    const next = [newAcc, ...accounts];
    setAccounts(next);
    logActivity(`Account added: <b>${newAcc.name}</b> (${newAcc.entity})`, 'crm', '#eef2ff', '#4338ca');
    syncState({ accounts: next });
    toast(`Account <b>${newAcc.name}</b> created`);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    const next = accounts.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setAccounts(next);
    syncState({ accounts: next });
  };

  const deleteAccount = (id: string) => {
    const next = accounts.filter((a) => a.id !== id);
    setAccounts(next);
    syncState({ accounts: next });
    toast('Account deleted');
  };

  const addLead = (lead: Partial<Lead>) => {
    const newLead: Lead = {
      id: lead.id || `L-${300 + leads.length + 1}`,
      co: lead.co || 'Prospective Client',
      ind: lead.ind || 'Technology',
      val: lead.val || 150000,
      src: lead.src || 'Referral',
      stage: lead.stage || 'New',
      owner: lead.owner || 'Priya Nair',
      next: lead.next || new Date().toISOString().slice(0, 10)
    };
    const next = [newLead, ...leads];
    setLeads(next);
    syncState({ leads: next });
    toast(`Lead <b>${newLead.co}</b> added to pipeline`);
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    const next = leads.map((l) => (l.id === id ? { ...l, ...updates } : l));
    setLeads(next);
    syncState({ leads: next });
  };

  const addRfx = (rfx: Partial<Rfx>) => {
    const newRfx: Rfx = {
      id: rfx.id || `${rfx.type || 'RFP'}-${new Date().getFullYear()}-${String(rfxs.length + 20).padStart(3, '0')}`,
      co: rfx.co || 'Prospective Client',
      type: rfx.type || 'RFP',
      val: rfx.val || 250000,
      due: rfx.due || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      stage: rfx.stage || 'Intake',
      owner: rfx.owner || 'Dana Whitfield',
      score: rfx.score || 75,
      scope: rfx.scope || 'End-to-end FAO + US Tax',
      proposalDraft: rfx.proposalDraft || ''
    };
    const next = [newRfx, ...rfxs];
    setRfxs(next);
    logActivity(`New <b>${newRfx.type}</b> logged — <b>${newRfx.id}</b> (${newRfx.co})`, 'rfx', '#ede9fe', '#6d28d9');
    syncState({ rfxs: next });
    toast(`RFx <b>${newRfx.id}</b> created`);
  };

  const updateRfx = (id: string, updates: Partial<Rfx>) => {
    const next = rfxs.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setRfxs(next);
    syncState({ rfxs: next });
  };

  const advanceRfxStage = (id: string) => {
    const stages: Rfx['stage'][] = ['Intake', 'Qualification', 'Go / No-Go', 'Drafting', 'Internal Review', 'Submitted', 'Awarded', 'Lost'];
    const rfx = rfxs.find((r) => r.id === id);
    if (!rfx) return;
    const idx = stages.indexOf(rfx.stage);
    if (idx < stages.length - 1) {
      const nextStage = stages[idx + 1];
      updateRfx(id, { stage: nextStage });
      toast(`<b>${rfx.id}</b> moved to <b>${nextStage}</b>`);
    }
  };

  const deleteRfx = (id: string) => {
    const next = rfxs.filter((r) => r.id !== id);
    setRfxs(next);
    syncState({ rfxs: next });
    toast('RFx removed');
  };

  const addOnboarding = (ob: Partial<Onboarding>, accountDetails?: Partial<Account>): string => {
    const id = ob.id || `OB-${new Date().getFullYear()}-${String(onboardings.length + 1).padStart(3, '0')}`;
    const newOb: Onboarding = {
      id,
      acct: ob.acct || 'New Client',
      entityCode: ob.entityCode || 'DLC',
      owner: ob.owner || 'Priya Nair',
      start: ob.start || new Date().toISOString().slice(0, 10),
      golive: ob.golive || new Date(Date.now() + 70 * 86400000).toISOString().slice(0, 10),
      phase: 0,
      doneIds: ob.doneIds || [],
      risks: ob.risks || [],
      docs: ob.docs || []
    };
    const next = [newOb, ...onboardings];
    setOnboardings(next);

    // Auto create matching account if missing
    if (!accounts.some((a) => a.name.toLowerCase() === newOb.acct.toLowerCase())) {
      const newAcc: Account = {
        id: `A-${1000 + accounts.length + 1}`,
        name: newOb.acct,
        ind: accountDetails?.ind || 'Technology / SMB',
        hq: accountDetails?.hq || 'United States',
        entity: newOb.entityCode,
        arr: accountDetails?.arr || 150000,
        health: 85,
        stage: 'Onboarding',
        csm: newOb.owner,
        since: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        svc: accountDetails?.svc || ['AP', 'AR', 'GL / Close']
      };
      setAccounts((prev) => [newAcc, ...prev]);
    }

    logActivity(`Onboarding launched — <b>${newOb.acct}</b> (${newOb.id})`, 'onboard', '#ccfbf1', '#0f766e');
    syncState({ onboardings: next });
    toast(`Transition workspace created for <b>${newOb.acct}</b>`);
    return id;
  };

  const toggleOnboardingTask = (obId: string, taskId: number) => {
    const next = onboardings.map((ob) => {
      if (ob.id !== obId) return ob;
      const isDone = ob.doneIds.includes(taskId);
      const doneIds = isDone ? ob.doneIds.filter((id) => id !== taskId) : [...ob.doneIds, taskId];
      return { ...ob, doneIds };
    });
    setOnboardings(next);
    syncState({ onboardings: next });
  };

  const addRiskToOnboarding = (obId: string, risk: any) => {
    const next = onboardings.map((ob) => {
      if (ob.id !== obId) return ob;
      return { ...ob, risks: [...ob.risks, risk] };
    });
    setOnboardings(next);
    syncState({ onboardings: next });
    toast('Risk logged');
  };

  const deleteRiskFromOnboarding = (obId: string, index: number) => {
    const next = onboardings.map((ob) => {
      if (ob.id !== obId) return ob;
      const risks = [...ob.risks];
      risks.splice(index, 1);
      return { ...ob, risks };
    });
    setOnboardings(next);
    syncState({ onboardings: next });
  };

  const addDocToOnboarding = (obId: string, docItem: any) => {
    const next = onboardings.map((ob) => {
      if (ob.id !== obId) return ob;
      return { ...ob, docs: [...ob.docs, docItem] };
    });
    setOnboardings(next);
    syncState({ onboardings: next });
  };

  const deleteDocFromOnboarding = (obId: string, index: number) => {
    const next = onboardings.map((ob) => {
      if (ob.id !== obId) return ob;
      const docs = [...ob.docs];
      docs.splice(index, 1);
      return { ...ob, docs };
    });
    setOnboardings(next);
    syncState({ onboardings: next });
  };

  const deleteOnboarding = (id: string) => {
    const next = onboardings.filter((o) => o.id !== id);
    setOnboardings(next);
    syncState({ onboardings: next });
    toast('Onboarding workspace removed');
  };

  const addIssue = (issue: Partial<Issue>) => {
    const newIssue: Issue = {
      id: issue.id || `ISS-${1000 + issues.length + 1}`,
      t: issue.t || 'Operational bottleneck',
      co: issue.co || 'General Client',
      sev: issue.sev || 'Medium',
      cat: issue.cat || 'AP',
      st: issue.st || 'New',
      o: issue.o || 'R. Kumar',
      age: 0,
      sla: issue.sev === 'Critical' ? '4h left' : issue.sev === 'High' ? '24h left' : '3d left',
      opened: new Date().toISOString().slice(0, 10),
      resolution: ''
    };
    const next = [newIssue, ...issues];
    setIssues(next);
    logActivity(`Issue logged: <b>${newIssue.id}</b> — ${newIssue.t}`, 'issues', '#fee2e2', '#b91c1c');
    syncState({ issues: next });
    toast(`Issue <b>${newIssue.id}</b> logged`);
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    const next = issues.map((i) => (i.id === id ? { ...i, ...updates } : i));
    setIssues(next);
    syncState({ issues: next });
  };

  const setIssueStatus = (id: string, status: Issue['st']) => {
    updateIssue(id, { st: status });
    toast(`Issue status updated to <b>${status}</b>`);
  };

  const resolveIssue = (id: string) => {
    updateIssue(id, { st: 'Resolved' });
    toast(`Issue <b>${id}</b> marked as Resolved`);
  };

  const deleteIssue = (id: string) => {
    const next = issues.filter((i) => i.id !== id);
    setIssues(next);
    syncState({ issues: next });
    toast('Issue removed');
  };

  const sendThreadReply = (threadId: string, text: string) => {
    const next = threads.map((t) => {
      if (t.id !== threadId) return t;
      return {
        ...t,
        last: 'just now',
        msgs: [
          ...t.msgs,
          {
            who: user?.displayName || 'Priya Nair (Trivium)',
            dir: 'out' as const,
            t: text,
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          }
        ]
      };
    });
    setThreads(next);
    syncState({ threads: next });
    toast('Message sent');
  };

  const addCommunication = (comm: Partial<CommunicationItem>) => {
    const newComm: CommunicationItem = {
      id: comm.id || 'COMM-' + Math.random().toString(36).slice(2, 7),
      acct: comm.acct || 'General Client',
      from: comm.from || 'Priya Nair (Trivium Lead)',
      to: comm.to || 'Client Stakeholder',
      subj: comm.subj || 'Untitled Communication',
      body: comm.body || '',
      channel: comm.channel || 'Email',
      dir: comm.dir || 'Outbound',
      st: comm.st || 'Delivered',
      date: 'Just now'
    };
    const next = [newComm, ...comms];
    setComms(next);
    toast(`Communication dispatched to <b>${newComm.to}</b>`);
  };

  const updateWorkstream = (id: string, updates: Partial<Workstream>) => {
    const next = workstreams.map((w) => (w.id === id ? { ...w, ...updates } : w));
    setWorkstreams(next);
    syncState({ workstreams: next });
    toast('Workstream deliverable updated');
  };

  const updateTaxEvent = (id: string, updates: Partial<TaxCalendarItem>) => {
    const next = taxCalendar.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTaxCalendar(next);
    syncState({ taxCalendar: next });
  };

  const addDocument = (docItem: Partial<DocumentItem>) => {
    const newDoc: DocumentItem = {
      id: docItem.id || 'DOC-' + Math.random().toString(36).slice(2, 8),
      name: docItem.name || 'Untitled File',
      folder: docItem.folder || 'F-01',
      size: docItem.size || 1024 * 50,
      uploaded: Date.now(),
      fileId: docItem.fileId
    };
    const next = [newDoc, ...documents];
    setDocuments(next);
    syncState({ documents: next });
    toast(`File <b>${newDoc.name}</b> uploaded`);
  };

  const deleteDocument = (id: string) => {
    const next = documents.filter((d) => d.id !== id);
    setDocuments(next);
    syncState({ documents: next });
    toast('File deleted');
  };

  const clearNotifications = () => {
    setNotifications([]);
    syncState({ notifications: [] });
    toast('Notifications cleared');
  };

  const resetDemoData = () => {
    setAccounts(initialAccounts);
    setContacts(initialContacts);
    setLeads(initialLeads);
    setRfxs(initialRfxs);
    setOnboardings(initialOnboardings);
    setIssues(initialIssues);
    setThreads(initialThreads);
    setWorkstreams(initialWorkstreams);
    setTaxCalendar(initialTaxCalendar);
    setDocuments([]);
    setActivities(initialActivities);
    setNotifications(initialNotifications);
    persistLocally({
      accounts: initialAccounts,
      contacts: initialContacts,
      leads: initialLeads,
      rfxs: initialRfxs,
      onboardings: initialOnboardings,
      issues: initialIssues,
      threads: initialThreads,
      workstreams: initialWorkstreams,
      taxCalendar: initialTaxCalendar,
      documents: [],
      activities: initialActivities,
      notifications: initialNotifications
    });
    toast('Demo data reset');
  };

  const exportAllData = () => {
    const data = {
      accounts,
      contacts,
      leads,
      rfxs,
      onboardings,
      issues,
      threads,
      workstreams,
      taxCalendar,
      documents,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plse-trivium-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Full data backup downloaded');
  };

  return (
    <DataContext.Provider
      value={{
        accounts,
        contacts,
        leads,
        rfxs,
        onboardings,
        issues,
        threads,
        comms,
        workstreams,
        taxCalendar,
        docFolders,
        documents,
        activities,
        notifications,
        user,
        theme,
        activeView,
        viewParams,
        toasts,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        navigate,
        setTheme,
        toggleTheme,
        signIn,
        signOut,
        toast,
        removeToast,
        addAccount,
        updateAccount,
        deleteAccount,
        addLead,
        updateLead,
        addRfx,
        updateRfx,
        deleteRfx,
        advanceRfxStage,
        addOnboarding,
        toggleOnboardingTask,
        addRiskToOnboarding,
        deleteRiskFromOnboarding,
        addDocToOnboarding,
        deleteDocFromOnboarding,
        deleteOnboarding,
        addIssue,
        updateIssue,
        setIssueStatus,
        resolveIssue,
        deleteIssue,
        sendThreadReply,
        addCommunication,
        updateWorkstream,
        updateTaxEvent,
        addDocument,
        deleteDocument,
        clearNotifications,
        resetDemoData,
        exportAllData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
