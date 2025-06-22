"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Database, Shield, ExternalLink, Download, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WalletConnection, WalletStatus } from '@/components/wallet-connection'
import { useAccount } from 'wagmi'
import type { User } from '@/types'

interface Web3Record {
  id: string
  recordId: number
  documentCID: string
  userDID: string
  recordType: string
  fileName: string
  timestamp: string
  txHash: string
  verified: boolean
  size: string
  authorizedBy: string
  metadata: {
    contentType: string
    ipfsHash: string
    baseScanUrl: string
  }
}

interface Web3RecordsProps {
  user: User
}

const mockWeb3Records: Web3Record[] = [
  {
    id: '1',
    recordId: 101,
    documentCID: 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o',
    userDID: 'did:ethr:0x1234...5678',
    recordType: 'lab_report',
    fileName: 'Blood_Test_Results_Dec2024.pdf',
    timestamp: '2024-12-15T10:30:00Z',
    txHash: '0xabc123def456...',
    verified: true,
    size: '2.4 MB',
    authorizedBy: 'Dr. Sarah Johnson',
    metadata: {
      contentType: 'application/pdf',
      ipfsHash: 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o',
      baseScanUrl: 'https://sepolia.basescan.org'
    }
  },
  {
    id: '2',
    recordId: 102,
    documentCID: 'QmXfg9Qjvhb8xYWGh7k3LpD5cRt6YnHf2vQ8xZaB9kP1mN',
    userDID: 'did:ethr:0x1234...5678',
    recordType: 'prescription',
    fileName: 'Prescription_Diabetes_Medication.pdf',
    timestamp: '2024-12-10T14:15:00Z',
    txHash: '0xdef789ghi012...',
    verified: true,
    size: '1.8 MB',
    authorizedBy: 'Dr. Michael Chen',
    metadata: {
      contentType: 'application/pdf',
      ipfsHash: 'QmXfg9Qjvhb8xYWGh7k3LpD5cRt6YnHf2vQ8xZaB9kP1mN',
      baseScanUrl: 'https://sepolia.basescan.org'
    }
  },
  {
    id: '3',
    recordId: 103,
    documentCID: 'QmPqR8sT2uVwX3yZ7A9bC4dE6fG8hI0jK1lM2nO5pQ7rS',
    userDID: 'did:ethr:0x1234...5678',
    recordType: 'medical_image',
    fileName: 'Chest_Xray_Annual_Checkup.dcm',
    timestamp: '2024-12-05T09:45:00Z',
    txHash: '0x123abc456def...',
    verified: true,
    size: '15.6 MB',
    authorizedBy: 'City Medical Center',
    metadata: {
      contentType: 'application/dicom',
      ipfsHash: 'QmPqR8sT2uVwX3yZ7A9bC4dE6fG8hI0jK1lM2nO5pQ7rS',
      baseScanUrl: 'https://sepolia.basescan.org'
    }
  }
]

const recordTypeInfo = {
  lab_report: { label: 'Lab Report', icon: '🧪', color: 'from-blue-500 to-blue-600' },
  prescription: { label: 'Prescription', icon: '💊', color: 'from-green-500 to-green-600' },
  medical_image: { label: 'Medical Image', icon: '🩻', color: 'from-purple-500 to-purple-600' },
  consultation_note: { label: 'Consultation', icon: '📝', color: 'from-orange-500 to-orange-600' },
  vaccination_record: { label: 'Vaccination', icon: '💉', color: 'from-emerald-500 to-emerald-600' },
  discharge_summary: { label: 'Discharge Summary', icon: '🏥', color: 'from-red-500 to-red-600' },
  other: { label: 'Other', icon: '📄', color: 'from-gray-500 to-gray-600' }
}

