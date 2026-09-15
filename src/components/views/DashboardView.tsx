import React from 'react';
import { useData } from '../../context/DataContext.tsx';
import { PHASES, getOnboardingProgress, getPhaseStats } from '../../data/transitionPhases.ts';
import { ENTITY_MASTER } from '../../data/entityMaster.ts';
import {
  GitMerge,
  Users,
  FileCheck2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  Building2,
  Activity,
  DollarSign
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    accounts,
    onboardings,
    rfxs,
    issues,
    workstreams,
    taxCalendar,
    activities,
    navigate,
    setIsAiDrawerOpen
  } = useData();

  // Metrics
  const totalArr = accounts.reduce((acc, a) => acc + a.arr, 0);
  const activeTransitions = onboardings.filter((o) => o.phase < 6);
  const avgHealth = Math.round(
    accounts.reduce((acc, a) => acc + a.health, 0) / (accounts.length || 1)
  );
  const openIssues = issues.filter((i) => i.st !== 'Resolved');
  const criticalIssues = openIssues.filter((i) => i.sev === 'Critical');
  const pipelineValue = rfxs
    .filter((r) => r.stage !== 'Awarded' && r.stage !== 'Lost')
    .reduce((acc, r) => acc + r.val, 0);

  // Transition Funnel counts by phase
  const phaseCounts = PHASES.map((p) => {
    return {
      phase: p,
      count: onboardings.filter((o) => o.phase === p.id).length
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Solution Architect Welcome */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 text-[10px] font-bold uppercase tracking-wider border border-indigo-400/30">
              FAO Global Delivery
            </span>
            <span className="text-xs text-indigo-200">Trivium PLSE Operations</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">F&A Executive Command Center</h2>
          <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
            Overseeing <b>{accounts.length} client portfolios</b> (${(totalArr / 1e6).toFixed(2)}M ARR),{' '}
            <b>{activeTransitions.length} active onboarding transitions</b> across the 7-Phase TOM framework, and US entity compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            AI Strategy Advisor
          </button>
          <button
            onClick={() => navigate('onboarding')}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <GitMerge className="w-3.5 h-3.5" />
            Transition Engine
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active ARR */}
        <div 
          onClick={() => navigate('crm')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Portfolio ARR</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ${(totalArr / 1e3).toFixed(0)}k
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Across {accounts.length} active client accounts</span>
          </div>
        </div>

        {/* KPI 2: Active Onboardings */}
        <div 
          onClick={() => navigate('onboarding')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Transitions</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <GitMerge className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {activeTransitions.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            7-Phase methodology in flight
          </div>
        </div>

        {/* KPI 3: Open RFx Pipeline */}
        <div 
          onClick={() => navigate('rfx')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">RFx Pipeline Value</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ${(pipelineValue / 1e3).toFixed(0)}k
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            {rfxs.filter((r) => r.stage !== 'Awarded' && r.stage !== 'Lost').length} active bids & proposals
          </div>
        </div>

        {/* KPI 4: Issues / SLA Health */}
        <div 
          onClick={() => navigate('issues')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Operational Bottlenecks</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {openIssues.length}
            {criticalIssues.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300">
                {criticalIssues.length} critical
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Avg Portfolio Health: {avgHealth}%
          </div>
        </div>
      </div>

      {/* 7-Phase Transition Engine Overview */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              7-Phase F&A Transition Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live progression of client onboarding workspaces through discovery, TOM design, parallel runs, and cutover.
            </p>
          </div>
          <button
            onClick={() => navigate('onboarding')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
          >
            Manage Transitions <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Funnel Bar Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {phaseCounts.map(({ phase, count }) => {
            const hasActive = count > 0;
            return (
              <div
                key={phase.id}
                onClick={() => navigate('onboarding')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  hasActive
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">P{phase.id}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      hasActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {phase.short}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{phase.weeks}</div>
              </div>
            );
          })}
        </div>

        {/* Active Transition Cards Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Client Workspace</th>
                <th className="py-2.5 px-3">Entity Form</th>
                <th className="py-2.5 px-3">Current Phase</th>
                <th className="py-2.5 px-3">Phase Progress</th>
                <th className="py-2.5 px-3">Target Go-Live</th>
                <th className="py-2.5 px-3">Lead</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {onboardings.map((ob) => {
                const prog = getOnboardingProgress(ob);
                const currentPhase = PHASES.find((p) => p.id === ob.phase) || PHASES[0];
                return (
                  <tr
                    key={ob.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{ob.acct}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ob.id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {ob.entityCode}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        Phase {ob.phase}: {currentPhase.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{currentPhase.weeks}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${prog}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-semibold">{prog}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">{ob.golive}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{ob.owner}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate('onboardingDetail', { id: ob.id })}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-semibold transition-colors"
                      >
                        Open Workspace
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Grid: Service Delivery & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workstream Delivery Queue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Live Workstream SLA Compliance
            </h3>
            <button
              onClick={() => navigate('delivery')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            >
              View all queues →
            </button>
          </div>

          <div className="space-y-2.5">
            {workstreams.slice(0, 5).map((ws) => (
              <div
                key={ws.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {ws.co}
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {ws.ws}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Vol: {ws.vol} • Auto: {ws.auto}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-bold font-mono text-xs ${
                      ws.st === 'Breach'
                        ? 'text-red-600 dark:text-red-400'
                        : ws.st === 'Watch'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {ws.sla}% SLA
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">{ws.st}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity & Governance Stream */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Delivery Activity Timeline
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Live feed</span>
          </div>

          <div className="space-y-3">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
                  style={{ backgroundColor: act.c, color: act.i }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-slate-800 dark:text-slate-200 font-normal leading-snug"
                    dangerouslySetInnerHTML={{ __html: act.t }}
                  />
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {Math.round((Date.now() - act.d) / 60000)}m ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
