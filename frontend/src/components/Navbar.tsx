import React, { useState } from 'react';
import { ShieldCheck, Wallet, ChevronRight, Activity } from 'lucide-react';
import { web3, WalletState } from '../services/web3';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  wallet: WalletState;
  setWallet: (wallet: WalletState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  wallet,
  setWallet,
}) => {
  const [connecting, setConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      const res = await web3.connectWallet();
      setWallet(res);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setConnecting(false);
    }
  };

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'new', label: 'New Verification' },
    { id: 'history', label: 'Reports' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setActivePage('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl text-navy-900 tracking-tight">TrustProof</span>
              <span className="bg-brand-50 text-brand-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-brand-200">
                AI + Web3
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Verify the evidence. Trust the process.</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActivePage(link.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-navy-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-white/50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Action & Wallet */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleConnectWallet}
            disabled={connecting}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              wallet.isConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-teal-600" />
            {wallet.isConnected ? (
              <span>
                {wallet.address?.substring(0, 6)}...{wallet.address?.substring(38)}
              </span>
            ) : connecting ? (
              <span>Connecting...</span>
            ) : (
              <span>Connect Wallet</span>
            )}
          </button>

          <button
            onClick={() => setActivePage('new')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            Verify Vendor
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
