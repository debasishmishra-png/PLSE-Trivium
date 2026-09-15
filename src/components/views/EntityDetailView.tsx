import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { ENTITY_MASTER, ENTITY_DOCUMENT_CHECKLIST, ENTITY_RISK_PROFILES } from '../../data/entityMaster.ts';
import {
  Scale,
  ArrowLeft,
  Calendar,
  FileCheck2,
  GitMerge,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sparkles,
  Download,
  FileText,
  Info,
  Layers,
  Award,
  ChevronRight
} from 'lucide-react';

interface EntityDetailViewProps {
  entityCode: string;
  onOpenNewOnboarding: () => void;
}

export const EntityDetailView: React.FC<EntityDetailViewProps> = ({
  entityCode,
  onOpenNewOnboarding
}) => {
  const { navigate, setIsAiDrawerOpen, addOnboarding, toast } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'tax' | 'tasks' | 'risks' | 'docs'>('overview');
  
  const entity = ENTITY_MASTER[entityCode] || ENTITY_MASTER['DLC'];

  const handleLaunchDirectOnboarding = () => {
    const obId = addOnboarding({
      acct: `New ${entity.code} Client`,
      entityCode: entity.code,
      owner: 'Priya Nair',
      golive: new Date(Date.now() + 70 * 86400000).toISOString().slice(0, 10)
    });
    toast(`Launched Onboarding for ${entity.code}!`);
    navigate('onboardingDetail', { id: obId });
  };

  const handleDownloadSpecSheet = () => {
    const markdown = `# Trivium F&A Architecture Spec Sheet: ${entity.code} — ${entity.name}
**Federal Tax Form:** ${entity.federalForm} | **Statutory Deadline:** ${entity.filingDeadline}
**Tax Classification:** ${entity.taxDefault} | **Governing Statute:** ${entity.governingLaw}

---

## 1. Entity Overview & Structure
${entity.desc}

- **Owner Liability:** ${entity.liability}
- **Owner Thresholds:** Min ${entity.minOwners}, Max ${entity.maxOwners || 'Unlimited'}
- **Formation Filing:** ${entity.formation}
- **Electable Tax Regimes:** ${entity.taxElectable || 'None'}
- **Self-Employment Tax Rules:** ${entity.selfEmploymentTax}

---

## 2. Automated Transition & Onboarding Gate Controls
${entity.onboardingTasks.map((t, idx) => `${idx + 1}. [Phase 0/1] ${t}`).join('\n')}

---

## 3. Statutory Document Checklist
${(ENTITY_DOCUMENT_CHECKLIST[entity.code] || []).map((d) => `- [ ] ${d}`).join('\n')}

---

## 4. Risk Profile & Controls
${(ENTITY_RISK_PROFILES[entity.code] || []).map((r) => `- **${r.r}** (${r.sev} Severity): ${r.m}`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Trivium_Entity_Spec_${entity.code}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(`Downloaded Spec Sheet for ${entity.code}`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('entities')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to US Entity Master Encyclopedia (16)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSpecSheet}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Download Spec Sheet
          </button>

          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Nexus Advisor
          </button>

          <button
            onClick={handleLaunchDirectOnboarding}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <GitMerge className="w-3.5 h-3.5" />
            Launch {entity.code} Onboarding
          </button>
        </div>
      </div>

      {/* Hero Profile Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              {entity.code}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{entity.name}</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {entity.cat}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                US Statutory Tax & Operating Model Reference Blueprint
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold">
              Form {entity.federalForm}
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              Due {entity.filingDeadline}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-5xl">
          {entity.desc}
        </p>

        {/* 4 Summary Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
            <div className="text-[10px] font-bold uppercase text-slate-400">Default Tax Class</div>
            <div className="font-semibold text-slate-900 dark:text-white truncate">{entity.taxDefault}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
            <div className="text-[10px] font-bold uppercase text-slate-400">Liability Shield</div>
            <div className="font-semibold text-slate-900 dark:text-white truncate">{entity.liability}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
            <div className="text-[10px] font-bold uppercase text-slate-400">K-1 Schedule</div>
            <div className="font-semibold font-mono text-indigo-600 dark:text-indigo-400">
              {entity.k1 ? 'Mandatory' : 'Not Applicable'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
            <div className="text-[10px] font-bold uppercase text-slate-400">Extension Form</div>
            <div className="font-semibold font-mono text-slate-900 dark:text-white">{entity.extension}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Governance & Structure' },
            { id: 'tax', label: 'Tax & Compliance Rules' },
            { id: 'tasks', label: `Onboarding Quality Gates (${entity.onboardingTasks.length})` },
            { id: 'risks', label: 'Risk Factors & Mitigations' },
            { id: 'docs', label: 'Formation Records Checklist' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 text-xs space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Governing Statute</div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{entity.governingLaw}</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Ownership Bounds</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    Min: {entity.minOwners} | Max: {entity.maxOwners || 'Unlimited'}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Formation Filing</div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{entity.formation}</div>
                </div>
              </div>

              {entity.notes && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                  <Info className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="leading-relaxed">
                    <b className="font-bold">Authoritative Trivium F&A Advisory Note:</b> {entity.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Federal Tax Classification</div>
                  <div className="font-bold text-slate-900 dark:text-white">{entity.taxDefault}</div>
                  <div className="text-[11px] text-slate-500">
                    Electable: <b className="font-mono text-indigo-600 dark:text-indigo-400">{entity.taxElectable || 'None'}</b>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Return & Statutory Timeline</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">{entity.federalForm}</div>
                  <div className="text-[11px] text-slate-500">
                    Statutory Due Date: <b>{entity.filingDeadline}</b> (Ext: {entity.extension})
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-400">Self-Employment & Pass-Through Treatment</div>
                <div className="text-slate-800 dark:text-slate-200 font-medium">{entity.selfEmploymentTax}</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">State Compliance & Franchise Nexus Requirements</div>
                <ul className="space-y-1.5">
                  {entity.stateCompliance.map((sc, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{sc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                These quality control tasks are automatically injected into Phase 0 & Phase 1 whenever a client of type <b>{entity.code}</b> is launched:
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {entity.onboardingTasks.map((t, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{t}</span>
                    </div>
                    <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 font-semibold">
                      Phase 0/1 Gate
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Key regulatory and operational vulnerabilities assessed for <b>{entity.name}</b>:
              </div>
              <div className="space-y-2.5">
                {(ENTITY_RISK_PROFILES[entity.code] || []).map((risk, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{risk.r}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        risk.sev === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {risk.sev} Severity
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs pl-6">
                      <b>Trivium Preventative Mitigation:</b> {risk.m}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Formation documents and corporate records required during Phase 1 Discovery:
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {(ENTITY_DOCUMENT_CHECKLIST[entity.code] || ['Articles of Incorporation', 'IRS EIN Confirmation Letter', 'Operating Agreement / Bylaws']).map((docName, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{docName}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold">
                      Mandatory
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
