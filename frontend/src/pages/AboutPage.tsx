import React from 'react';
import {
  ShieldCheck,
  Search,
  Cpu,
  Lock,
  Globe2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Kritical Hacks 2026 Project</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-navy-950 tracking-tight">
          About TrustProof
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          TrustProof was conceived to tackle supplier fraud, credential embellishment, and procurement blind-spots. By binding automated public research with structured AI cross-analysis and on-chain verification hashes, TrustProof provides a verifiable paper trail for vendor risk assessment.
        </p>
      </div>

      {/* Philosophy Callout */}
      <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200/90 text-xs sm:text-sm text-slate-700 space-y-3">
        <h3 className="font-bold text-navy-950 text-sm uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Guiding Philosophy
        </h3>
        <p className="leading-relaxed">
          1. <strong>Discrepancies ≠ Automatic Fraud:</strong> Inconsistencies between self-reported marketing copy and state registries can stem from corporate restructuring, recent acquisitions, or rebranding. TrustProof highlights these anomalies for human auditor follow-up rather than making unilateral legal judgments.
        </p>
        <p className="leading-relaxed">
          2. <strong>Blockchain Proves Integrity, Not Claim Truth:</strong> Anchoring a canonical SHA-256 hash in a Solidity contract guarantees that an audit report has not been tampered with or quietly modified after the fact. It does not certify that external corporate claims were true.
        </p>
      </div>

      {/* Tech Stack Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-navy-950">Architecture & Technical Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
              <Globe2 className="w-4 h-4" />
              TinyFish Web Agent API
            </div>
            <p className="text-slate-600 leading-relaxed">
              Utilizes TinyFish Search API (<code>https://api.search.tinyfish.ai</code>) and Fetch API (<code>https://api.fetch.tinyfish.ai</code>) to crawl official business registries, Secretary of State portals, and ICANN WHOIS records.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              AI Discrepancy Engine
            </div>
            <p className="text-slate-600 leading-relaxed">
              Compares self-reported marketing statements with external registry data. Strictly cites indexed source IDs and flags timeline gaps, dissolved entities, or virtual mailbox addresses.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <Lock className="w-4 h-4" />
              Solidity Smart Contract
            </div>
            <p className="text-slate-600 leading-relaxed">
              <code>ReportRegistry.sol</code> maintains an immutable mapping from <code>reportId</code> to canonical SHA-256 report hash, submitter wallet, and block timestamp, compiled and tested with Hardhat.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              SQLite Database Persistence
            </div>
            <p className="text-slate-600 leading-relaxed">
              SQLite stores verification requests, normalized evidence, AI findings, and blockchain transaction receipts, ensuring reports remain accessible across restarts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
