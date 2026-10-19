import {
  VerificationReport,
  DashboardMetrics,
  IntegrityResult,
  ContractInfo
} from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getDashboard(): Promise<DashboardMetrics> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },

  async createVerification(data: {
    vendor_name: string;
    website_url?: string;
    region?: string;
    notes?: string;
  }): Promise<{ report_id: string; status: string; message: string }> {
    const res = await fetch(`${API_BASE}/verifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to initialize verification');
    }
    return res.json();
  },

  async getVerifications(search?: string): Promise<VerificationReport[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/verifications${query}`);
    if (!res.ok) throw new Error('Failed to fetch verifications');
    return res.json();
  },

  async getVerification(reportId: string): Promise<VerificationReport> {
    const res = await fetch(`${API_BASE}/verifications/${reportId}`);
    if (!res.ok) throw new Error('Failed to fetch verification report');
    return res.json();
  },

  async anchorReport(
    reportId: string,
    data?: { tx_hash?: string; network?: string; submitter?: string }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/verifications/${reportId}/anchor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to anchor report');
    }
    return res.json();
  },

  async verifyIntegrity(reportId: string): Promise<IntegrityResult> {
    const res = await fetch(`${API_BASE}/verifications/${reportId}/verify-integrity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to verify integrity');
    }
    return res.json();
  },

  async getContractInfo(): Promise<ContractInfo> {
    const res = await fetch(`${API_BASE}/contract`);
    if (!res.ok) throw new Error('Failed to fetch smart contract details');
    return res.json();
  },
};
