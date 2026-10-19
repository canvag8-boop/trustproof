import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Search,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Hash
} from 'lucide-react';
import { DashboardMetrics, VerificationReport } from '../types';
import { api } from '../services/api';

interface DashboardPageProps {
  onStartNew: () => void;
  onOpenReport: (reportId: string) => void;
  onOpenVerify: (reportId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartNew,
  onOpenReport,
  onOpenVerify,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickVendor, setQuickVendor] = useState('');
  const [quickUrl, setQuickUrl] = useState('');
  const [quickRegion, setQuickRegion] = useState('');
  const [startingQuick, setStartingQuick] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboard();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickVendor.trim()) return;
    setStartingQuick(true);
    try {
      const res = await api.createVerification({
        vendor_name: quickVendor.trim(),
        website_url: quickUrl.trim() || undefined,
        region: quickRegion.trim() || undefined,
      });
      onOpenReport(res.report_id);
    } catch (err: any) {
      alert(err.message);
      setStartingQuick(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case 'analyzing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <Clock className="w-3 h-3" /> Analyzing AI
          </span>
        );
      case 'researching':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Search className="w-3 h-3" /> TinyFish Crawl
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Pending
          </span>
        );
    }
  };

  const getAssessmentBadge = (assessment?: string | null) => {
    if (!assessment) return <span className="text-xs text-slate-400">In Progress</span>;
    if (assessment === 'No major discrepancies detected') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          No Discrepancies
        </span>
      );
    }
    if (assessment === 'Potential discrepancies found') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          Discrepancies Flagged
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        Insufficient Evidence
      </span>
    );
  };

  const filteredHistory = (metrics?.recent_history || []).filter((item) =>
    item.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Verification Dashboard
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Real-time telemetry and audit records stored in TrustProof SQLite repository.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2 text-slate-500 hover:text-navy-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onStartNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            New Verification
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Metrics Row (Calculated from actual DB storage) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Verifications</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-navy-950">
            {loading ? '—' : metrics?.total_verifications ?? 0}
          </div>
          <p className="text-xs text-slate-500 mt-2">All initialized vendor audits</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Reports Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {loading ? '—' : metrics?.reports_completed ?? 0}
          </div>
          <p className="text-xs text-slate-500 mt-2">Fully processed & hashed reports</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Discrepancies Flagged</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">
            {loading ? '—' : metrics?.discrepancies_flagged ?? 0}
          </div>
          <p className="text-xs text-slate-500 mt-2">Vendors with potential anomalies</p>
        </div>
      </div>

      {/* Quick Start Mini Form */}
      <div className="bg-gradient-to-br from-white to-slate-50/70 p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-navy-900 mb-1 flex items-center gap-2">
          <Search className="w-4 h-4 text-teal-600" />
          Quick Vendor Verification
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Submit an organization name to start the live TinyFish crawl and AI cross-check pipeline.
        </p>

        <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              required
              placeholder="Vendor or organization name (e.g. Apex Logistics)"
              value={quickVendor}
              onChange={(e) => setQuickVendor(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Website URL (optional)"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={startingQuick || !quickVendor.trim()}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {startingQuick ? 'Initializing...' : 'Start Verification'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Recent Verification History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-navy-950">Recent Verification History</h2>
            <p className="text-xs text-slate-500">Live records retrieved from SQLite database</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search recent reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-teal-500"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm">No verification reports found in database.</p>
            <button
              onClick={onStartNew}
              className="px-4 py-2 text-xs font-semibold bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 border border-teal-200 transition-all"
            >
              Run First Verification
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Vendor</th>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assessment</th>
                  <th className="py-3 px-4">Blockchain</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-navy-950">
                      <div>{rep.vendor_name}</div>
                      {rep.website_url && (
                        <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                          {rep.website_url}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {rep.id}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(rep.status)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getAssessmentBadge(rep.assessment)}
                    </td>
                    <td className="py-3.5 px-4">
                      {rep.blockchain_status === 'anchored' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          <Hash className="w-3 h-3" /> Anchored
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not anchored</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => onOpenReport(rep.id)}
                        className="px-2.5 py-1 text-slate-700 hover:text-navy-950 bg-slate-100 hover:bg-slate-200 rounded font-medium transition-all"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onOpenVerify(rep.id)}
                        className="px-2.5 py-1 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded font-medium transition-all"
                      >
                        Integrity
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
