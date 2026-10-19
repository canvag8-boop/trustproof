// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ReportRegistry
 * @dev Stores tamper-evident hashes of TrustProof vendor verification reports.
 * Emits an event upon anchoring and provides instant verification.
 */
contract ReportRegistry {
    struct Record {
        string reportHash;
        address submitter;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from reportId to its anchored Record
    mapping(string => Record) private reports;

    // Emitted when a verification report hash is permanently anchored
    event ReportAnchored(
        string indexed reportId,
        string reportHash,
        address indexed submitter,
        uint256 timestamp
    );

    error ReportAlreadyAnchored(string reportId);
    error InvalidInput(string reason);

    /**
     * @notice Anchors a deterministic report hash for a given report ID.
     * @param reportId Unique identifier of the verification report.
     * @param reportHash Deterministic cryptographic hash (SHA-256) of canonical report content.
     */
    function anchorReport(string calldata reportId, string calldata reportHash) external {
        if (bytes(reportId).length == 0) revert InvalidInput("reportId cannot be empty");
        if (bytes(reportHash).length == 0) revert InvalidInput("reportHash cannot be empty");
        if (reports[reportId].exists) revert ReportAlreadyAnchored(reportId);

        reports[reportId] = Record({
            reportHash: reportHash,
            submitter: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit ReportAnchored(reportId, reportHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verifies whether a given reportHash matches the anchored hash for reportId.
     * @param reportId Unique identifier of the report.
     * @param reportHash Hash to verify against on-chain record.
     * @return matches True if report exists and hashes match byte-for-byte.
     * @return timestamp Block timestamp when the report was anchored.
     * @return submitter Address that submitted the anchoring transaction.
     */
    function verifyReport(string calldata reportId, string calldata reportHash)
        external
        view
        returns (bool matches, uint256 timestamp, address submitter)
    {
        Record memory rec = reports[reportId];
        if (!rec.exists) {
            return (false, 0, address(0));
        }

        bool isMatch = keccak256(bytes(rec.reportHash)) == keccak256(bytes(reportHash));
        return (isMatch, rec.timestamp, rec.submitter);
    }

    /**
     * @notice Retrieves the anchored record for a given report ID.
     * @param reportId Unique identifier of the report.
     */
    function getReport(string calldata reportId)
        external
        view
        returns (
            string memory reportHash,
            address submitter,
            uint256 timestamp,
            bool exists
        )
    {
        Record memory rec = reports[reportId];
        return (rec.reportHash, rec.submitter, rec.timestamp, rec.exists);
    }
}
