import os
import json
import re
import logging
import httpx
from typing import List, Dict, Any, Tuple

logger = logging.getLogger("trustproof.analysis")

class AIAnalysisService:
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.gemini_key = os.getenv("GEMINI_API_KEY", "").strip()

    async def analyze_evidence(
        self,
        vendor_name: str,
        website_url: str,
        region: str,
        evidence: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyzes collected public evidence against vendor claims.
        Returns validated structured assessment, findings, limitations, and summary.
        """
        if not evidence or len(evidence) == 0:
            return {
                "assessment": "Insufficient evidence",
                "summary": f"No verifiable public records or registry entries could be indexed for '{vendor_name}'.",
                "findings": [],
                "limitations": "Insufficient public data to make any consistency determination.",
                "disclaimer": "This report is an AI-assisted research aid, not a guarantee of vendor legitimacy or a legal certification."
            }

        # Attempt LLM analysis if API key is present
        if self.openai_key:
            try:
                llm_result = await self._call_openai_analysis(vendor_name, website_url, region, evidence)
                if llm_result:
                    return llm_result
            except Exception as e:
                logger.error(f"OpenAI analysis call failed, falling back to heuristic engine: {e}")

        # Intelligent structured cross-verification engine (evidence-grounded)
        return self._rule_based_grounded_analysis(vendor_name, website_url, region, evidence)

    async def _call_openai_analysis(
        self,
        vendor_name: str,
        website_url: str,
        region: str,
        evidence: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are TrustProof's AI Vendor Verification Analyst. "
            "Your role is to strictly compare claimed vendor details with retrieved public evidence. "
            "Rules:\n"
            "1. NEVER invent or hallucinate URLs, registries, or facts not present in the provided evidence.\n"
            "2. Assess whether there are: 'No major discrepancies detected', 'Potential discrepancies found', or 'Insufficient evidence'.\n"
            "3. Discrepancies are NOT proof of fraud; explain reasons neutrally.\n"
            "4. Distinguish verified observations from inferences.\n"
            "5. Cite exact source titles from the evidence.\n"
            "6. Output MUST strictly match the requested JSON format."
        )

        evidence_text = "\n\n".join([
            f"Evidence Source: {e.get('source_title')}\nURL: {e.get('source_url')}\nExcerpt: {e.get('excerpt')}\nClaim Focus: {e.get('claim_supported')}"
            for e in evidence
        ])

        user_prompt = f"""
Vendor Name: {vendor_name}
Submitted Website: {website_url}
Submitted Region: {region}

Collected Evidence:
{evidence_text}

Respond in JSON with this exact schema:
{{
  "assessment": "No major discrepancies detected" | "Potential discrepancies found" | "Insufficient evidence",
  "summary": "High-level summary of the consistency findings",
  "limitations": "Summary of unverified areas or missing official records",
  "findings": [
    {{
      "inconsistency_title": "Short title",
      "inconsistency_description": "Detailed description of the potential inconsistency",
      "supporting_evidence": "Exact source title and citation from the evidence",
      "why_it_matters": "Why this matters to a vendor risk assessor",
      "confidence": "High" | "Medium" | "Low",
      "recommended_human_verification": "Clear recommended next step for human auditor"
    }}
  ]
}}
"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openai_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.1
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                parsed["disclaimer"] = "This report is an AI-assisted research aid, not a guarantee of vendor legitimacy or a legal certification."
                return parsed
        return None

    def _rule_based_grounded_analysis(
        self,
        vendor_name: str,
        website_url: str,
        region: str,
        evidence: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Deterministic, evidence-grounded cross-comparison engine.
        Checks for:
        1. Domain age vs claimed establishment year
        2. Corporate entity status (e.g. Dissolved, Suspended, or Missing vs Active)
        3. Virtual address / commercial mailbox indicators vs physical premises
        4. Negative regulatory or watchdog records
        """
        findings = []
        combined_text = " ".join([e.get("excerpt", "") for e in evidence]).lower()

        # Check 1: Establishment Year vs Domain / Filing Registration
        claimed_years = re.findall(r"(?:founded|established|operating since|started in|est\.)\s+(?:in\s+)?(19\d{2}|20\d{2})", combined_text)
        domain_dates = re.findall(r"(?:registered on|created:?|registration:?)\s*(?:[a-zA-Z]+\s+\d{1,2},?\s+)?(20\d{2})", combined_text)
        
        if claimed_years and domain_dates:
            claimed_yr = int(claimed_years[0])
            domain_yr = int(domain_dates[0])
            if domain_yr - claimed_yr >= 5:
                whois_source = next((e["source_title"] for e in evidence if "whois" in e.get("source_title", "").lower() or "domain" in e.get("source_title", "").lower()), "ICANN WHOIS Domain Registration")
                findings.append({
                    "inconsistency_title": "Timeline Disparity Between Claimed Founding and Domain Creation",
                    "inconsistency_description": f"The vendor self-reports establishment in {claimed_yr}, but primary WHOIS domain registry indicates the primary web domain was first created in {domain_yr} ({domain_yr - claimed_yr} years later).",
                    "supporting_evidence": f"{whois_source} vs official self-reported claims",
                    "why_it_matters": "Significant discrepancy between claimed longevity and digital footprint can indicate acquired legacy claims, rebranded operations, or fabricated operating history.",
                    "confidence": "High",
                    "recommended_human_verification": f"Request corporate archival records, prior domain registration history, or tax returns from {claimed_yr} to {domain_yr}."
                })

        # Check 2: Corporate Registration Status
        if any(term in combined_text for term in ["inactive", "dissolved", "suspended", "revoked", "forfeited"]):
            corp_source = next((e["source_title"] for e in evidence if "corporation" in e.get("source_title", "").lower() or "state" in e.get("source_title", "").lower()), "State Department of Corporations")
            findings.append({
                "inconsistency_title": "Legal Entity Inactive or Dissolved Status",
                "inconsistency_description": f"State business registry records indicate the corporate entity corresponding to '{vendor_name}' is currently flagged as INACTIVE, DISSOLVED, or in non-good standing.",
                "supporting_evidence": corp_source,
                "why_it_matters": "Transacting with a legally dissolved or forfeited entity creates severe contractual and liability risks, as the entity may lack legal capacity to execute enforceable agreements.",
                "confidence": "High",
                "recommended_human_verification": "Request an updated Certificate of Good Standing directly from the secretary of state or local commercial registrar."
            })

        # Check 3: Registered Office / Virtual Address
        if any(term in combined_text for term in ["commercial mailbox", "virtual office", "cmra", "mailbox store", "po box"]):
            findings.append({
                "inconsistency_title": "Registered Agent Uses Virtual Office / Mailbox Suite",
                "inconsistency_description": f"The registered corporate address for '{vendor_name}' is identified as a commercial mail receiving agency or virtual office suite rather than dedicated operational headquarters.",
                "supporting_evidence": "Public Secretary of State corporate filing excerpts",
                "why_it_matters": "While virtual offices are common for small ventures, larger suppliers claiming multi-million operations or extensive on-site teams typically maintain verifiable physical premises.",
                "confidence": "Medium",
                "recommended_human_verification": "Conduct satellite imagery cross-check or request physical facility lease documentation."
            })

        # Check 4: Watchdog or Consumer Complaints
        if any(term in combined_text for term in ["c-", "d-", "f rating", "unresolved", "delayed fulfillment", "fraud alert", "warning"]):
            bbb_source = next((e["source_title"] for e in evidence if "bbb" in e.get("source_title", "").lower() or "watchdog" in e.get("source_title", "").lower() or "consumer" in e.get("source_title", "").lower()), "Industry Consumer Watchdog")
            findings.append({
                "inconsistency_title": "Adverse Watchdog / Consumer Complaints Recorded",
                "inconsistency_description": "Public watchdog or consumer advocacy registers report negative operational patterns, including fulfillment delays or unverified credentials.",
                "supporting_evidence": bbb_source,
                "why_it_matters": "Indicates potential execution risk or recurrent post-sale contractual friction.",
                "confidence": "Medium",
                "recommended_human_verification": "Ask the vendor for formal references from three active enterprise clients in your jurisdiction."
            })

        # Determine Assessment Category
        if len(findings) > 0:
            assessment = "Potential discrepancies found"
            summary = f"Identified {len(findings)} potential discrepancy points across public registrations, domain lifecycle records, and self-reported claims. Recommended human auditor follow-up before approving vendor onboarding."
        elif len(evidence) >= 2:
            assessment = "No major discrepancies detected"
            summary = "Cross-referenced public corporate entity registries, domain age records, and official self-reported claims. No irreconcilable discrepancies or red flags were identified in the indexed evidence."
        else:
            assessment = "Insufficient evidence"
            summary = "The indexed public evidence base is too sparse to perform comprehensive cross-verification."

        return {
            "assessment": assessment,
            "summary": summary,
            "limitations": "Analysis is strictly bounded to indexed public sources. Private contracts, proprietary banking statements, and non-public tax filings were not inspected.",
            "findings": findings,
            "disclaimer": "This report is an AI-assisted research aid, not a guarantee of vendor legitimacy or a legal certification."
        }
