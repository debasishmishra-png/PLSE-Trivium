import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { ENTITY_MASTER, ENTITY_DOCUMENT_CHECKLIST, ENTITY_RISK_PROFILES } from '../../data/entityMaster.ts';
import {
  Scale,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  FileCheck2,
  Calendar,
  Building2,
  Table,
  LayoutGrid,
  HelpCircle,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Download,
  X,
  Sparkles,
  GitMerge,
  Layers,
  ChevronRight,
  Info,
  ExternalLink
} from 'lucide-react';
import { EntityDefinition } from '../../types/index.ts';

type ViewMode = 'grid' | 'matrix' | 'advisor' | 'taxCalc';

const CATEGORIES = [
  { id: 'all', label: 'All 16 Entities', count: 16 },
  { id: 'proprietorship', label: 'Proprietorship', count: 1 },
  { id: 'partnership', label: 'Partnerships', count: 3 },
  { id: 'llc', label: 'LLC & Series', count: 2 },
  { id: 'corporation', label: 'Corporations & Benefit', count: 4 },
  { id: 'professional', label: 'Professional & Trusts', count: 3 },
  { id: 'npc', label: 'Non-Profit', count: 1 },
  { id: 'foreign', label: 'Foreign & Cross-Border', count: 2 }
];

export const EntityMasterView: React.FC = () => {
  const { navigate, addOnboarding, toast, setIsAiDrawerOpen } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [taxFilter, setTaxFilter] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeModalEntity, setActiveModalEntity] = useState<EntityDefinition | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'tax' | 'tasks' | 'risks' | 'docs'>('overview');

  // Advisor State
  const [advOwnership, setAdvOwnership] = useState<'single' | 'multiple' | 'foreign' | 'professional'>('multiple');
  const [advFunding, setAdvFunding] = useState<'vc' | 'bootstrapped' | 'grant' | 'debt'>('vc');
  const [advTaxPref, setAdvTaxPref] = useState<'passthrough' | 'corporate' | 'exempt'>('corporate');
  const [advAssetProtection, setAdvAssetProtection] = useState<'high' | 'maximum_series' | 'standard'>('high');

  // Delaware Tax Calc State
  const [calcAuthShares, setCalcAuthShares] = useState<number>(10000000);
  const [calcIssuedShares, setCalcIssuedShares] = useState<number>(5000000);
  const [calcGrossAssets, setCalcGrossAssets] = useState<number>(2500000);
  const [calcParValue, setCalcParValue] = useState<number>(0.0001);

  const entities = Object.values(ENTITY_MASTER);

  // Filtered list for grid and matrix
  const filtered = entities.filter((e) => {
    const matchesSearch =
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.federalForm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.taxDefault.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' ||
      (selectedCategory === 'proprietorship' && e.cat === 'proprietorship') ||
      (selectedCategory === 'partnership' && e.cat === 'partnership') ||
      (selectedCategory === 'llc' && (e.cat === 'llc' || e.code === 'SLLC')) ||
      (selectedCategory === 'corporation' && (e.cat === 'corporation' || e.code === 'DLC' || e.code === 'PBC' || e.code === 'BC' || e.code === 'COOP')) ||
      (selectedCategory === 'professional' && (e.cat === 'professional' || e.cat === 'trust' || e.code === 'PC' || e.code === 'PLLC' || e.code === 'ST')) ||
      (selectedCategory === 'npc' && e.cat === 'npc') ||
      (selectedCategory === 'foreign' && e.cat === 'foreign');

    const matchesTax =
      taxFilter === 'All' ||
      (taxFilter === 'Pass-Through' && (e.taxDefault.toLowerCase().includes('pass-through') || e.taxDefault.toLowerCase().includes('partnership'))) ||
      (taxFilter === 'Corporate' && (e.taxDefault.toLowerCase().includes('corporation') || e.taxDefault.toLowerCase().includes('entity-level') || e.code === 'DLC')) ||
      (taxFilter === 'Disregarded' && e.taxDefault.toLowerCase().includes('disregarded')) ||
      (taxFilter === 'Tax-Exempt' && (e.taxDefault.toLowerCase().includes('exempt') || e.code === 'NPC'));

    return matchesSearch && matchesCat && matchesTax;
  });

  // Calculate Delaware Franchise Tax
  const calculateDelawareTax = () => {
    // 1. Authorized Shares Method
    let authSharesTax = 175;
    if (calcAuthShares > 5000 && calcAuthShares <= 10000) {
      authSharesTax = 250;
    } else if (calcAuthShares > 10000) {
      const extraShares = calcAuthShares - 10000;
      authSharesTax = 250 + Math.ceil(extraShares / 10000) * 85;
    }

    // 2. Assumed Par Value Capital Method
    const assumedParValue = calcGrossAssets / Math.max(calcIssuedShares, 1);
    const effectivePar = Math.max(assumedParValue, calcParValue);
    const assumedParValueCapital = calcAuthShares * effectivePar;
    const assumedTax = Math.max(400, Math.ceil(assumedParValueCapital / 1000000) * 400);

    const recommendedMethod = assumedTax < authSharesTax ? 'Assumed Par Value Capital Method' : 'Authorized Shares Method';
    const finalTax = Math.min(authSharesTax, assumedTax) + 50; // $50 filing fee
    const savings = Math.abs(authSharesTax - assumedTax);

    return {
      authSharesTax: authSharesTax + 50,
      assumedTax: assumedTax + 50,
      recommendedMethod,
      finalTax,
      savings,
      assumedParValue,
      assumedParValueCapital
    };
  };

  const deCalcResults = calculateDelawareTax();

  // Recommendation engine logic
  const getRecommendedEntity = (): { code: string; name: string; score: number; rationale: string[] } => {
    if (advOwnership === 'foreign') {
      return {
        code: 'DLC',
        name: 'Delaware C-Corporation (with Form 5472 / 8858)',
        score: 96,
        rationale: [
          'Universal standard for foreign parent holding entities and international venture investment.',
          'Permits non-US resident shareholders without Subchapter S citizenship restrictions.',
          'Full legal shield protecting offshore founders from US jurisdiction.'
        ]
      };
    }
    if (advOwnership === 'professional') {
      return {
        code: 'PLLC',
        name: 'Professional Limited Liability Company (or PC)',
        score: 94,
        rationale: [
          'Statutory vehicle tailored for licensed professionals (CPAs, attorneys, physicians).',
          'Pass-through taxation combined with personal professional liability limitation.',
          'Complies with state regulatory board licensing mandates.'
        ]
      };
    }
    if (advFunding === 'grant' || advTaxPref === 'exempt') {
      return {
        code: 'NPC',
        name: 'Non-Profit 501(c)(3) Corporation',
        score: 98,
        rationale: [
          'Eligible for public grants, philanthropic endowments, and tax-deductible contributions.',
          'Exempt from Federal Corporate Income Tax under IRC Section 501(c)(3).',
          'Fosters strong public trust with annual Form 990 transparency.'
        ]
      };
    }
    if (advFunding === 'vc' || advTaxPref === 'corporate') {
      return {
        code: 'DLC',
        name: 'Delaware C-Corporation',
        score: 99,
        rationale: [
          'Mandatory legal vehicle required by 95%+ of US institutional venture capital and angel investors.',
          'Allows multi-class stock (Preferred Stock, Common Stock, Stock Option Pools).',
          'Qualifies for Section 1202 Qualified Small Business Stock (QSBS) up to $10M tax-free capital gains exclusion.'
        ]
      };
    }
    if (advAssetProtection === 'maximum_series') {
      return {
        code: 'SLLC',
        name: 'Series Limited Liability Company',
        score: 92,
        rationale: [
          'Partition assets (e.g. real estate portfolios, IP blocks) into distinct firewalled sub-series.',
          'Single master formation fee with independent liability rings per series.',
          'Flexible pass-through tax treatment.'
        ]
      };
    }
    if (advOwnership === 'single' && advFunding === 'bootstrapped') {
      return {
        code: 'LLC',
        name: 'Single-Member LLC (Disregarded / S-Corp Eligible)',
        score: 95,
        rationale: [
          'Simplicity of single-member pass-through tax filing without entity-level return overhead.',
          'Strong corporate veil liability shield against personal lawsuits.',
          'Option to elect S-Corporation tax treatment (Form 2553) to optimize self-employment taxes once profitability exceeds $80k.'
        ]
      };
    }

    return {
      code: 'LLC',
      name: 'Multi-Member Limited Liability Company',
      score: 93,
      rationale: [
        'Unmatched operating agreement flexibility for multi-founder profit-sharing.',
        'Default partnership pass-through tax treatment avoiding double taxation.',
        'Comprehensive limited liability shield.'
      ]
    };
  };

  const recommended = getRecommendedEntity();

  const handleLaunchOnboarding = (entityCode: string) => {
    const obId = addOnboarding({
      acct: `New ${entityCode} Client`,
      entityCode: entityCode,
      owner: 'Priya Nair',
      golive: new Date(Date.now() + 70 * 86400000).toISOString().slice(0, 10)
    });
    toast(`Launched Onboarding for ${entityCode}!`);
    setActiveModalEntity(null);
    navigate('onboardingDetail', { id: obId });
  };

  const handleExportComparisonMatrix = () => {
    const headers = ['Code', 'Name', 'Category', 'Federal Form', 'Filing Deadline', 'Tax Treatment', 'K-1 Required', 'Liability Shield', 'Min Owners', 'Max Owners', 'Self-Employment Tax', 'Extension Form', 'Onboarding Gates'];
    const rows = entities.map((e) => [
      e.code,
      `"${e.name}"`,
      e.cat,
      e.federalForm,
      `"${e.filingDeadline}"`,
      `"${e.taxDefault}"`,
      e.k1 ? 'Yes' : 'No',
      `"${e.liability}"`,
      e.minOwners,
      e.maxOwners || 'Unlimited',
      `"${e.selfEmploymentTax}"`,
      e.extension,
      e.onboardingTasks.length
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `US_Entity_Master_16_Taxonomy_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Exported US Entity Master (16) Matrix to CSV');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
              IRS & Statutory Delivery Framework
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">16 Authoritative US Archetypes</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            US Entity Master (16) Encyclopedia & Nexus Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            The definitive US legal entity taxonomy powering Trivium's Target Operating Model (TOM), automated onboarding gates, Delaware franchise calculations, and IRS tax return compliance.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            AI Entity & Nexus Advisor
          </button>

          <button
            onClick={handleExportComparisonMatrix}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Export 16 Matrix (CSV)
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            16 Entity Cards
          </button>

          <button
            onClick={() => setViewMode('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'matrix'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Comparison Matrix
          </button>

          <button
            onClick={() => setViewMode('advisor')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'advisor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Entity Decision Wizard
          </button>

          <button
            onClick={() => setViewMode('taxCalc')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'taxCalc'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Delaware Franchise Calculator
          </button>
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
          Showing <b>{filtered.length}</b> of <b>16</b> US entity structures
        </div>
      </div>

      {/* MODE 1: GRID CARDS VIEW */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          {/* Category Filter Pills & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedCategory === cat.id ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search code, form, name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <select
                value={taxFilter}
                onChange={(e) => setTaxFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                <option value="All">All Tax Classes</option>
                <option value="Pass-Through">Pass-Through (1065 / K-1)</option>
                <option value="Corporate">Corporate / Entity-Level (1120)</option>
                <option value="Disregarded">Disregarded (Schedule C)</option>
                <option value="Tax-Exempt">Tax-Exempt (990)</option>
              </select>
            </div>
          </div>

          {/* 16 Entity Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((entity) => (
              <div
                key={entity.code}
                onClick={() => setActiveModalEntity(entity)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-2xs">
                        {entity.code}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {entity.cat}
                      </span>
                    </div>
                    {entity.k1 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50">
                        K-1
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {entity.name}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {entity.desc}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Federal Form:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {entity.federalForm}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Filing Deadline:</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        {entity.filingDeadline}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tax Treatment:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                        {entity.taxDefault}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {entity.onboardingTasks.length} Automated Gates
                  </span>
                  <div className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
                    <span>Inspect 360°</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 2: COMPREHENSIVE COMPARISON MATRIX */}
      {viewMode === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">16 US Legal Frameworks Comparative Matrix</h3>
                <p className="text-xs text-slate-500">Cross-structural taxonomy comparing tax forms, liability shields, K-1 rules, and governing statutes.</p>
              </div>
              <button
                onClick={handleExportComparisonMatrix}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-3 font-mono">Code</th>
                    <th className="py-3 px-3">Entity Name</th>
                    <th className="py-3 px-3">Federal Form</th>
                    <th className="py-3 px-3">Deadline</th>
                    <th className="py-3 px-3">Default Tax</th>
                    <th className="py-3 px-3">K-1</th>
                    <th className="py-3 px-3">Liability Protection</th>
                    <th className="py-3 px-3">Owners (Min-Max)</th>
                    <th className="py-3 px-3">Self-Employment Tax</th>
                    <th className="py-3 px-3">Extension</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {entities.map((e) => (
                    <tr key={e.code} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {e.code}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {e.name}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {e.federalForm}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {e.filingDeadline}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 text-[11px]">
                        {e.taxDefault}
                      </td>
                      <td className="py-3 px-3">
                        {e.k1 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                            Required
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 dark:text-slate-300 max-w-[160px] truncate" title={e.liability}>
                        {e.liability}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {e.minOwners} to {e.maxOwners || '∞'}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 dark:text-slate-300 max-w-[140px] truncate" title={e.selfEmploymentTax}>
                        {e.selfEmploymentTax}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {e.extension}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setActiveModalEntity(e)}
                          className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-semibold text-[11px] transition-colors"
                        >
                          View 360°
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: ENTITY DECISION WIZARD */}
      {viewMode === 'advisor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                US Entity Architecture & Selection Wizard
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your strategic, tax, and governance parameters to determine the optimal US entity archetype.
              </p>
            </div>

            <div className="space-y-4">
              {/* Question 1: Ownership Profile */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  1. Ownership & Founder Structure
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'single', label: 'Single Founder / Owner' },
                    { id: 'multiple', label: 'Multiple US Founders' },
                    { id: 'foreign', label: 'Foreign / International Parent' },
                    { id: 'professional', label: 'Licensed Professional (CPA/Law/Med)' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAdvOwnership(opt.id as any)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        advOwnership === opt.id
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Capital & Financing Objective */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  2. Fundraising & Capitalization Objective
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'vc', label: 'Institutional VC / Angel (Priced / SAFEs)' },
                    { id: 'bootstrapped', label: 'Bootstrapped / Owner Financed' },
                    { id: 'grant', label: 'Public Grants / Philanthropic' },
                    { id: 'debt', label: 'Bank Debt / Equipment Finance' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAdvFunding(opt.id as any)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        advFunding === opt.id
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Tax Preference */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  3. Tax Treatment & Distribution Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'corporate', label: 'Corporate Entity-Level (Retained Earnings & QSBS)' },
                    { id: 'passthrough', label: 'Pass-Through (Direct to Owner Returns)' },
                    { id: 'exempt', label: 'Tax-Exempt Charitable / 501(c)(3)' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAdvTaxPref(opt.id as any)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        advTaxPref === opt.id
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4: Asset Ring-Fencing */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  4. Liability Isolation & Asset Partitioning
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'high', label: 'Standard High Corporate Shield' },
                    { id: 'maximum_series', label: 'Multi-Asset Series Firewalls' },
                    { id: 'standard', label: 'Basic Operating Company' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAdvAssetProtection(opt.id as any)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        advAssetProtection === opt.id
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Output Card */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-700/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  Architectural Recommendation
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {recommended.score}% Match
                </span>
              </div>

              <div>
                <div className="font-mono text-3xl font-extrabold text-white">
                  {recommended.code}
                </div>
                <div className="text-base font-bold text-indigo-200 mt-1">
                  {recommended.name}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-indigo-800/80">
                <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                  Strategic Rationale:
                </div>
                <ul className="space-y-1.5">
                  {recommended.rationale.map((r, idx) => (
                    <li key={idx} className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-indigo-800/80 flex flex-col gap-2">
                <button
                  onClick={() => {
                    const ent = ENTITY_MASTER[recommended.code] || ENTITY_MASTER['DLC'];
                    setActiveModalEntity(ent);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xs transition-colors text-center"
                >
                  View Full 360° {recommended.code} Blueprint
                </button>

                <button
                  onClick={() => handleLaunchOnboarding(recommended.code)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  Launch {recommended.code} Onboarding
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: DELAWARE FRANCHISE TAX CALCULATOR */}
      {viewMode === 'taxCalc' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-600" />
                Delaware Annual Franchise Tax Multi-Method Calculator
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Compares the State Default (Authorized Shares Method) against Trivium's Optimized (Assumed Par Value Capital Method) per Delaware Title 8, Section 503.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Authorized Shares (Certificate of Incorporation)
                </label>
                <input
                  type="number"
                  value={calcAuthShares}
                  onChange={(e) => setCalcAuthShares(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400">e.g. 10,000,000 shares</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Issued Shares (Founders, Investors, Options)
                </label>
                <input
                  type="number"
                  value={calcIssuedShares}
                  onChange={(e) => setCalcIssuedShares(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400">e.g. 5,000,000 issued</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Gross Assets ($ USD from Form 1120 Sch L)
                </label>
                <input
                  type="number"
                  value={calcGrossAssets}
                  onChange={(e) => setCalcGrossAssets(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400">e.g. $2,500,000 balance sheet assets</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Stated Par Value per Share ($)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={calcParValue}
                  onChange={(e) => setCalcParValue(Number(e.target.value) || 0.0001)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400">Standard startup par value is $0.0001</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Calculated Intermediate Valuation Metrics:
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500">Assumed Par Value: </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    ${deCalcResults.assumedParValue.toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Assumed Par Value Capital: </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    ${Math.round(deCalcResults.assumedParValueCapital).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Method Comparison
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20">
                  <div className="text-[11px] text-slate-500">Authorized Shares Method (Default)</div>
                  <div className="text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
                    ${deCalcResults.authSharesTax.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Includes $50 mandatory filing fee</div>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold">
                      Assumed Par Value Method
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                      Trivium Pick
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    ${deCalcResults.assumedTax.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Estimated Annual Savings: <b>${deCalcResults.savings.toLocaleString()}</b>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
                <b>Statutory Deadline:</b> March 1 of each year. Trivium prepares and files Delaware Franchise Tax returns electronically in February during Phase 7 BAU operations.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 360° ENTITY MODAL / DRAWER */}
      {activeModalEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold px-3 py-1 rounded-xl bg-indigo-600 text-white shadow-xs">
                  {activeModalEntity.code}
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeModalEntity.name}
                  </h2>
                  <div className="text-xs text-slate-500 font-mono">
                    Federal Form: {activeModalEntity.federalForm} • Due: {activeModalEntity.filingDeadline}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLaunchOnboarding(activeModalEntity.code)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  Launch Onboarding
                </button>
                <button
                  onClick={() => setActiveModalEntity(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tab Navigation */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview & Law' },
                { id: 'tax', label: 'Tax & Compliance' },
                { id: 'tasks', label: `Onboarding Tasks (${activeModalEntity.onboardingTasks.length})` },
                { id: 'risks', label: 'Risk Factors' },
                { id: 'docs', label: 'Formation Documents' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModalTab(tab.id as any)}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeModalTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {activeModalTab === 'overview' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Legal Description</div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{activeModalEntity.desc}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Governing Statute</div>
                      <div className="font-semibold text-slate-900 dark:text-white">{activeModalEntity.governingLaw}</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Owner Liability</div>
                      <div className="font-semibold text-slate-900 dark:text-white">{activeModalEntity.liability}</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Ownership Limits</div>
                      <div className="font-semibold font-mono text-slate-900 dark:text-white">
                        Min: {activeModalEntity.minOwners} | Max: {activeModalEntity.maxOwners || 'Unlimited'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Formation Filing Requirement</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">{activeModalEntity.formation}</div>
                  </div>

                  {activeModalEntity.notes && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <div><b>Strategic Note:</b> {activeModalEntity.notes}</div>
                    </div>
                  )}
                </div>
              )}

              {activeModalTab === 'tax' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Default Tax Treatment</div>
                      <div className="font-semibold text-slate-900 dark:text-white">{activeModalEntity.taxDefault}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Electable Tax Regimes</div>
                      <div className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                        {activeModalEntity.taxElectable || 'None (Mandatory default)'}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Federal Return & Deadline</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {activeModalEntity.federalForm} — Due {activeModalEntity.filingDeadline}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Statutory Extension Form</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {activeModalEntity.extension}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Self-Employment & Pass-Through Tax Rules</div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium">{activeModalEntity.selfEmploymentTax}</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">State Annual Compliance & Nexus Requirements</div>
                    <ul className="space-y-1">
                      {activeModalEntity.stateCompliance.map((sc, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{sc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeModalTab === 'tasks' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-500">
                    These compliance gates are automatically injected into Trivium's 7-Phase Transition Engine (Phase 0 & 1) when onboarding this entity:
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {activeModalEntity.onboardingTasks.map((t, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[11px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{t}</span>
                        </div>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                          Phase 0/1 Gate
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModalTab === 'risks' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-500">
                    Pre-calculated risk factors and mitigation safeguards for {activeModalEntity.name}:
                  </div>
                  <div className="space-y-2">
                    {(ENTITY_RISK_PROFILES[activeModalEntity.code] || []).map((risk, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{risk.r}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            risk.sev === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {risk.sev} Severity
                          </span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px] pl-5">
                          <b>Trivium Mitigation Control:</b> {risk.m}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModalTab === 'docs' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-500">
                    Statutory formation documents and corporate records required during technical discovery:
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {(ENTITY_DOCUMENT_CHECKLIST[activeModalEntity.code] || ['Articles of Organization / Incorporation', 'IRS EIN Confirmation Letter', 'Operating Agreement / Bylaws']).map((docName, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{docName}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold">
                          Required
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
