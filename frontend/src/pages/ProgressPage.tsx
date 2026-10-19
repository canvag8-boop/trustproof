import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  Cpu,
  FileCheck2,
  Lock,
  Globe2
} from 'lucide-react';
import { VerificationReport, Stage } from '../types';
import { api } from '../services/api';

interface ProgressPageProps {
  reportId: string;
  onViewReport: (reportId: string) => void;
  onReturnDashboard: () => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  reportId,
  onViewReport,
  onReturnDashboard,
}) => {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    try {
      const data = await api.getVerification(reportId);
      setReport(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error tracking progress');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
    // Poll every 1.5 seconds if report is in-progress
    const interval = setInterval(() => {
      if (!report || report.status === 'pending' || report.status === 'researching' || report.status === 'analyzing') {
        fetchProgress();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [reportId, report?.status]);

  const stagesList = report?.stages || [];
  const isCompleted = report?.status === 'completed';
  const isFailed = report?.status === 'failed';

  const completedCount = stagesList.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / (stagesList.length || 6)) * 100);

  const getStageIcon = (idx: number, status: string) => {
    if (status === 'completed') {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
    if (status === 'in_progress') {
      return <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />;
    }
    if (status === 'failed') {
      return <AlertCircle className="w-5 h-5 text-rose-600" />;
    }
    return <Clock className="w-5 h-5 text-slate-300" />;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
              Report ID: {reportId}
            </span>
            <h1 className="text-2xl font-black text-navy-950 mt-1">
              Verifying: {report?.vendor_name || 'Loading organization...'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {report?.website_url ? `Target Domain: ${report.website_url}` : 'Domain lookup in progress'}
              {report?.region ? ` • Region: ${report.region}` : ''}
            </p>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isFailed
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-teal-50 text-teal-700 border border-teal-200 animate-pulse'
              }`}
            >
              {isCompleted ? 'Verification Complete' : isFailed ? 'Workflow Failed' : 'Real-time Processing'}
            </span>
          </div>
        </div>

        {/* Real Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-600 font-medium">
            <span>Overall Research & Analysis Progress</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-teal-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* 6 Stages Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
          Sequential Workflow Stages
        </div>

        {stagesList.map((st) => {
          const inProgress = st.status === 'in_progress';
          const isDone = st.status === 'completed';
          const isErr = st.status === 'failed';

          return (
            <div
              key={st.stage_index}
              className={`p-5 transition-colors flex items-start gap-4 ${
                inProgress ? 'bg-teal-50/30' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="mt-0.5">{getStageIcon(st.stage_index, st.status)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-navy-900">
                    Stage {st.stage_index}: {st.stage_name}
                  </h2>
                  <span className="text-[11px] font-mono text-slate-400">
                    {st.completed_at ? new Date(st.completed_at).toLocaleTimeString() : (st.started_at ? 'Active' : 'Queued')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1">
                  {st.details || 'Pending prior stage resolution.'}
                </p>

                {inProgress && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-teal-700 font-semibold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                    Executing live backend operation...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onReturnDashboard}
          className="text-xs font-semibold text-slate-600 hover:text-navy-900 transition-colors"
        >
          ← Return to Dashboard
        </button>

        {isCompleted && (
          <button
            onClick={() => onViewReport(reportId)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            View Verification Report
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
