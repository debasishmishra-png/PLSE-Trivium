import React, { useState } from 'react';
import { useData } from '../context/DataContext.tsx';
import { ENTITY_MASTER } from '../data/entityMaster.ts';
import {
  X,
  Sparkles,
  GitMerge,
  FileCheck2,
  AlertTriangle,
  Building2,
  Calendar,
  DollarSign,
  User,
  Layers,
  ArrowRight,
  CheckCircle2,
  Info
} from 'lucide-react';

interface ActionModalsProps {
  modalType: 'onboarding' | 'rfx' | 'issue' | 'account' | 'rfxDraft' | null;
  activeRfxId?: string;
  onClose: () => void;
}

export const ActionModals: React.FC<ActionModalsProps> = ({ modalType, activeRfxId, onClose }) => {
  const {
    accounts,
    rfxs,
    addOnboarding,
    addRfx,
    updateRfx,
    addIssue,
    addAccount,
    navigate,
    toast
  } = useData();

  // Onboarding form state
  const [obAcct, setObAcct] = useState('');
  const [obEntity, setObEntity] = useState('DLC');
  const [obOwner, setObOwner] = useState('Priya Nair');
  const [obGoLive, setObGoLive] = useState(
    new Date(Date.now() + 70 * 86400000).toISOString().slice(0, 10)
  );
  const [obArr, setObArr] = useState(180000);
  const [obIndustry, setObIndustry] = useState('Technology / SaaS');
  const [obServices, setObServices] = useState<string[]>(['AP', 'AR', 'GL / Close']);

  // RFx form state
  const [rfxCo, setRfxCo] = useState('');
  const [rfxType, setRfxType] = useState<'RFI' | 'RFP' | 'RFQ'>('RFP');
  const [rfxVal, setRfxVal] = useState(250000);
  const [rfxDue, setRfxDue] = useState(
    new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10)
  );
  const [rfxOwner, setRfxOwner] = useState('Dana Whitfield');
  const [rfxScope, setRfxScope] = useState('End-to-end FAO + US Corporate Tax + 3-Day Close');

  // Issue form state
  const [issueT, setIssueT] = useState('');
  const [issueCo, setIssueCo] = useState(accounts[0]?.name || 'Greenleaf Foods');
  const [issueSev, setIssueSev] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [issueCat, setIssueCat] = useState<any>('AP');
  const [issueOwner, setIssueOwner] = useState('R. Kumar');

  // Account form state
  const [accName, setAccName] = useState('');
  const [accEntity, setAccEntity] = useState('DLC');
  const [accInd, setAccInd] = useState('Technology / SaaS');
  const [accHq, setAccHq] = useState('San Francisco, CA');
  const [accArr, setAccArr] = useState(150000);
  const [accCsm, setAccCsm] = useState('Priya Nair');

  // RFx AI Draft Generation state
  const currentRfx = rfxs.find((r) => r.id === activeRfxId);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(currentRfx?.proposalDraft || '');

  if (!modalType) return null;

  const toggleService = (svc: string) => {
    setObServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const handleLaunchOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obAcct.trim()) {
      toast('Please enter a client name');
      return;
    }
    const obId = addOnboarding(
      {
        acct: obAcct.trim(),
        entityCode: obEntity,
        owner: obOwner,
        golive: obGoLive
      },
      {
        ind: obIndustry,
        arr: Number(obArr),
        svc: obServices
      }
    );
    onClose();
    navigate('onboardingDetail', { id: obId });
  };

  const handleCreateRfx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfxCo.trim()) {
      toast('Please enter client or prospect name');
      return;
    }
    addRfx({
      co: rfxCo.trim(),
      type: rfxType,
      val: Number(rfxVal),
      due: rfxDue,
      owner: rfxOwner,
      scope: rfxScope,
      stage: 'Intake'
    });
    onClose();
    navigate('rfx');
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueT.trim()) {
      toast('Please enter issue title');
      return;
    }
    addIssue({
      t: issueT.trim(),
      co: issueCo,
      sev: issueSev,
      cat: issueCat,
      o: issueOwner
    });
    onClose();
    navigate('issues');
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) {
      toast('Please enter account name');
      return;
    }
    addAccount({
      name: accName.trim(),
      entity: accEntity,
      ind: accInd,
      hq: accHq,
      arr: Number(accArr),
      csm: accCsm,
      stage: 'Onboarding'
    });
    onClose();
    navigate('crm');
  };

  const handleGenerateAiProposal = async () => {
    if (!currentRfx) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/rfx-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          co: currentRfx.co,
          type: currentRfx.type,
          scope: currentRfx.scope,
          val: currentRfx.val,
          industry: 'High-Growth Tech / Enterprise',
          entityType: 'Delaware C-Corporation (DLC)'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate draft');
      setGeneratedDraft(data.text);
      updateRfx(currentRfx.id, { proposalDraft: data.text });
      toast('AI Proposal Response generated successfully!');
    } catch (err: any) {
      toast(`Generation Error: ${err.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10 max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              {modalType === 'onboarding' && <GitMerge className="w-4 h-4" />}
              {modalType === 'rfx' && <FileCheck2 className="w-4 h-4" />}
              {modalType === 'issue' && <AlertTriangle className="w-4 h-4" />}
              {modalType === 'account' && <Building2 className="w-4 h-4" />}
              {modalType === 'rfxDraft' && <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {modalType === 'onboarding' && 'Launch Client Transition Workspace'}
                {modalType === 'rfx' && 'Create RFx Opportunity'}
                {modalType === 'issue' && 'Log Operational Issue / Bottleneck'}
                {modalType === 'account' && 'Register Client Account'}
                {modalType === 'rfxDraft' && `AI Proposal Builder: ${currentRfx?.id}`}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {modalType === 'onboarding' && 'Initialize the 7-phase F&A onboarding engine with entity-specific tasks.'}
                {modalType === 'rfx' && 'Track prospective client RFI, RFP, or RFQ requirements and scope.'}
                {modalType === 'issue' && 'Escalate and triage service delivery bottlenecks before SLA breaches.'}
                {modalType === 'account' && 'Add a new client organization to Trivium F&A portfolio.'}
                {modalType === 'rfxDraft' && 'Generate structured executive proposals powered by Gemini.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* 1. Launch Onboarding Form */}
          {modalType === 'onboarding' && (
            <form onSubmit={handleLaunchOnboarding} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Client / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={obAcct}
                    onChange={(e) => setObAcct(e.target.value)}
                    placeholder="e.g. Acme Health Inc."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    US Entity Type *
                  </label>
                  <select
                    value={obEntity}
                    onChange={(e) => setObEntity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    {Object.values(ENTITY_MASTER).map((e) => (
                      <option key={e.code} value={e.code}>
                        {e.code} — {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={obIndustry}
                    onChange={(e) => setObIndustry(e.target.value)}
                    placeholder="e.g. Biotech / Medical Devices"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Contracted Annual Run-Rate (ARR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-medium">$</span>
                    <input
                      type="number"
                      value={obArr}
                      onChange={(e) => setObArr(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Transition Lead (Owner)
                  </label>
                  <select
                    value={obOwner}
                    onChange={(e) => setObOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Priya Nair">Priya Nair (Principal Delivery)</option>
                    <option value="Marcus Bell">Marcus Bell (Senior Architect)</option>
                    <option value="Dana Whitfield">Dana Whitfield (F&A Partner)</option>
                    <option value="A. Fernandez">A. Fernandez (Tax Lead)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Target Go-Live Date
                  </label>
                  <input
                    type="date"
                    value={obGoLive}
                    onChange={(e) => setObGoLive(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Service scope selection */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Contracted Service Scope
                </label>
                <div className="flex flex-wrap gap-2">
                  {['AP', 'AR', 'GL / Close', 'Payroll', 'US Tax', 'Fractional CFO', 'Audit Readiness'].map(
                    (svc) => {
                      const selected = obServices.includes(svc);
                      return (
                        <button
                          type="button"
                          key={svc}
                          onClick={() => toggleService(svc)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            selected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {selected && '✓ '}
                          {svc}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Entity info notice */}
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  Selecting <b>{obEntity} ({ENTITY_MASTER[obEntity]?.name})</b> will automatically inject{' '}
                  <b>{ENTITY_MASTER[obEntity]?.onboardingTasks?.length || 0} entity-specific compliance tasks</b> into Phase 0 & Phase 1.
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <GitMerge className="w-4 h-4" />
                  Launch Transition
                </button>
              </div>
            </form>
          )}

          {/* 2. Create RFx Form */}
          {modalType === 'rfx' && (
            <form onSubmit={handleCreateRfx} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Client / Prospect Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={rfxCo}
                    onChange={(e) => setRfxCo(e.target.value)}
                    placeholder="e.g. Meridian Bio Labs"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Opportunity Type
                  </label>
                  <select
                    value={rfxType}
                    onChange={(e) => setRfxType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="RFP">RFP (Request for Proposal)</option>
                    <option value="RFI">RFI (Request for Information)</option>
                    <option value="RFQ">RFQ (Request for Quotation)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Target Contract Value (Annual)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-medium">$</span>
                    <input
                      type="number"
                      value={rfxVal}
                      onChange={(e) => setRfxVal(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Submission Due Date
                  </label>
                  <input
                    type="date"
                    value={rfxDue}
                    onChange={(e) => setRfxDue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Scope Description
                  </label>
                  <textarea
                    rows={3}
                    value={rfxScope}
                    onChange={(e) => setRfxScope(e.target.value)}
                    placeholder="Describe scope, volume, entity complexity, and software stack..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-4 h-4" />
                  Create Opportunity
                </button>
              </div>
            </form>
          )}

          {/* 3. Log Issue Form */}
          {modalType === 'issue' && (
            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Issue Summary / Description *
                </label>
                <input
                  type="text"
                  required
                  value={issueT}
                  onChange={(e) => setIssueT(e.target.value)}
                  placeholder="e.g. Bank reconciliation break of $42K across 2 depository accounts"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Client Account
                  </label>
                  <select
                    value={issueCo}
                    onChange={(e) => setIssueCo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name} ({a.entity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Severity
                  </label>
                  <select
                    value={issueSev}
                    onChange={(e) => setIssueSev(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Critical">Critical (Immediate Escalation, 4h SLA)</option>
                    <option value="High">High (24h SLA)</option>
                    <option value="Medium">Medium (3d SLA)</option>
                    <option value="Low">Low (Minor / Improvement)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Workstream / Category
                  </label>
                  <select
                    value={issueCat}
                    onChange={(e) => setIssueCat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="AP">AP (Invoicing, PO matching, OCR)</option>
                    <option value="AR">AR (Billing, Collections, Dunning)</option>
                    <option value="GL / Recon">GL / Reconciliation (Bank breaks, TB balance)</option>
                    <option value="Payroll">Payroll (Multi-state, PTO, Taxes)</option>
                    <option value="US Tax">US Tax & Compliance (Nexus, 1099s, Filings)</option>
                    <option value="Technology">Technology & Integrations (ERP, API)</option>
                    <option value="Client Dependency">Client Dependency (Approvals)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Assignee (Owner)
                  </label>
                  <select
                    value={issueOwner}
                    onChange={(e) => setIssueOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="R. Kumar">R. Kumar (Senior GL / Recon)</option>
                    <option value="S. Iyer">S. Iyer (AP Lead)</option>
                    <option value="A. Fernandez">A. Fernandez (Tax Lead)</option>
                    <option value="V. Menon">V. Menon (Tech Lead)</option>
                    <option value="N. Shah">N. Shah (Payroll Lead)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Log Issue
                </button>
              </div>
            </form>
          )}

          {/* 4. Register Account Form */}
          {modalType === 'account' && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Client Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="e.g. Cobalt Technologies Inc."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Entity Structure
                  </label>
                  <select
                    value={accEntity}
                    onChange={(e) => setAccEntity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    {Object.values(ENTITY_MASTER).map((e) => (
                      <option key={e.code} value={e.code}>
                        {e.code} — {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Industry Sector
                  </label>
                  <input
                    type="text"
                    value={accInd}
                    onChange={(e) => setAccInd(e.target.value)}
                    placeholder="e.g. Fintech / Web3"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Headquarters
                  </label>
                  <input
                    type="text"
                    value={accHq}
                    onChange={(e) => setAccHq(e.target.value)}
                    placeholder="e.g. New York, NY"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Annual Contracted ARR ($)
                  </label>
                  <input
                    type="number"
                    value={accArr}
                    onChange={(e) => setAccArr(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Dedicated CSM / Lead
                  </label>
                  <select
                    value={accCsm}
                    onChange={(e) => setAccCsm(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Priya Nair">Priya Nair</option>
                    <option value="Dana Whitfield">Dana Whitfield</option>
                    <option value="Marcus Bell">Marcus Bell</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" />
                  Save Account
                </button>
              </div>
            </form>
          )}

          {/* 5. AI Proposal Builder Modal for RFx */}
          {modalType === 'rfxDraft' && currentRfx && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    {currentRfx.id}: {currentRfx.co}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Type: {currentRfx.type} • Target: ${currentRfx.val.toLocaleString()} • Scope: {currentRfx.scope}
                  </div>
                </div>
                <button
                  onClick={handleGenerateAiProposal}
                  disabled={isGeneratingAi}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingAi ? 'Drafting Proposal...' : 'Generate with Gemini'}
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Executive Proposal Document Draft
                </label>
                <textarea
                  rows={16}
                  value={generatedDraft}
                  onChange={(e) => {
                    setGeneratedDraft(e.target.value);
                    updateRfx(currentRfx.id, { proposalDraft: e.target.value });
                  }}
                  placeholder="Click 'Generate with Gemini' above to create a complete TOM, RACI matrix, transition timeline, and pricing proposal..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400">
                  Changes auto-saved to RFx workspace
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
