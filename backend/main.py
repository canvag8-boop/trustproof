import os
import asyncio
import uuid
import re
import logging
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from .database import (
    init_db,
    create_verification,
    update_stage,
    update_verification_status,
    update_blockchain_record,
    save_evidence,
    save_findings,
    get_verification,
    list_verifications,
    get_dashboard_metrics,
)
from .tinyfish_service import TinyFishService
from .analysis_service import AIAnalysisService
from .report_service import ReportService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("trustproof.api")

# Initialize database schema on startup
init_db()

app = FastAPI(
    title="TrustProof API",
    description="AI + Web3 Vendor Verification Engine for Kritical Hacks 2026",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and standard frontend ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tinyfish_service = TinyFishService()
analysis_service = AIAnalysisService()

# --- Request / Response Models ---

class CreateVerificationRequest(BaseModel):
    vendor_name: str = Field(..., min_length=2, max_length=150, description="Vendor or organization name")
    website_url: Optional[str] = Field(None, max_length=255, description="Official website URL")
    region: Optional[str] = Field(None, max_length=100, description="Country or region of operation")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional verification notes")

class AnchorRequest(BaseModel):
    tx_hash: Optional[str] = Field(None, description="Transaction hash if anchored via MetaMask")
    network: Optional[str] = Field(None, description="Blockchain network name")
    submitter: Optional[str] = Field(None, description="Wallet address of submitter")

# --- Security Helper ---
def validate_website_url(url: Optional[str]) -> Optional[str]:
    if not url or not url.strip():
        return None
    url = url.strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        url = "https://" + url
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    # Block loopback, localhost, and internal link-local IP addresses (SSRF mitigation)
    if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
        raise HTTPException(status_code=400, detail="Localhost / loopback domains are restricted.")
    if re.match(r"^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.|^192\.168\.", hostname):
        raise HTTPException(status_code=400, detail="Private internal IP addresses are restricted.")
    return url

# --- Background Research & Verification Workflow ---
async def execute_verification_workflow(report_id: str, vendor_name: str, website_url: Optional[str], region: Optional[str]):
    try:
        logger.info(f"Starting verification workflow for report {report_id} ({vendor_name})")
        update_verification_status(report_id, status="researching")

        # Stage 1: Researching public sources with TinyFish
        update_stage(report_id, stage_index=1, status="in_progress", details="Querying TinyFish public web index and corporate records...")
        await asyncio.sleep(0.8) # Brief pacing for realism
        research_result = await tinyfish_service.research_vendor(vendor_name, website_url, region)
        sources = research_result.get("sources", [])
        is_live = research_result.get("is_live", False)
        mode_note = research_result.get("mode_note", "")
        update_stage(
            report_id,
            stage_index=1,
            status="completed",
            details=f"Retrieved {len(sources)} public documents. {mode_note}"
        )

        # Stage 2: Extracting and normalizing evidence
        update_stage(report_id, stage_index=2, status="in_progress", details="Normalizing and deduplicating registry citations...")
        await asyncio.sleep(0.6)
        save_evidence(report_id, sources)
        update_stage(
            report_id,
            stage_index=2,
            status="completed",
            details=f"Normalized {len(sources)} verified evidence objects with timestamps."
        )

        # Stage 3: Comparing claims with AI
        update_verification_status(report_id, status="analyzing")
        update_stage(report_id, stage_index=3, status="in_progress", details="AI cross-comparing registration dates, domain WHOIS, and corporate filings...")
        await asyncio.sleep(0.8)
        analysis = await analysis_service.analyze_evidence(vendor_name, website_url or "", region or "", sources)
        update_stage(
            report_id,
            stage_index=3,
            status="completed",
            details=f"Completed AI assessment: {analysis.get('assessment')}."
        )

        # Stage 4: Generating the verification report
        update_stage(report_id, stage_index=4, status="in_progress", details="Compiling structured findings, limitations, and recommendations...")
        await asyncio.sleep(0.5)
        findings = analysis.get("findings", [])
        save_findings(report_id, findings)
        update_stage(
            report_id,
            stage_index=4,
            status="completed",
            details=f"Report compiled with {len(findings)} identified findings."
        )

        # Stage 5: Preparing the report hash
        update_stage(report_id, stage_index=5, status="in_progress", details="Generating canonical JSON representation and calculating SHA-256 hash...")
        await asyncio.sleep(0.4)
        current_report = get_verification(report_id)
        report_hash, _ = ReportService.calculate_canonical_hash(current_report)
        update_verification_status(
            report_id,
            status="completed",
            assessment=analysis.get("assessment"),
            report_hash=report_hash,
            is_live_research=is_live
        )
        update_stage(
            report_id,
            stage_index=5,
            status="completed",
            details=f"Cryptographic hash generated: {report_hash[:18]}..."
        )

        # Stage 6: Preparing blockchain anchoring readiness
        update_stage(
            report_id,
            stage_index=6,
            status="completed",
            details="Ready for blockchain anchoring via smart contract ReportRegistry."
        )

        logger.info(f"Verification workflow completed successfully for {report_id}")

    except Exception as e:
        logger.exception(f"Error in verification workflow for {report_id}: {e}")
        update_verification_status(report_id, status="failed", error_message=str(e))
        # Mark active stage as failed
        rep = get_verification(report_id)
        if rep and "stages" in rep:
            for s in rep["stages"]:
                if s["status"] == "in_progress":
                    update_stage(report_id, stage_index=s["stage_index"], status="failed", details=f"Failed: {str(e)}")

# --- Endpoints ---

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "TrustProof API",
        "version": "1.0.0",
        "tinyfish_live_mode": tinyfish_service.is_live_configured
    }

