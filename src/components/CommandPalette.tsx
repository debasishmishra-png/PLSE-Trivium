import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext.tsx';
import { ENTITY_MASTER } from '../data/entityMaster.ts';
import {
  Search,
  Users,
  FileCheck2,
  GitMerge,
  AlertTriangle,
  Building2,
  Scale,
  ArrowRight,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { accounts, rfxs, onboardings, issues, navigate } = useData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [
        { type: 'view', id: 'dashboard', title: 'Executive Cockpit', subtitle: 'Global portfolio health & transition status', icon: Building2 },
        { type: 'view', id: 'onboarding', title: 'Transition & Onboarding', subtitle: '7-Phase FAO Migration Engine', icon: GitMerge },
        { type: 'view', id: 'rfx', title: 'RFx Center', subtitle: 'Proposal builder & fit scoring', icon: FileCheck2 },
        { type: 'view', id: 'issues', title: 'Issues & Bottlenecks', subtitle: 'Operational triage & SLA monitoring', icon: AlertTriangle },
        { type: 'view', id: 'entities', title: 'US Entity Master (16)', subtitle: 'Tax laws, forms & compliance rules', icon: Scale },
      ];
    }

    const q = query.toLowerCase();
    const items: Array<{ type: string; id: string; title: string; subtitle: string; icon: any; action: () => void }> = [];

    // Accounts
    accounts.filter((a) => a.name.toLowerCase().includes(q) || a.entity.toLowerCase().includes(q) || a.ind.toLowerCase().includes(q)).forEach((a) => {
      items.push({
        type: 'account',
        id: a.id,
        title: a.name,
        subtitle: `Account • ${a.entity} • ARR $${a.arr.toLocaleString()} • ${a.stage}`,
        icon: Users,
        action: () => {
          navigate('crm', { id: a.id });
          onClose();
        }
      });
    });

    // Onboardings
    onboardings.filter((o) => o.acct.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.entityCode.toLowerCase().includes(q)).forEach((o) => {
      items.push({
        type: 'onboarding',
        id: o.id,
        title: `${o.acct} Transition`,
        subtitle: `Workspace ${o.id} • ${o.entityCode} • Phase ${o.phase}`,
        icon: GitMerge,
        action: () => {
          navigate('onboardingDetail', { id: o.id });
          onClose();
        }
      });
    });

    // RFx
    rfxs.filter((r) => r.co.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.scope.toLowerCase().includes(q)).forEach((r) => {
      items.push({
        type: 'rfx',
        id: r.id,
        title: `${r.id}: ${r.co}`,
        subtitle: `${r.type} • $${r.val.toLocaleString()} • Stage: ${r.stage}`,
        icon: FileCheck2,
        action: () => {
          navigate('rfx', { id: r.id });
          onClose();
        }
      });
    });

    // Issues
    issues.filter((i) => i.t.toLowerCase().includes(q) || i.co.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)).forEach((i) => {
      items.push({
        type: 'issue',
        id: i.id,
        title: `${i.id}: ${i.t}`,
        subtitle: `${i.co} • ${i.sev} Severity • ${i.st}`,
        icon: AlertTriangle,
        action: () => {
          navigate('issues', { id: i.id });
          onClose();
        }
      });
    });

    // US Entity Master
    Object.values(ENTITY_MASTER).filter((e) => e.code.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.federalForm.toLowerCase().includes(q)).forEach((e) => {
      items.push({
        type: 'entity',
        id: e.code,
        title: `${e.code} — ${e.name}`,
        subtitle: `Federal ${e.federalForm} • Deadline: ${e.filingDeadline} • ${e.taxDefault}`,
        icon: Scale,
        action: () => {
          navigate('entityDetail', { code: e.code });
          onClose();
        }
      });
    });

    return items;
  }, [query, accounts, rfxs, onboardings, issues, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-100">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            id="input-cmd-palette"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, account name, RFx ID, issue, or entity code (e.g. DLC, LLC)..."
            className="w-full bg-transparent border-0 outline-hidden text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No results found for <span className="font-semibold text-slate-600 dark:text-slate-300">"{query}"</span>
            </div>
          ) : (
            results.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.type === 'view') {
                      navigate(item.id);
                      onClose();
                    }
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/80 dark:hover:bg-slate-800/80 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.subtitle}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><b>↑↓</b> to navigate</span>
            <span><b>↵</b> to select</span>
          </div>
          <span>Trivium PLSE Universal Search</span>
        </div>
      </div>
    </div>
  );
};
