# Contract Deployment Guide

## ✅ SUCCESSFUL DEPLOYMENT

**Deployment Date**: June 21, 2025  
**Network**: Base Sepolia Testnet  
**Contract Address**: `0x201818D882228B56a0bd51882D1D41fA5D6f349b`  
**Transaction Hash**: `0xa9f6ee36445967388d00f43abc7c3bf7ca061fe90a2d1789adfe4d0d8a1927f8`  
**Deployer Address**: `0x057e7D2757a23E16De14261aEF456E446773f153`

## Contract Verification
✅ **Verified on BaseScan**: [View Contract](https://sepolia.basescan.org/address/0x201818D882228B56a0bd51882D1D41fA5D6f349b#code)

## Contract Features
- ✅ Verifiable Medical Records on IPFS
- ✅ DID-based Identity Management  
- ✅ Consent Management System
- ✅ Document Verification
- ✅ Access Control (Ownable)
- ✅ Reentrancy Protection

## Prerequisites
1. Set up your environment variables in `/contracts/.env`:
   ```
   PRIVATE_KEY=your-private-key (without 0x prefix)
   BASESCAN_API_KEY=your-basescan-api-key (optional, for verification)
   ```

2. Get Base Sepolia ETH from faucet:
   - Visit: https://bridge.base.org/deposit
   - Or use: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

## Deploy Contract

1. Navigate to contracts directory:
   ```bash
   cd contracts
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Deploy to Base Sepolia:
   ```bash
   npx hardhat run scripts/deploy.js --network baseSepolia
   ```

4. Copy the contract address from the output and update:
   - `/backend/.env` - set CONTRACT_ADDRESS
   - `/frontend/.env` - set VITE_CONTRACT_ADDRESS

## Verify Contract (Optional)
If you have a BaseScan API key, the deployment script will automatically verify the contract.

## Test Contract
```bash
npx hardhat test --network baseSepolia
```

## Contract Addresses
- Base Sepolia: TBD (after deployment)
- Base Mainnet: TBD (for production)
