import React from 'react';
import {
  ShieldCheck,
  Search,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe2,
  FileCheck2,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onStartVerification: () => void;
  onViewDemo: () => void;
  onNavigateHistory: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartVerification,
  onViewDemo,
  onNavigateHistory,
}) => {
  const workflowSteps = [
    { num: '01', title: 'Vendor Search', desc: 'Enter name, domain & jurisdiction' },
    { num: '02', title: 'TinyFish Research', desc: 'Real-time crawling across registry records' },
    { num: '03', title: 'Evidence Collection', desc: 'Timestamped source URLs & text excerpts' },
    { num: '04', title: 'AI Analysis', desc: 'Strict cross-comparison without hallucinations' },
    { num: '05', title: 'Verification Report', desc: 'Structured findings with human audit tips' },
    { num: '06', title: 'Blockchain Hash', desc: 'Deterministic SHA-256 smart contract anchor' },
    { num: '07', title: 'Integrity Check', desc: 'Cryptographic proof against post-audit tampering' },
  ];

  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-16 pb-12 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Kritical Hacks 2026 • AI + Web3 Vendor Verification</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-950 tracking-tight leading-[1.15]">
          Verify the evidence. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
            Trust the process.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Organizations make critical procurement decisions based on glossy marketing decks.
          <strong className="text-navy-900 font-semibold"> TrustProof</strong> cross-examines public registries with TinyFish, isolates factual inconsistencies using AI, and anchors immutable cryptographic proofs to the blockchain.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStartVerification}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-sm font-semibold shadow-md shadow-navy-900/10 transition-all hover:scale-[1.02]"
          >
            Start Verification
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onViewDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            View Live Demo Report
          </button>
        </div>

        {/* Essential Guardrail Banner */}
        <div className="mt-10 p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-slate-600 text-xs max-w-2xl mx-auto flex items-start gap-2.5 text-left">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Neutral Verification Framework: </span>
            Identified discrepancies reflect differences in available public records and are not proof of fraud. Blockchain anchoring certifies the tamper-evident integrity of the audit report, not the factual truth of third-party claims.
          </div>
        </div>
      </section>

      {/* Feature Highlights (The 3 Core Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Architectural Pillars</h2>
          <p className="text-2xl sm:text-3xl font-bold text-navy-950">How TrustProof Eliminates Blind Vendor Trust</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-5">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">1. TinyFish Public Web Research</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Real-time deep indexing via TinyFish Search and Fetch APIs across state corporation registries, WHOIS domain registers, and regulatory databases with timestamped excerpts.
            </p>
            <div className="text-xs font-medium text-teal-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero fabricated or simulated URLs
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 mb-5">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">2. AI Discrepancy Detection</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Cross-compares self-reported marketing claims against external corporate filings. Flags timeline anomalies, dissolved entities, or virtual mailbox setups with confidence scores.
            </p>
            <div className="text-xs font-medium text-blue-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Strictly grounded in cited evidence
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 mb-5">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">3. Blockchain Report Integrity</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Generates a deterministic canonical SHA-256 report hash and permanently anchors it in the Solidity ReportRegistry smart contract. Any altered byte triggers an instant mismatch.
            </p>
            <div className="text-xs font-medium text-indigo-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ethereum Sepolia / Hardhat verified
            </div>
          </div>
        </div>
      </section>

      {/* Verification Workflow Progression */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-navy-800">
          <div className="max-w-2xl mb-10">
            <h3 className="text-teal-400 text-xs font-bold tracking-widest uppercase mb-2">End-to-End Pipeline</h3>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-white">The TrustProof Verification Flow</h4>
            <p className="text-slate-400 text-sm mt-2">
              Every audit transitions through automated stages to guarantee factual repeatability and cryptographic permanence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.slice(0, 4).map((st) => (
              <div key={st.num} className="bg-navy-900/80 border border-navy-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-teal-400 mb-1 block">{st.num}</span>
                <h5 className="font-bold text-sm text-white mb-1">{st.title}</h5>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {workflowSteps.slice(4).map((st) => (
              <div key={st.num} className="bg-navy-900/80 border border-navy-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-teal-400 mb-1 block">{st.num}</span>
                <h5 className="font-bold text-sm text-white mb-1">{st.title}</h5>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-navy-800 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Deterministic Canonical Hash: <code className="text-teal-300 font-mono">SHA256(canonical(report))</code>
            </span>
            <button
              onClick={onStartVerification}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs rounded-xl transition-all"
            >
              Start Your First Verification
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
