const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const address = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(address);
  
  console.log("Wallet address:", address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("Balance (wei):", balance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
