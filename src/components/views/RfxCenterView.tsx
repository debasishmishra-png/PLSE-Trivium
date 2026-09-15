import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import {
  FileCheck2,
  Plus,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Trash2,
  LayoutGrid,
  List,
  X,
  Layers,
  Award,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Rfx } from '../../types/index.ts';

interface RfxCenterViewProps {
  onOpenNewRfx: () => void;
  onOpenRfxDraft: (rfxId: string) => void;
}

const STAGES: Rfx['stage'][] = [
  'Intake',
  'Qualification',
  'Go / No-Go',
  'Drafting',
  'Internal Review',
  'Submitted',
  'Awarded',
  'Lost'
];

export const RfxCenterView: React.FC<RfxCenterViewProps> = ({ onOpenNewRfx, onOpenRfxDraft }) => {
  const { rfxs, advanceRfxStage, deleteRfx, updateRfx, toast } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | 'RFI' | 'RFP' | 'RFQ'>('All');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedRfx, setSelectedRfx] = useState<Rfx | null>(null);

  const filteredRfxs = rfxs.filter((r) => {
    const matchesSearch =
      r.co.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.scope.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalValue = filteredRfxs.reduce((acc, r) => acc + r.val, 0);

  const exportRfxCsv = () => {
    const headers = ['ID', 'Company', 'Type', 'Target Value', 'Due Date', 'Stage', 'Owner', 'Fit Score', 'Scope'];
    const rows = filteredRfxs.map((r) => [
      r.id,
      `"${r.co}"`,
      r.type,
      r.val,
      r.due,
      r.stage,
      `"${r.owner}"`,
      r.score,
      `"${r.scope.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trivium-rfx-pipeline-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('RFx pipeline exported to CSV');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">RFx Solution Center (RFI / RFP / RFQ)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lifecycle bid management, fit scoring, Target Operating Model (TOM) proposal generation powered by Gemini AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Register Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={exportRfxCsv}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={onOpenNewRfx}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New RFx Opportunity
          </button>
        </div>
      </div>

      {/* Filter & Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Total Bids Tracked</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{filteredRfxs.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Pipeline Deal Value</div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            ${(totalValue / 1e3).toFixed(0)}k
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Awarded Win Rate</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {Math.round(
              (rfxs.filter((r) => r.stage === 'Awarded').length /
                (rfxs.filter((r) => r.stage === 'Awarded' || r.stage === 'Lost').length || 1)) *
                100
            )}
            %
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Avg Solution Fit Score</div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
            {Math.round(rfxs.reduce((acc, r) => acc + r.score, 0) / (rfxs.length || 1))}/100
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search RFx ID, client, scope..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['All', 'RFP', 'RFI', 'RFQ'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedType === t
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3.5 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageRfxs = filteredRfxs.filter((r) => r.stage === stage);
            const stageVal = stageRfxs.reduce((acc, r) => acc + r.val, 0);
            return (
              <div
                key={stage}
                className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-2.5 min-w-[240px] max-w-[260px] shrink-0"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{stage}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs">
                    {stageRfxs.length}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono font-medium">
                  ${(stageVal / 1e3).toFixed(0)}k pipeline
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[520px]">
                  {stageRfxs.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRfx(r)}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-indigo-400 cursor-pointer space-y-2 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`font-bold font-mono text-[9px] px-1.5 py-0.5 rounded ${
                            r.type === 'RFP'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                              : r.type === 'RFI'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {r.type} • {r.id}
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                          ${(r.val / 1e3).toFixed(0)}k
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 dark:text-white text-xs">{r.co}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{r.scope}</div>

                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100 dark:border-slate-800 text-slate-400">
                        <span>Due: {r.due}</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          <span>Fit: {r.score}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenRfxDraft(r.id)}
                          className="flex-1 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[10px] font-semibold flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          {r.proposalDraft ? 'View Proposal' : 'AI Draft'}
                        </button>
                        {stage !== 'Awarded' && stage !== 'Lost' && (
                          <button
                            onClick={() => advanceRfxStage(r.id)}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                            title="Advance to next stage"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Register Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">RFx Identifier & Client</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Target ARR Value</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Fit Score</th>
                  <th className="py-3 px-4">Lifecycle Stage</th>
                  <th className="py-3 px-4">Lead Architect</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredRfxs.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRfx(r)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-xs hover:text-indigo-600 transition-colors">
                        {r.co}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.id}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm mt-0.5">
                        {r.scope}
                      </div>
                    </td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <span
                        className={`font-bold font-mono text-[10px] px-2 py-0.5 rounded ${
                          r.type === 'RFP'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : r.type === 'RFI'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {r.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      ${(r.val / 1e3).toFixed(0)}k
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{r.due}</td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              r.score >= 80 ? 'bg-emerald-500' : r.score >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${r.score}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold">{r.score}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={r.stage}
                        onChange={(e) => updateRfx(r.id, { stage: e.target.value as any })}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border-0 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{r.owner}</td>

                    <td className="py-3.5 px-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* Gemini AI Proposal Draft Button */}
                      <button
                        onClick={() => onOpenRfxDraft(r.id)}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 text-indigo-700 dark:text-indigo-300 font-semibold transition-all inline-flex items-center gap-1"
                        title="Generate Executive Proposal Draft"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        <span>{r.proposalDraft ? 'View Draft' : 'AI Proposal'}</span>
                      </button>

                      {/* Advance Stage button */}
                      <button
                        onClick={() => advanceRfxStage(r.id)}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors"
                        title="Advance to next lifecycle stage"
                      >
                        →
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm(`Delete RFx opportunity ${r.id}?`)) {
                            deleteRfx(r.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        title="Delete RFx"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RFx Detail & Solution Response Builder Modal */}
      {selectedRfx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setSelectedRfx(null)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10 max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedRfx.type}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedRfx.co}
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono">
                      {selectedRfx.id}
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Target Deal ARR: ${(selectedRfx.val / 1e3).toFixed(0)}k • Due: {selectedRfx.due} • Architect: {selectedRfx.owner}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRfx(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Proposal Status & Stage bar */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Proposal Stage</div>
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {selectedRfx.stage}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold text-right">Solution Fit Score</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 text-right font-mono">
                      {selectedRfx.score}/100
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-8 gap-1 pt-1">
                  {STAGES.map((s, idx) => {
                    const currentIdx = STAGES.indexOf(selectedRfx.stage);
                    const isDone = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={s} className="space-y-1 text-center">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isDone
                              ? 'bg-emerald-500'
                              : isCurrent
                              ? 'bg-indigo-600'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                        <div className="text-[9px] font-medium text-slate-400 truncate">{s}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RFP Scope */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs text-slate-900 dark:text-white">RFP Scope of Work & Requirements</div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedRfx.scope}
                </div>
              </div>

              {/* Solution Response Blueprint Sections */}
              <div className="space-y-2.5">
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                  <span>RFx Proposal Response Sections</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">8/8 Ready</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { title: '1. Executive Summary & Value Proposition', status: 'Drafted' },
                    { title: '2. Company Background & Credentials', status: 'Approved' },
                    { title: '3. Scope of Services (AP, AR, GL, Tax)', status: 'Approved' },
                    { title: '4. Target Operating Model (TOM) & RACI', status: 'Approved' },
                    { title: '5. 7-Phase Transition Methodology', status: 'Approved' },
                    { title: '6. Technology Stack & Integration', status: 'Approved' },
                    { title: '7. Pricing, FTE Model & Unit Rates', status: 'Review' },
                    { title: '8. Governance, SLAs & KPIs', status: 'Approved' }
                  ].map((sec) => (
                    <div
                      key={sec.title}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{sec.title}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                        {sec.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Draft preview if available */}
              {selectedRfx.proposalDraft && (
                <div className="space-y-2">
                  <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini AI Generated Executive Proposal Draft</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 text-slate-700 dark:text-slate-300 font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedRfx.proposalDraft}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60">
              <button
                onClick={() => {
                  advanceRfxStage(selectedRfx.id);
                  setSelectedRfx(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Advance Stage ({selectedRfx.stage} → Next)
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = selectedRfx.id;
                    setSelectedRfx(null);
                    onOpenRfxDraft(id);
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Open AI Proposal Builder
                </button>
                <button
                  onClick={() => setSelectedRfx(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-600 dark:text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
