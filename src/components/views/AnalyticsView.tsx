import React from 'react';
import { useData } from '../../context/DataContext.tsx';
import {
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const { accounts, workstreams, issues, rfxs } = useData();

  const totalArr = accounts.reduce((acc, a) => acc + a.arr, 0);

  const arrTrendData = [
    { month: 'Oct', arr: 520, clients: 4 },
    { month: 'Nov', arr: 610, clients: 5 },
    { month: 'Dec', arr: 740, clients: 6 },
    { month: 'Jan', arr: 890, clients: 7 },
    { month: 'Feb', arr: 1040, clients: 8 },
    { month: 'Mar', arr: 1220, clients: 9 }
  ];

  const slaData = workstreams.map((ws) => ({
    name: `${ws.co?.split(' ')?.[0] || ws.co || 'Client'} (${ws.ws})`,
    sla: ws.sla,
    target: 95
  }));

  const issueCategoryData = [
    { name: 'AP / Invoicing', value: 4, color: '#6366f1' },
    { name: 'AR / Collections', value: 2, color: '#8b5cf6' },
    { name: 'GL / Reconciliation', value: 3, color: '#ec4899' },
    { name: 'US Tax & Nexus', value: 2, color: '#f59e0b' },
    { name: 'ERP Integrations', value: 2, color: '#10b981' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delivery Performance & Revenue Analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Portfolio ARR expansion velocity, SLA compliance metrics, and operational exception distributions.
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-slate-500">
          Updated: Live Real-Time
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Current Run-Rate ARR</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            ${(totalArr / 1e3).toFixed(0)}k
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">+24.5% QoQ growth</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Average Delivery SLA</div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            97.8%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Target benchmark: 95.0%</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Avg Transition Duration</div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
            10.4 Weeks
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Across 7-Phase TOM</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Client Net Retention</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            128%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Zero churn in 12 months</div>
        </div>
      </div>

      {/* Chart 1: ARR Growth & Client Count */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Portfolio ARR Expansion Trajectory ($k)
          </h3>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">6-Month Trend</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={arrTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="arr" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: SLA Bar Chart & Issue Category Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Live Workstream SLA Compliance (%)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slaData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis domain={[80, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="sla" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Category Pie */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Exception & Bottleneck Breakdown by Domain
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueCategoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                  label
                >
                  {issueCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
