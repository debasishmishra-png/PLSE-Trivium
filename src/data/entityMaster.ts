import { EntityDefinition, ComplianceMilestone, EntityRiskFactor } from '../types/index.ts';

export const ENTITY_MASTER: Record<string, EntityDefinition> = {
  SP: {
    code: 'SP',
    name: 'Sole Proprietorship',
    cat: 'proprietorship',
    desc: 'No legal distinction between individual and business. Simplest form.',
    taxDefault: 'Disregarded (Schedule C)',
    taxElectable: null,
    liability: 'Unlimited personal liability',
    minOwners: 1,
    maxOwners: 1,
    formation: 'No filing required',
    governingLaw: 'Common law',
    federalForm: 'Schedule C (Form 1040)',
    filingDeadline: 'April 15',
    k1: false,
    extension: 'Form 4868',
    stateCompliance: ['DBA registration (if applicable)', 'Business licences (local/state)'],
    selfEmploymentTax: 'Full 15.3% on net earnings',
    onboardingTasks: [
      'Collect DBA filing and business licences',
      'Verify EIN (or confirm SSN usage)',
      'Set up quarterly estimated tax reminders',
      'Review personal vs. business expense separation'
    ],
    auditChecks: ['No entity-level audit — personal return focus', 'Expense substantiation review'],
    notes: 'Full self-employment tax exposure. No liability protection.'
  },
  GP: {
    code: 'GP',
    name: 'General Partnership',
    cat: 'partnership',
    desc: 'Default for 2+ owners with no liability shield.',
    taxDefault: 'Partnership',
    taxElectable: 'C-Corp',
    liability: 'Unlimited — all partners jointly and severally liable',
    minOwners: 2,
    maxOwners: null,
    formation: 'No public filing (partnership agreement recommended)',
    governingLaw: 'RUPA (state-specific)',
    federalForm: 'Form 1065',
    filingDeadline: 'March 15',
    k1: true,
    extension: 'Form 7004 (6 months)',
    stateCompliance: ['State annual report (if required)', 'Franchise tax (state-specific)'],
    selfEmploymentTax: 'Yes — on active income',
    onboardingTasks: [
      'Review partnership agreement for allocation and dissolution provisions',
      'Verify partner capital contributions and basis tracking',
      'Set up K-1 issuance workflow',
      'Review joint and several liability exposure'
    ],
    auditChecks: ['Partner basis tracking', 'Liability exposure review', 'Guaranteed payment treatment'],
    notes: 'Unlimited liability for all partners. Often undesirable entity form.'
  },
  LP: {
    code: 'LP',
    name: 'Limited Partnership',
    cat: 'partnership',
    desc: 'At least one GP (unlimited liability) + one LP (limited liability to contribution).',
    taxDefault: 'Partnership',
    taxElectable: 'C-Corp',
    liability: 'GP unlimited; LP limited to capital contribution',
    minOwners: 2,
    maxOwners: null,
    formation: 'State filing (Certificate of LP)',
    governingLaw: 'State LP Act (e.g., Delaware LP Act)',
    federalForm: 'Form 1065',
    filingDeadline: 'March 15',
    k1: true,
    extension: 'Form 7004 (6 months)',
    stateCompliance: ['Annual report', 'Franchise tax', 'Registered agent', 'Foreign qualification (if multi-state)'],
    selfEmploymentTax: 'GP: yes on active income; LP: generally no on limited partnership income',
    onboardingTasks: [
      'Verify GP vs. LP classification in partnership agreement',
      'Review capital account tracking for all partners',
      'Set up K-1 issuance workflow (separate GP/LP allocations)',
      'Confirm GP liability insurance coverage',
      'Review Delaware LP contractual freedom provisions'
    ],
    auditChecks: ['GP liability exposure review', 'LP capital account integrity', 'Allocation methodology review'],
    notes: 'Strong contractual freedom in Delaware. Must maintain at least one GP.'
  },
  LLP: {
    code: 'LLP',
    name: 'Registered Limited Liability Partnership',
    cat: 'partnership',
    desc: 'All partners have limited liability. Often used by professional firms.',
    taxDefault: 'Partnership',
    taxElectable: 'C-Corp',
    liability: 'All partners limited liability',
    minOwners: 2,
    maxOwners: null,
    formation: 'State filing (Registration)',
    governingLaw: 'State LLP Act',
    federalForm: 'Form 1065',
    filingDeadline: 'March 15',
    k1: true,
    extension: 'Form 7004 (6 months)',
    stateCompliance: ['Annual/biennial renewal', 'Franchise tax', 'Registered agent', 'Professional liability insurance'],
    selfEmploymentTax: 'Yes — on active income',
    onboardingTasks: [
      'Verify partner registration with state licensing board',
      'Collect professional liability insurance certificates',
      'Review partnership agreement for liability shield provisions',
      'Set up biennial renewal tracking with state board',
      'Confirm all partners hold active professional licences'
    ],
    auditChecks: ['Partner liability shield compliance', 'Insurance verification', 'Licence renewal tracking'],
    notes: 'Not taxed at entity level for federal purposes. Biennial or annual renewal with state licensing body.'
  },
  LLC: {
    code: 'LLC',
    name: 'Limited Liability Company',
    cat: 'llc',
    desc: 'State-law entity; not recognised for federal tax purposes.',
    taxDefault: 'DRE (1 owner) / Partnership (2+)',
    taxElectable: 'C-Corp (Form 8832), S-Corp (Form 2553)',
    liability: 'Members not personally liable',
    minOwners: 1,
    maxOwners: null,
    formation: 'State filing (Articles of Organization)',
    governingLaw: 'State LLC Act (e.g., Delaware LLC Act)',
    federalForm: 'Form 1065 (partnership) or Schedule C (DRE) or Form 1120/1120-S (elected)',
    filingDeadline: 'March 15 (partnership) / April 15 (DRE)',
    k1: 'Partnership: yes; DRE: no',
    extension: 'Form 7004 (6 months)',
    stateCompliance: ['Annual report', 'Franchise tax (DE: $300; CA: $800 min)', 'Registered agent', 'Foreign qualification (if multi-state)'],
    selfEmploymentTax: 'Partnership: yes on active income; DRE: full S/E tax',
    onboardingTasks: [
      'Review operating agreement for allocation and management provisions',
      'Set up capital account tracking (partnership) or Schedule C tracking (DRE)',
      'Confirm PTE election status (state-specific)',
      'Verify self-employment tax treatment of members',
      'Set up K-1 issuance workflow (partnership only)',
      'Review veil-piercing risk factors'
    ],
    auditChecks: ['Capital account reconciliation', 'Allocation methodology', 'Basis tracking', 'PTE election compliance'],
    notes: 'Most flexible entity structure. Can change tax treatment without changing legal entity.'
  },
  DLC: {
    code: 'DLC',
    name: 'Delaware Corporation',
    cat: 'corporation',
    desc: 'Most common state for VC-backed startups. Investor-friendly.',
    taxDefault: 'C Corporation',
    taxElectable: 'S Corporation (Form 2553)',
    liability: 'Shareholders limited liability',
    minOwners: 1,
    maxOwners: null,
    formation: 'State filing (Certificate of Incorporation)',
    governingLaw: 'Delaware General Corporation Law',
    federalForm: 'Form 1120',
    filingDeadline: 'April 15',
    k1: false,
    extension: 'Form 7004 (6 months)',
    stateCompliance: ['Annual report (March 1)', 'Franchise tax (variable)', 'Registered agent', 'Foreign qualification (if multi-state)'],
    selfEmploymentTax: 'N/A (shareholders are not self-employed for tax purposes)',
    onboardingTasks: [
      'Verify shareholder register and cap table accuracy',
      'Collect board resolutions and minutes',
      'Review related-party transaction disclosures',
      'Confirm Delaware franchise tax calculation method',
      'Set up annual shareholder meeting calendar',
      'Verify stock option plan and 409A valuation'
    ],
    auditChecks: ['Annual shareholder meeting minutes', 'Board consents', 'Related-party transactions', 'Stock ledger accuracy'],
    notes: 'Extensive case law. Investor-friendly. Most common for startups.'
  },
  PC: {
    code: 'PC',
    name: 'Professional Corporation',
    cat: 'professional',
    desc: 'For licensed professionals. Shareholders must be licensed in the same profession.',
    taxDefault: 'C Corporation',
    taxElectable: 'S Corporation (Form 2553)',
    liability: 'Shareholders limited (professional liability retained)',
    minOwners: 1,
    maxOwners: null,
    formation: 'State filing',
    governingLaw: 'State Professional Corporation Act',
    federalForm: 'Form 1120 or 1120-S',
    filingDeadline: 'April 15 or March 15',
    k1: 'S-Corp: yes; C-Corp: no',
    extension: 'Form 7004 (6 months)',
    stateCompliance: ['Annual report', 'Franchise tax', 'Registered agent', 'State licensing board approval', 'Professional liability insurance'],
    selfEmploymentTax: 'S-Corp: salary subject to payroll tax; C-Corp: salary subject to payroll tax',
    onboardingTasks: [
      'Collect professional licence copies for all shareholders',
      'Verify state licensing board approval',
      'Confirm professional liability insurance coverage',
      'Set up licence renewal tracking calendar',
      'Review scope-of-practice restrictions'
    ],
    auditChecks: ['Licence renewal tracking', 'Scope-of-practice compliance', 'Professional liability insurance'],
    notes: 'Must be owned by licensed professionals in same profession.'
  },
  PLLC: {
    code: 'PLLC',
    name: 'Professional Limited Liability Company',
    cat: 'professional',
    desc: 'Alternative to PC. Members must be licensed in the same profession.',
    taxDefault: 'DRE (1 owner) / Partnership (2+)',
    taxElectable: 'C-Corp, S-Corp',
    liability: 'Members limited (professional liability retained)',
    minOwners: 1,
    maxOwners: null,
    formation: 'State filing',
    governingLaw: 'State PLLC Act',
    federalForm: 'Form 1065 or Schedule C or Form 1120/1120-S',
    filingDeadline: 'March 15 / April 15',
    k1: 'Partnership: yes; DRE: no',
    extension: 'Form 7004 (6 months)',
    stateCompliance: ['Annual report', 'Franchise tax', 'Registered agent', 'State licensing board approval', 'Professional liability insurance'],
    selfEmploymentTax: 'Partnership: yes on active income; DRE: full S/E tax',
    onboardingTasks: [
      'Collect professional licence copies for all members',
      'Verify state licensing board approval',
      'Confirm professional liability insurance coverage',
      'Set up licence renewal tracking calendar',
      'Review PLLC operating agreement for professional practice provisions'
    ],
    auditChecks: ['Licence renewal tracking', 'Scope-of-practice compliance', 'Professional liability insurance'],
    notes: 'Not all states permit PLLCs. Some states require PCs instead.'
  },
  ST: {
    code: 'ST',
    name: 'Statutory Trust / Business Trust',
    cat: 'trust',
    desc: 'Separate legal entity. Used for structured finance, asset management, mutual funds.',
    taxDefault: 'Grantor Trust / Complex Trust',
    taxElectable: 'Corporation (Form 8832)',
    liability: 'Beneficial owners limited liability',
    minOwners: 1,
    maxOwners: null,
    formation: 'State filing (Certificate of Trust)',
    governingLaw: 'State Statutory Trust Act',
    federalForm: 'Form 1041',
    filingDeadline: 'April 15',
    k1: true,
    extension: 'Form 7004 (5.5 months)',
    stateCompliance: ['Annual report', 'Franchise tax', 'Registered agent', 'Trustee reporting requirements'],
    selfEmploymentTax: 'N/A — fiduciary income tax rules apply',
    onboardingTasks: [
      'Review trust agreement for distribution waterfall',
      'Verify trustee acceptance and fiduciary duties',
      'Set up Form 1041 filing calendar',
      'Confirm grantor vs. non-grantor trust status',
      'Review beneficial owner reporting requirements'
    ],
    auditChecks: ['Fiduciary duty compliance', 'Distribution waterfall verification', 'Grantor trust reporting'],
    notes: 'Separate legal entity distinct from trustees. Can be series trust.'
  },
  NPC: {
    code: 'NPC',
    name: 'Non-Profit Corporation',
    cat: 'npc',
    desc: 'Tax-exempt under 501(c)(3). No stockholders.',
    taxDefault: 'Tax-Exempt (501(c)(3))',
    taxElectable: 'N/A',
    liability: 'Directors/officers limited liability',
    minOwners: 1,
    maxOwners: null,
    formation: 'State filing (Articles of Incorporation)',
    governingLaw: 'State Non-Profit Corporation Act',
    federalForm: 'Form 990 / 990-EZ / 990-N',
    filingDeadline: 'May 15',
    k1: false,
    extension: 'Form 8868',
    stateCompliance: ['Annual report', 'Franchise tax (may be exempt)', 'Registered agent', 'State charitable solicitation registration'],
    selfEmploymentTax: 'N/A — exempt from federal income tax',
    onboardingTasks: [
      'Verify IRS 501(c)(3) determination letter',
      'Review board governance policies',
      'Set up Form 990 filing calendar',
      'Confirm state charitable solicitation registrations',
      'Review UBIT exposure',
      'Collect conflict-of-interest policy'
    ],
    auditChecks: ['Board governance review', 'Excess benefit transaction screening', 'UBIT analysis', 'Public disclosure of Form 990'],
    notes: 'Annual Form 990 filing required. State charitable registration.'
  },
  PBC: {
    code: 'PBC',
    name: 'Public Benefit Corporation',
    cat: 'corporation',
    desc: 'For-profit entity with public benefit purpose. Directors balance shareholder interest with public benefit.',
    taxDefault: 'C Corporation',
    taxElectable: 'S Corporation (Form 2553)',
    liability: 'Shareholders limited liability',
    minOwners: 1,
    maxOwners: null,
    formation: 'State filing (Certificate of Incorporation with PBC designation)',
    governingLaw: 'State PBC Act (DE §362)',
    federalForm: 'Form 1120 or 1120-S',
    filingDeadline: 'April 15 or March 15',
    k1: 'S-Corp: yes; C-Corp: no',
    extension: 'Form 7004 (6 months)',
    stateCompliance: ['Annual report', 'Franchise tax', 'Registered agent', 'Biennial benefit report (Delaware §366)', 'Third-party standard assessment'],
    selfEmploymentTax: 'S-Corp: salary subject to payroll tax; C-Corp: salary subject to payroll tax',
    onboardingTasks: [
      'Verify PBC designation in Certificate of Incorporation',
      'Review public benefit purpose statement',
      'Set up biennial benefit report calendar (Delaware)',
      'Confirm third-party standard assessment methodology',
      'Review director fiduciary duty balancing requirement',
      'Set up benefit report disclosure workflow'
    ],
    auditChecks: ['Public benefit purpose compliance', 'Benefit report accuracy and timeliness', 'Director fiduciary duty documentation', 'Shareholder transparency reporting'],
    notes: 'Available in 35+ states. Delaware requires biennial benefit report.'
  },
  BC: {
    code: 'BC',
    name: 'Benefit Corporation',
    cat: 'corporation',
    desc: 'For-profit entity meeting third-party social and environmental standards.',
    taxDefault: 'C Corporation',
    taxElectable: 'S Corporation (Form 2553)',
    liability: 'Shareholders limited liability',
    minOwners: 1,
    maxOwners: null,
    formation: 'State filing',
    governingLaw: 'State Benefit Corporation Act',
    federalForm: 'Form 1120 or 1120-S',
    filingDeadline: 'April 15 or March 15',
    k1: 'S-Corp: yes; C-Corp: no',
    extension: 'Form 7004 (6 months)',
    stateCompliance: ['Annual report', 'Franchise tax', 'Registered agent', 'Annual benefit report', 'Third-party standard certification'],
    selfEmploymentTax: 'S-Corp: salary subject to payroll tax; C-Corp: salary subject to payroll tax',
    onboardingTasks: [
      'Verify benefit corporation election in formation documents',
      'Confirm third-party standard (B Lab, etc.)',
      'Set up annual benefit report calendar',
      'Review director fiduciary duty provisions',
      'Confirm shareholder transparency requirements',
      'Set up benefit report publication workflow'
    ],
    auditChecks: ['Third-party standard compliance', 'Annual benefit report accuracy', 'Director fiduciary duty documentation', 'Shareholder transparency reporting'],
    notes: 'Available in 35+ states. Must meet third-party standard (B Lab certification).'
  },
  SLLC: {
    code: 'SLLC',
    name: 'Series LLC',
    cat: 'llc',
    desc: 'One LLC with multiple legally distinct series.',
    taxDefault: 'DRE / Partnership (per series)',
    taxElectable: 'C-Corp (Form 8832) per series',
    liability: 'Members limited; series liability separation',
    minOwners: 1,
    maxOwners: null,
    formation: 'State filing (Articles of Organization + Series designation)',
    governingLaw: 'State LLC Act (DE, IL, TX, NV, etc.)',
    federalForm: 'Form 1065 or Schedule C per series',
    filingDeadline: 'March 15 or April 15',
    k1: 'Partnership: yes; DRE: no',
    extension: 'Form 7004 (6 months)',
    stateCompliance: ['Annual report per series', 'Franchise tax per series', 'Registered agent', 'Series-specific books and records'],
    selfEmploymentTax: 'Partnership: yes on active income; DRE: full S/E tax',
    onboardingTasks: [
      'Verify series designation in Articles of Organization',
      'Review series operating agreement for liability separation',
      'Set up separate books and records per series',
      'Confirm federal tax classification per series',
      'Verify series recognition in all operating states',
      'Set up series-specific bank accounts',
      'Review series liability shield robustness'
    ],
    auditChecks: ['Series liability separation compliance', 'Books and records separation per series', 'Federal tax classification per series', 'Series recognition in operating states'],
    notes: 'Not recognised in all states (notable non-recognition: California).'
  },
  COOP: {
    code: 'COOP',
    name: 'Cooperative Corporation',
    cat: 'corporation',
    desc: 'Member-owned and democratically controlled. Subchapter T federal tax treatment.',
    taxDefault: 'Cooperative (Subchapter T)',
    taxElectable: 'C Corporation',
    liability: 'Members limited liability',
    minOwners: 1,
    maxOwners: null,
    formation: 'State filing',
    governingLaw: 'State Cooperative Corporation Act',
    federalForm: 'Form 1120-C',
    filingDeadline: 'April 15',
    k1: false,
    extension: 'Form 7004 (6 months)',
    stateCompliance: ['Annual report', 'Franchise tax', 'Registered agent', 'Member meeting documentation', 'Patronage dividend reporting'],
    selfEmploymentTax: 'N/A — members are not self-employed for tax purposes',
    onboardingTasks: [
      'Verify cooperative designation in formation documents',
      'Review member governance and voting provisions',
      'Set up patronage dividend tracking',
      'Confirm Subchapter T election status',
      'Set up member meeting calendar',
      'Review member equity and redemption provisions',
      'Set up Form 1099-PATR issuance workflow'
    ],
    auditChecks: ['Member governance compliance', 'Patronage dividend calculation accuracy', 'Subchapter T compliance', 'Member equity tracking'],
    notes: 'Governed by Subchapter T of the IRC.'
  },
  FDE: {
    code: 'FDE',
    name: 'Foreign Disregarded Entity',
    cat: 'foreign',
    desc: 'Foreign entity with single owner and no limited liability under local law.',
    taxDefault: 'Disregarded / Branch',
    taxElectable: 'Corporation (Form 8832)',
    liability: 'Depends on local law',
    minOwners: 1,
    maxOwners: 1,
    formation: 'Foreign jurisdiction filing',
    governingLaw: 'Foreign local law',
    federalForm: 'Form 8858',
    filingDeadline: 'With owner\'s return',
    k1: false,
    extension: 'N/A',
    stateCompliance: ['Foreign qualification (if doing business in US)', 'Registered agent (if qualified)'],
    selfEmploymentTax: 'N/A — depends on owner type',
    onboardingTasks: [
      'Confirm default classification vs. elected classification',
      'Verify Form 8832 filing (if elected)',
      'Set up Form 8858 tracking',
      'Review treaty positions and ECI determination',
      'Conduct transfer pricing analysis',
      'Verify US trade or business determination'
    ],
    auditChecks: ['Transfer pricing study', 'Treaty-based return positions', 'ECI determination'],
    notes: 'Reported on Form 8858. Owned by US person.'
  },
  FC: {
    code: 'FC',
    name: 'Foreign Corporation (per se)',
    cat: 'foreign',
    desc: 'Foreign entity where all owners have limited liability. Per se corporation.',
    taxDefault: 'Corporation',
    taxElectable: 'None (per se corporation)',
    liability: 'All owners limited liability',
    minOwners: 1,
    maxOwners: null,
    formation: 'Foreign jurisdiction filing',
    governingLaw: 'Foreign local law',
    federalForm: 'Form 5471',
    filingDeadline: 'With owner\'s return',
    k1: false,
    extension: 'N/A',
    stateCompliance: ['Foreign qualification (if doing business in US)', 'Registered agent (if qualified)', 'BOI reporting (foreign reporting companies only)'],
    selfEmploymentTax: 'N/A — corporate tax rules apply',
    onboardingTasks: [
      'Verify per se corporation status under Treas. Reg. §301.7701-2(b)(8)',
      'Set up Form 5471 tracking',
      'Review CFC status',
      'Conduct Subpart F / GILTI analysis',
      'Review treaty positions and ECI determination',
      'Conduct transfer pricing analysis'
    ],
    auditChecks: ['Transfer pricing study', 'Subpart F / GILTI analysis', 'ECI determination', 'CFC status review'],
    notes: 'Cannot elect out of corporation status. Foreign reporting companies remain subject to FinCEN BOI reporting.'
  }
};

