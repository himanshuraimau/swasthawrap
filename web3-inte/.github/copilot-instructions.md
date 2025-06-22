<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# SwasthWrap Web3 Medical Records System

This is a Web3-enabled medical records management system built on Base L2 with the following architecture:

## Project Structure
- **Frontend**: React + TypeScript + Vite with Wagmi and RainbowKit for Web3 integration
- **Backend**: Node.js + Express API server with Veramo for DID/VC functionality  
- **Smart Contracts**: Solidity contracts on Base L2 for verifiable medical records
- **Storage**: IPFS for document storage with on-chain hash references

## Key Features
1. **Verifiable Medical Records**: Documents stored on IPFS with verifiable credentials on Base L2
2. **DID-based Identity**: Each user gets a decentralized identity (did:ethr:base:address)
3. **Consent Management**: Blockchain-based consent for data sharing between patients and doctors
4. **Document Verification**: Anyone can verify document authenticity using IPFS CID + record ID
5. **Base L2 Integration**: Low-cost, fast transactions with Ethereum security

## Technology Stack
- **Blockchain**: Base L2 (Ethereum Layer 2)
- **Frontend**: React, TypeScript, Wagmi, RainbowKit, TailwindCSS
- **Backend**: Node.js, Express, Veramo (DID/VC), Ethers.js
- **Storage**: IPFS for documents, Base L2 for metadata
- **Identity**: DID (Decentralized Identifiers) + VC (Verifiable Credentials)

## Development Guidelines
- Use TypeScript throughout the project
- Follow React best practices with hooks and functional components
- Implement proper error handling for Web3 interactions
- Use environment variables for configuration
- Follow security best practices for medical data handling

## File Organization
- `/src/components/` - React components
- `/backend/` - Express API server
- `/contracts/` - Solidity smart contracts
- Each component should be self-contained with proper TypeScript interfaces
