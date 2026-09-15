import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import {
  AlertTriangle,
  Plus,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Brain,
  Download,
  ShieldAlert,
  HelpCircle,
  FileText,
  LayoutGrid,
  List,
  X
} from 'lucide-react';
import { Issue } from '../../types/index.ts';

interface IssuesViewProps {
  onOpenNewIssue: () => void;
}

const ISSUE_STAGES: Issue['st'][] = [
  'New',
  'Triaged',
  'In Progress',
  'Client Pending',
  'Blocked',
  'Resolved'
];

export const IssuesView: React.FC<IssuesViewProps> = ({ onOpenNewIssue }) => {
  const { issues, updateIssue, deleteIssue, resolveIssue, toast } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sevFilter, setSevFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [activeIssueDetail, setActiveIssueDetail] = useState<Issue | null>(null);
  const [rcaLoading, setRcaLoading] = useState(false);
  const [generatedRca, setGeneratedRca] = useState('');

  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      i.t.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.co.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = sevFilter === 'All' || i.sev === sevFilter;
    const matchesStatus = statusFilter === 'All' || i.st === statusFilter;
    return matchesSearch && matchesSev && matchesStatus;
  });

  const handleRunRca = async (issue: Issue) => {
    setGeneratedRca(issue.rca || '');
    if (!issue.rca) {
      setRcaLoading(true);
      try {
        const res = await fetch('/api/gemini/rca', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            issueTitle: issue.t,
            client: issue.co,
            severity: issue.sev,
            category: issue.cat
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate RCA');
        setGeneratedRca(data.text);
        updateIssue(issue.id, { rca: data.text });
        if (activeIssueDetail && activeIssueDetail.id === issue.id) {
          setActiveIssueDetail({ ...activeIssueDetail, rca: data.text });
        }
        toast('AI Root Cause Analysis & CAPA generated');
      } catch (err: any) {
        toast(`RCA Error: ${err.message}`);
      } finally {
        setRcaLoading(false);
      }
    }
  };

  const exportIssuesCsv = () => {
    const headers = ['ID', 'Issue Title', 'Client', 'Severity', 'Category', 'Owner', 'Status', 'SLA Target', 'RCA Generated'];
    const rows = filteredIssues.map((i) => [
      i.id,
      `"${i.t.replace(/"/g, '""')}"`,
      `"${i.co}"`,
      i.sev,
      i.cat,
      `"${i.o}"`,
      i.st,
      i.sla,
      i.rca ? 'Yes' : 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trivium-issues-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Issues exported to CSV');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Issues, Escalations & Bottlenecks</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Triage operational exceptions, SLA breaches, bank recon breaks, and automate 5-Whys Root Cause Analysis (RCA) with Gemini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
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
            onClick={exportIssuesCsv}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={onOpenNewIssue}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Exception
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400">Total Open Issues</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            {issues.filter((i) => i.st !== 'Resolved').length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400">Critical / Escalated</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">
            {issues.filter((i) => i.sev === 'Critical' && i.st !== 'Resolved').length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400">AI RCAs Completed</div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {issues.filter((i) => !i.rca).length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400">Avg Resolution Time</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            18.4 Hours
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search issue title, client, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {/* Severity filter */}
          <select
            value={sevFilter}
            onChange={(e) => setSevFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            {ISSUE_STAGES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {ISSUE_STAGES.map((stage) => {
            const stageIssues = filteredIssues.filter((i) => i.st === stage);
            return (
              <div
                key={stage}
                className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-2.5 min-w-[210px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{stage}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs">
                    {stageIssues.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[550px]">
                  {stageIssues.map((i) => (
                    <div
                      key={i.id}
                      onClick={() => {
                        setActiveIssueDetail(i);
                        setGeneratedRca(i.rca || '');
                      }}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-red-400 cursor-pointer space-y-2 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            i.sev === 'Critical'
                              ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300'
                              : i.sev === 'High'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {i.sev}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400">{i.id}</span>
                      </div>

                      <div className="font-bold text-slate-900 dark:text-white text-xs">{i.t}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">{i.co}</div>

                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100 dark:border-slate-800 text-slate-400">
                        <span>SLA: {i.sla}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{i.o}</span>
                      </div>

                      {i.rca && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>RCA Attached</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Issues Table */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4">Client Account</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Target SLA</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredIssues.map((i) => (
                  <tr
                    key={i.id}
                    onClick={() => {
                      setActiveIssueDetail(i);
                      setGeneratedRca(i.rca || '');
                    }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-xs hover:text-red-600 transition-colors">
                        {i.t}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{i.id}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {i.co}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          i.sev === 'Critical'
                            ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300'
                            : i.sev === 'High'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {i.sev}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {i.cat}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{i.sla}</td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{i.o}</td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={i.st}
                        onChange={(e) => updateIssue(i.id, { st: e.target.value as any })}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border-0 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                      >
                        {ISSUE_STAGES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      {/* Gemini 5-Whys RCA */}
                      <button
                        onClick={() => {
                          setActiveIssueDetail(i);
                          handleRunRca(i);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 inline-flex items-center gap-1 transition-colors"
                        title="Run 5-Whys Root Cause Analysis with Gemini AI"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        <span>{i.rca ? 'View RCA' : 'AI RCA'}</span>
                      </button>

                      {i.st !== 'Resolved' && (
                        <button
                          onClick={() => resolveIssue(i.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                          title="Mark Resolved"
                        >
                          Resolve
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`Delete issue ${i.id}?`)) {
                            deleteIssue(i.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        title="Delete Issue"
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

      {/* Issue Detail & RCA Modal */}
      {activeIssueDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setActiveIssueDetail(null)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10 max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {activeIssueDetail.t}
                    <span className="text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono">
                      {activeIssueDetail.id}
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Client: {activeIssueDetail.co} • Owner: {activeIssueDetail.o} • SLA: {activeIssueDetail.sla}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveIssueDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Quick Status Pill Controls */}
              <div>
                <label className="block text-slate-500 font-semibold mb-2">Update Issue Lifecycle Status:</label>
                <div className="flex flex-wrap gap-1.5">
                  {ISSUE_STAGES.map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        updateIssue(activeIssueDetail.id, { st });
                        setActiveIssueDetail({ ...activeIssueDetail, st });
                        toast(`Issue status updated to <b>${st}</b>`);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                        activeIssueDetail.st === st
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {activeIssueDetail.st === st && '✓ '}
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity & Category Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Severity</div>
                  <div className="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5">
                    {activeIssueDetail.sev}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Category</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {activeIssueDetail.cat}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Target SLA</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {activeIssueDetail.sla}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Assignee</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeIssueDetail.o}
                  </div>
                </div>
              </div>

              {/* 5-Whys RCA Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Gemini 5-Whys Root Cause Analysis (RCA) & CAPA</span>
                  </div>
                  <button
                    onClick={() => handleRunRca(activeIssueDetail)}
                    disabled={rcaLoading}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {rcaLoading ? 'Analyzing...' : activeIssueDetail.rca ? 'Re-run RCA' : 'Run 5-Whys RCA'}
                  </button>
                </div>

                {rcaLoading && (
                  <div className="p-6 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                      Formulating 5-Whys Root Cause & Corrective Actions...
                    </div>
                  </div>
                )}

                {generatedRca && !rcaLoading && (
                  <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 text-slate-700 dark:text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {generatedRca}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/60">
              <button
                onClick={() => setActiveIssueDetail(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-600 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