export const ENTITY_CAT_LABEL: Record<string, string> = {
  proprietorship: 'Proprietorship',
  partnership: 'Partnership',
  llc: 'LLC',
  corporation: 'Corporation',
  professional: 'Professional Corp',
  trust: 'Statutory Trust',
  npc: 'Non-Profit 501(c)(3)',
  foreign: 'Foreign Structure'
};

export const ENTITY_COMPLIANCE_CALENDAR: Record<string, ComplianceMilestone[]> = {
  SP: [
    { d: 'Apr 15', n: 'Form 1040 + Schedule C', type: 'Federal', freq: 'Annual' },
    { d: 'Jun 15', n: 'Q2 Estimated Tax', type: 'Federal', freq: 'Quarterly' },
    { d: 'Sep 15', n: 'Q3 Estimated Tax', type: 'Federal', freq: 'Quarterly' },
    { d: 'Jan 15', n: 'Q4 Estimated Tax', type: 'Federal', freq: 'Quarterly' }
  ],
  GP: [
    { d: 'Mar 15', n: 'Form 1065 + K-1s', type: 'Federal', freq: 'Annual' },
    { d: 'Apr 15', n: 'Partner Schedule K-1', type: 'Federal', freq: 'Annual' },
    { d: 'Jun 15', n: 'Q2 Estimated Tax', type: 'Federal', freq: 'Quarterly' }
  ],
  LP: [
    { d: 'Mar 15', n: 'Form 1065 + K-1s', type: 'Federal', freq: 'Annual' },
    { d: 'Anniversary', n: 'State LP Annual Report', type: 'State', freq: 'Annual' }
  ],
  LLP: [
    { d: 'Mar 15', n: 'Form 1065 + K-1s', type: 'Federal', freq: 'Annual' },
    { d: 'Biennial', n: 'State LLP Renewal', type: 'State', freq: 'Biennial' }
  ],
  LLC: [
    { d: 'Mar 15', n: 'Form 1065 + K-1s (partnership) or Schedule C (DRE)', type: 'Federal', freq: 'Annual' },
    { d: 'Jun 1', n: 'DE LLC Franchise Tax ($300)', type: 'State', freq: 'Annual' },
    { d: 'Anniversary', n: 'State LLC Annual Report', type: 'State', freq: 'Annual' }
  ],
  DLC: [
    { d: 'Apr 15', n: 'Form 1120 (C-Corp)', type: 'Federal', freq: 'Annual' },
    { d: 'Mar 15', n: 'Form 1120-S (S-Corp)', type: 'Federal', freq: 'Annual' },
    { d: 'Mar 1', n: 'DE Annual Report + Franchise Tax', type: 'State', freq: 'Annual' }
  ],
  PC: [
    { d: 'Apr 15', n: 'Form 1120 or 1120-S', type: 'Federal', freq: 'Annual' },
    { d: 'Anniversary', n: 'State Professional Licence Renewal', type: 'State', freq: 'Annual/Biennial' }
  ],
  PLLC: [
    { d: 'Mar 15', n: 'Form 1065 + K-1s', type: 'Federal', freq: 'Annual' },
    { d: 'Anniversary', n: 'State Professional Licence Renewal', type: 'State', freq: 'Annual/Biennial' }
  ],
  ST: [
    { d: 'Apr 15', n: 'Form 1041 (Trust)', type: 'Federal', freq: 'Annual' }
  ],
  NPC: [
    { d: 'May 15', n: 'Form 990 / 990-EZ / 990-N', type: 'Federal', freq: 'Annual' },
    { d: 'Anniversary', n: 'State Charitable Solicitation Registration', type: 'State', freq: 'Annual' }
  ],
  PBC: [
    { d: 'Apr 15', n: 'Form 1120 or 1120-S', type: 'Federal', freq: 'Annual' },
    { d: 'Biennial', n: 'DE Public Benefit Report (§366)', type: 'State', freq: 'Biennial' }
  ],
  BC: [
    { d: 'Apr 15', n: 'Form 1120 or 1120-S', type: 'Federal', freq: 'Annual' },
    { d: 'Anniversary', n: 'Annual Benefit Report', type: 'State', freq: 'Annual' }
  ],
  SLLC: [
    { d: 'Mar 15', n: 'Form 1065 or Schedule C (per series)', type: 'Federal', freq: 'Annual' },
    { d: 'Jun 1', n: 'DE Series LLC Franchise Tax', type: 'State', freq: 'Annual' }
  ],
  COOP: [
    { d: 'Apr 15', n: 'Form 1120-C', type: 'Federal', freq: 'Annual' },
    { d: 'Jan 31', n: 'Form 1099-PATR', type: 'Federal', freq: 'Annual' }
  ],
  FDE: [
    { d: 'With owner return', n: 'Form 8858 (Information Return of U.S. Persons With Respect to Foreign DREs)', type: 'Federal', freq: 'Annual' }
  ],
  FC: [
    { d: 'With owner return', n: 'Form 5471 (Controlled Foreign Corporation)', type: 'Federal', freq: 'Annual' }
  ]
};

