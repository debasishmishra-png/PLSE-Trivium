import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { ENTITY_MASTER } from '../../data/entityMaster.ts';
import { PHASES, getOnboardingProgress, getOnboardingCurrentPhase } from '../../data/transitionPhases.ts';
import {
  Users,
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Download,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Account, Lead, Contact } from '../../types/index.ts';

interface CrmViewProps {
  onOpenNewAccount: () => void;
}

const LEAD_STAGES: Lead['stage'][] = ['New', 'Contacted', 'Discovery', 'Qualified', 'Proposal Sent'];

export const CrmView: React.FC<CrmViewProps> = ({ onOpenNewAccount }) => {
  const {
    accounts,
    contacts,
    leads,
    onboardings,
    issues,
    workstreams,
    navigate,
    deleteAccount,
    deleteContact,
    updateLead,
    addLead,
    toast
  } = useData();

  const [activeTab, setActiveTab] = useState<'accounts' | 'contacts' | 'pipeline'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // New Lead Modal
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [newLeadCo, setNewLeadCo] = useState('');
  const [newLeadInd, setNewLeadInd] = useState('Technology / SaaS');
  const [newLeadVal, setNewLeadVal] = useState(150000);
  const [newLeadSrc, setNewLeadSrc] = useState('Referral');
  const [newLeadOwner, setNewLeadOwner] = useState('Priya Nair');

  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ind.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.entity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'All' || a.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const totalArr = accounts.reduce((acc, a) => acc + a.arr, 0);
  const totalPipeline = leads.reduce((acc, l) => acc + l.val, 0);

  const exportAccountsCsv = () => {
    const headers = ['Account ID', 'Name', 'Entity', 'Industry', 'HQ', 'ARR', 'Health Score', 'Stage', 'CSM Lead', 'Services'];
    const rows = accounts.map((a) => [
      a.id,
      `"${a.name}"`,
      a.entity,
      `"${a.ind}"`,
      `"${a.hq}"`,
      a.arr,
      a.health,
      a.stage,
      `"${a.csm}"`,
      `"${a.svc.join(', ')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `trivium-accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadAnchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Accounts directory exported to CSV');
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadCo.trim()) return;
    addLead({
      co: newLeadCo.trim(),
      ind: newLeadInd,
      val: Number(newLeadVal),
      src: newLeadSrc,
      stage: 'New',
      owner: newLeadOwner,
      next: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
    });
    setNewLeadCo('');
    setIsAddLeadOpen(false);
    toast(`Lead <b>${newLeadCo.trim()}</b> added to pipeline`);
  };

  const advanceLeadStage = (leadId: string, currentStage: Lead['stage']) => {
    const idx = LEAD_STAGES.indexOf(currentStage);
    if (idx < LEAD_STAGES.length - 1) {
      const nextStage = LEAD_STAGES[idx + 1];
      updateLead(leadId, { stage: nextStage });
      toast(`Lead updated to <b>${nextStage}</b>`);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Client Portfolio & CRM</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage client accounts, executive stakeholders, contracted service scopes, and active prospect pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'accounts'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Accounts ({accounts.length})
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'contacts'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Key Contacts ({contacts.length})
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pipeline Leads ({leads.length})
            </button>
          </div>

          <button
            onClick={exportAccountsCsv}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {activeTab === 'pipeline' ? (
            <button
              onClick={() => setIsAddLeadOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Lead
            </button>
          ) : (
            <button
              onClick={onOpenNewAccount}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Account
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400">Total Portfolio ARR</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
            ${(totalArr / 1e3).toFixed(0)}k/yr
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Across {accounts.length} active corporate clients
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400">Open Deal Pipeline</div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
            ${(totalPipeline / 1e3).toFixed(0)}k
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {leads.length} leads in active qualification
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400">Average Account Health</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
            {Math.round(accounts.reduce((acc, a) => acc + a.health, 0) / (accounts.length || 1))}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            94% SLA compliance rate portfolio-wide
          </div>
        </div>
      </div>

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search account name, sector, entity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {['All', 'Steady State', 'Hypercare', 'Onboarding', 'At Risk'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStageFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    stageFilter === st
                      ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-4">Client Organization</th>
                    <th className="py-3 px-4">US Entity Structure</th>
                    <th className="py-3 px-4">Contract ARR</th>
                    <th className="py-3 px-4">Delivery Scope</th>
                    <th className="py-3 px-4">Account Health</th>
                    <th className="py-3 px-4">Lifecycle Stage</th>
                    <th className="py-3 px-4">CSM Lead</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredAccounts.map((a) => {
                    const entityDef = ENTITY_MASTER[a.entity];
                    return (
                      <tr
                        key={a.id}
                        onClick={() => setSelectedAccount(a)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white text-xs hover:text-indigo-600 transition-colors">
                            {a.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{a.id} • {a.ind} • {a.hq}</div>
                        </td>

                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <span
                            onClick={() => navigate('entityDetail', { code: a.entity })}
                            className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            title={entityDef?.name || a.entity}
                          >
                            {a.entity}
                          </span>
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{entityDef?.name}</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                          ${(a.arr / 1e3).toFixed(0)}k/yr
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {a.svc.map((s) => (
                              <span
                                key={s}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  a.health >= 85
                                    ? 'bg-emerald-500'
                                    : a.health >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${a.health}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-bold">{a.health}%</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              a.stage === 'Steady State'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : a.stage === 'Hypercare'
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                                : a.stage === 'Onboarding'
                                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                                : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                            }`}
                          >
                            {a.stage}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{a.csm}</td>

                        <td className="py-3.5 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedAccount(a)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete account ${a.name}?`)) {
                                deleteAccount(a.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{c.role}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{c.acct}</div>
                </div>
                <div className="flex items-center gap-1">
                  {c.primary && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      Primary Sponsor
                    </span>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Delete contact ${c.name}?`)) {
                        deleteContact(c.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-600 transition-opacity"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${c.email}`} className="font-mono text-[11px] hover:underline truncate">
                    {c.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-[11px]">{c.ph}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('comms')}
                className="w-full mt-2 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold transition-colors text-center"
              >
                Open Communications Thread
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pipeline Leads Tab with Interactive Kanban */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
            {LEAD_STAGES.map((st) => {
              const stageLeads = leads.filter((l) => l.stage === st);
              const stageVal = stageLeads.reduce((acc, l) => acc + l.val, 0);
              return (
                <div
                  key={st}
                  className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-2.5 min-w-[220px]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{st}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono font-medium">
                    ${(stageVal / 1e3).toFixed(0)}k total
                  </div>

                  <div className="space-y-2 flex-1">
                    {stageLeads.map((l) => (
                      <div
                        key={l.id}
                        className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2"
                      >
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{l.co}</div>
                        <div className="text-[10px] text-slate-400">{l.ind} • Source: {l.src}</div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ${(l.val / 1e3).toFixed(0)}k
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{l.owner}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 gap-1">
                          <button
                            onClick={() => advanceLeadStage(l.id, l.stage)}
                            className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[10px] font-semibold w-full text-center"
                          >
                            Advance Stage →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Account 360° Detail Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setSelectedAccount(null)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10 max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedAccount.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedAccount.name}
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                      {selectedAccount.id}
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedAccount.ind} • {selectedAccount.hq} • Client Since {selectedAccount.since}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAccount(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* 4 Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Contracted ARR</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    ${(selectedAccount.arr / 1e3).toFixed(0)}k
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Health Score</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {selectedAccount.health}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">US Entity Form</div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    {selectedAccount.entity}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Lifecycle Stage</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {selectedAccount.stage}
                  </div>
                </div>
              </div>

              {/* Entity Profile Details */}
              {ENTITY_MASTER[selectedAccount.entity] && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 space-y-2">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                    <span>US Entity Architecture: {ENTITY_MASTER[selectedAccount.entity].name}</span>
                    <button
                      onClick={() => {
                        setSelectedAccount(null);
                        navigate('entityDetail', { code: selectedAccount.entity });
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Full Entity Profile <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {ENTITY_MASTER[selectedAccount.entity].desc}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>Default Tax: <b>{ENTITY_MASTER[selectedAccount.entity].taxDefault}</b></div>
                    <div>Federal Return: <b>{ENTITY_MASTER[selectedAccount.entity].federalForm}</b></div>
                    <div>Filing Deadline: <b>{ENTITY_MASTER[selectedAccount.entity].filingDeadline}</b></div>
                    <div>Liability: <b>{ENTITY_MASTER[selectedAccount.entity].liability}</b></div>
                  </div>
                </div>
              )}

              {/* Services In Scope */}
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mb-2">Contracted F&A Services</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAccount.svc.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Transition Workspace */}
              {(() => {
                const ob = onboardings.find((o) => o.acct === selectedAccount.name);
                if (!ob) return null;
                const prog = getOnboardingProgress(ob);
                const currentPhase = getOnboardingCurrentPhase(ob);
                return (
                  <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                        Active 7-Phase Transition: {ob.id}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAccount(null);
                          navigate('onboardingDetail', { id: ob.id });
                        }}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        Open Transition Workspace <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Phase {currentPhase}: <b>{PHASES[currentPhase]?.name}</b> • Target Go-Live: <b>{ob.golive}</b>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${prog}%` }} />
                      </div>
                      <span className="font-mono font-bold text-xs">{prog}%</span>
                    </div>
                  </div>
                );
              })()}

              {/* Workstream SLAs */}
              {(() => {
                const clientWs = workstreams.filter((w) => w.co === selectedAccount.name);
                if (clientWs.length === 0) return null;
                return (
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white mb-2">Workstream SLA Metrics</div>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-semibold text-slate-400">
                          <tr>
                            <th className="py-2 px-3">Workstream</th>
                            <th className="py-2 px-3">Volume</th>
                            <th className="py-2 px-3">SLA</th>
                            <th className="py-2 px-3">Automation</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {clientWs.map((w) => (
                            <tr key={w.id}>
                              <td className="py-2 px-3 font-semibold">{w.ws}</td>
                              <td className="py-2 px-3 text-slate-500">{w.vol}</td>
                              <td className="py-2 px-3 font-mono font-bold text-emerald-600">{w.sla}%</td>
                              <td className="py-2 px-3 text-slate-500">{w.auto}</td>
                              <td className="py-2 px-3">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                  {w.st}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Open Issues */}
              {(() => {
                const clientIssues = issues.filter((i) => i.co === selectedAccount.name && i.st !== 'Resolved');
                if (clientIssues.length === 0) return null;
                return (
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white mb-2">Open Issues & Bottlenecks</div>
                    <div className="space-y-1.5">
                      {clientIssues.map((i) => (
                        <div
                          key={i.id}
                          className="p-2.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white">{i.t}</div>
                            <div className="text-[10px] text-slate-500">{i.id} • SLA: {i.sla}</div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                            {i.sev}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/60">
              <button
                onClick={() => setSelectedAccount(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-600 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedAccount(null);
                  navigate('comms');
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-xs"
              >
                Open Communications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsAddLeadOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Pipeline Lead</h3>
              <button onClick={() => setIsAddLeadOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Health Technologies"
                  value={newLeadCo}
                  onChange={(e) => setNewLeadCo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Estimated Deal ARR ($)</label>
                  <input
                    type="number"
                    value={newLeadVal}
                    onChange={(e) => setNewLeadVal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Industry</label>
                  <input
                    type="text"
                    value={newLeadInd}
                    onChange={(e) => setNewLeadInd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Source</label>
                  <select
                    value={newLeadSrc}
                    onChange={(e) => setNewLeadSrc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option>Referral</option>
                    <option>Inbound RFI</option>
                    <option>Conference</option>
                    <option>Outbound</option>
                    <option>Partner</option>
                    <option>RFP Portal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Owner</label>
                  <select
                    value={newLeadOwner}
                    onChange={(e) => setNewLeadOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option>Priya Nair</option>
                    <option>Marcus Bell</option>
                    <option>Dana Whitfield</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
