# SwasthWrap - Web3 Medical Records System

A comprehensive Web3-enabled medical records management system built on Base L2, featuring IPFS storage, DID-based identity, and verifiable credentials for secure, transparent, and patient-controlled healthcare data.

## 🌟 Features

### 🔐 Verifiable Medical Records
- Documents stored securely on IPFS with verifiable credentials anchored on Base L2
- Cryptographic proofs ensure document authenticity and integrity
- Immutable audit trail for all medical records

### 🆔 DID-based Identity
- Each user gets a decentralized identity (did:ethr:base:address)
- Self-sovereign identity management
- No central authority controls your medical data

### 🤝 Consent Management
- Blockchain-based consent for data sharing between patients and doctors
- Granular control over which record types can be accessed
- Time-based consent expiration with automatic revocation

### ✅ Document Verification
- Anyone can verify document authenticity using IPFS CID + record ID
- Public auditability without exposing private data
- Real-time verification on Base L2 blockchain

### ⚡ Base L2 Integration
- Low-cost, fast transactions with Ethereum security
- EVM-compatible smart contracts
- Scalable for healthcare institutions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │  Base L2 Network │
│   + RainbowKit   │◄──►│   + Veramo DID   │◄──►│   + Smart       │
│   + Wagmi        │    │   + Express API  │    │     Contracts   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                         │                         │
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Wallet   │    │  IPFS Storage   │    │  Verifiable     │
│   (MetaMask)    │    │  (Documents)    │    │  Credentials    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web3-inte
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install smart contract dependencies
   cd ../contracts
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp backend/.env.example backend/.env
   
   # Edit the environment variables with your values
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Frontend (React + Vite)
   npm run dev
   
   # Terminal 2: Backend (Express API)
   cd backend
   npm run dev
   
   # Terminal 3: Smart Contracts (optional - for development)
   cd contracts
   npx hardhat node
   ```

## 🔧 Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Wagmi** - React hooks for Ethereum
- **RainbowKit** - Beautiful wallet connection
- **TailwindCSS** - Utility-first CSS framework

### Backend
- **Node.js + Express** - API server
- **Veramo** - DID and Verifiable Credentials
- **Ethers.js** - Ethereum interaction
- **Multer** - File upload handling

### Blockchain
- **Base L2** - Ethereum Layer 2 network
- **Solidity** - Smart contract development
- **Hardhat** - Development environment
- **OpenZeppelin** - Security and standards

### Storage & Identity
- **IPFS** - Decentralized file storage
- **DIDs** - Decentralized identifiers
- **Verifiable Credentials** - W3C standard

## 🚢 Quick Start

1. **Start the frontend:**
   ```bash
   npm run dev
   ```

2. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

4. **Connect your wallet and start uploading medical records!**

## 📱 Usage

1. **Connect Your Wallet** - Click "Connect Wallet" and select MetaMask
2. **Upload Medical Records** - Navigate to "Upload Record" and select your document
3. **Manage Consent** - Use "Consent Management" to grant access to doctors
4. **Verify Documents** - Anyone can verify authenticity using IPFS CID + Record ID

## 🔗 Key Components

- **Dashboard** - Overview of your medical records and recent activity
- **Upload Record** - Secure document upload to IPFS with Base L2 anchoring
- **Records List** - View and manage all your medical records
- **Consent Management** - Grant and revoke data access permissions
- **Document Verification** - Verify document authenticity on the blockchain

## 🌐 Networks

- **Base Sepolia (Testnet)** - Chain ID: 84532
- **Base Mainnet** - Chain ID: 8453

## 📄 License

MIT License - see LICENSE file for details.

---

**Built for the future of healthcare data ownership with Web3 technology**