export const ENTITY_DOC_CHECKLISTS: Record<string, string[]> = {
  SP: ['DBA filing', 'Business licences', 'EIN confirmation', 'Personal tax returns (3 years)', 'Bank statements'],
  GP: ['Partnership agreement', 'EIN letter', 'Partner capital contribution records', 'Insurance certificates'],
  LP: ['Certificate of LP', 'Partnership agreement', 'EIN letter', 'Capital account statements'],
  LLP: ['LLP registration', 'Partnership agreement', 'EIN letter', 'Professional licences', 'Professional liability insurance'],
  LLC: ['Articles of Organization', 'Operating Agreement', 'EIN letter', 'Membership certificates', 'State annual report filings'],
  DLC: ['Certificate of Incorporation', 'Bylaws', 'EIN letter', 'Shareholder register', 'Stock ledger', 'Board resolutions', 'Cap table', '409A valuation'],
  PC: ['Articles of Incorporation', 'Professional licence copies', 'State board approval letter', 'EIN letter'],
  PLLC: ['Articles of Organization', 'Operating Agreement', 'Professional licence copies', 'State board approval letter'],
  ST: ['Certificate of Trust', 'Trust Agreement', 'EIN letter', 'Trustee acceptance', 'Beneficial owner list'],
  NPC: ['Articles of Incorporation', 'Bylaws', 'IRS 501(c)(3) determination letter', 'EIN letter', 'Conflict-of-interest policy'],
  PBC: ['Certificate of Incorporation (PBC)', 'Public benefit purpose statement', 'Bylaws', 'Biennial benefit report template'],
  BC: ['Certificate of Incorporation (benefit corp)', 'Third-party standard certification', 'Bylaws', 'Annual benefit report template'],
  SLLC: ['Articles of Organization (series)', 'Series operating agreement', 'EIN per series', 'Series bank account documentation'],
  COOP: ['Articles of Incorporation (cooperative)', 'Bylaws', 'EIN letter', 'Member list', 'Subchapter T election documentation'],
  FDE: ['Formation documents (translated)', 'Form 8832 (if elected)', 'Form 8858', 'EIN'],
  FC: ['Formation documents (translated)', 'Form 5471', 'EIN', 'CFC analysis']
};

