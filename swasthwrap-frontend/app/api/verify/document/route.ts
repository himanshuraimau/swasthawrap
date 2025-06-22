import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Import the uploaded records from the upload API
// Note: In a real application, this would be a shared database
let UPLOADED_RECORDS: Map<string, any>
try {
  const uploadModule = require('../medical-records/upload/route')
  UPLOADED_RECORDS = uploadModule.UPLOADED_RECORDS || new Map()
} catch {
  UPLOADED_RECORDS = new Map()
}

// Enhanced mock database of known records for verification
const MOCK_RECORD_DATABASE = [
  {
    recordId: 123456,
    documentCID: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnAQP2bDB',
    userDID: 'did:ethr:baseSepolia:0x742d35c67d391d7f1e43cc2c87bb977b66c9b007',
    documentHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    provider: {
      id: 'apollo-delhi',
      name: 'Apollo Hospital Delhi',
      verified: true,
      trustScore: 98,
      license: 'DL-MED-2019-001'
    },
    recordType: 'lab_report',
    timestamp: '2024-06-20T10:30:00Z',
    patientName: 'John Doe',
    isValid: true,
    verificationScore: 96
  },
  {
    recordId: 234567,
    documentCID: 'QmYFbmhdvpDfWyaTzWj8vWu5k3z2a4Y9U6QjJ4jKN8hGpE',
    userDID: 'did:ethr:baseSepolia:0x8ba1f109551bd432803012645hac136c24f0686e',
    documentHash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567',
    provider: {
      id: 'aiims-delhi',
      name: 'AIIMS New Delhi',
      verified: true,
      trustScore: 100,
      license: 'DL-MED-2018-002'
    },
    recordType: 'prescription',
    timestamp: '2024-06-19T14:15:00Z',
    patientName: 'Jane Smith',
    isValid: true,
    verificationScore: 98
  },
  {
    recordId: 345678,
    documentCID: 'QmZHbmhdvpDfWyaTzWj8vWu5k3z2a4Y9U6QjJ4jKN8hGpF',
    userDID: 'did:ethr:baseSepolia:0x2546bf417bc4c37c9f875f386c7f58d2f0c27772',
    documentHash: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
    provider: {
      id: 'fortis-mumbai',
      name: 'Fortis Hospital Mumbai',
      verified: false, // This one has issues
      trustScore: 45,
      license: 'EXPIRED-2023'
    },
    recordType: 'consultation_notes',
    timestamp: '2024-06-18T09:45:00Z',
    patientName: 'Bob Johnson',
    isValid: false,
    verificationScore: 23
  }
]

