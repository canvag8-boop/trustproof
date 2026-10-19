export type AssessmentType = 
  | 'No major discrepancies detected'
  | 'Potential discrepancies found'
  | 'Insufficient evidence';

export type VerificationStatus = 
  | 'pending'
  | 'researching'
  | 'analyzing'
  | 'completed'
  | 'failed';

export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Stage {
  id?: number;
  stage_index: number;
  stage_name: string;
  status: StageStatus;
  started_at?: string;
  completed_at?: string;
  details?: string;
}

export interface Evidence {
  id?: number;
  source_title: string;
  source_url: string;
  retrieved_at: string;
  publication_date?: string | null;
  excerpt: string;
  claim_supported: string;
}

export interface Finding {
  id?: number;
  inconsistency_title: string;
  inconsistency_description: string;
  supporting_evidence: string;
  why_it_matters: string;
  confidence: 'High' | 'Medium' | 'Low';
  recommended_human_verification: string;
}

export interface VerificationReport {
  id: string;
  vendor_name: string;
  website_url?: string | null;
  region?: string | null;
  notes?: string | null;
  status: VerificationStatus;
  assessment?: AssessmentType | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  error_message?: string | null;
  report_hash?: string | null;
  is_live_research?: boolean | number;
  blockchain_status: 'not_anchored' | 'anchored' | 'mismatch' | 'failed';
  blockchain_tx_hash?: string | null;
  blockchain_network?: string | null;
  blockchain_submitter?: string | null;
  blockchain_anchored_at?: string | null;
  stages?: Stage[];
  evidence?: Evidence[];
  findings?: Finding[];
}

export interface DashboardMetrics {
  total_verifications: number;
  reports_completed: number;
  discrepancies_flagged: number;
  recent_history: VerificationReport[];
}

export interface IntegrityResult {
  report_id: string;
  original_report_hash: string | null;
  current_calculated_hash: string;
  is_hash_matching: boolean;
  verification_status: string;
  blockchain_status: string;
  network: string;
  transaction_hash?: string | null;
  submitting_wallet?: string | null;
  anchored_timestamp?: string | null;
  explanation: string;
  canonical_json_sample?: string;
}

export interface ContractInfo {
  address: string;
  network: string;
  chainId: number;
  abi: any[];
}
