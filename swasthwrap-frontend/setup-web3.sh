#!/bin/bash

# SwasthWrap Web3 Integration Setup Script

echo "🏥 SwasthWrap Web3 Integration Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the swasthwrap-frontend directory"
    exit 1
fi

echo "📦 Installing Web3 dependencies..."
pnpm install

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your actual values:"
    echo "   - NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID"
    echo "   - NEXT_PUBLIC_WEB3_STORAGE_TOKEN"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Get WalletConnect Project ID: https://cloud.walletconnect.com/"
echo "3. Get Web3.Storage Token: https://web3.storage/"
echo "4. Run 'pnpm dev' to start the development server"
echo ""
echo "📖 Full documentation: ../WEB3_INTEGRATION_README.md"
