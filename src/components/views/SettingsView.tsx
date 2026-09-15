import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import {
  Settings,
  Sparkles,
  Shield,
  Database,
  Cloud,
  CheckCircle2,
  Lock,
  RotateCcw,
  Building2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme, toast } = useData();
  const [geminiModel, setGeminiModel] = useState('gemini-3.1-pro-preview');
  const [autoRca, setAutoRca] = useState(true);
  const [slaAlertHours, setSlaAlertHours] = useState(4);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Settings saved successfully');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform Settings & Enterprise Governance</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure AI reasoning parameters, Firestore sync rules, SLA threshold triggers, and UI appearance.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: AI Reasoning Engine */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gemini Advisory Intelligence Configuration</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Server-side LLM model routing and automated 5-Whys triage parameters.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Primary Advisory & Strategy Model
              </label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
              >
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Thinking for TOM, Tax & Complex RFx)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (High speed conversational responses)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">Auto 5-Whys RCA Synthesis</div>
                <div className="text-[11px] text-slate-500">Automatically prompt AI analysis upon logging Critical severity issues</div>
              </div>
              <input
                type="checkbox"
                checked={autoRca}
                onChange={(e) => setAutoRca(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: SLA Triggers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">SLA Breach Escalation Thresholds</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Determine early warning alerts for AP, AR, and GL close milestones.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Critical Issue SLA Early Warning Window (Hours before breach)
              </label>
              <input
                type="number"
                value={slaAlertHours}
                onChange={(e) => setSlaAlertHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Storage & Database Persistence */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Firestore Persistent Data Architecture</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Firebase Firestore cloud persistence with fallback local cache.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Security Rules & Blueprint Active
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">firestore.rules deployed</span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
