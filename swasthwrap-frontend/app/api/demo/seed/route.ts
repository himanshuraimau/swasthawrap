import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Import the uploaded records from the upload API
let UPLOADED_RECORDS: Map<string, any>
try {
  const uploadModule = require('../medical-records/upload/route')
  UPLOADED_RECORDS = uploadModule.UPLOADED_RECORDS || new Map()
} catch {
  UPLOADED_RECORDS = new Map()
}

// Demo data for realistic testing
const DEMO_RECORDS = [
  {
    recordId: 123456,
    documentCID: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnAQP2bDB',
    userDID: 'did:ethr:baseSepolia:0x742d35c67d391d7f1e43cc2c87bb977b66c9b007',
    userAddress: '0x742d35c67d391d7f1e43cc2c87bb977b66c9b007',
    documentHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    provider: {
      id: 'apollo-delhi',
      name: 'Apollo Hospital Delhi',
      verified: true,
      trustScore: 98,
      license: 'DL-MED-2019-001',
      address: '0x742d35c67d391d7f1e43cc2c87bb977b66c9b007'
    },
    recordType: 'lab_report',
    patientName: 'John Doe',
    dateOfService: '2024-06-20',
    timestamp: '2024-06-20T10:30:00Z',
    isValid: true,
    verificationScore: 96,
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    gasUsed: 45230,
    metadata: {
      fileName: 'blood_test_results.pdf',
      fileSize: 1048576, // 1MB
      mimeType: 'application/pdf',
      notes: 'Complete blood count and lipid profile',
      uploadTimestamp: '2024-06-20T10:30:00Z',
      ipfsNode: 'ipfs-node-us-east-1',
      replicationFactor: 3
    }
  },
  {
    recordId: 234567,
    documentCID: 'QmYFbmhdvpDfWyaTzWj8vWu5k3z2a4Y9U6QjJ4jKN8hGpE',
    userDID: 'did:ethr:baseSepolia:0x8ba1f109551bd432803012645hac136c24f0686e',
    userAddress: '0x8ba1f109551bd432803012645hac136c24f0686e',
    documentHash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567',
    provider: {
      id: 'aiims-delhi',
      name: 'AIIMS New Delhi',
      verified: true,
      trustScore: 100,
      license: 'DL-MED-2018-002',
      address: '0x8ba1f109551bd432803012645hac136c24f0686e'
    },
    recordType: 'prescription',
    patientName: 'Jane Smith',
    dateOfService: '2024-06-19',
    timestamp: '2024-06-19T14:15:00Z',
    isValid: true,
    verificationScore: 98,
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    gasUsed: 42150,
    metadata: {
      fileName: 'prescription_antibiotics.pdf',
      fileSize: 524288, // 512KB
      mimeType: 'application/pdf',
      notes: 'Antibiotic treatment for respiratory infection',
      uploadTimestamp: '2024-06-19T14:15:00Z',
      ipfsNode: 'ipfs-node-eu-west-1',
      replicationFactor: 3
    }
  },
  {
    recordId: 345678,
    documentCID: 'QmZHbmhdvpDfWyaTzWj8vWu5k3z2a4Y9U6QjJ4jKN8hGpF',
    userDID: 'did:ethr:baseSepolia:0x2546bf417bc4c37c9f875f386c7f58d2f0c27772',
    userAddress: '0x2546bf417bc4c37c9f875f386c7f58d2f0c27772',
    documentHash: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
    provider: {
      id: 'fortis-mumbai',
      name: 'Fortis Hospital Mumbai',
      verified: false, // This one has issues for testing
      trustScore: 45,
      license: 'EXPIRED-2023',
      address: '0x2546bf417bc4c37c9f875f386c7f58d2f0c27772'
    },
    recordType: 'consultation_notes',
    patientName: 'Bob Johnson',
    dateOfService: '2024-06-18',
    timestamp: '2024-06-18T09:45:00Z',
    isValid: false,
    verificationScore: 23,
    transactionHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    gasUsed: 38420,
    metadata: {
      fileName: 'consultation_cardiac.pdf',
      fileSize: 768432,
      mimeType: 'application/pdf',
      notes: 'Cardiac consultation follow-up',
      uploadTimestamp: '2024-06-18T09:45:00Z',
      ipfsNode: 'ipfs-node-ap-south-1',
      replicationFactor: 2
    }
  },
  {
    recordId: 456789,
    documentCID: 'QmAbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIj',
    userDID: 'did:ethr:baseSepolia:0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
    userAddress: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
    documentHash: 'd4e5f6789012345678901234567890abcdef1234567890abcdef123456789',
    provider: {
      id: 'max-noida',
      name: 'Max Hospital Noida',
      verified: true,
      trustScore: 94,
      license: 'UP-MED-2021-004',
      address: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5'
    },
    recordType: 'medical_imaging',
    patientName: 'Alice Brown',
    dateOfService: '2024-06-17',
    timestamp: '2024-06-17T16:20:00Z',
    isValid: true,
    verificationScore: 92,
    transactionHash: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
    gasUsed: 52340,
    metadata: {
      fileName: 'chest_xray.dcm',
      fileSize: 2097152, // 2MB
      mimeType: 'application/dicom',
      notes: 'Chest X-ray for pneumonia screening',
      uploadTimestamp: '2024-06-17T16:20:00Z',
      ipfsNode: 'ipfs-node-ap-south-1',
      replicationFactor: 4
    }
  },
  {
    recordId: 567890,
    documentCID: 'QmKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrSt',
    userDID: 'did:ethr:baseSepolia:0x1234567890abcdef1234567890abcdef12345678',
    userAddress: '0x1234567890abcdef1234567890abcdef12345678',
    documentHash: 'e5f6789012345678901234567890abcdef1234567890abcdef1234567890a',
    provider: {
      id: 'apollo-delhi',
      name: 'Apollo Hospital Delhi',
      verified: true,
      trustScore: 98,
      license: 'DL-MED-2019-001',
      address: '0x742d35c67d391d7f1e43cc2c87bb977b66c9b007'
    },
    recordType: 'vaccination_record',
    patientName: 'Charlie Wilson',
    dateOfService: '2024-06-16',
    timestamp: '2024-06-16T11:00:00Z',
    isValid: true,
    verificationScore: 97,
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    gasUsed: 41280,
    metadata: {
      fileName: 'covid_vaccination.pdf',
      fileSize: 327680, // 320KB
      mimeType: 'application/pdf',
      notes: 'COVID-19 booster vaccination certificate',
      uploadTimestamp: '2024-06-16T11:00:00Z',
      ipfsNode: 'ipfs-node-us-east-1',
      replicationFactor: 3
    }
  }
]

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'seed') {
      // Clear existing demo records and add new ones
      DEMO_RECORDS.forEach(record => {
        UPLOADED_RECORDS.set(record.recordId.toString(), record)
        UPLOADED_RECORDS.set(record.documentCID, record)
      })

      return NextResponse.json({
        success: true,
        message: `Seeded ${DEMO_RECORDS.length} demo records for testing`,
        data: {
          recordIds: DEMO_RECORDS.map(r => r.recordId),
          documentCIDs: DEMO_RECORDS.map(r => r.documentCID),
          totalRecords: UPLOADED_RECORDS.size
        }
      })
    }

    if (action === 'clear') {
      // Clear all records
      UPLOADED_RECORDS.clear()

      return NextResponse.json({
        success: true,
        message: 'Cleared all demo records',
        data: {
          totalRecords: UPLOADED_RECORDS.size
        }
      })
    }

    if (action === 'list') {
      // List all current records
      const records = Array.from(UPLOADED_RECORDS.values())
        .filter((record, index, arr) => 
          arr.findIndex(r => r.recordId === record.recordId) === index
        ) // Remove duplicates

      return NextResponse.json({
        success: true,
        data: {
          records: records.map(record => ({
            recordId: record.recordId,
            documentCID: record.documentCID,
            patientName: record.patientName,
            provider: record.provider?.name,
            recordType: record.recordType,
            verificationScore: record.verificationScore,
            isValid: record.isValid,
            timestamp: record.timestamp
          })),
          totalRecords: records.length
        }
      })
    }

    return NextResponse.json({
      error: 'Invalid action. Use "seed", "clear", or "list"'
    }, { status: 400 })

  } catch (error) {
    console.error('Demo data seeder error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Demo seeder failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const records = Array.from(UPLOADED_RECORDS.values())
      .filter((record, index, arr) => 
        arr.findIndex(r => r.recordId === record.recordId) === index
      ) // Remove duplicates

    return NextResponse.json({
      success: true,
      data: {
        demoRecords: DEMO_RECORDS.map(record => ({
          recordId: record.recordId,
          documentCID: record.documentCID,
          patientName: record.patientName,
          provider: record.provider?.name,
          recordType: record.recordType,
          verificationScore: record.verificationScore,
          isValid: record.isValid
        })),
        uploadedRecords: records.map(record => ({
          recordId: record.recordId,
          documentCID: record.documentCID,
          patientName: record.patientName,
          provider: record.provider?.name,
          recordType: record.recordType,
          verificationScore: record.verificationScore,
          isValid: record.isValid,
          timestamp: record.timestamp
        })),
        totalRecords: records.length
      }
    })
  } catch (error) {
    console.error('Demo data fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch demo data' },
      { status: 500 }
    )
  }
}
