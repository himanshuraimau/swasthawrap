import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"
    const isProduction = process.env.NODE_ENV === 'production'
    
    return NextResponse.json({
      success: true,
      data: {
        contractAddress: contractAddress,
        network: isProduction ? 'Base Mainnet' : 'Base Sepolia',
        chainId: isProduction ? 8453 : 84532,
        rpcUrl: isProduction ? 'https://mainnet.base.org' : 'https://sepolia.base.org',
        baseScanUrl: `https://${isProduction ? '' : 'sepolia.'}basescan.org/address/${contractAddress}`,
        explorerName: 'BaseScan',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18
        },
        blockTime: 2, // seconds
        finalityBlocks: 12
      }
    })
  } catch (error) {
    console.error('Contract info error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get contract info' },
      { status: 500 }
    )
  }
}
