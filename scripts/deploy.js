import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const { ethers, network } = hre;
  console.log(`Deploying ReportRegistry to network: ${network.name}...`);

  const ReportRegistry = await ethers.getContractFactory("ReportRegistry");
  const registry = await ReportRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log(`ReportRegistry deployed successfully at: ${contractAddress}`);

  // Save address and ABI for frontend and backend use
  const artifactPath = path.resolve(__dirname, "../artifacts/contracts/ReportRegistry.sol/ReportRegistry.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

  const deploymentData = {
    address: contractAddress,
    network: network.name,
    chainId: network.config.chainId || 31337,
    abi: artifact.abi,
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.resolve(__dirname, "../deployments");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${network.name}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  console.log(`Deployment config saved to: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
