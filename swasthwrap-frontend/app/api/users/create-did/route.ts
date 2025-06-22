import { NextRequest, NextResponse } from 'next/server'
import { isAddress } from 'ethers'

function createUserDID(address: string) {
  const networkName = process.env.NODE_ENV === 'production' ? 'base' : 'baseSepolia'
  return `did:ethr:${networkName}:${address.toLowerCase()}`
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()
    
    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Valid Ethereum address required' }, { status: 400 })
    }

    const did = createUserDID(address)
    
    return NextResponse.json({
      success: true,
      data: {
        address: address.toLowerCase(),
        did: did
      }
    })
  } catch (error) {
    console.error('Create DID error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create DID' },
      { status: 500 }
    )
  }
}