// Simulate comprehensive document verification with realistic delays and checks
async function performVerification(documentCID: string, recordId: string, fileHash?: string) {
  // Simulate verification delay based on complexity
  const baseDelay = 1500
  const randomDelay = Math.random() * 2500
  await new Promise(resolve => setTimeout(resolve, baseDelay + randomDelay))
  
  // First check recently uploaded records
  let knownRecord = null
  if (recordId) {
    knownRecord = UPLOADED_RECORDS.get(recordId) || MOCK_RECORD_DATABASE.find(r => r.recordId.toString() === recordId)
  } else if (documentCID) {
    knownRecord = UPLOADED_RECORDS.get(documentCID) || MOCK_RECORD_DATABASE.find(r => r.documentCID === documentCID)
  }
  
  // Initialize verification checks
  let verificationChecks = {
    recordExists: !!knownRecord,
    ipfsIntegrity: false,
    blockchainRecord: false,
    hashMatch: false,
    timestampValid: false,
    signatureValid: false,
    providerValid: false,
    formatValid: false,
    consensusCheck: false,
    cryptoProof: false
  }
  
  let verificationScore = 0
  let status = 'flagged'
  let recommendations: string[] = []
  let warnings: string[] = []
  
  if (knownRecord) {
    console.log('Found known record for verification:', knownRecord.recordId)
    
    // Simulate various checks with realistic probabilities based on record quality
    const baseReliability = knownRecord.provider?.verified ? 0.95 : 0.3
    const trustScoreMultiplier = (knownRecord.provider?.trustScore || 50) / 100
    
    verificationChecks.ipfsIntegrity = Math.random() > (0.05 * (2 - trustScoreMultiplier)) // Higher trust = better integrity
    verificationChecks.blockchainRecord = Math.random() > (0.02 * (2 - trustScoreMultiplier))
    verificationChecks.hashMatch = fileHash ? 
      fileHash === knownRecord.documentHash : 
      Math.random() > (0.1 * (2 - trustScoreMultiplier))
    verificationChecks.timestampValid = Math.random() > (0.05 * (2 - trustScoreMultiplier))
    verificationChecks.signatureValid = Math.random() > (0.08 * (2 - trustScoreMultiplier))
    verificationChecks.providerValid = knownRecord.provider?.verified && Math.random() > 0.05
    verificationChecks.formatValid = Math.random() > (0.03 * (2 - trustScoreMultiplier))
    verificationChecks.consensusCheck = Math.random() > (0.07 * (2 - trustScoreMultiplier))
    verificationChecks.cryptoProof = Math.random() > (0.06 * (2 - trustScoreMultiplier))
    
    // Calculate score based on checks and record quality
    const passedChecks = Object.values(verificationChecks).filter(Boolean).length
    const baseScore = (passedChecks / Object.keys(verificationChecks).length) * 100
    verificationScore = Math.floor(baseScore * trustScoreMultiplier)
    
    // Determine status and provide recommendations
    if (verificationScore >= 90) {
      status = 'verified'
      recommendations.push('Document is fully verified and can be trusted')
      if (knownRecord.provider?.trustScore === 100) {
        recommendations.push('Issued by a top-tier healthcare provider')
      }
    } else if (verificationScore >= 70) {
      status = 'pending'
      recommendations.push('Document requires additional verification')
      if (!verificationChecks.providerValid) {
        warnings.push('Healthcare provider verification failed')
        recommendations.push('Contact the healthcare provider to verify authenticity')
      }
      if (!verificationChecks.hashMatch) {
        warnings.push('Document hash mismatch detected')
        recommendations.push('Document may have been modified')
      }
    } else {
      status = 'flagged'
      warnings.push('Multiple verification checks failed')
      recommendations.push('Do not rely on this document without manual verification')
      if (!knownRecord.provider?.verified) {
        warnings.push('Healthcare provider is not verified in our system')
      }
      if (knownRecord.provider?.trustScore < 50) {
        warnings.push('Healthcare provider has low trust score')
      }
    }
    
    // Additional contextual recommendations
    if (verificationChecks.ipfsIntegrity && verificationChecks.blockchainRecord) {
      recommendations.push('Document storage integrity confirmed')
    }
    
    if (verificationChecks.consensusCheck) {
      recommendations.push('Blockchain consensus verification passed')
    }
    
  } else {
    console.log('No known record found for verification')
    // Unknown record - mostly failed checks
    verificationChecks.ipfsIntegrity = Math.random() > 0.7 // 30% chance
    verificationChecks.blockchainRecord = Math.random() > 0.8 // 20% chance
    verificationChecks.formatValid = Math.random() > 0.3 // 70% chance
    verificationChecks.consensusCheck = Math.random() > 0.9 // 10% chance
    
    const passedChecks = Object.values(verificationChecks).filter(Boolean).length
    verificationScore = Math.floor((passedChecks / Object.keys(verificationChecks).length) * 100)
    status = 'flagged'
    
    warnings.push('Document not found in our verification database')
    warnings.push('Unable to verify document authenticity')
    recommendations.push('Contact the issuing healthcare provider directly')
    recommendations.push('Request a new verified copy of the document')
    
    if (verificationChecks.formatValid) {
      recommendations.push('Document format appears valid')
    }
  }
  
  return {
    knownRecord,
    verificationChecks,
    verificationScore,
    status,
    recommendations,
    warnings
  }
}

