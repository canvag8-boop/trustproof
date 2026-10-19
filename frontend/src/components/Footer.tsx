import React from 'react';
import { ShieldCheck, ExternalLink, Github, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-navy-900 tracking-tight">TrustProof</span>
            </div>
            <p className="text-slate-600 text-sm max-w-md leading-relaxed">
              AI + Web3 Vendor Verification Engine for Kritical Hacks 2026. Empowering businesses to audit claims against live public evidence and anchor tamper-evident reports on the blockchain.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Built with TinyFish API, OpenAI LLM, and Ethereum Hardhat</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Workflow Stages</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>1. TinyFish Public Web Crawl</li>
              <li>2. Evidence Normalization</li>
              <li>3. AI Cross-Claim Consistency</li>
              <li>4. Deterministic Canonical Hash</li>
              <li>5. Smart Contract Anchoring</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Resources & Code</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/placeholder/trustproof"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-navy-900 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href="https://tinyfish.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-navy-900 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>TinyFish Web Agent API</span>
                </a>
              </li>
              <li>
                <span className="text-slate-500">Kritical Hacks 2026 Edition</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 TrustProof. Discrepancies flagged are AI-assisted research aids, not legal determinations of fraud.</p>
          <p>Blockchain validates report data integrity, not the truth of external vendor claims.</p>
        </div>
      </div>
    </footer>
  );
};
