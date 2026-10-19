import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewVerificationPage } from './pages/NewVerificationPage';
import { ProgressPage } from './pages/ProgressPage';
import { ReportPage } from './pages/ReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { BlockchainPage } from './pages/BlockchainPage';
import { AboutPage } from './pages/AboutPage';
import { WalletState } from './services/web3';
import { api } from './services/api';

export function App() {
  const [activePage, setActivePage] = useState<string>('landing');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    error: null,
  });

  const navigateTo = (page: string, reportId?: string) => {
    if (reportId) {
      setSelectedReportId(reportId);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDemo = async () => {
    try {
      // Find latest completed report or create one
      const reports = await api.getVerifications();
      const completed = reports.find((r) => r.status === 'completed');
      if (completed) {
        navigateTo('report', completed.id);
      } else {
        // Initialize sample demo
        const res = await api.createVerification({
          vendor_name: 'Apex Global Logistics LLC',
          website_url: 'https://apexlogistics-shipping.com',
          region: 'California, United States',
          notes: 'Demonstration of automated discrepancy detection vs public filings',
        });
        navigateTo('progress', res.report_id);
      }
    } catch {
      navigateTo('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      <Navbar
        activePage={activePage}
        setActivePage={(p) => navigateTo(p)}
        wallet={wallet}
        setWallet={setWallet}
      />

      <main className="flex-1">
        {activePage === 'landing' && (
          <LandingPage
            onStartVerification={() => navigateTo('new')}
            onViewDemo={handleViewDemo}
            onNavigateHistory={() => navigateTo('history')}
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            onStartNew={() => navigateTo('new')}
            onOpenReport={(id) => navigateTo('report', id)}
            onOpenVerify={(id) => navigateTo('blockchain', id)}
          />
        )}

        {activePage === 'new' && (
          <NewVerificationPage
            onVerificationStarted={(id) => navigateTo('progress', id)}
            onCancel={() => navigateTo('dashboard')}
          />
        )}

        {activePage === 'progress' && selectedReportId && (
          <ProgressPage
            reportId={selectedReportId}
            onViewReport={(id) => navigateTo('report', id)}
            onReturnDashboard={() => navigateTo('dashboard')}
          />
        )}

        {activePage === 'report' && selectedReportId && (
          <ReportPage
            reportId={selectedReportId}
            onOpenVerify={(id) => navigateTo('blockchain', id)}
            onReturnDashboard={() => navigateTo('dashboard')}
          />
        )}

        {activePage === 'history' && (
          <HistoryPage
            onOpenReport={(id) => navigateTo('report', id)}
            onOpenVerify={(id) => navigateTo('blockchain', id)}
            onStartNew={() => navigateTo('new')}
          />
        )}

        {activePage === 'blockchain' && selectedReportId && (
          <BlockchainPage
            reportId={selectedReportId}
            wallet={wallet}
            onOpenReport={(id) => navigateTo('report', id)}
            onReturnDashboard={() => navigateTo('dashboard')}
          />
        )}

        {activePage === 'about' && <AboutPage />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
