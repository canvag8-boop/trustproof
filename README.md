# TrustProof — AI + Web3 Vendor Verification App
> **Built for Kritical Hacks 2026**  
> *"Verify the evidence. Trust the process."*

TrustProof cross-examines vendor claims against public corporate records via **TinyFish Web Research**, detects factual inconsistencies using **AI**, generates deterministic canonical report hashes, and permanently anchors tamper-evident proofs to an **Ethereum smart contract** (`ReportRegistry.sol`).

---

## 🚀 Key Features

1. **TinyFish Public Web Research**:
   - Integrated with official TinyFish Search (`https://api.search.tinyfish.ai`) and Fetch (`https://api.fetch.tinyfish.ai`) APIs.
   - Extracts timestamped excerpts, domain WHOIS data, and corporate registry records.
   - Clearly labeled demo fallback mode when `TINYFISH_API_KEY` is not provided.
2. **AI Discrepancy & Consistency Analysis**:
   - Cross-references claimed founding years, registered entity standing (active vs dissolved), and physical addresses vs commercial mailbox dropboxes.
   - Outputs structured, evidence-grounded findings with confidence indicators and recommended human audit steps.
   - Strictly strictly strictly eliminates hallucinations: never invents URLs or unregistered entities.
3. **Deterministic Canonical Cryptographic Hash**:
   - Generates sorted, deterministic SHA-256 report digest (`0x...`).
   - Guarantees byte-level repeatability for verifiable audit integrity.
4. **Solidity Smart Contract (`ReportRegistry.sol`)**:
   - Functions: `anchorReport(reportId, reportHash)` and `verifyReport(reportId, reportHash)`.
   - Prevents accidental report overwriting and emits `ReportAnchored` events.
   - Verified with 100% passing Hardhat unit test suite.
5. **Interactive Tamper Simulation & Blockchain Verification**:
   - Recalculates dynamic SHA-256 hash live on demand.
   - Built-in **1-Byte Tamper Simulator** to demonstrate immediate cryptographic mismatch alerting.
6. **Persistent SQLite Database**:
   - Stores vendor audits, 6 sequential stage states, evidence, findings, and on-chain tx hashes across restarts.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS, Lucide React, ethers.js v6
- **Backend**: Python 3.9+, FastAPI, Uvicorn, httpx, SQLite3, Pydantic v2
- **Web Research**: TinyFish Search & Fetch APIs
- **AI Analysis**: OpenAI LLM API / Evidence Grounded Reasoning Engine
- **Smart Contracts**: Solidity 0.8.24, Hardhat, Ethers.js, MetaMask

---

## ⚡ Quick Start Instructions

### Prerequisites
- Node.js v18+ and npm
- Python 3.9+

### 1. Backend Setup
```bash
# In project root:
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn httpx pydantic python-dotenv pytest

# Start FastAPI backend (port 8000)
uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# In frontend directory:
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

### 3. Smart Contract Deployment & Testing
```bash
# In project root:
# Run tests:
npx hardhat test

# Deploy to local Hardhat node or testnet:
npx hardhat run scripts/deploy.js
```

---

## 🧪 Tests Executed

1. **Smart Contract Tests (`test/ReportRegistry.test.js`)**:
   - `✔ should anchor a new report and emit ReportAnchored event`
   - `✔ should verify a matching report hash successfully`
   - `✔ should return matches=false when report hash does not match`
   - `✔ should return matches=false for an unanchored report`
   - `✔ should prevent duplicate anchoring for the same reportId`
   - `✔ should reject empty reportId or reportHash`
   - **Result: 6 / 6 tests passing.**

2. **Backend Unit & API Tests (`backend/test_backend.py`)**:
   - Health check and live mode detection
   - Smart contract info endpoint verification
   - End-to-end verification creation and report retrieval
   - Deterministic SHA-256 canonical hashing & tampering detection
   - Server-Side Request Forgery (SSRF) validation
   - **Result: 5 / 5 tests passing.**

3. **Frontend Production Build**:
   - `tsc && vite build` passed with zero errors.

---

## 🔑 Configuration & Environment Variables

Create `.env` in the root:
```env
# TinyFish Web Research API (Optional: runs realistic demo mode if unset)
TINYFISH_API_KEY=your_key_here

# LLM API (Optional: runs evidence-grounded rule engine if unset)
OPENAI_API_KEY=your_openai_key_here

# Blockchain
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## ⚠️ Important Disclaimers

1. **Neutrality of Discrepancies**: Inconsistencies flagged in this tool indicate variance between self-reported statements and available public records. They do not constitute a legal certification or proof of fraud.
2. **Integrity vs Truth**: Anchoring on the blockchain certifies data integrity (that the audit report has not been tampered with since generation). It does not certify the truth of third-party claims.
