import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Realistic mock data for different hospitals/clinics
const MOCK_PROVIDERS = [
  { id: 'apollo-delhi', name: 'Apollo Hospital Delhi', address: '0x742d35c67d391d7f1e43cc2c87bb977b66c9b007' },
  { id: 'aiims-delhi', name: 'AIIMS New Delhi', address: '0x8ba1f109551bd432803012645hac136c24f0686e' },
  { id: 'fortis-mumbai', name: 'Fortis Hospital Mumbai', address: '0x2546bf417bc4c37c9f875f386c7f58d2f0c27772' },
  { id: 'max-noida', name: 'Max Hospital Noida', address: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5' }
]

// Utility function to create DID
function createUserDID(address: string) {
  const networkName = process.env.NODE_ENV === 'production' ? 'base' : 'baseSepolia'
  return `did:ethr:${networkName}:${address.toLowerCase()}`
}

// Enhanced mock IPFS upload with realistic simulation
async function uploadToIPFS(fileBuffer: Buffer, fileName: string) {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // Create realistic CID based on file content
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex')
  const mockCID = `Qm${hash.substring(0, 44)}`
  
  console.log(`Mock IPFS upload successful: ${fileName} -> ${mockCID}`)
  return mockCID
}

// Create realistic Verifiable Credential
function createVerifiableCredential(
  documentCID: string,
  userDID: string,
  recordType: string,
  metadata: any,
  provider: any
) {
  const credentialId = `vc:medical:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
  
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
      'https://swasthwrap.com/contexts/medical/v1'
    ],
    id: credentialId,
    type: ['VerifiableCredential', 'MedicalRecordCredential'],
    issuer: {
      id: process.env.ISSUER_DID || 'did:ethr:baseSepolia:0x742d35c67d391d7f1e43cc2c87bb977b66c9b007',
      name: 'SwasthWrap Medical Records Platform'
    },
    issuanceDate: new Date().toISOString(),
    expirationDate: new Date(Date.now() + (10 * 365 * 24 * 60 * 60 * 1000)).toISOString(), // 10 years
    credentialSubject: {
      id: userDID,
      medicalRecord: {
        documentCID: documentCID,
        recordType: recordType,
        timestamp: new Date().toISOString(),
        provider: provider,
        ...metadata
      }
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      verificationMethod: `${process.env.ISSUER_DID || 'did:ethr:baseSepolia:0x742d35c67d391d7f1e43cc2c87bb977b66c9b007'}#key-1`,
      proofPurpose: 'assertionMethod',
      proofValue: `z${crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 43)}`
    }
  }
}

// Mock smart contract interaction with realistic responses
async function mockContractInteraction(documentCID: string, userDID: string, recordType: string, metadata: any) {
  // Simulate blockchain transaction delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
  
  const recordId = Math.floor(Math.random() * 1000000) + 100000
  const mockTxHash = `0x${crypto.randomBytes(32).toString('hex')}`
  const blockNumber = Math.floor(Math.random() * 1000000) + 15000000
  const gasUsed = Math.floor(Math.random() * 50000) + 21000
  
  return {
    recordId,
    transactionHash: mockTxHash,
    blockNumber,
    gasUsed,
    confirmations: Math.floor(Math.random() * 20) + 12
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('document') as File
    const userAddress = formData.get('userAddress') as string
    const recordType = formData.get('recordType') as string
    const providerId = formData.get('providerId') as string
    const notes = formData.get('notes') as string
    const patientName = formData.get('patientName') as string
    const dateOfService = formData.get('dateOfService') as string

    // Validation
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!userAddress) {
      return NextResponse.json({ error: 'User address required' }, { status: 400 })
    }

    if (!recordType) {
      return NextResponse.json({ error: 'Record type required' }, { status: 400 })
    }

    // File size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // File type validation
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/dicom']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload PDF, JPEG, PNG, or DICOM files only.' 
      }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Create user DID
    const userDID = createUserDID(userAddress)

    // Get provider info
    const provider = MOCK_PROVIDERS.find(p => p.id === providerId) || MOCK_PROVIDERS[0]

    // Upload to IPFS (mock)
    const documentCID = await uploadToIPFS(fileBuffer, file.name)

    // Create document hash for integrity
    const documentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex')
    const metadataHash = crypto.createHash('sha256').update(JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    })).digest('hex')

    const metadata = {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      documentHash: documentHash,
      metadataHash: metadataHash,
      patientName: patientName || 'Anonymous',
      dateOfService: dateOfService || new Date().toISOString().split('T')[0],
      notes: notes || '',
      uploadLocation: 'India',
      ipfsGateway: 'https://ipfs.io/ipfs/'
    }

    // Create Verifiable Credential
    const verifiableCredential = createVerifiableCredential(
      documentCID,
      userDID,
      recordType,
      metadata,
      provider
    )

    // Mock smart contract interaction
    const contractResult = await mockContractInteraction(documentCID, userDID, recordType, metadata)

    // Calculate verification score (mock)
    const verificationScore = Math.floor(Math.random() * 20) + 80 // 80-100

    return NextResponse.json({
      success: true,
      data: {
        recordId: contractResult.recordId,
        documentCID: documentCID,
        userDID: userDID,
        recordType: recordType,
        provider: provider,
        verifiableCredential: verifiableCredential,
        metadata: metadata,
        timestamp: new Date().toISOString(),
        blockchain: {
          transactionHash: contractResult.transactionHash,
          blockNumber: contractResult.blockNumber,
          gasUsed: contractResult.gasUsed,
          confirmations: contractResult.confirmations,
          network: process.env.NODE_ENV === 'production' ? 'Base Mainnet' : 'Base Sepolia'
        },
        verification: {
          score: verificationScore,
          status: verificationScore >= 90 ? 'verified' : verificationScore >= 70 ? 'pending' : 'flagged',
          checks: {
            fileIntegrity: true,
            formatValid: true,
            sizeValid: true,
            hashMatch: true,
            providerValid: true
          }
        },
        urls: {
          baseScanUrl: `https://${process.env.NODE_ENV === 'production' ? '' : 'sepolia.'}basescan.org/tx/${contractResult.transactionHash}`,
          ipfsGateway: `https://ipfs.io/ipfs/${documentCID}`,
          credentialUrl: `https://swasthwrap.com/credentials/${verifiableCredential.id}`
        }
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
