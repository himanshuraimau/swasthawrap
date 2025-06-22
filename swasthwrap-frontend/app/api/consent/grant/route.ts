import { NextRequest, NextResponse } from 'next/server'
import { isAddress } from 'ethers'
import crypto from 'crypto'

function createUserDID(address: string) {
  const networkName = process.env.NODE_ENV === 'production' ? 'base' : 'baseSepolia'
  return `did:ethr:${networkName}:${address.toLowerCase()}`
}

export async function POST(request: NextRequest) {
  try {
    const { granterAddress, granteeAddress, expiryDays, recordTypes } = await request.json()

    if (!granterAddress || !isAddress(granterAddress)) {
      return NextResponse.json({ error: 'Valid granter address required' }, { status: 400 })
    }

    if (!granteeAddress || !isAddress(granteeAddress)) {
      return NextResponse.json({ error: 'Valid grantee address required' }, { status: 400 })
    }

    if (!recordTypes || !Array.isArray(recordTypes) || recordTypes.length === 0) {
      return NextResponse.json({ error: 'Record types array required' }, { status: 400 })
    }

    const granterDID = createUserDID(granterAddress)
    const granteeDID = createUserDID(granteeAddress)
    
    const expiryTime = new Date()
    expiryTime.setDate(expiryTime.getDate() + (expiryDays || 30))

    // Generate a unique consent key
    const consentKey = crypto.createHash('sha256').update(granterDID + granteeDID + Date.now()).digest('hex')
    
    // Mock transaction hash for development
    const mockTxHash = `0x${crypto.randomBytes(32).toString('hex')}`

    return NextResponse.json({
      success: true,
      data: {
        granterDID: granterDID,
        granteeDID: granteeDID,
        granterAddress: granterAddress.toLowerCase(),
        granteeAddress: granteeAddress.toLowerCase(),
        expiryTime: expiryTime.toISOString(),
        recordTypes: recordTypes,
        consentKey: consentKey,
        transactionHash: mockTxHash,
        baseScanUrl: `https://${process.env.NODE_ENV === 'production' ? '' : 'sepolia.'}basescan.org/tx/${mockTxHash}`,
        status: 'active'
      }
    })

  } catch (error) {
    console.error('Grant consent error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to grant consent' },
      { status: 500 }
    )
  }
}
