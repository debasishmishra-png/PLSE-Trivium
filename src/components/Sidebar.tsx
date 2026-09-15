import React from 'react';
import { useData } from '../context/DataContext.tsx';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  GitMerge,
  Cpu,
  AlertTriangle,
  MessageSquare,
  Scale,
  FolderLock,
  Building2,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, navigate, rfxs, issues, onboardings, setIsAiDrawerOpen } = useData();

  const criticalIssuesCount = issues.filter((i) => i.st !== 'Resolved' && i.sev === 'Critical').length;
  const activeTransitionsCount = onboardings.filter((o) => o.phase < 6).length;
  const openRfxCount = rfxs.filter((r) => r.stage !== 'Awarded' && r.stage !== 'Lost').length;

  const navItems = [
    { id: 'dashboard', label: 'Executive Cockpit', icon: LayoutDashboard, section: 'Core' },
    { id: 'crm', label: 'Client CRM & Accounts', icon: Users, section: 'Core' },
    { id: 'rfx', label: 'RFx Center', icon: FileCheck2, badge: openRfxCount, section: 'Growth & Solutions' },
    { id: 'onboarding', label: 'Transition & Onboarding', icon: GitMerge, badge: activeTransitionsCount, section: 'Delivery Engine' },
    { id: 'delivery', label: 'F&A Service Delivery', icon: Cpu, section: 'Delivery Engine' },
    { id: 'issues', label: 'Issues & Bottlenecks', icon: AlertTriangle, badge: criticalIssuesCount, badgeColor: 'bg-red-500 text-white', section: 'Quality & Governance' },
    { id: 'comms', label: 'Client Communications', icon: MessageSquare, section: 'Quality & Governance' },
    { id: 'tax', label: 'US Tax & Compliance', icon: Scale, section: 'Tax & Compliance' },
    { id: 'entities', label: 'US Entity Master (16)', icon: Building2, section: 'Tax & Compliance' },
    { id: 'docs', label: 'Document Vault', icon: FolderLock, section: 'Knowledge Base' },
    { id: 'analytics', label: 'Delivery Analytics', icon: BarChart3, section: 'Executive Insights' },
    { id: 'settings', label: 'Platform Settings', icon: Settings, section: 'System' }
  ];

  // Group by sections
  const sections = Array.from(new Set(navItems.map((n) => n.section)));

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen select-none shrink-0 z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div 
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
            T
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">PLSE</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">Trivium F&A Delivery</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {sections.map((sec) => (
          <div key={sec} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {sec}
            </div>
            {navItems
              .filter((item) => item.section === sec)
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id || (item.id === 'onboarding' && activeView === 'onboardingDetail');
                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id}`}
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      {/* AI Assistant Quick Pill */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          id="btn-open-gemini-ai"
          onClick={() => setIsAiDrawerOpen(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/60 dark:border-indigo-800/40 text-left hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                Gemini Advisory
                <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-600 text-white font-mono">3.1 PRO</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">High-Thinking F&A AI</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Status Badge */}
        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>US Delivery Grid</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v2.4 Live</span>
        </div>
      </div>
    </aside>
  );
};
