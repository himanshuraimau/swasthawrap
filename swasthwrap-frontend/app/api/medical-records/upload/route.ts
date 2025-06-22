import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Utility function to create DID
function createUserDID(address: string) {
  const networkName = process.env.NODE_ENV === 'production' ? 'base' : 'baseSepolia'
  return `did:ethr:${networkName}:${address.toLowerCase()}`
}

// Utility function to upload to IPFS (mock for now)
async function uploadToIPFS(fileBuffer: Buffer, fileName: string) {
  try {
    // For production, integrate with Web3.Storage
    // For now, create a mock CID based on file hash
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex')
    const mockCID = `Qm${hash.substring(0, 44)}`
    console.log(`Mock IPFS upload: ${fileName} -> ${mockCID}`)
    return mockCID
  } catch (error) {
    console.error('IPFS upload error:', error)
    throw new Error('Failed to upload to IPFS')
  }
}

// Utility function to create simple Verifiable Credential structure
function createVerifiableCredential(
  documentCID: string,
  userDID: string,
  recordType: string,
  metadata: any
) {
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential', 'MedicalRecordCredential'],
    issuer: process.env.ISSUER_DID || 'did:ethr:baseSepolia:swasthwrap',
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: userDID,
      medicalRecord: {
        documentCID: documentCID,
        recordType: recordType,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('document') as File
    const userAddress = formData.get('userAddress') as string
    const recordType = formData.get('recordType') as string
    const authorizedBy = formData.get('authorizedBy') as string
    const notes = formData.get('notes') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!userAddress) {
      return NextResponse.json({ error: 'User address required' }, { status: 400 })
    }

    if (!recordType) {
      return NextResponse.json({ error: 'Record type required' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Create user DID
    const userDID = createUserDID(userAddress)

    // Upload to IPFS
    const documentCID = await uploadToIPFS(fileBuffer, file.name)

    // Create document hash for metadata
    const documentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex')

    const metadata = {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      documentHash: documentHash,
      authorizedBy: authorizedBy || 'Unknown',
      notes: notes || ''
    }

    // Create Verifiable Credential
    const verifiableCredential = createVerifiableCredential(
      documentCID,
      userDID,
      recordType,
      metadata
    )

    // Mock record ID and transaction hash for development
    const recordId = Math.floor(Math.random() * 1000000)
    const mockTxHash = `0x${crypto.randomBytes(32).toString('hex')}`

    return NextResponse.json({
      success: true,
      data: {
        recordId: recordId,
        documentCID: documentCID,
        userDID: userDID,
        recordType: recordType,
        verifiableCredential: verifiableCredential,
        metadata: metadata,
        timestamp: new Date().toISOString(),
        transactionHash: mockTxHash,
        baseScanUrl: `https://${process.env.NODE_ENV === 'production' ? '' : 'sepolia.'}basescan.org/tx/${mockTxHash}`
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
