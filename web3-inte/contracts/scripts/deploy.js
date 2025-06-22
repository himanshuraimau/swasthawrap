const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying MedicalRecordsRegistry contract...");

  // Get the ContractFactory and Signers
  const MedicalRecordsRegistry = await ethers.getContractFactory("MedicalRecordsRegistry");
  
  // Deploy the contract
  const registry = await MedicalRecordsRegistry.deploy();
  
  // Wait for deployment to finish
  await registry.waitForDeployment();
  
  const contractAddress = await registry.getAddress();
  
  console.log("MedicalRecordsRegistry deployed to:", contractAddress);
  console.log("Transaction hash:", registry.deploymentTransaction().hash);
  
  // Verify contract on Base Sepolia (if API key is provided)
  if (process.env.BASESCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await registry.deploymentTransaction().wait(5);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on BaseScan");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: network.name,
    deploymentHash: registry.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
  };
  
  console.log("\nDeployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\nPlease update your .env files with the contract address:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
