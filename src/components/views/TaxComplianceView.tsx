import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { ENTITY_MASTER } from '../../data/entityMaster.ts';
import {
  Scale,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';

export const TaxComplianceView: React.FC = () => {
  const { taxCalendar, updateTaxEvent, toast } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = taxCalendar.filter((t) => {
    const formName = t.f || t.n || '';
    const entityCode = t.entityCode || 'DLC';
    const clientName = t.co || '';
    const matchesSearch =
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entityCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === 'All' ||
      t.st === statusFilter ||
      (statusFilter === 'Pending' && (t.st === 'Pending' || t.st === 'In Preparation' || t.st === 'Data Collection' || t.st === 'Blocked')) ||
      (statusFilter === 'Drafting' && (t.st === 'Drafting' || t.st === 'Not Started')) ||
      (statusFilter === 'Filed' && (t.st === 'Filed' || t.st === 'Delivered' || t.st === 'Executed'));

    return matchesSearch && matchesStatus;
  });

  const dueSoon = taxCalendar.filter((t) => t.st !== 'Filed' && t.st !== 'Delivered' && t.st !== 'Executed');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">US Corporate Tax & Compliance Governance</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-entity statutory filing calendar, state economic nexus monitoring, FinCEN BOI filings, and Form 1120 / 1065 / 5472 schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {dueSoon.length} Filings Pending
          </span>
        </div>
      </div>

      {/* Tax Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Federal Returns (IRS)</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">Forms 1120, 1120-S, 1065, 5472</div>
          <div className="text-[10px] text-slate-500">Auto-mapped by entity type</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">State Franchise & Income</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">DE, CA, NY, TX, FL Nexus</div>
          <div className="text-[10px] text-slate-500">Delaware March 1 & June 1 deadlines</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Corporate Transparency (FinCEN)</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">BOI Reporting (CTA)</div>
          <div className="text-[10px] text-emerald-600 font-medium">100% Portfolio Audited</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tax form, client, entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['All', 'Filed', 'Drafting', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tax Filings Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Client Organization</th>
                <th className="py-3 px-4">Entity Structure</th>
                <th className="py-3 px-4">Tax Return / Form</th>
                <th className="py-3 px-4">Statutory Due Date</th>
                <th className="py-3 px-4">Tax Owner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{t.co}</td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                      {t.entityCode || 'DLC'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{t.f || t.n}</div>
                    <div className="text-[10px] text-slate-400">{t.type} IRS / State Compliance</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">{t.due || t.d}</td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{t.o}</td>

                  <td className="py-3.5 px-4">
                    <select
                      value={t.st}
                      onChange={(e) => updateTaxEvent(t.id, { st: e.target.value as any })}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold focus:outline-hidden ${
                        t.st === 'Filed' || t.st === 'Executed' || t.st === 'Delivered'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : t.st === 'Drafting' || t.st === 'In Preparation'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Preparation">In Preparation</option>
                      <option value="Data Collection">Data Collection</option>
                      <option value="Drafting">Drafting</option>
                      <option value="Pending">Pending</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Filed">Filed</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        updateTaxEvent(t.id, { st: 'Filed' });
                        toast(`Marked ${t.f || t.n} as Filed for ${t.co}`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold"
                    >
                      Mark Filed
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