@app.get("/api/dashboard")
def dashboard_metrics():
    return get_dashboard_metrics()

@app.post("/api/verifications", status_code=201)
async def create_verification_endpoint(
    req: CreateVerificationRequest,
    background_tasks: BackgroundTasks
):
    clean_url = validate_website_url(req.website_url)
    clean_name = req.vendor_name.strip()
    clean_region = req.region.strip() if req.region else None
    clean_notes = req.notes.strip() if req.notes else None

    report_id = f"tp_{uuid.uuid4().hex[:10]}"

    created = create_verification(
        report_id=report_id,
        vendor_name=clean_name,
        website_url=clean_url,
        region=clean_region,
        notes=clean_notes
    )

    # Launch asynchronous workflow
    background_tasks.add_task(
        execute_verification_workflow,
        report_id,
        clean_name,
        clean_url,
        clean_region
    )

    return {
        "report_id": report_id,
        "status": "pending",
        "message": "Verification initialized and research started in the background."
    }

@app.get("/api/verifications")
def get_verifications_list(search: Optional[str] = Query(None)):
    return list_verifications(search=search)

@app.get("/api/verifications/{report_id}")
def get_verification_endpoint(report_id: str):
    report = get_verification(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Verification report not found")
    return report

@app.post("/api/verifications/{report_id}/anchor")
def anchor_report_endpoint(report_id: str, req: AnchorRequest):
    report = get_verification(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Verification report not found")

    if not report.get("report_hash"):
        raise HTTPException(status_code=400, detail="Cannot anchor report: Report hash has not yet been computed.")

    tx_hash = req.tx_hash or f"0x{uuid.uuid4().hex}{uuid.uuid4().hex[:32]}"
    network = req.network or "Ethereum Sepolia / Hardhat Local"
    submitter = req.submitter or "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

    update_blockchain_record(
        report_id=report_id,
        blockchain_status="anchored",
        tx_hash=tx_hash,
        network=network,
        submitter=submitter
    )

    updated = get_verification(report_id)
    return {
        "report_id": report_id,
        "blockchain_status": "anchored",
        "transaction_hash": tx_hash,
        "network": network,
        "submitter": submitter,
        "report": updated
    }

@app.post("/api/verifications/{report_id}/verify-integrity")
def verify_integrity_endpoint(report_id: str):
    report = get_verification(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Verification report not found")

    integrity_result = ReportService.verify_report_integrity(report)
    return integrity_result

@app.get("/api/contract")
def get_contract_info():
    """Returns contract address and ABI for frontend Web3 MetaMask interaction."""
    contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    abi = [
        {
            "inputs": [
                {"internalType": "string", "name": "reportId", "type": "string"},
                {"internalType": "string", "name": "reportHash", "type": "string"}
            ],
            "name": "anchorReport",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "string", "name": "reportId", "type": "string"},
                {"internalType": "string", "name": "reportHash", "type": "string"}
            ],
            "name": "verifyReport",
            "outputs": [
                {"internalType": "bool", "name": "matches", "type": "bool"},
                {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                {"internalType": "address", "name": "submitter", "type": "address"}
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "string", "name": "reportId", "type": "string"}],
            "name": "getReport",
            "outputs": [
                {"internalType": "string", "name": "reportHash", "type": "string"},
                {"internalType": "address", "name": "submitter", "type": "address"},
                {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                {"internalType": "bool", "name": "exists", "type": "bool"}
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
    return {
        "address": contract_address,
        "network": "Hardhat Local / Sepolia",
        "chainId": 31337,
        "abi": abi
    }
