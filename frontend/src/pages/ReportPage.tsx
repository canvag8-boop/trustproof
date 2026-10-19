import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Download,
  Lock,
  ArrowLeft,
  Calendar,
  Globe,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  FileCheck,
  CheckCircle2,
  Share2,
  ChevronRight
} from 'lucide-react';
import { VerificationReport, AssessmentType } from '../types';
import { api } from '../services/api';

interface ReportPageProps {
  reportId: string;
  onOpenVerify: (reportId: string) => void;
  onReturnDashboard: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  reportId,
  onOpenVerify,
  onReturnDashboard,
}) => {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await api.getVerification(reportId);
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  const handleDownloadJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrustProof_${report.vendor_name.replace(/\s+/g, '_')}_${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollToSources = () => {
    sourcesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Retrieving verification report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 max-w-md mx-auto">
          <p className="text-sm font-bold">Failed to load report</p>
          <p className="text-xs mt-1">{error || 'Report not found'}</p>
        </div>
        <button
          onClick={onReturnDashboard}
          className="text-xs font-semibold text-slate-600 hover:text-navy-900"
        >
          ← Return to Dashboard
        </button>
      </div>
    );
  }

  const assessment = report.assessment || 'Insufficient evidence';

  const getAssessmentConfig = (ass: AssessmentType | string) => {
    switch (ass) {
      case 'No major discrepancies detected':
        return {
          title: 'No Major Discrepancies Detected',
          icon: <ShieldCheck className="w-7 h-7 text-emerald-600" />,
          bgColor: 'bg-emerald-50/80',
          borderColor: 'border-emerald-200',
          textColor: 'text-emerald-900',
          badge: 'bg-emerald-100 text-emerald-800',
          summary: 'Cross-referenced state business registrations, domain WHOIS records, and official self-reported claims. No irreconcilable discrepancies were found in available public evidence.',
        };
      case 'Potential discrepancies found':
        return {
          title: 'Potential Discrepancies Found',
          icon: <AlertTriangle className="w-7 h-7 text-amber-600" />,
          bgColor: 'bg-amber-50/80',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-900',
          badge: 'bg-amber-100 text-amber-800',
          summary: 'AI detected inconsistencies between self-reported vendor claims and external corporate registries. Human review is recommended prior to onboarding.',
        };
      default:
        return {
          title: 'Insufficient Evidence',
          icon: <HelpCircle className="w-7 h-7 text-slate-600" />,
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-800',
          badge: 'bg-slate-200 text-slate-700',
          summary: 'Available public registry data is currently insufficient to perform comprehensive cross-verification.',
        };
    }
  };

  const assessmentCfg = getAssessmentConfig(assessment);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back and Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onReturnDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={scrollToSources}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            View Sources ({report.evidence?.length || 0})
          </button>

          <button
            onClick={() => onOpenVerify(report.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            Verify Report Integrity
          </button>

          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download JSON
          </button>
        </div>
      </div>

      {/* Vendor Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Verification Report • {report.id}
              </span>
              {report.is_live_research ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Live TinyFish Crawl
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Demo Evidence Set
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black text-navy-950 tracking-tight">
              {report.vendor_name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-600">
              {report.website_url && (
                <a
                  href={report.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-teal-700 hover:underline font-medium"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {report.website_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {report.region && (
                <span className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {report.region}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(report.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Blockchain Anchor Status Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-right sm:min-w-[200px]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Blockchain Anchor
            </div>
            {report.blockchain_status === 'anchored' ? (
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Lock className="w-3 h-3" /> Anchored On-Chain
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1 truncate max-w-[180px]">
                  {report.blockchain_tx_hash}
                </p>
              </div>
            ) : (
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-slate-600 bg-white border border-slate-200">
                  Ready to Anchor
                </span>
                <button
                  onClick={() => onOpenVerify(report.id)}
                  className="block w-full text-center text-[11px] font-bold text-teal-700 hover:underline mt-1"
                >
                  Anchor Hash Now →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Canonical Hash Display */}
        {report.report_hash && (
          <div className="mt-4 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
            <span className="font-semibold text-slate-700">Canonical SHA-256 Hash:</span>
            <code className="font-mono text-[11px] bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200 break-all select-all">
              {report.report_hash}
            </code>
          </div>
        )}
      </div>

      {/* Assessment Section */}
      <div className={`p-6 sm:p-7 rounded-2xl border ${assessmentCfg.bgColor} ${assessmentCfg.borderColor} transition-all`}>
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-0.5">{assessmentCfg.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className={`text-lg font-bold ${assessmentCfg.textColor}`}>
                {assessmentCfg.title}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${assessmentCfg.badge}`}>
                Verified Classification
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed">
              {assessmentCfg.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100/90 border border-slate-200/90 text-slate-600 text-xs flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Legal & Verification Notice: </span>
          This report is an AI-assisted research aid, not a guarantee of vendor legitimacy or a legal certification. Discrepancies represent differences between self-reported statements and retrieved public records.
        </div>
      </div>

      {/* AI Findings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-navy-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              AI Discrepancy Findings
            </h2>
            <p className="text-xs text-slate-500">
              Cross-examination of public registry records against vendor claims
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {report.findings?.length || 0} Identified
          </span>
        </div>

        {(!report.findings || report.findings.length === 0) ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-navy-900">No Discrepancies Identified</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              The AI comparison found consistent dates, active corporate standing, and verifiable domain registry records across all indexed sources.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {report.findings.map((finding, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-navy-950">
                      {finding.inconsistency_title}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      finding.confidence === 'High'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    Confidence: {finding.confidence}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-8">
                  {finding.inconsistency_description}
                </p>

                <div className="pl-8 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">Supporting Evidence Cited:</span>
                    <span className="text-slate-600">{finding.supporting_evidence}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">Why This Matters:</span>
                    <span className="text-slate-600">{finding.why_it_matters}</span>
                  </div>
                </div>

                <div className="pl-8 pt-1">
                  <div className="p-3 bg-teal-50/60 border border-teal-200/80 rounded-xl text-xs text-teal-900 flex items-start gap-2">
                    <span className="font-bold shrink-0">Recommended Human Audit Step:</span>
                    <span>{finding.recommended_human_verification}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Collected Section */}
      <div ref={sourcesRef} className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-navy-950 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              Evidence Collected ({report.evidence?.length || 0})
            </h2>
            <p className="text-xs text-slate-500">
              Public sources indexed by TinyFish Search & Fetch APIs with timestamped excerpts
            </p>
          </div>
        </div>

        {(!report.evidence || report.evidence.length === 0) ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No external evidence records found.
          </div>
        ) : (
          <div className="space-y-3">
            {report.evidence.map((ev, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-navy-900">
                    {ev.source_title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    {ev.publication_date && <span>Pub: {ev.publication_date}</span>}
                    <span>Retrieved: {new Date(ev.retrieved_at).toLocaleString()}</span>
                  </div>
                </div>

                {ev.source_url && (
                  <div>
                    <a
                      href={ev.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 font-mono break-all"
                    >
                      {ev.source_url}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans">
                  "{ev.excerpt}"
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">Claim Focus:</span>
                  <span>{ev.claim_supported}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