export async function POST(request: NextRequest) {
  try {
    const { documentCID, recordId, expectedHash, userAddress, fileData } = await request.json()

    if (!documentCID && !recordId) {
      return NextResponse.json({ error: 'Document CID or Record ID required' }, { status: 400 })
    }

    // If file data is provided, calculate hash for verification
    let calculatedHash: string | undefined
    if (fileData) {
      try {
        // Convert base64 to buffer and calculate hash
        const buffer = Buffer.from(fileData, 'base64')
        calculatedHash = crypto.createHash('sha256').update(buffer).digest('hex')
      } catch (error) {
        console.error('Error calculating file hash:', error)
      }
    }

    // Perform comprehensive verification
    const verificationResult = await performVerification(
      documentCID, 
      recordId, 
      expectedHash || calculatedHash
    )
    
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"
    const isProduction = process.env.NODE_ENV === 'production'
    const networkName = isProduction ? '' : 'sepolia.'
    
    // Generate mock transaction hash for verification record
    const verificationTxHash = `0x${crypto.randomBytes(32).toString('hex')}`
    const blockNumber = 15000000 + Math.floor(Math.random() * 1000000)
    
    // Enhanced response with detailed verification information
    const response = {
      success: true,
      verification: {
        status: verificationResult.status,
        score: verificationResult.verificationScore,
        timestamp: new Date().toISOString(),
        verificationId: `VER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        
        // Detailed check results
        checks: verificationResult.verificationChecks,
        
        // Recommendations and warnings
        recommendations: verificationResult.recommendations,
        warnings: verificationResult.warnings,
        
        // Document information
        document: verificationResult.knownRecord ? {
          recordId: verificationResult.knownRecord.recordId,
          documentCID: verificationResult.knownRecord.documentCID,
          recordType: verificationResult.knownRecord.recordType,
          patientName: verificationResult.knownRecord.patientName,
          issueDate: verificationResult.knownRecord.timestamp,
          provider: verificationResult.knownRecord.provider,
          userDID: verificationResult.knownRecord.userDID
        } : null,
        
        // Blockchain verification details
        blockchain: {
          network: isProduction ? 'Base Mainnet' : 'Base Sepolia',
          contractAddress: contractAddress,
          verificationTxHash: verificationTxHash,
          blockNumber: blockNumber,
          gasUsed: Math.floor(25000 + Math.random() * 15000),
          confirmations: Math.floor(1 + Math.random() * 10)
        },
        
        // Technical details
        technical: {
          hashMatched: verificationResult.verificationChecks.hashMatch,
          calculatedHash: calculatedHash,
          expectedHash: expectedHash,
          ipfsAccessible: verificationResult.verificationChecks.ipfsIntegrity,
          consensusReached: verificationResult.verificationChecks.consensusCheck,
          signatureVerified: verificationResult.verificationChecks.signatureValid
        },
        
        // Provider information
        provider: verificationResult.knownRecord?.provider ? {
          name: verificationResult.knownRecord.provider.name,
          verified: verificationResult.knownRecord.provider.verified,
          trustScore: verificationResult.knownRecord.provider.trustScore,
          license: verificationResult.knownRecord.provider.license,
          id: verificationResult.knownRecord.provider.id
        } : null,
        
        // Additional metadata
        metadata: {
          verificationMethod: 'blockchain_consensus',
          confidenceLevel: verificationResult.verificationScore >= 90 ? 'high' : 
                          verificationResult.verificationScore >= 70 ? 'medium' : 'low',
          riskLevel: verificationResult.verificationScore >= 90 ? 'low' : 
                    verificationResult.verificationScore >= 70 ? 'medium' : 'high',
          nextVerificationDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          verificationCost: '0.0001 ETH'
        }
      },
      
      // URLs for external verification
      urls: {
        baseScanTx: `https://${networkName}basescan.org/tx/${verificationTxHash}`,
        baseScanContract: `https://${networkName}basescan.org/address/${contractAddress}`,
        ipfsGateway: documentCID ? `https://ipfs.io/ipfs/${documentCID}` : null,
        verificationReport: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verification-report/${verificationTxHash}`
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
        verification: {
          status: 'error',
          score: 0,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}
