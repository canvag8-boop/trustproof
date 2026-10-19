import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Building2,
  Globe,
  MapPin,
  FileText,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

interface NewVerificationPageProps {
  onVerificationStarted: (reportId: string) => void;
  onCancel: () => void;
}

export const NewVerificationPage: React.FC<NewVerificationPageProps> = ({
  onVerificationStarted,
  onCancel,
}) => {
  const [vendorName, setVendorName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [region, setRegion] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) {
      setError('Vendor or organization name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.createVerification({
        vendor_name: vendorName.trim(),
        website_url: websiteUrl.trim() || undefined,
        region: region.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      onVerificationStarted(res.report_id);
    } catch (err: any) {
      setError(err.message || 'Failed to start verification workflow.');
      setLoading(false);
    }
  };

  const applyPreset = (preset: { name: string; url: string; reg: string; n: string }) => {
    setVendorName(preset.name);
    setWebsiteUrl(preset.url);
    setRegion(preset.reg);
    setNotes(preset.n);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New AI + TinyFish Verification Audit</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">
          Initialize Vendor Verification
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Our backend orchestrates live web research with TinyFish, isolates discrepancies via AI, and stores a tamper-evident hash on the blockchain.
        </p>
      </div>

      {/* Preset Quick Fill Cards */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Test Presets (Click to Auto-Fill)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              applyPreset({
                name: 'Apex Global Logistics LLC',
                url: 'https://apexlogistics-shipping.com',
                reg: 'California, United States',
                n: 'Potential discrepancies demo: founding claims vs WHOIS domain age & virtual address.',
              })
            }
            className="text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-sm transition-all group"
          >
            <div className="text-xs font-bold text-navy-900 group-hover:text-teal-600">
              Apex Global Logistics LLC
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">
              • Demonstrates Discrepancy Findings
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset({
                name: 'Veritas CyberSec Inc',
                url: 'https://veritas-cyberdefense.org',
                reg: 'Delaware, United States',
                n: 'Clean vendor audit: good corporate standing & verifiable domain age.',
              })
            }
            className="text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-sm transition-all group"
          >
            <div className="text-xs font-bold text-navy-900 group-hover:text-teal-600">
              Veritas CyberSec Inc
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              • Demonstrates Clean Verification
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Verification Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
            Vendor or Organization Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="e.g. Acme Corporation LLC"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Official registered name or commercial trade style</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
              Official Website URL <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="https://acme.org"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">TinyFish Fetch API scans corporate claims</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
              Country or Region <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. Delaware, USA or Germany"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Helps target state registry databases</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
            Verification Notes <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <textarea
              rows={3}
              placeholder="e.g. Checking for SOC-2 compliance claim and 2015 establishment date..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !vendorName.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-900 hover:bg-navy-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            {loading ? 'Initializing Backend...' : 'Start Verification'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
