export interface KnowledgeDoc {
  id: string;
  code: string;
  title: string;
  category: 'SOP' | 'Tax & Compliance' | 'Transition & TOM' | 'Governance & Legal' | 'Audit & Controls' | 'Financial Close';
  type: 'PDF' | 'DOCX' | 'MD' | 'XLSX';
  version: string;
  lastUpdated: string;
  author: string;
  securityClassification: 'Confidential' | 'Restricted' | 'Internal Standard';
  tags: string[];
  summary: string;
  content: string;
}

export const KNOWLEDGE_VAULT_DOCS: KnowledgeDoc[] = [
  {
    id: 'DOC-SOP-001',
    code: 'SOP-AP-01',
    title: 'End-to-End Accounts Payable & 3-Way OCR Matching Standard Operating Procedure',
    category: 'SOP',
    type: 'MD',
    version: 'v3.2',
    lastUpdated: '2026-08-15',
    author: 'Priya Nair, Lead Delivery Architect',
    securityClassification: 'Internal Standard',
    tags: ['AP', 'Procure-to-Pay', 'OCR', '3-Way Match', 'Fraud Prevention'],
    summary: 'Comprehensive standard operating procedure covering invoice ingestion, OCR validation, PO matching tolerances, dual-authorization approval hierarchies, and payment batch execution.',
    content: `# Trivium F&A Standard Operating Procedure (SOP)
## Document ID: SOP-AP-01 | Rev: 3.2
### Title: End-to-End Accounts Payable & 3-Way OCR Automated Reconciliation Standard

---

### 1. Purpose & Scope
This Standard Operating Procedure defines the end-to-end processing rules for vendor invoices, credit memos, expense reimbursements, and disbursement schedules managed by Trivium delivery pods across client engagements.

### 2. Procure-to-Pay Workflow Architecture
1. **Intake & OCR Extraction (Target: < 2 Hours from receipt):**
   - Automated ingestion via dedicated client AP mailbox (\`ap@client.triviumfao.com\`).
   - OCR engine parses Header Data (Vendor Name, Tax ID/EIN, Invoice #, Date, Due Date, Net Terms, Currency, Subtotal, Tax, Shipping, Total) and Line Items (Quantity, Unit Price, SKU, GL coding suggestion).
   - Confidence threshold: Field extractions $\\ge 95\\%$ pass automatically; $< 95\\%$ route to Tier 1 AP Analyst validation queue.

2. **Validation & Matching Rules:**
   - **2-Way Match (Services / Recurring):** Invoice verified against authorized Master Services Agreement / Contract schedule and department budget line.
   - **3-Way Match (Goods / Physical Items):** Automated algorithmic tie-out between **Purchase Order (PO)**, **Goods Receiving Note (GRN) / Warehouse Slip**, and **Vendor Invoice**.
   - **Tolerances:** Unit price variance allowance is $\\pm 0.00\\%$; Freight/tax variance allowance is capped at lesser of $10.00 or $1.5\\%$.

3. **Approval Hierarchies & RACI Matrix:**
   - **Tier 1 ($0 – $5,000):** Operational Department Head approval.
   - **Tier 2 ($5,001 – $25,000):** Department VP + Controller review.
   - **Tier 3 ($25,001 – $100,000):** CFO / VP Finance authorization.
   - **Tier 4 (>$100,000):** Dual C-Suite authorization (CEO + CFO).

4. **Payment Batch Generation & Positive Pay:**
   - Payment runs scheduled twice weekly (Tuesdays & Thursdays, 2:00 PM EST).
   - Automated generation of Bank Positive Pay file (NACHA format) and immediate transmission to depository institution to prevent check washing and ACH intercept fraud.

### 3. Key Performance Indicators & SLAs
- **Invoice Processing Cycle Time:** $\\le 24$ hours from receipt to approval queue.
- **First-Pass Accuracy:** $\\ge 99.4\\%$.
- **Vendor Payment On-Time Rate:** $\\ge 99.8\\%$.
- **Duplicate Invoice Detection Rate:** $100.0\\%$.`
  },
  {
    id: 'DOC-SOP-002',
    code: 'SOP-AR-02',
    title: 'Accounts Receivable, ASC 606 Milestone Invoicing & Automated Dunning Framework',
    category: 'SOP',
    type: 'MD',
    version: 'v2.8',
    lastUpdated: '2026-07-22',
    author: 'Dana Whitfield, Senior Accounting Manager',
    securityClassification: 'Internal Standard',
    tags: ['AR', 'Order-to-Cash', 'ASC 606', 'Dunning', 'Collections'],
    summary: 'Order-to-cash operational standard establishing milestone invoicing rules, deferred revenue waterfall schedules, payment gateway reconciliation, and a 4-tier automated dunning sequence.',
    content: `# Trivium Order-to-Cash Standard Operating Procedure
## Document ID: SOP-AR-02 | Rev: 2.8
### Title: Order-to-Cash, Contract Milestone Invoicing & Collections Standard

---

### 1. Objective
To maintain optimal Days Sales Outstanding (DSO $\\le 32$ days), eliminate unapplied customer cash, and guarantee rigorous compliance with GAAP ASC 606 (Revenue from Contracts with Customers).

### 2. Invoicing Procedures
- **SaaS & Subscription Contracts:** Billed in advance on the 1st of each billing cycle (Monthly, Quarterly, Annual). Automated Stripe/Chargebee integration syncing with NetSuite/QuickBooks.
- **Professional Services / Milestone Contracts:** Triggered upon formal written sign-off from Client Engagement Lead and Client Sponsor.
- **Time & Materials (T&M):** Hours locked on the final day of the calendar month; invoices generated and distributed by Working Day +2.

### 3. Automated Dunning & Escalation Cadence
- **Day -3 (Pre-Due Reminder):** Friendly electronic notice with PDF invoice and 1-click ACH/Wire payment link.
- **Day +1 (Due Date Grace):** Automated email notice of pending receipt.
- **Day +7 (First Overdue Notice):** Standard dunning notice with copy to Account Executive.
- **Day +15 (Second Overdue Notice):** Phone follow-up by AR Specialist; finance penalty warning.
- **Day +30 (Executive Escalation):** Formal letter from Trivium Controller; service suspension hold placed on account pending resolution.

### 4. Cash Application & Bank Reconciliations
- Daily automated Plaid/Bank feed cash match against open subledger AR items.
- Unapplied cash must not exceed $0.00 beyond 48 business hours.`
  },
  {
    id: 'DOC-GL-003',
    code: 'SOP-GL-03',
    title: '4-Day Month-End Financial Close & Balance Sheet Reconciliation Playbook',
    category: 'Financial Close',
    type: 'MD',
    version: 'v4.1',
    lastUpdated: '2026-09-01',
    author: 'Priya Nair, Lead Delivery Architect',
    securityClassification: 'Restricted',
    tags: ['Month-End Close', 'Balance Sheet', 'Reconciliations', 'GAAP', 'Flux Analysis'],
    summary: 'The authoritative playbook orchestrating the rapid 4-day close cadence: cutoff dates, amortization schedules, intercompany eliminations, variance thresholds, and board deck preparation.',
    content: `# Trivium Month-End Close Playbook
## Document ID: SOP-GL-03 | Rev: 4.1
### Title: 4-Day Working Close Methodology & Continuous Accounting Protocol

---

### 1. Close Velocity Schedule (Working Days WD-1 to WD+4)
- **WD -1 (Pre-Close Preparation):**
  - Lock vendor purchase orders and expense submission windows.
  - Review open purchase receipts and initiate pre-accrual scans.
- **WD +1 (Subledger Cutoff & Cash Settlement):**
  - AP subledger hard close at 5:00 PM EST.
  - AR subledger lock and unapplied cash reconciliation.
  - Complete 100% of bank, merchant, and credit card reconciliations.
- **WD +2 (Accruals, Prepaid & Fixed Asset Amortization):**
  - Book payroll wage/tax accruals and PTO balance adjustments.
  - Run automated depreciation and prepaid expense amortizations.
  - Post ASC 842 lease liability and Right-of-Use (ROU) asset adjustments.
- **WD +3 (Revenue Recognition & Intercompany Eliminations):**
  - Execute ASC 606 revenue recognition waterfalls.
  - Post intercompany balance eliminations and management fee allocations.
  - Draft initial preliminary Trial Balance.
- **WD +4 (Controller Review & Final Financial Statement Delivery):**
  - Execute Balance Sheet & Income Statement flux analysis (threshold: $\\ge 10\\%$ and $\\ge \\$5,000$).
  - Lead Controller tie-out sign-off.
  - Publish Executive Reporting Package (P&L, Balance Sheet, Statement of Cash Flows, SaaS KPI Dashboard).

### 2. Balance Sheet Tie-Out Standard
Every balance sheet account must have an active, audited tie-out schedule in the workpaper repository by WD+4. Unreconciled variances exceeding $\\$0.01$ will trigger a Gate Close Exception.`
  },
  {
    id: 'DOC-TR-004',
    code: 'PLSE-TR-01',
    title: 'Trivium 7-Phase Client Onboarding & Transition Operating Blueprint',
    category: 'Transition & TOM',
    type: 'MD',
    version: 'v5.0',
    lastUpdated: '2026-08-30',
    author: 'Marcus Bell, Head of Client Transitions',
    securityClassification: 'Internal Standard',
    tags: ['Onboarding', '7-Phases', 'Transition', 'Knowledge Transfer', 'Parallel Run'],
    summary: 'Complete operating blueprint for transitioning client F&A operations to Trivium: Discovery, Target Operating Model (TOM), Knowledge Transfer (KT), Parallel Close Calibration, Cutover, Hypercare, and Steady-State BAU.',
    content: `# Trivium 7-Phase Client Transition Blueprint
## Document ID: PLSE-TR-01 | Rev: 5.0
### Title: Standard Transition Methodology for High-Growth US F&A Outsourcing

---

### The 7-Phase Transition Lifecycle (70-Day Standard Timeline)

\`\`\`
[Phase 0: Intake] ──> [Phase 1: Discovery] ──> [Phase 2: TOM Design] ──> [Phase 3: KT & SOPs]
       │
       ▼
[Phase 4: Parallel Run] ──> [Phase 5: Cutover & Go-Live] ──> [Phase 6: Hypercare] ──> [Phase 7: BAU]
\`\`\`

#### Phase 0: Contract Execution & Initiation (Days 1–5)
- MSA & SOW execution, security access protocols, client kickoff meeting.
- Assignment of Lead US Controller, Onboarding Pod Lead, and Client Account Manager.

#### Phase 1: Technical & Process Discovery (Days 6–15)
- Deep-dive into general ledger architecture, historical chart of accounts, banking access levels, tax filings, and recurring vendors.
- Initial compliance risk scorecard and GAP analysis.

#### Phase 2: Target Operating Model (TOM) & RACI Design (Days 16–25)
- Definition of segregation of duties, delegation of authority (DOA) matrix, and software stack integration map.

#### Phase 3: Knowledge Transfer (KT) & Desktop Procedures (Days 26–40)
- Process shadowing (minimum 10 recorded sessions).
- Formulation and client sign-off of granular Desktop Procedures (DTPs) for every transaction stream.

#### Phase 4: Dual Parallel Close Run (Days 41–55)
- Trivium delivery pod executes parallel month-end close alongside client/legacy team.
- Zero-variance reconciliation criteria required for Gate 4 clearance.

#### Phase 5: Go-Live Cutover (Days 56–60)
- Formal transfer of primary accounting operations to Trivium.
- Activation of live SLA telemetry and monitoring dashboards.

#### Phase 6: Hypercare & Stabilization (Days 61–75)
- Daily standup meetings with client controller.
- 15-minute priority SLA resolution window for all inquiries.

#### Phase 7: Steady-State BAU & Continuous Improvement (Day 76+)
- Migration to standard SLA monitoring, monthly executive KPI reporting, and quarterly governance reviews.`
  },
  {
    id: 'DOC-TAX-005',
    code: 'TAX-DE-01',
    title: 'Delaware Annual Franchise Tax Calculation & Filing Methodology',
    category: 'Tax & Compliance',
    type: 'MD',
    version: 'v3.0',
    lastUpdated: '2026-08-10',
    author: 'US Tax & Corporate Governance Practice',
    securityClassification: 'Internal Standard',
    tags: ['Delaware', 'Franchise Tax', 'Assumed Par Value', 'Authorized Shares', 'Form 1120'],
    summary: 'Strategic analysis and computation guide comparing the Authorized Shares Method vs. the Assumed Par Value Capital Method, saving high-growth startups tens of thousands of dollars annually.',
    content: `# Delaware Annual Franchise Tax Filing Standard
## Document ID: TAX-DE-01 | Rev: 3.0
### Title: Dual-Method Calculation & Minimization Guide for Delaware C-Corps

---

### 1. Regulatory Background
All domestic corporations incorporated in the State of Delaware must file an Annual Franchise Tax Report and pay Delaware Franchise Tax by **March 1** of each calendar year.

### 2. The Two Calculation Methods

#### Method A: Authorized Shares Method (Default by State)
- 5,000 shares or less: Minimum tax of $\\$175.00$
- 5,001 to 10,000 shares: $\\$250.00$
- For each additional 10,000 shares: Add $\\$85.00$
- *Danger:* Startups with 10,000,000 authorized shares receive default bills of over $\\$85,000$ using this method!

#### Method B: Assumed Par Value Capital Method (Trivium Optimized)
- Formula: 
  $$\\text{Assumed Par Value} = \\frac{\\text{Total Gross Assets}}{\\text{Total Issued Shares}}$$
  $$\\text{Assumed Par Value Capital} = \\text{Authorized Shares} \\times \\max(\\text{Assumed Par Value}, \\text{Actual Par Value})$$
- Tax rate: $\\$400.00$ for each $\\$1,000,000$ of Assumed Par Value Capital.
- Minimum tax: $\\$400.00$; Annual filing fee: $\\$50.00$.
- *Result:* Re-computes tax for early-stage startups with high authorized share counts from $\\$85,000$ down to $\\$450.00$.

### 3. Trivium Preparation & Filing Protocol
1. Reconcile Gross Assets from Form 1120 Schedule L (Balance Sheet) as of December 31.
2. Reconcile Cap Table (Total Authorized Shares vs Total Issued Shares including founder shares).
3. Compute tax under both methods in PLSE Tax Matrix.
4. Execute electronic filing on the Delaware Division of Corporations portal by February 15.`
  },
  {
    id: 'DOC-TAX-006',
    code: 'TAX-US-02',
    title: 'Form 1099-NEC & 1099-MISC Annual Information Return Playbook',
    category: 'Tax & Compliance',
    type: 'MD',
    version: 'v2.5',
    lastUpdated: '2026-07-30',
    author: 'US Tax & Corporate Governance Practice',
    securityClassification: 'Internal Standard',
    tags: ['1099-NEC', '1099-MISC', 'W-9', 'IRS FIRE', 'Information Returns'],
    summary: 'Detailed instructions on annual independent contractor compliance, TIN matching via IRS e-Services, backup withholding rules, electronic FIRE system filings, and state 1099 filing nexus.',
    content: `# IRS Form 1099 Information Returns Playbook
## Document ID: TAX-US-02 | Rev: 2.5
### Title: Annual 1099-NEC / 1099-MISC Compliance & Backup Withholding Protocol

---

### 1. Filing Thresholds & Deadlines
- **Form 1099-NEC (Nonemployee Compensation):**
  - Threshold: Payments $\\ge \\$600$ to non-corporate independent contractors, freelancers, attorneys, and LLCs taxed as partnerships/disregarded entities.
  - Statutory Deadline: **January 31** (Recipient Copy & IRS Electronic Submission).
- **Form 1099-MISC (Miscellaneous Information):**
  - Threshold: Rent ($\\ge \\$600$), Royalties ($\\ge \\$10$), Legal settlement payments.
  - Statutory Deadline: **January 31** (Recipient) / **March 31** (IRS Electronic).

### 2. Year-Round Controls & W-9 Ingestion Gate
1. **Rule of First Payment:** No AP disbursement may be released to an unincorporated US vendor without an active, signed Form W-9 on file.
2. **Automated IRS TIN Matching:** Run bulk TIN match across all vendor records in Q3 to detect name/SSN/EIN discrepancies prior to annual filing.
3. **Backup Withholding (24%):** If a valid TIN is not provided after B-Notice notification, mandatory 24% backup withholding is remitted to the IRS.`
  },
  {
    id: 'DOC-GOV-007',
    code: 'GOV-RACI-01',
    title: 'Target Operating Model (TOM) & Global Delivery RACI Matrix',
    category: 'Governance & Legal',
    type: 'MD',
    version: 'v3.5',
    lastUpdated: '2026-08-20',
    author: 'Executive Leadership Team',
    securityClassification: 'Internal Standard',
    tags: ['RACI', 'TOM', 'Governance', 'Delivery Pods', 'Controllership'],
    summary: 'Defines the structural boundaries, accountabilities, and handoff protocols between Onshore US Fractional Controllers, Nearshore Delivery Pods, and Client Financial Stakeholders.',
    content: `# Trivium Global Target Operating Model (TOM) & RACI
## Document ID: GOV-RACI-01 | Rev: 3.5
### Title: Multi-Tier Governance & Roles Accountability Architecture

---

### Legend
- **R (Responsible):** The doer who executes the task.
- **A (Accountable):** The individual with final approval and fiduciary ownership.
- **C (Consulted):** Subject matter expert providing vital inputs.
- **I (Informed):** Stakeholder kept updated on progress and outcomes.

---

### Governance Matrix

| F&A Process / Workflow | Trivium Delivery Pod | Trivium US Controller | Client Financial Officer |
| :--- | :---: | :---: | :---: |
| **Vendor Invoice OCR & 3-Way Match** | **R** | **A** | **I** |
| **AP Disbursement Authorization (<$25k)** | **R** | **C** | **A** |
| **Customer Invoicing & Dunning** | **R** | **A** | **I** |
| **Bank Feeds & Cash Reconciliations** | **R** | **A** | **I** |
| **Month-End Accruals & Prepaids** | **R** | **A** | **I** |
| **ASC 606 Revenue Recognition** | **R** | **A** | **C** |
| **Financial Statement Publication** | **C** | **R** | **A** |
| **Delaware Franchise Tax & 1099s** | **R** | **A** | **I** |
| **Federal 1120 / State Income Tax Filing** | **R** | **A** | **A** |
| **Board Package Financial Reporting** | **C** | **R** | **A** |`
  },
  {
    id: 'DOC-MSA-008',
    code: 'MSA-STD-01',
    title: 'Master Services Agreement (MSA) & Service Level Agreement (SLA) Template',
    category: 'Governance & Legal',
    type: 'MD',
    version: 'v4.0',
    lastUpdated: '2026-06-15',
    author: 'Legal & Risk Counsel',
    securityClassification: 'Restricted',
    tags: ['MSA', 'Legal', 'SLA', 'Contract', 'Confidentiality', 'Data Protection'],
    summary: 'Standard contractual framework covering service covenants, data security safeguards, SOC 2 compliance warranties, intellectual property indemnities, and SLA performance penalty clauses.',
    content: `# Master Services Agreement (MSA) & Service Level Schedules
## Document ID: MSA-STD-01 | Rev: 4.0
### Title: Standard F&A Outsourcing Master Contract & SLA Covenants

---

### 1. Engagement & Deliverables
Trivium Solutions LLC ("Provider") covenants to perform comprehensive Finance & Accounting Outsourcing (FAO) services for Client in accordance with the Statement of Work (SOW), utilizing reasonable professional care and adherence to US Generally Accepted Accounting Principles (GAAP).

### 2. Information Security & Data Protection
- Provider shall maintain **SOC 1 Type II** and **SOC 2 Type II** certifications.
- All client financial data at rest shall be encrypted using **AES-256**, and in transit using **TLS 1.3**.
- Multi-factor authentication (MFA) and least-privilege role-based access control (RBAC) are strictly enforced.

### 3. Service Level Commitments
1. **System Uptime:** $99.9\\%$ availability for PLSE workflow orchestration.
2. **Month-End Close Delivery:** Working Day +4 by 5:00 PM EST.
3. **Critical Exception Response:** $\\le 30$ minutes acknowledgment; $\\le 4$ hours root cause resolution plan.`
  },
  {
    id: 'DOC-SOC-009',
    code: 'SOC-CTL-01',
    title: 'SOC 1 Type II / SOC 2 Internal Control Matrix & Evidence Workpaper',
    category: 'Audit & Controls',
    type: 'MD',
    version: 'v3.1',
    lastUpdated: '2026-08-25',
    author: 'Internal Audit & Compliance Team',
    securityClassification: 'Restricted',
    tags: ['SOC 1', 'SOC 2', 'Internal Controls', 'Audit Workpaper', 'Segregation of Duties'],
    summary: 'Audited control activities, testing frequencies, segregation of duty validations, user access review logs, and annual external auditor workpaper documentation.',
    content: `# SOC 1 Type II / SOC 2 Control Matrix & Testing Plan
## Document ID: SOC-CTL-01 | Rev: 3.1
### Title: Financial Reporting Internal Controls & Security Trust Criteria Matrix

---

### 1. Control Domain: Segregation of Duties (SOD)
- **Control ID CTL-AP-01:** No individual with authority to enter vendor master records shall possess authorization to release bank disbursements.
- **Testing Frequency:** Monthly automated permission scan.
- **Audit Evidence:** ERP user role audit log and positive pay dual-signature verification reports.

### 2. Control Domain: General Ledger Journal Entries
- **Control ID CTL-GL-04:** All non-standard journal entries exceeding $\\$10,000$ require documented business justification and supervisory review by the US Controller prior to posting.
- **Testing Frequency:** 100% sample test for all closing periods.

### 3. Control Domain: User Access Management & Offboarding
- **Control ID CTL-IT-02:** Upon employee termination, system access credentials across all ERPs, banking portals, and workflow engines must be revoked within 2 hours of formal notice.`
  },
  {
    id: 'DOC-RCA-010',
    code: 'RCA-5WHY-01',
    title: '5-Whys Root Cause Analysis (RCA) & 72-Hour CAPA Operational Standard',
    category: 'Audit & Controls',
    type: 'MD',
    version: 'v2.4',
    lastUpdated: '2026-07-18',
    author: 'Continuous Improvement Practice',
    securityClassification: 'Internal Standard',
    tags: ['RCA', '5-Whys', 'CAPA', 'Quality Management', 'SLA Remediation'],
    summary: 'Operational standard for investigating SLA breaches, exceptions, and closing variances using the 5-Whys framework, complete with 72-hour Corrective and Preventative Action (CAPA) tracking.',
    content: `# Trivium Root Cause Analysis & CAPA Standard
## Document ID: RCA-5WHY-01 | Rev: 2.4
### Title: 5-Whys Problem Solving Methodology & Incident Remediation Protocol

---

### 1. Trigger Conditions for Mandatory RCA
- Any SLA breach categorized as **Critical** or **High**.
- Balance sheet reconciliation variance exceeding $\\$1,000$ at month-end close cutoff.
- Any missed statutory tax filing deadline or penalty notice.

### 2. The 5-Whys Sequential Investigation Framework
1. **Direct Symptom:** What observable error or delay occurred?
2. **First-Order Process Cause:** Why was the immediate control bypassed?
3. **Upstream Dependency Cause:** What input or document was missing or corrupted?
4. **Procedural Gap:** Why did existing checks fail to detect the defect earlier?
5. **Systemic Root Cause:** What structural policy, tool, or training deficiency allowed the gap to exist?

### 3. 72-Hour Corrective & Preventative Action (CAPA)
- **Containment (Within 24 Hours):** Immediate operational workaround to protect client close timelines.
- **Root Cause & Permanent Fix (Within 48 Hours):** System rule modification or SOP amendment.
- **Client Disclosure & Preventative Sign-off (Within 72 Hours):** Executive memo and updated monitoring telemetry.`
  }
];
