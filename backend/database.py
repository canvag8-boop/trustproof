import sqlite3
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "trustproof.db")

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Verifications master table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS verifications (
        id TEXT PRIMARY KEY,
        vendor_name TEXT NOT NULL,
        website_url TEXT,
        region TEXT,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        assessment TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        completed_at TEXT,
        error_message TEXT,
        report_hash TEXT,
        is_live_research INTEGER DEFAULT 0,
        blockchain_status TEXT DEFAULT 'not_anchored',
        blockchain_tx_hash TEXT,
        blockchain_network TEXT,
        blockchain_submitter TEXT,
        blockchain_anchored_at TEXT
    );
    """)

    # Evidence collected table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evidence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT NOT NULL,
        source_title TEXT NOT NULL,
        source_url TEXT NOT NULL,
        retrieved_at TEXT NOT NULL,
        publication_date TEXT,
        excerpt TEXT NOT NULL,
        claim_supported TEXT NOT NULL,
        FOREIGN KEY (report_id) REFERENCES verifications (id) ON DELETE CASCADE
    );
    """)

    # AI findings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS findings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT NOT NULL,
        inconsistency_title TEXT NOT NULL,
        inconsistency_description TEXT NOT NULL,
        supporting_evidence TEXT NOT NULL,
        why_it_matters TEXT NOT NULL,
        confidence TEXT NOT NULL,
        recommended_human_verification TEXT NOT NULL,
        FOREIGN KEY (report_id) REFERENCES verifications (id) ON DELETE CASCADE
    );
    """)

    # Research progress stages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT NOT NULL,
        stage_index INTEGER NOT NULL,
        stage_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        started_at TEXT,
        completed_at TEXT,
        details TEXT,
        FOREIGN KEY (report_id) REFERENCES verifications (id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    conn.close()

def create_verification(
    report_id: str,
    vendor_name: str,
    website_url: Optional[str] = None,
    region: Optional[str] = None,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    now = datetime.utcnow().isoformat() + "Z"
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO verifications (
            id, vendor_name, website_url, region, notes,
            status, assessment, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'pending', NULL, ?, ?)
    """, (report_id, vendor_name, website_url, region, notes, now, now))

    # Initialize the 6 stages defined in requirements
    stage_names = [
        "Researching public sources with TinyFish",
        "Extracting and normalizing evidence",
        "Comparing claims with AI",
        "Generating the verification report",
        "Preparing the report hash",
        "Recording or verifying the blockchain transaction"
    ]

    for idx, name in enumerate(stage_names, start=1):
        cursor.execute("""
            INSERT INTO stages (report_id, stage_index, stage_name, status)
            VALUES (?, ?, ?, 'pending')
        """, (report_id, idx, name))

    conn.commit()
    conn.close()
    return get_verification(report_id)

def update_stage(report_id: str, stage_index: int, status: str, details: Optional[str] = None):
    now = datetime.utcnow().isoformat() + "Z"
    conn = get_db_connection()
    cursor = conn.cursor()

    if status == 'in_progress':
        cursor.execute("""
            UPDATE stages
            SET status = ?, started_at = COALESCE(started_at, ?), details = COALESCE(?, details)
            WHERE report_id = ? AND stage_index = ?
        """, (status, now, details, report_id, stage_index))
    elif status in ('completed', 'failed'):
        cursor.execute("""
            UPDATE stages
            SET status = ?, completed_at = ?, details = COALESCE(?, details)
            WHERE report_id = ? AND stage_index = ?
        """, (status, now, details, report_id, stage_index))
    else:
        cursor.execute("""
            UPDATE stages
            SET status = ?, details = COALESCE(?, details)
            WHERE report_id = ? AND stage_index = ?
        """, (status, details, report_id, stage_index))

    conn.commit()
    conn.close()

def update_verification_status(
    report_id: str,
    status: str,
    assessment: Optional[str] = None,
    error_message: Optional[str] = None,
    report_hash: Optional[str] = None,
    is_live_research: Optional[bool] = None
):
    now = datetime.utcnow().isoformat() + "Z"
    conn = get_db_connection()
    cursor = conn.cursor()

    completed_at = now if status in ('completed', 'failed') else None

    cursor.execute("""
        UPDATE verifications
        SET status = ?,
            assessment = COALESCE(?, assessment),
            error_message = COALESCE(?, error_message),
            report_hash = COALESCE(?, report_hash),
            is_live_research = COALESCE(?, is_live_research),
            updated_at = ?,
            completed_at = COALESCE(?, completed_at)
        WHERE id = ?
    """, (status, assessment, error_message, report_hash, 1 if is_live_research else (0 if is_live_research is False else None), now, completed_at, report_id))

    conn.commit()
    conn.close()