export const ENTITY_DOCUMENT_CHECKLIST = ENTITY_DOC_CHECKLISTS;

export const ENTITY_RISK_PROFILES: Record<string, EntityRiskFactor[]> = {
  SP: [
    { r: 'Unlimited personal liability', sev: 'High', m: 'Consider LLC conversion or insurance' },
    { r: 'Full self-employment tax', sev: 'Medium', m: 'Evaluate S-Corp election' }
  ],
  GP: [
    { r: 'Joint and several liability', sev: 'High', m: 'Consider LLP or LLC conversion' },
    { r: 'Partner disputes', sev: 'Medium', m: 'Execute partnership agreement' }
  ],
  LP: [
    { r: 'GP liability exposure', sev: 'High', m: 'Consider LLLP or LLC conversion' }
  ],
  LLP: [
    { r: 'Liability shield compliance', sev: 'Medium', m: 'Verify state LLP act compliance' },
    { r: 'Licence renewal', sev: 'High', m: 'Set up licence renewal tracking' }
  ],
  LLC: [
    { r: 'Veil-piercing risk', sev: 'Medium', m: 'Maintain separate bank accounts & strict ledger separation' },
    { r: 'S/E tax on active members', sev: 'Medium', m: 'Evaluate S-Corp election' }
  ],
  DLC: [
    { r: 'DE franchise tax calculation', sev: 'Medium', m: 'Verify calculation method (authorized shares vs assumed par value)' },
    { r: 'Stock option 409A valuation', sev: 'High', m: 'Obtain independent annual 409A valuation' }
  ],
  PC: [
    { r: 'Professional licence renewal', sev: 'High', m: 'Set up licence renewal tracking' },
    { r: 'State board approval', sev: 'High', m: 'Verify board approval' }
  ],
  PLLC: [
    { r: 'State PLLC recognition', sev: 'Medium', m: 'Verify PLLC recognition' },
    { r: 'Licence renewal', sev: 'High', m: 'Set up tracking' }
  ],
  ST: [
    { r: 'Fiduciary duty compliance', sev: 'High', m: 'Verify trustee compliance' },
    { r: 'Grantor vs non-grantor status', sev: 'Medium', m: 'Confirm tax classification' }
  ],
  NPC: [
    { r: '501(c)(3) status maintenance', sev: 'High', m: 'Verify annual 990 filing' },
    { r: 'UBIT exposure', sev: 'Medium', m: 'Review unrelated business income' }
  ],
  PBC: [
    { r: 'Public benefit purpose compliance', sev: 'Medium', m: 'Verify purpose alignment' },
    { r: 'Biennial benefit report', sev: 'High', m: 'Set up biennial report calendar' }
  ],
  BC: [
    { r: 'Third-party standard compliance', sev: 'High', m: 'Maintain certification' },
    { r: 'Annual benefit report', sev: 'High', m: 'Set up annual report calendar' }
  ],
  SLLC: [
    { r: 'Series liability separation', sev: 'High', m: 'Maintain separate books per series' },
    { r: 'State series recognition', sev: 'High', m: 'Verify state recognition' }
  ],
  COOP: [
    { r: 'Subchapter T compliance', sev: 'High', m: 'Verify Subchapter T requirements' },
    { r: 'Patronage dividend calc', sev: 'High', m: 'Verify dividend accuracy' }
  ],
  FDE: [
    { r: 'Transfer pricing compliance', sev: 'High', m: 'Conduct transfer pricing study' },
    { r: 'ECI determination', sev: 'High', m: 'Analyze effectively connected income' }
  ],
  FC: [
    { r: 'Subpart F / GILTI inclusion', sev: 'High', m: 'Analyze inclusions' },
    { r: 'CFC status', sev: 'High', m: 'Verify CFC status' }
  ]
};
