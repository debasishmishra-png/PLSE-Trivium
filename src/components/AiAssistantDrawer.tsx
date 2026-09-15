import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext.tsx';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Copy,
  Check,
  Brain,
  Zap,
  RotateCcw,
  Bot,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isHighThinking?: boolean;
}

export const AiAssistantDrawer: React.FC = () => {
  const { isAiDrawerOpen, setIsAiDrawerOpen, toast } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `### Welcome to Trivium PLSE Advisory & Strategy Co-Pilot

I am your **Principal Solution Architect & Fractional CFO AI Advisor**, powered by Gemini with Deep Thinking capabilities.

How can I assist your F&A operations today?
- **Target Operating Model (TOM)** & Global RACI Design
- **RFx Proposal & Pricing Strategy** (RFI / RFP / RFQ)
- **7-Phase Transition & Onboarding Risk Mitigation**
- **Root Cause Analysis (RCA)** on AP/AR/GL & Close Bottlenecks
- **US Corporate Tax & Nexus Governance** (across 16 US entity types)`,
      timestamp: 'Ready'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [enableHighThinking, setEnableHighThinking] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const promptPills = [
    { title: 'Design TOM for SaaS ($15M ARR)', prompt: 'Design a complete Target Operating Model (TOM) and Global RACI matrix for a high-growth Series B Delaware C-Corp SaaS company with $15M ARR transitioning from in-house to Trivium FAO.' },
    { title: 'RCA for AP Invoice Backlog', prompt: 'Perform a 5-Whys Root Cause Analysis and 72-hour Corrective Action Plan for an AP backlog of 340 invoices with missing PO matches in NetSuite.' },
    { title: 'Tax Nexus Assessment (CA, NY, TX)', prompt: 'Provide a comprehensive state economic nexus and sales tax risk evaluation for a multi-state remote workforce LLC generating $4M in gross receipts across CA, NY, and TX.' },
    { title: '7-Phase Transition Acceleration', prompt: 'Outline practical levers to accelerate a 14-week F&A transition into a compressed 8-week parallel run without compromising financial controls or audit readiness.' }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isHighThinking: enableHighThinking
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content
          })),
          enableHighThinking
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'model',
        content: data.text || 'No response received.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        isHighThinking: enableHighThinking
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'model',
        content: `**AI Service Notice:** ${err.message || 'Unable to complete request. Please verify connection and retry.'}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
      toast(`AI Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: `Chat cleared. How can I assist with your F&A delivery and solutions architecture today?`,
        timestamp: 'Ready'
      }
    ]);
  };

  if (!isAiDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">PLSE Advisory AI</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                {enableHighThinking ? '3.1 PRO (Deep Thinking)' : '3.8 FLASH'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Principal Solution Architect & Fractional CFO</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* High Thinking Toggle */}
          <button
            onClick={() => setEnableHighThinking(!enableHighThinking)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              enableHighThinking
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            title="Toggle High Thinking mode (Gemini 3.1 Pro Preview)"
          >
            {enableHighThinking ? <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> : <Zap className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{enableHighThinking ? 'Deep Thinking' : 'Fast Mode'}</span>
          </button>

          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Clear Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAiDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isAi = m.role === 'model';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isAi
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {/* Content */}
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {m.content.split('\n\n').map((para, pIdx) => {
                    if (para.startsWith('### ')) {
                      return <h4 key={pIdx} className="font-bold text-sm text-slate-900 dark:text-white mt-1">{para.replace('### ', '')}</h4>;
                    }
                    if (para.startsWith('## ')) {
                      return <h3 key={pIdx} className="font-bold text-sm text-slate-900 dark:text-white mt-1">{para.replace('## ', '')}</h3>;
                    }
                    return <p key={pIdx}>{para}</p>;
                  })}
                </div>

                {/* Footer / Meta */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/40 dark:border-slate-700/40 text-[10px] text-slate-400">
                  <span className="font-mono">{m.timestamp}</span>
                  {isAi && (
                    <button
                      onClick={() => copyToClipboard(m.id, m.content)}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              {!isAi && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-1">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-medium text-slate-500">
                {enableHighThinking ? 'Gemini 3.1 Pro formulating architecture...' : 'Generating response...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Strategy Pills */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Executive Prompts
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {promptPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pill.prompt)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-[11px] font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              {pill.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="input-ai-chat"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about FAO, TOM design, US tax, or transition risk..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
