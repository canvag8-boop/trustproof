import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("ReportRegistry", function () {
  let reportRegistry;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const ReportRegistry = await ethers.getContractFactory("ReportRegistry");
    reportRegistry = await ReportRegistry.deploy();
  });

  it("should anchor a new report and emit ReportAnchored event", async function () {
    const reportId = "rep_test_001";
    const reportHash = "0x4a5f6e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f";

    await expect(reportRegistry.connect(owner).anchorReport(reportId, reportHash))
      .to.emit(reportRegistry, "ReportAnchored")
      .withArgs(reportId, reportHash, owner.address, (await ethers.provider.getBlock("latest")).timestamp + 1);

    const record = await reportRegistry.getReport(reportId);
    expect(record.exists).to.be.true;
    expect(record.reportHash).to.equal(reportHash);
    expect(record.submitter).to.equal(owner.address);
    expect(record.timestamp).to.be.gt(0);
  });

  it("should verify a matching report hash successfully", async function () {
    const reportId = "rep_test_002";
    const reportHash = "0xhash123456789abcdef";

    await reportRegistry.connect(addr1).anchorReport(reportId, reportHash);

    const [matches, timestamp, submitter] = await reportRegistry.verifyReport(reportId, reportHash);
    expect(matches).to.be.true;
    expect(timestamp).to.be.gt(0);
    expect(submitter).to.equal(addr1.address);
  });

  it("should return matches=false when report hash does not match", async function () {
    const reportId = "rep_test_003";
    const originalHash = "0xcorrecthash";
    const tamperedHash = "0xtamperedhash";

    await reportRegistry.connect(owner).anchorReport(reportId, originalHash);

    const [matches, timestamp, submitter] = await reportRegistry.verifyReport(reportId, tamperedHash);
    expect(matches).to.be.false;
    expect(submitter).to.equal(owner.address);
  });

  it("should return matches=false for an unanchored report", async function () {
    const [matches, timestamp, submitter] = await reportRegistry.verifyReport("unanchored_id", "0xhash");
    expect(matches).to.be.false;
    expect(timestamp).to.equal(0n);
    expect(submitter).to.equal(ethers.ZeroAddress);
  });

  it("should prevent duplicate anchoring for the same reportId", async function () {
    const reportId = "rep_test_004";
    const reportHash = "0xhash444";

    await reportRegistry.anchorReport(reportId, reportHash);
    await expect(
      reportRegistry.anchorReport(reportId, reportHash)
    ).to.be.revertedWithCustomError(reportRegistry, "ReportAlreadyAnchored");
  });

  it("should reject empty reportId or reportHash", async function () {
    await expect(
      reportRegistry.anchorReport("", "0xhash")
    ).to.be.revertedWithCustomError(reportRegistry, "InvalidInput");

    await expect(
      reportRegistry.anchorReport("rep_test_005", "")
    ).to.be.revertedWithCustomError(reportRegistry, "InvalidInput");
  });
});
