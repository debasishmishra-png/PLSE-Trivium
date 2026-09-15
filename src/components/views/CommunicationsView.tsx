import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import {
  Mail,
  Send,
  Search,
  Plus,
  Paperclip,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Sparkles
} from 'lucide-react';

export const CommunicationsView: React.FC = () => {
  const { comms = [], addCommunication, accounts = [], contacts = [], toast } = useData();
  const [selectedCommId, setSelectedCommId] = useState<string>(comms[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  // New compose form
  const [newClient, setNewClient] = useState(accounts[0]?.name || 'Greenleaf Foods');
  const [newContact, setNewContact] = useState(contacts[0]?.name || 'Sam Okafor');
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newChannel, setNewChannel] = useState<'Email' | 'Portal' | 'Slack' | 'Meeting'>('Email');

  const selectedComm = comms.find((c) => c.id === selectedCommId) || comms[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedComm) return;
    toast(`Dispatched response to ${selectedComm.from}`);
    setReplyText('');
  };

  const handleCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newBody.trim()) {
      toast('Please enter subject and message body');
      return;
    }
    addCommunication({
      acct: newClient,
      from: 'Dana Whitfield (Trivium Lead)',
      to: newContact,
      subj: newSubject.trim(),
      body: newBody.trim(),
      channel: newChannel,
      dir: 'Outbound',
      st: 'Delivered'
    });
    setIsComposing(false);
    setNewSubject('');
    setNewBody('');
    toast('Outbound communication logged and dispatched');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Client Communications & CRM Dispatch</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Unified omnichannel log across Email, Client Portal, Slack Connect, and Stakeholder Governance Meetings.
          </p>
        </div>

        <button
          onClick={() => setIsComposing(true)}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Compose Dispatch
        </button>
      </div>

      {/* Main Mailbox Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden min-h-[600px]">
        {/* Left: Message Thread List */}
        <div className="border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search subject or client..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {comms.map((c) => {
              const isSelected = c.id === selectedCommId;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCommId(c.id);
                    setIsComposing(false);
                  }}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{c.acct}</span>
                    <span className="font-mono text-[10px] text-slate-400">{c.date}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{c.subj}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{c.body}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {c.channel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{c.dir}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Message Detail View or Compose Form */}
        <div className="md:col-span-2 flex flex-col p-6">
          {isComposing ? (
            <form onSubmit={handleCompose} className="space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">New Client Communication Dispatch</h3>
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Client Account</label>
                  <select
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Channel</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                  >
                    <option value="Email">Email Dispatch</option>
                    <option value="Portal">Client Portal Notification</option>
                    <option value="Slack">Slack Connect Channel</option>
                    <option value="Meeting">Meeting Minutes & Followup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 text-xs">Subject *</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Month-End Close Sign-Off & Variance Analysis"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1 text-xs">Message Body *</label>
                <textarea
                  rows={8}
                  required
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Draft client update or escalation response..."
                  className="flex-1 w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Communication
                </button>
              </div>
            </form>
          ) : selectedComm ? (
            <div className="flex flex-col h-full space-y-4">
              {/* Message Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedComm.subj}</h3>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                      {selectedComm.acct}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-slate-400">{selectedComm.date}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <div>
                    From: <b className="text-slate-800 dark:text-slate-200">{selectedComm.from}</b> → To:{' '}
                    <b className="text-slate-800 dark:text-slate-200">{selectedComm.to}</b>
                  </div>
                  <span className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                    {selectedComm.channel} • {selectedComm.st}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-1 overflow-y-auto text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap">
                {selectedComm.body}
              </div>

              {/* Quick Reply Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a quick reply to this thread..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                />
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">Press Send to dispatch via {selectedComm.channel}</div>
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    Send Reply
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a message thread to view history
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
