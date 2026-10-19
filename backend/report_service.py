import hashlib
import json
from typing import Dict, Any, Tuple
from datetime import datetime

class ReportService:
    @staticmethod
    def create_canonical_payload(report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Constructs a canonical, deterministic dictionary representation of the report content.
        Excludes mutable database IDs, temporary timestamps, or on-chain transaction metadata.
        """
        # Canonicalize evidence
        evidence_list = []
        for e in report_data.get("evidence", []):
            evidence_list.append({
                "claim_supported": str(e.get("claim_supported") or "").strip(),
                "excerpt": str(e.get("excerpt") or "").strip(),
                "publication_date": str(e.get("publication_date") or "").strip(),
                "source_title": str(e.get("source_title") or "").strip(),
                "source_url": str(e.get("source_url") or "").strip(),
            })
        evidence_list.sort(key=lambda x: (x["source_url"], x["source_title"]))

        # Canonicalize findings
        findings_list = []
        for f in report_data.get("findings", []):
            findings_list.append({
                "confidence": str(f.get("confidence") or "").strip(),
                "inconsistency_description": str(f.get("inconsistency_description") or "").strip(),
                "inconsistency_title": str(f.get("inconsistency_title") or "").strip(),
                "recommended_human_verification": str(f.get("recommended_human_verification") or "").strip(),
                "supporting_evidence": str(f.get("supporting_evidence") or "").strip(),
                "why_it_matters": str(f.get("why_it_matters") or "").strip(),
            })
        findings_list.sort(key=lambda x: x["inconsistency_title"])

        canonical = {
            "assessment": str(report_data.get("assessment") or "").strip(),
            "created_at": str(report_data.get("created_at") or "").strip(),
            "disclaimer": "This report is an AI-assisted research aid, not a guarantee of vendor legitimacy or a legal certification.",
            "evidence": evidence_list,
            "findings": findings_list,
            "region": str(report_data.get("region") or "").strip(),
            "report_id": str(report_data.get("id") or report_data.get("report_id") or "").strip(),
            "vendor_name": str(report_data.get("vendor_name") or "").strip(),
            "website_url": str(report_data.get("website_url") or "").strip(),
        }
        return canonical

    @staticmethod
    def calculate_canonical_hash(report_data: Dict[str, Any]) -> Tuple[str, str]:
        """
        Generates canonical JSON string and its deterministic SHA-256 hash prefixed with '0x'.
        """
        canonical_dict = ReportService.create_canonical_payload(report_data)
        canonical_json_str = json.dumps(
            canonical_dict,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=True
        )
        hasher = hashlib.sha256()
        hasher.update(canonical_json_str.encode("utf-8"))
        report_hash = "0x" + hasher.hexdigest()
        return report_hash, canonical_json_str

    @staticmethod
    def verify_report_integrity(report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Recalculates the hash from the current report data and verifies it against the original recorded hash.
        """
        original_hash = report_data.get("report_hash")
        current_hash, canonical_json = ReportService.calculate_canonical_hash(report_data)
        
        blockchain_status = report_data.get("blockchain_status", "not_anchored")
        is_anchored = blockchain_status == "anchored"

        if not original_hash:
            verification_status = "Not yet anchored"
            explanation = "This report has not yet generated an initial canonical cryptographic hash."
            matches = False
        elif original_hash.lower() == current_hash.lower():
            if is_anchored:
                verification_status = "Hash matches"
                explanation = "The current report content exactly matches the original canonical version anchored on the blockchain. Notice: A matching hash confirms data integrity, not the factual accuracy of external vendor claims."
            else:
                verification_status = "Hash matches (off-chain)"
                explanation = "The current report content exactly matches the original recorded hash. It has not yet been anchored to an on-chain smart contract."
            matches = True
        else:
            verification_status = "Hash mismatch"
            explanation = "WARNING: Tamper Alert! The current report contents deviate from the original cryptographic hash record."
            matches = False

        return {
            "report_id": report_data.get("id"),
            "original_report_hash": original_hash,
            "current_calculated_hash": current_hash,
            "is_hash_matching": matches,
            "verification_status": verification_status,
            "blockchain_status": blockchain_status,
            "network": report_data.get("blockchain_network") or "Local Hardhat (ChainID 31337)",
            "transaction_hash": report_data.get("blockchain_tx_hash"),
            "submitting_wallet": report_data.get("blockchain_submitter"),
            "anchored_timestamp": report_data.get("blockchain_anchored_at"),
            "explanation": explanation,
            "canonical_json_sample": canonical_json[:300] + "..." if len(canonical_json) > 300 else canonical_json
        }
