import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { PHASES, getOnboardingProgress, getPhaseStats } from '../../data/transitionPhases.ts';
import { ENTITY_MASTER } from '../../data/entityMaster.ts';
import {
  GitMerge,
  Plus,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Search,
  Filter
} from 'lucide-react';

interface OnboardingViewProps {
  onOpenNewOnboarding: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onOpenNewOnboarding }) => {
  const { onboardings, navigate, deleteOnboarding } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOnboardings = onboardings.filter(
    (o) =>
      o.acct.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.entityCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transition & Onboarding Portfolio</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Standardized 7-Phase F&A Outsourcing (FAO) migration framework, target operating models, and entity compliance checklists.
          </p>
        </div>

        <button
          onClick={onOpenNewOnboarding}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Launch Client Transition
        </button>
      </div>

      {/* 7-Phase Methodology Reference Guide */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Trivium 7-Phase Transition Methodology
          </span>
          <span className="text-[11px] font-mono text-slate-400">37 Standard Quality Control Points</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {PHASES.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[10px]">
                  Phase {p.id}
                </span>
                <span className="text-[10px] text-slate-400">{p.weeks}</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">{p.short}</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search client transition, entity, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <b>{filteredOnboardings.length}</b> active workspaces
        </div>
      </div>

      {/* Transition Workspace Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOnboardings.map((ob) => {
          const prog = getOnboardingProgress(ob);
          const currentPhase = PHASES.find((p) => p.id === ob.phase) || PHASES[0];
          const openRisks = ob.risks.filter((r) => r.s !== 'Closed').length;

          return (
            <div
              key={ob.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-4 group"
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{ob.acct}</h3>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        {ob.entityCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{ob.id} • Lead: {ob.owner}</div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      ob.phase === 6
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : ob.phase === 4
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    Phase {ob.phase}: {currentPhase.short}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Overall Methodology Completion</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{prog}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${prog}%` }}
                    />
                  </div>
                </div>

                {/* Phase Stepper Pills */}
                <div className="grid grid-cols-7 gap-1 mt-3">
                  {PHASES.map((p) => {
                    const stats = getPhaseStats(ob, p.id);
                    const isDone = stats.pct === 100;
                    const isCurrent = ob.phase === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`h-1.5 rounded-full transition-colors ${
                          isDone
                            ? 'bg-emerald-500'
                            : isCurrent
                            ? 'bg-indigo-600'
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                        title={`Phase ${p.id} (${p.short}): ${stats.pct}% complete`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Card Meta & Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
                  <div>
                    Target Go-Live: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{ob.golive}</span>
                  </div>
                  {openRisks > 0 && (
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{openRisks} Open Risks</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate('onboardingDetail', { id: ob.id })}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
