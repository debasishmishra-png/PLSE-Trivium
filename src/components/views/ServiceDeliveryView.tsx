import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
  Layers,
  ArrowRight,
  Filter,
  DollarSign,
  FileCheck2,
  Calendar,
  ShieldCheck
} from 'lucide-react';

export const ServiceDeliveryView: React.FC = () => {
  const { workstreams, updateWorkstream, toast } = useData();
  const [activeTab, setActiveTab] = useState<string>('All');

  const categories = ['All', 'AP', 'AR', 'GL', 'Payroll', 'Tax', 'CFO', 'Audit'];

  const filtered = workstreams.filter((ws) => {
    if (activeTab === 'All') return true;
    return ws.ws.includes(activeTab) || (activeTab === 'GL' && ws.ws.includes('GL'));
  });

  const avgSla = Math.round(
    workstreams.reduce((acc, ws) => acc + ws.sla, 0) / (workstreams.length || 1)
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">F&A Service Delivery Functions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time monitoring of live outsourced accounting, accounts payable, accounts receivable, month-end close, tax, and CFO deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Portfolio Avg SLA: {avgSla}%
          </span>
        </div>
      </div>

      {/* Function Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Accounts Payable (AP)</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">99.4% SLA</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            3-Way Match & OCR active
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Accounts Receivable (AR)</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">94.2% SLA</div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            DSO: 36 days (target &lt; 40)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Month-End Close (GL)</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">3.8 Days</div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
            Standard Fast-Close cycle
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Fractional CFO & Advisory</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">100% On-Time</div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
            Board decks & runway models
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === cat
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {cat} Functions
          </button>
        ))}
      </div>

      {/* Workstreams Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Client & Domain</th>
                <th className="py-3 px-4">Workstream Scope</th>
                <th className="py-3 px-4">Processed Volume</th>
                <th className="py-3 px-4">Automation Tier</th>
                <th className="py-3 px-4">SLA Compliance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.map((ws) => (
                <tr key={ws.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{ws.co}</div>
                    <div className="text-[10px] font-mono text-slate-400">{ws.id}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{ws.ws}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{ws.vol}</td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {ws.auto}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            ws.sla >= 95 ? 'bg-emerald-500' : ws.sla >= 85 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${ws.sla}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[11px]">{ws.sla}%</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ws.st === 'Healthy'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : ws.st === 'Watch'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {ws.st}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        updateWorkstream(ws.id, { st: ws.st === 'Healthy' ? 'Watch' : 'Healthy' });
                        toast(`Toggled status for ${ws.co}`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Toggle Flag
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
