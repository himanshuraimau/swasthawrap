import { NextRequest, NextResponse } from 'next/server'
import { isAddress } from 'ethers'

function createUserDID(address: string) {
  const networkName = process.env.NODE_ENV === 'production' ? 'base' : 'baseSepolia'
  return `did:ethr:${networkName}:${address.toLowerCase()}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userAddress: string } }
) {
  try {
    const { userAddress } = params

    if (!userAddress || !isAddress(userAddress)) {
      return NextResponse.json({ error: 'Valid user address required' }, { status: 400 })
    }

    const userDID = createUserDID(userAddress)

    // Mock records for demo - in production, these would come from the blockchain
    const mockRecords = [
      {
        recordId: 1,
        documentCID: "QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnAQP2bDB",
        userDID: userDID,
        recordType: "lab_report",
        timestamp: "2024-06-20T10:30:00Z",
        authorizedBy: "0x742d35c67d391d7f1e43cc2c87bb977b66c9b007",
        isActive: true,
        metadataHash: "0x1234567890abcdef",
        metadata: {
          fileName: "blood_test_report.pdf",
          fileSize: 245760,
          mimeType: "application/pdf"
        }
      },
      {
        recordId: 2,
        documentCID: "QmYFbmhdvpDfWyaTzWj8vWu5k3z2a4Y9U6QjJ4jKN8hGpE",
        userDID: userDID,
        recordType: "prescription",
        timestamp: "2024-06-19T14:15:00Z",
        authorizedBy: "0x742d35c67d391d7f1e43cc2c87bb977b66c9b007",
        isActive: true,
        metadataHash: "0x9876543210fedcba",
        metadata: {
          fileName: "prescription_antibiotics.pdf",
          fileSize: 123456,
          mimeType: "application/pdf"
        }
      },
      {
        recordId: 3,
        documentCID: "QmZFcmhdvpDfWyaTzWj8vWu5k3z2a4Y9U6QjJ4jKN8hXpF",
        userDID: userDID,
        recordType: "medical_imaging",
        timestamp: "2024-06-18T09:00:00Z",
        authorizedBy: "0x742d35c67d391d7f1e43cc2c87bb977b66c9b007",
        isActive: true,
        metadataHash: "0xabcdef1234567890",
        metadata: {
          fileName: "chest_xray.dcm",
          fileSize: 2048000,
          mimeType: "application/dicom"
        }
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        userDID: userDID,
        totalRecords: mockRecords.length,
        records: mockRecords
      }
    })

  } catch (error) {
    console.error('Get records error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get records' },
      { status: 500 }
    )
  }
}
