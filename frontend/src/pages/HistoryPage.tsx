import React, { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Filter
} from 'lucide-react';
import { VerificationReport } from '../types';
import { api } from '../services/api';

interface HistoryPageProps {
  onOpenReport: (reportId: string) => void;
  onOpenVerify: (reportId: string) => void;
  onStartNew: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onOpenReport,
  onOpenVerify,
  onStartNew,
}) => {
  const [reports, setReports] = useState<VerificationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAssessment, setFilterAssessment] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getVerifications(search);
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch verification reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [search]);

  const filteredReports = reports.filter((r) => {
    if (filterAssessment === 'all') return true;
    if (filterAssessment === 'discrepancy') return r.assessment === 'Potential discrepancies found';
    if (filterAssessment === 'clean') return r.assessment === 'No major discrepancies detected';
    if (filterAssessment === 'insufficient') return r.assessment === 'Insufficient evidence';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Verification Reports Archive
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Browse and inspect all past vendor assessments stored in SQLite database.
          </p>
        </div>

        <button
          onClick={onStartNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          New Verification
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by vendor name, region, or report ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterAssessment}
            onChange={(e) => setFilterAssessment(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:bg-white focus:border-teal-500"
          >
            <option value="all">All Assessments</option>
            <option value="discrepancy">Potential Discrepancies</option>
            <option value="clean">No Discrepancies</option>
            <option value="insufficient">Insufficient Evidence</option>
          </select>

          <button
            onClick={fetchReports}
            className="p-2 text-slate-500 hover:text-navy-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-navy-900">No reports found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No verification records match your query. Run a new audit to see live results here.
            </p>
            <button
              onClick={onStartNew}
              className="px-4 py-2 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 transition-all"
            >
              Start New Verification
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Vendor Name</th>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Date Created</th>
                  <th className="py-3 px-4">Assessment</th>
                  <th className="py-3 px-4">Blockchain Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-navy-950 text-sm">{rep.vendor_name}</div>
                      <div className="text-[11px] text-slate-500">
                        {rep.region ? rep.region : (rep.website_url || 'Unspecified region')}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-600">
                      {rep.id}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {new Date(rep.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4">
                      {rep.assessment === 'No major discrepancies detected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> No Discrepancies
                        </span>
                      )}
                      {rep.assessment === 'Potential discrepancies found' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Discrepancies
                        </span>
                      )}
                      {(!rep.assessment || rep.assessment === 'Insufficient evidence') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          Insufficient Evidence
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {rep.blockchain_status === 'anchored' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Lock className="w-3 h-3" /> Anchored
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not anchored</span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => onOpenReport(rep.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-navy-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => onOpenVerify(rep.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                      >
                        Verify Integrity
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
