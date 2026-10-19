import pytest
import asyncio
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db, get_verification, create_verification
from backend.report_service import ReportService
from backend.tinyfish_service import TinyFishService

client = TestClient(app)

def setup_module(module):
    init_db()

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "tinyfish_live_mode" in data

def test_contract_info():
    response = client.get("/api/contract")
    assert response.status_code == 200
    data = response.json()
    assert "address" in data
    assert "abi" in data
    assert data["chainId"] == 31337

def test_create_and_fetch_verification():
    # 1. Create verification
    payload = {
        "vendor_name": "Apex Global Logistics",
        "website_url": "https://www.apexlogistics-test.com",
        "region": "California, USA",
        "notes": "Testing supply chain vendor onboarding"
    }
    create_res = client.post("/api/verifications", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert "report_id" in created_data
    report_id = created_data["report_id"]

    # 2. Fetch verification
    get_res = client.get(f"/api/verifications/{report_id}")
    assert get_res.status_code == 200
    rep = get_res.json()
    assert rep["vendor_name"] == "Apex Global Logistics"
    assert rep["website_url"] == "https://www.apexlogistics-test.com"
    assert len(rep["stages"]) == 6

def test_deterministic_hashing():
    sample_report = {
        "id": "rep_test_canon",
        "vendor_name": "Acme Corp",
        "website_url": "https://acme.org",
        "region": "Delaware",
        "created_at": "2026-01-01T12:00:00Z",
        "assessment": "No major discrepancies detected",
        "evidence": [
            {
                "claim_supported": "Corporate registration",
                "excerpt": "Active LLC registered in Delaware",
                "publication_date": "2022-01-01",
                "source_title": "DE Corp Registry",
                "source_url": "https://corp.delaware.gov"
            }
        ],
        "findings": []
    }

    hash1, canonical1 = ReportService.calculate_canonical_hash(sample_report)
    hash2, canonical2 = ReportService.calculate_canonical_hash(sample_report)

    assert hash1.startswith("0x")
    assert len(hash1) == 66
    assert hash1 == hash2
    assert canonical1 == canonical2

    # Verify integrity
    sample_report["report_hash"] = hash1
    integrity = ReportService.verify_report_integrity(sample_report)
    assert integrity["is_hash_matching"] is True

    # Tampering test
    tampered_report = dict(sample_report)
    tampered_report["assessment"] = "Potential discrepancies found"
    tampered_integrity = ReportService.verify_report_integrity(tampered_report)
    assert tampered_integrity["is_hash_matching"] is False
    assert tampered_integrity["verification_status"] == "Hash mismatch"

def test_ssrf_prevention():
    res = client.post("/api/verifications", json={
        "vendor_name": "Intruder Corp",
        "website_url": "http://127.0.0.1:8000/secret"
    })
    assert res.status_code == 400
    assert "restricted" in res.json()["detail"].lower()
