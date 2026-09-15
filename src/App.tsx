/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Topbar } from './components/Topbar.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { AiAssistantDrawer } from './components/AiAssistantDrawer.tsx';
import { ActionModals } from './components/ActionModals.tsx';

// Views
import { DashboardView } from './components/views/DashboardView.tsx';
import { CrmView } from './components/views/CrmView.tsx';
import { RfxCenterView } from './components/views/RfxCenterView.tsx';
import { OnboardingView } from './components/views/OnboardingView.tsx';
import { OnboardingDetailView } from './components/views/OnboardingDetailView.tsx';
import { ServiceDeliveryView } from './components/views/ServiceDeliveryView.tsx';
import { IssuesView } from './components/views/IssuesView.tsx';
import { CommunicationsView } from './components/views/CommunicationsView.tsx';
import { TaxComplianceView } from './components/views/TaxComplianceView.tsx';
import { EntityMasterView } from './components/views/EntityMasterView.tsx';
import { EntityDetailView } from './components/views/EntityDetailView.tsx';
import { DocumentVaultView } from './components/views/DocumentVaultView.tsx';
import { AnalyticsView } from './components/views/AnalyticsView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';

import { Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, viewParams, setIsAiDrawerOpen } = useData();
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [modalType, setModalType] = useState<
    'onboarding' | 'rfx' | 'issue' | 'account' | 'rfxDraft' | null
  >(null);
  const [activeRfxId, setActiveRfxId] = useState<string | undefined>();

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'crm':
        return <CrmView onOpenNewAccount={() => setModalType('account')} />;
      case 'rfx':
        return (
          <RfxCenterView
            onOpenNewRfx={() => setModalType('rfx')}
            onOpenRfxDraft={(rfxId) => {
              setActiveRfxId(rfxId);
              setModalType('rfxDraft');
            }}
          />
        );
      case 'onboarding':
        return (
          <OnboardingView onOpenNewOnboarding={() => setModalType('onboarding')} />
        );
      case 'onboardingDetail':
        return <OnboardingDetailView onboardingId={viewParams?.id || 'OB-2024-001'} />;
      case 'delivery':
        return <ServiceDeliveryView />;
      case 'issues':
        return <IssuesView onOpenNewIssue={() => setModalType('issue')} />;
      case 'comms':
        return <CommunicationsView />;
      case 'tax':
        return <TaxComplianceView />;
      case 'entities':
        return <EntityMasterView />;
      case 'entityDetail':
        return (
          <EntityDetailView
            entityCode={viewParams?.code || 'DLC'}
            onOpenNewOnboarding={() => setModalType('onboarding')}
          />
        );
      case 'docs':
      case 'vault':
        return <DocumentVaultView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased overflow-hidden selection:bg-indigo-500 selection:text-white font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar
          onOpenCommandPalette={() => setIsCmdOpen(true)}
          onOpenNewModal={(type) => setModalType(type)}
        />

        <main className="flex-1 overflow-y-auto pb-12">
          {renderView()}
        </main>
      </div>

      {/* Floating AI Advisor Action Button (bottom-right) */}
      <button
        id="btn-floating-ai-advisor"
        onClick={() => setIsAiDrawerOpen(true)}
        className="fixed bottom-5 right-5 z-40 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer border border-white/20 backdrop-blur-xs"
        title="Open Gemini AI Solution Architect & Fractional CFO Advisor"
      >
        <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
        <span>PLSE AI Advisor</span>
      </button>

      {/* Command Palette (⌘K) */}
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />

      {/* AI Strategy Drawer */}
      <AiAssistantDrawer />

      {/* Action Modals */}
      <ActionModals
        modalType={modalType}
        activeRfxId={activeRfxId}
        onClose={() => {
          setModalType(null);
          setActiveRfxId(undefined);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
