import React, { useState } from 'react';
import { useData } from '../context/DataContext.tsx';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
  User as UserIcon,
  LogOut,
  GitMerge,
  FileCheck2,
  AlertTriangle,
  Building2,
  Check
} from 'lucide-react';

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onOpenNewModal: (type: 'onboarding' | 'rfx' | 'issue' | 'account') => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenCommandPalette, onOpenNewModal }) => {
  const {
    activeView,
    viewParams,
    theme,
    toggleTheme,
    user,
    signIn,
    signOut,
    notifications,
    clearNotifications,
    setIsAiDrawerOpen,
    navigate
  } = useData();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive Cockpit', subtitle: 'Global F&A Service Delivery & Portfolio Health' },
    crm: { title: 'Client CRM & Accounts', subtitle: 'Portfolio Directory, Key Contacts & Pipeline Funnel' },
    rfx: { title: 'RFx Solution Center', subtitle: 'RFI / RFP / RFQ Pipeline & AI Proposal Engine' },
    onboarding: { title: 'Transition & Onboarding', subtitle: '7-Phase FAO Migration Engine & Control Points' },
    onboardingDetail: { title: 'Transition Workspace', subtitle: viewParams.id ? `Managing ${viewParams.id}` : 'Client Migration' },
    delivery: { title: 'F&A Service Delivery', subtitle: 'Real-time AP, AR, GL, Close & Payroll Queues' },
    issues: { title: 'Issues & Bottlenecks', subtitle: 'Operational Triage, SLA Breach Prevention & RCA' },
    comms: { title: 'Client Communications', subtitle: 'Unified Multi-Channel Message Threads & Escalations' },
    tax: { title: 'US Tax & Compliance', subtitle: 'Federal & State Deadlines, Nexus Matrix & Audit Readiness' },
    entities: { title: 'US Entity Master (16)', subtitle: 'Authoritative Regulatory & Governance Architecture' },
    entityDetail: { title: 'Entity Profile', subtitle: viewParams.code ? `Deep-Dive: ${viewParams.code}` : 'US Entity Type' },
    docs: { title: 'Document Vault', subtitle: 'Executed MSAs, SOPs, TOM Blueprints & Audit Records' },
    analytics: { title: 'Delivery Analytics', subtitle: 'Unit Economics, Margin Analysis & FTE Efficiency' },
    settings: { title: 'Platform Settings', subtitle: 'Cloud Sync, Appearance & Master Data Management' }
  };

  const current = viewTitles[activeView] || { title: 'PLSE Platform', subtitle: 'Trivium F&A' };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 z-10 select-none">
      {/* View Title */}
      <div>
        <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          {current.title}
          {activeView === 'onboardingDetail' && viewParams.id && (
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {viewParams.id}
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{current.subtitle}</p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Universal Search (⌘K) */}
        <button
          id="btn-open-cmd-palette"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Search accounts, RFx, issues, entity types...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Quick + New Action Menu */}
        <div className="relative">
          <button
            id="btn-topbar-new-action"
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Action</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {isNewMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsNewMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-40 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Actions
                </div>
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenNewModal('onboarding');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <GitMerge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="font-semibold">Launch Client Onboarding</div>
                    <div className="text-[10px] text-slate-400">7-Phase Transition workspace</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenNewModal('rfx');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <FileCheck2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="font-semibold">Create RFx / Proposal</div>
                    <div className="text-[10px] text-slate-400">Draft RFI, RFP, or RFQ with AI</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenNewModal('issue');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="font-semibold">Log Delivery Bottleneck</div>
                    <div className="text-[10px] text-slate-400">AP/AR, Recon break, SLA issue</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenNewModal('account');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="font-semibold">Register Client Account</div>
                    <div className="text-[10px] text-slate-400">Add to F&A Portfolio CRM</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* AI Drawer Trigger */}
        <button
          id="btn-topbar-gemini"
          onClick={() => setIsAiDrawerOpen(true)}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          title="Open Gemini F&A Advisory"
        >
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="btn-topbar-notifications"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-40 p-3 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Delivery Alerts</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No active alerts</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left"
                      >
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</div>
                        {n.body && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.body}</div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile / Google Sign-In */}
        <div className="relative">
          {user ? (
            <button
              id="btn-user-profile-menu"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          ) : (
            <button
              id="btn-login-google"
              onClick={signIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}

          {isUserMenuOpen && user && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsUserMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-40 p-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{user.displayName || 'Trivium User'}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Principal Architect
                  </div>
                </div>
                <div className="pt-1.5">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('settings');
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Platform Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