export default function Web3Records({ user }: Web3RecordsProps) {
  const { address, isConnected } = useAccount()
  const [records, setRecords] = useState<Web3Record[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only load records if wallet is connected
    if (isConnected) {
      // Simulate loading records
      setTimeout(() => {
        setRecords(mockWeb3Records)
        setLoading(false)
      }, 1000)
    }
  }, [isConnected])

  const filteredRecords = activeTab === 'all' 
    ? records 
    : records.filter(record => record.recordType === activeTab)

  const handleViewOnIPFS = (cid: string) => {
    window.open(`https://ipfs.io/ipfs/${cid}`, '_blank')
  }

  const handleViewOnBaseScan = (txHash: string, baseScanUrl: string) => {
    window.open(`${baseScanUrl}/tx/${txHash}`, '_blank')
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <WalletConnection 
      title="Connect Wallet to Access Web3 Records"
      description="View your medical records stored on IPFS and verified on the blockchain"
      requiredFeature="Web3 medical records"
    >
      <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3ECF8E]/20 via-[#262626] to-[#1F1F1F] p-8 border border-[#3ECF8E]/20"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3ECF8E]/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Database className="mr-3 text-[#3ECF8E]" size={32} />
            Web3 Medical Records
          </h2>
          <p className="text-[#A3A3A3] text-lg">
            Your medical documents secured on IPFS and verified on Base blockchain
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A3A3A3] text-sm">Total Records</p>
                  <p className="text-3xl font-bold text-white">{records.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <Database className="text-blue-400" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A3A3A3] text-sm">Verified</p>
                  <p className="text-3xl font-bold text-white">
                    {records.filter(r => r.verified).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="text-green-400" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A3A3A3] text-sm">Total Size</p>
                  <p className="text-3xl font-bold text-white">
                    {(records.reduce((acc, r) => acc + parseFloat(r.size), 0)).toFixed(1)} MB
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <Shield className="text-purple-400" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Records List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
          <CardHeader>
            <CardTitle className="text-white">Medical Records</CardTitle>
            <CardDescription className="text-[#A3A3A3]">
              All your medical documents stored on IPFS with blockchain verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full bg-[#1F1F1F] border border-[#404040]">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
                  All Records
                </TabsTrigger>
                <TabsTrigger value="lab_report" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
                  Lab Reports
                </TabsTrigger>
                <TabsTrigger value="prescription" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
                  Prescriptions
                </TabsTrigger>
                <TabsTrigger value="medical_image" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
                  Medical Images
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-[#1F1F1F] rounded-2xl"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="mx-auto text-[#404040] mb-4" size={48} />
                    <p className="text-white text-lg font-medium mb-2">No Records Found</p>
                    <p className="text-[#A3A3A3] text-sm">
                      {activeTab === 'all' 
                        ? 'Start uploading your medical documents to see them here.'
                        : `No ${recordTypeInfo[activeTab as keyof typeof recordTypeInfo]?.label.toLowerCase()} records found.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRecords.map((record, index) => {
                      const typeInfo = recordTypeInfo[record.recordType as keyof typeof recordTypeInfo] || recordTypeInfo.other
                      
                      return (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-r from-[#1F1F1F] to-[#262626] rounded-2xl p-6 border border-[#404040]/30 hover:border-[#3ECF8E]/30 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className={`w-12 h-12 bg-gradient-to-r ${typeInfo.color} rounded-2xl flex items-center justify-center text-white text-xl`}>
                                {typeInfo.icon}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-white font-medium">{record.fileName}</h3>
                                  {record.verified && (
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                      <CheckCircle size={12} className="mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                  <Badge className={`bg-gradient-to-r ${typeInfo.color} text-white`}>
                                    {typeInfo.label}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-[#A3A3A3]">Size</p>
                                    <p className="text-white">{record.size}</p>
                                  </div>
                                  <div>
                                    <p className="text-[#A3A3A3]">Authorized By</p>
                                    <p className="text-white">{record.authorizedBy}</p>
                                  </div>
                                  <div>
                                    <p className="text-[#A3A3A3]">Upload Date</p>
                                    <p className="text-white">{formatDate(record.timestamp)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[#A3A3A3]">Record ID</p>
                                    <p className="text-white">#{record.recordId}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#404040] text-[#A3A3A3] hover:border-[#3ECF8E] hover:text-white"
                                onClick={() => handleViewOnIPFS(record.documentCID)}
                              >
                                <Eye size={14} className="mr-2" />
                                View on IPFS
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#404040] text-[#A3A3A3] hover:border-[#3ECF8E] hover:text-white"
                                onClick={() => handleViewOnBaseScan(record.txHash, record.metadata.baseScanUrl)}
                              >
                                <ExternalLink size={14} className="mr-2" />
                                BaseScan
                              </Button>
                            </div>
                          </div>
                          
                          {/* Technical Details */}
                          <div className="mt-4 pt-4 border-t border-[#404040]/30">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                              <div>
                                <p className="text-[#A3A3A3] mb-1">IPFS Hash</p>
                                <p className="text-[#3ECF8E] font-mono break-all">{record.documentCID}</p>
                              </div>
                              <div>
                                <p className="text-[#A3A3A3] mb-1">Transaction Hash</p>
                                <p className="text-[#3ECF8E] font-mono break-all">{record.txHash}</p>
                              </div>
                              <div>
                                <p className="text-[#A3A3A3] mb-1">DID</p>
                                <p className="text-[#3ECF8E] font-mono break-all">{record.userDID}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </WalletConnection>
  )
}