def update_blockchain_record(
    report_id: str,
    blockchain_status: str,
    tx_hash: Optional[str] = None,
    network: Optional[str] = None,
    submitter: Optional[str] = None
):
    now = datetime.utcnow().isoformat() + "Z"
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE verifications
        SET blockchain_status = ?,
            blockchain_tx_hash = COALESCE(?, blockchain_tx_hash),
            blockchain_network = COALESCE(?, blockchain_network),
            blockchain_submitter = COALESCE(?, blockchain_submitter),
            blockchain_anchored_at = ?,
            updated_at = ?
        WHERE id = ?
    """, (blockchain_status, tx_hash, network, submitter, now, now, report_id))

    conn.commit()
    conn.close()

def save_evidence(report_id: str, evidence_list: List[Dict[str, Any]]):
    conn = get_db_connection()
    cursor = conn.cursor()
    for ev in evidence_list:
        cursor.execute("""
            INSERT INTO evidence (
                report_id, source_title, source_url, retrieved_at, publication_date, excerpt, claim_supported
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            report_id,
            ev.get("source_title", "Unknown Source"),
            ev.get("source_url", ""),
            ev.get("retrieved_at", datetime.utcnow().isoformat() + "Z"),
            ev.get("publication_date"),
            ev.get("excerpt", ""),
            ev.get("claim_supported", "Vendor overview")
        ))
    conn.commit()
    conn.close()

def save_findings(report_id: str, findings_list: List[Dict[str, Any]]):
    conn = get_db_connection()
    cursor = conn.cursor()
    for f in findings_list:
        supporting = f.get("supporting_evidence", "")
        if isinstance(supporting, list):
            supporting = json.dumps(supporting)
        cursor.execute("""
            INSERT INTO findings (
                report_id, inconsistency_title, inconsistency_description, supporting_evidence,
                why_it_matters, confidence, recommended_human_verification
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            report_id,
            f.get("inconsistency_title", "Identified Anomaly"),
            f.get("inconsistency_description", ""),
            str(supporting),
            f.get("why_it_matters", ""),
            f.get("confidence", "Medium"),
            f.get("recommended_human_verification", "Verify with primary source registry")
        ))
    conn.commit()
    conn.close()

def get_verification(report_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM verifications WHERE id = ?", (report_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    report = dict(row)

    # Fetch stages
    cursor.execute("SELECT * FROM stages WHERE report_id = ? ORDER BY stage_index ASC", (report_id,))
    report["stages"] = [dict(s) for s in cursor.fetchall()]

    # Fetch evidence
    cursor.execute("SELECT * FROM evidence WHERE report_id = ? ORDER BY id ASC", (report_id,))
    report["evidence"] = [dict(e) for e in cursor.fetchall()]

    # Fetch findings
    cursor.execute("SELECT * FROM findings WHERE report_id = ? ORDER BY id ASC", (report_id,))
    findings = []
    for f in cursor.fetchall():
        item = dict(f)
        try:
            item["supporting_evidence"] = json.loads(item["supporting_evidence"])
        except Exception:
            pass
        findings.append(item)
    report["findings"] = findings

    conn.close()
    return report

def list_verifications(search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    if search:
        query = "%" + search.strip() + "%"
        cursor.execute("""
            SELECT * FROM verifications
            WHERE vendor_name LIKE ? OR id LIKE ? OR region LIKE ?
            ORDER BY created_at DESC
        """, (query, query, query))
    else:
        cursor.execute("SELECT * FROM verifications ORDER BY created_at DESC")

    rows = cursor.fetchall()
    results = [dict(r) for r in rows]
    conn.close()
    return results

def get_dashboard_metrics() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM verifications")
    total_verifications = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM verifications WHERE status = 'completed'")
    reports_completed = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM verifications 
        WHERE assessment = 'Potential discrepancies found'
    """)
    discrepancies_flagged = cursor.fetchone()[0]

    cursor.execute("SELECT * FROM verifications ORDER BY created_at DESC LIMIT 6")
    recent_history = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return {
        "total_verifications": total_verifications,
        "reports_completed": reports_completed,
        "discrepancies_flagged": discrepancies_flagged,
        "recent_history": recent_history
    }
