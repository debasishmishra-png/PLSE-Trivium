import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import {
  PHASES,
  BASE_TASKS,
  getEntityTasks,
  getAllTasksForOnboarding,
  getPhaseStats,
  getOnboardingProgress
} from '../../data/transitionPhases.ts';
import { ENTITY_MASTER } from '../../data/entityMaster.ts';
import {
  GitMerge,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  Upload,
  Download,
  Building2,
  Clock,
  ChevronRight,
  Layers
} from 'lucide-react';

interface OnboardingDetailViewProps {
  onboardingId: string;
}

export const OnboardingDetailView: React.FC<OnboardingDetailViewProps> = ({ onboardingId }) => {
  const {
    onboardings,
    toggleOnboardingTask,
    addRiskToOnboarding,
    deleteRiskFromOnboarding,
    addDocToOnboarding,
    deleteDocFromOnboarding,
    navigate,
    setIsAiDrawerOpen,
    toast
  } = useData();

  const ob = onboardings.find((o) => o.id === onboardingId) || onboardings[0];
  const [activePhaseTab, setActivePhaseTab] = useState<number>(ob?.phase || 0);
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'risks' | 'docs' | 'tom' | 'cutover'>('tasks');

  // Risk form state
  const [riskDesc, setRiskDesc] = useState('');
  const [riskSev, setRiskSev] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [riskOwner, setRiskOwner] = useState('Delivery Lead');
  const [riskMitigation, setRiskMitigation] = useState('');

  // Doc form state
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('PDF');
  const [docSize, setDocSize] = useState('1.2 MB');

  if (!ob) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Transition Workspace Not Found</h3>
        <button
          onClick={() => navigate('onboarding')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Back to Onboardings Portfolio
        </button>
      </div>
    );
  }

  const entityDef = ENTITY_MASTER[ob.entityCode];
  const allTasks = getAllTasksForOnboarding(ob);
  const phaseTasks = allTasks.filter((t) => t.p === activePhaseTab);
  const phaseStats = getPhaseStats(ob, activePhaseTab);
  const overallProg = getOnboardingProgress(ob);

  const handleAddRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskDesc.trim()) return;
    addRiskToOnboarding(ob.id, {
      d: riskDesc.trim(),
      sev: riskSev,
      o: riskOwner,
      m: riskMitigation.trim() || 'Active monitoring and review',
      s: 'Open'
    });
    setRiskDesc('');
    setRiskMitigation('');
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    addDocToOnboarding(ob.id, {
      n: docName.trim(),
      t: docType,
      s: docSize,
      st: 'Uploaded'
    });
    setDocName('');
    toast('Document recorded in workspace');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('onboarding')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Transitions</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Risk & Acceleration Advisor
          </button>
        </div>
      </div>

      {/* Workspace Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{ob.acct}</h2>
              <span
                onClick={() => navigate('entityDetail', { code: ob.entityCode })}
                className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:underline cursor-pointer"
                title={`View ${entityDef?.name} regulatory architecture`}
              >
                {ob.entityCode} — {entityDef?.name || 'US Entity'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Workspace ID: <b className="font-mono text-slate-700 dark:text-slate-300">{ob.id}</b></span>
              <span>•</span>
              <span>Transition Lead: <b className="text-slate-700 dark:text-slate-300">{ob.owner}</b></span>
              <span>•</span>
              <span>Kickoff: <b className="font-mono text-slate-700 dark:text-slate-300">{ob.start}</b></span>
              <span>•</span>
              <span>Target Go-Live: <b className="font-mono text-indigo-600 dark:text-indigo-400">{ob.golive}</b></span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-[11px] font-medium text-slate-400">Total Transition Progress</div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{overallProg}%</div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center font-bold text-xs font-mono text-indigo-600 dark:text-indigo-400 shadow-2xs">
              {ob.doneIds.length}/{allTasks.length}
            </div>
          </div>
        </div>

        {/* 7-Phase Visual Stepper Navigation */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {PHASES.map((p) => {
              const stats = getPhaseStats(ob, p.id);
              const isActive = activePhaseTab === p.id;
              const isDone = stats.pct === 100;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePhaseTab(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className={`font-mono font-bold ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                      P{p.id}
                    </span>
                    <span className={`font-mono font-bold ${isActive ? 'text-white' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {stats.pct}%
                    </span>
                  </div>
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {p.short}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold w-fit">
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'tasks'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Phase Tasks ({phaseTasks.length})
        </button>
        <button
          onClick={() => setActiveSubTab('risks')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'risks'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Risk & Bottleneck Register ({ob.risks.length})
        </button>
        <button
          onClick={() => setActiveSubTab('docs')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'docs'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Artifacts & SOPs ({ob.docs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('tom')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'tom'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          TOM & RACI Blueprint
        </button>
        <button
          onClick={() => setActiveSubTab('cutover')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'cutover'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Go/No-Go Decision Gate
        </button>
      </div>

      {/* 1. Tasks Sub-tab */}
      {activeSubTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Phase {activePhaseTab}: {PHASES[activePhaseTab]?.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {PHASES[activePhaseTab]?.desc}
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Completed: <b className="font-mono text-indigo-600 dark:text-indigo-400">{phaseStats.done}/{phaseStats.total}</b> ({phaseStats.pct}%)
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {phaseTasks.map((t) => {
              const isChecked = ob.doneIds.includes(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => toggleOnboardingTask(ob.id, t.id)}
                  className={`p-3.5 px-4 flex items-center justify-between cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-slate-50/50 dark:bg-slate-800/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div>
                      <div
                        className={`text-xs font-semibold ${
                          isChecked
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {t.n}
                      </div>
                      {t.entity && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                          {ob.entityCode} Specific Compliance Task
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      RACI: {t.r}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{t.o}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Risks Sub-tab */}
      {activeSubTab === 'risks' && (
        <div className="space-y-4">
          {/* Add Risk Form */}
          <form
            onSubmit={handleAddRisk}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="font-bold text-xs text-slate-900 dark:text-white">Log Transition Risk / Dependency</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={riskDesc}
                  onChange={(e) => setRiskDesc(e.target.value)}
                  placeholder="Describe risk (e.g. ERP API latency, missing W-9s, legacy accrual variance)..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <select
                  value={riskSev}
                  onChange={(e) => setRiskSev(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="Critical">Critical Severity</option>
                  <option value="High">High Severity</option>
                  <option value="Medium">Medium Severity</option>
                  <option value="Low">Low Severity</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={riskMitigation}
                  onChange={(e) => setRiskMitigation(e.target.value)}
                  placeholder="Mitigation strategy & corrective actions..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                >
                  Add Risk to Register
                </button>
              </div>
            </div>
          </form>

          {/* Risks Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-4">Risk Description</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Mitigation Plan</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {ob.risks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No risks logged for this transition.
                      </td>
                    </tr>
                  ) : (
                    ob.risks.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-xs">{r.d}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.sev === 'Critical'
                                ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300'
                                : r.sev === 'High'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            }`}
                          >
                            {r.sev}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-sm">{r.m}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.o}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{r.s}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteRiskFromOnboarding(ob.id, idx)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Docs Sub-tab */}
      {activeSubTab === 'docs' && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddDoc}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3"
          >
            <input
              type="text"
              required
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Artifact name (e.g. SOP v1.0, Discovery Signoff, Parallel Variance Report)..."
              className="flex-1 w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shrink-0"
            >
              Upload Artifact Reference
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ob.docs.map((d, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold font-mono text-xs">
                    {d.t}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{d.n}</div>
                    <div className="text-[10px] text-slate-400">{d.s} • Status: {d.st}</div>
                  </div>
                </div>
                <button
                  onClick={() => deleteDocFromOnboarding(ob.id, idx)}
                  className="p-1 rounded text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TOM & RACI Sub-tab */}
      {activeSubTab === 'tom' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Target Operating Model (TOM) & Global Delivery Structure
          </h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            The target operating model assigns specific responsibility tiers between client leadership and Trivium onshore/nearshore service delivery squads.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Process Domain</th>
                  <th className="py-2.5 px-3">Client Role</th>
                  <th className="py-2.5 px-3">Trivium Lead</th>
                  <th className="py-2.5 px-3">RACI Code</th>
                  <th className="py-2.5 px-3">Automation Tool</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">Accounts Payable (AP)</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">Invoice Approval ($5k+)</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">AP Specialist (S. Iyer)</td>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600">A / R</td>
                  <td className="py-3 px-3 text-slate-500">OCR + 3-Way Match</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">Accounts Receivable (AR)</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">Contract Sign-off</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">AR Specialist (S. Iyer)</td>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600">R / C</td>
                  <td className="py-3 px-3 text-slate-500">Auto-dunning sequence</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">General Ledger & Close</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">Final TB Sign-off</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">GL Lead (R. Kumar)</td>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600">A / R</td>
                  <td className="py-3 px-3 text-slate-500">3-Day close checklist bot</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">US Federal & State Tax</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">Officer Signature</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">Tax Lead (A. Fernandez)</td>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600">A / R</td>
                  <td className="py-3 px-3 text-slate-500">Compliance Calendar tracker</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Cutover Sub-tab */}
      {activeSubTab === 'cutover' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Phase 4: Go / No-Go Cutover Readiness Scorecard
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Executive steering criteria must all be satisfied before granting production cutover authorization.
          </p>

          <div className="space-y-3">
            {[
              { label: 'Parallel Run Cycle 2 variance < 0.1% of GL balance', status: 'Passed', met: true },
              { label: 'SOP library v1.0 executed and signed by Process SME', status: 'Passed', met: true },
              { label: 'Production bank feed tokens and ERP access credentials active', status: 'Passed', met: true },
              { label: 'Approval hierarchy and delegation-of-authority mapped', status: 'Passed', met: true },
              { label: 'No unresolved Critical or High severity transition risks', status: 'In Review', met: false }
            ].map((gate, gIdx) => (
              <div
                key={gIdx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      gate.met
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {gate.met ? '✓' : '!'}
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{gate.label}</span>
                </div>
                <span
                  className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                    gate.met
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {gate.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
