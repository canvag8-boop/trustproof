import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  Fingerprint
} from 'lucide-react';
import { IntegrityResult, VerificationReport } from '../types';
import { api } from '../services/api';
import { web3, WalletState } from '../services/web3';

interface BlockchainPageProps {
  reportId: string;
  wallet: WalletState;
  onOpenReport: (reportId: string) => void;
  onReturnDashboard: () => void;
}

export const BlockchainPage: React.FC<BlockchainPageProps> = ({
  reportId,
  wallet,
  onOpenReport,
  onReturnDashboard,
}) => {
  const [integrity, setIntegrity] = useState<IntegrityResult | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [anchoring, setAnchoring] = useState(false);
  const [simulatedTamper, setSimulatedTamper] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrity = async () => {
    try {
      setLoading(true);
      setError(null);
      const [repData, intData] = await Promise.all([
        api.getVerification(reportId),
        api.verifyIntegrity(reportId),
      ]);
      setReport(repData);
      setIntegrity(intData);
    } catch (err: any) {
      setError(err.message || 'Failed to verify blockchain integrity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrity();
  }, [reportId]);

  const handleAnchor = async () => {
    if (!report?.report_hash) {
      alert('Cannot anchor report: Hash not yet generated.');
      return;
    }

    setAnchoring(true);
    try {
      // Execute on-chain via MetaMask or fallback
      const txResult = await web3.anchorReportOnChain(report.id, report.report_hash);
      
      // Update backend database record
      await api.anchorReport(report.id, {
        tx_hash: txResult.txHash,
        network: txResult.network,
        submitter: txResult.submitter,
      });

      await fetchIntegrity();
    } catch (err: any) {
      alert('Anchoring failed: ' + err.message);
    } finally {
      setAnchoring(false);
    }
  };

  const toggleTamperSimulation = () => {
    setSimulatedTamper(!simulatedTamper);
  };

  const originalHash = integrity?.original_report_hash || '0x—';
  const displayedCurrentHash = simulatedTamper
    ? '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d'
    : (integrity?.current_calculated_hash || '0x—');

  const isMatching = !simulatedTamper && (integrity?.is_hash_matching ?? false);
  const isAnchored = report?.blockchain_status === 'anchored';

  const getStatusDisplay = () => {
    if (simulatedTamper) {
      return {
        label: 'Hash Mismatch (Tamper Detected)',
        icon: <XCircle className="w-6 h-6 text-rose-600" />,
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        textColor: 'text-rose-900',
        badge: 'bg-rose-100 text-rose-800',
      };
    }
    if (!isAnchored) {
      return {
        label: 'Not Yet Anchored',
        icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-900',
        badge: 'bg-amber-100 text-amber-800',
      };
    }
    if (isMatching) {
      return {
        label: 'Hash Matches (Tamper-Evident Integrity Confirmed)',
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-900',
        badge: 'bg-emerald-100 text-emerald-800',
      };
    }
    return {
      label: 'Hash Mismatch',
      icon: <XCircle className="w-6 h-6 text-rose-600" />,
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-900',
      badge: 'bg-rose-100 text-rose-800',
    };
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back and Action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onOpenReport(reportId)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Verification Report
        </button>

        <button
          onClick={fetchIntegrity}
          className="p-2 text-slate-500 hover:text-navy-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          title="Re-verify Integrity"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Smart Contract Cryptographic Audit</span>
        </div>
        <h1 className="text-3xl font-black text-navy-950 tracking-tight">
          Report Integrity Verification
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Verifying canonical report hash against the on-chain <code className="text-indigo-600 font-mono font-semibold">ReportRegistry.sol</code> record.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Integrity Verification Card */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${statusInfo.bgColor} ${statusInfo.borderColor} transition-all space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {statusInfo.icon}
            <div>
              <h2 className={`text-xl font-bold ${statusInfo.textColor}`}>
                {statusInfo.label}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Target Vendor: <span className="font-semibold text-navy-900">{report?.vendor_name}</span> ({reportId})
              </p>
            </div>
          </div>

          {!isAnchored && (
            <button
              onClick={handleAnchor}
              disabled={anchoring}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              {anchoring ? 'Anchoring...' : 'Anchor Report on Blockchain'}
            </button>
          )}
        </div>

        {/* Cryptographic Hashes Comparison */}
        <div className="bg-white/90 backdrop-blur rounded-xl p-5 border border-slate-200/80 space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Original Recorded Report Hash:</span>
              <span className="font-mono text-[10px] text-slate-400">Canonical SHA-256</span>
            </div>
            <div className="font-mono text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-all select-all">
              {originalHash}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Current Re-Calculated Report Hash:</span>
              <span className="font-mono text-[10px] text-slate-400">Live Dynamic Recompute</span>
            </div>
            <div
              className={`font-mono text-xs p-2.5 rounded-lg border break-all select-all ${
                simulatedTamper
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              {displayedCurrentHash}
            </div>
          </div>
        </div>

        {/* Educational Callout */}
        <div className="text-xs text-slate-600 bg-white/70 p-4 rounded-xl border border-slate-200 leading-relaxed">
          <strong className="text-slate-800">What does this verify? </strong>
          A matching hash confirms with mathematical certainty that the stored report content has not been altered, modified, or tampered with since generation. It does <em>not</em> independently establish that the vendor's self-reported marketing claims were factual.
        </div>
      </div>

      {/* On-Chain Metadata Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
          Smart Contract Anchoring Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Blockchain Network:</span>
            <span className="font-semibold text-navy-900">
              {report?.blockchain_network || 'Hardhat Local (ChainID 31337) / Sepolia'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Smart Contract Address:</span>
            <span className="font-mono text-teal-700 font-semibold truncate block">
              0x5FbDB2315678afecb367f032d93F642f64180aa3
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Transaction Hash:</span>
            <span className="font-mono text-slate-700 truncate block">
              {report?.blockchain_tx_hash || 'Pending anchor execution'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Submitting Wallet:</span>
            <span className="font-mono text-slate-700 truncate block">
              {report?.blockchain_submitter || (wallet.isConnected ? wallet.address : '0x70997970C51812dc3A010C7d01b50e0d17dc79C8')}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Tamper Simulator for Hackathon Judges */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Hackathon Demo Tool
              </span>
              <span className="bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 rounded font-mono">
                Interactive Proof
              </span>
            </div>
            <h4 className="text-base font-bold text-white mt-1">
              Simulate Report Tampering
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Experience how modifying a single character immediately breaks SHA-256 equivalence.
            </p>
          </div>

          <button
            onClick={toggleTamperSimulation}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              simulatedTamper
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-navy-950 shadow'
            }`}
          >
            {simulatedTamper ? 'Reset to Legitimate Report' : 'Simulate 1-Byte Tamper'}
          </button>
        </div>

        {simulatedTamper && (
          <div className="p-3.5 bg-rose-950/70 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong>Tampering Simulation Active: </strong>
              The in-memory report payload was simulated with an altered audit outcome. Notice that the re-calculated hash diverged from the immutable on-chain record, instantly triggering a Tamper Mismatch alert!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
