#!/bin/bash

# SwasthWrap Setup Script
echo "🏥 Setting up SwasthWrap Web3 Medical Records System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Node.js and npm found"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install contract dependencies
echo "📦 Installing contract dependencies..."
cd contracts
npm install
cd ..

# Copy environment files if they don't exist
echo "🔧 Setting up environment files..."

if [ ! -f ".env" ]; then
    cp ".env" ".env.local"
    echo "📝 Please configure .env.local with your settings"
fi

if [ ! -f "backend/.env" ]; then
    echo "📝 Please configure backend/.env with your settings"
fi

if [ ! -f "contracts/.env" ]; then
    echo "📝 Please configure contracts/.env with your private key for deployment"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Configure environment variables:"
echo "   - Frontend: .env"
echo "   - Backend: backend/.env"  
echo "   - Contracts: contracts/.env"
echo ""
echo "2. Start IPFS node (optional for real IPFS):"
echo "   ipfs daemon"
echo ""
echo "3. Deploy smart contract:"
echo "   cd contracts && npx hardhat run scripts/deploy.js --network baseSepolia"
echo ""
echo "4. Start the development servers:"
echo "   npm run dev:full"
echo ""
echo "📚 See README-NEW.md for detailed instructions"
