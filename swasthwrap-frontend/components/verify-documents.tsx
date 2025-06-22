"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, Search, Upload, FileText, Shield, ExternalLink, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WalletConnection, WalletStatus } from '@/components/wallet-connection'
import { useAccount } from 'wagmi'
import type { User } from '@/types'

interface VerificationResult {
  isValid: boolean
  documentHash: string
  onChainHash: string
  timestampOnChain: string
  issuer: string
  recordType: string
  verificationLevel: 'high' | 'medium' | 'low'
  blockNumber: number
  transactionHash: string
  metadata: {
    fileName: string
    fileSize: string
    mimeType: string
    ipfsHash: string
  }
}

interface VerifyDocumentsProps {
  user: User
}

export default function VerifyDocuments({ user }: VerifyDocumentsProps) {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('upload')
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [searchHash, setSearchHash] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      setSelectedFile(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleVerifyFile = async () => {
    if (!selectedFile) return

    setIsVerifying(true)
    
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock verification result
    const mockResult: VerificationResult = {
      isValid: Math.random() > 0.3, // 70% chance of being valid
      documentHash: 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o',
      onChainHash: 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o',
      timestampOnChain: '2024-12-15T10:30:00Z',
      issuer: 'Dr. Sarah Johnson - City Medical Center',
      recordType: 'lab_report',
      verificationLevel: 'high',
      blockNumber: 15432876,
      transactionHash: '0xabc123def456ghi789jkl012mno345pqr678stu901vwx234',
      metadata: {
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        mimeType: selectedFile.type,
        ipfsHash: 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o'
      }
    }

    setVerificationResult(mockResult)
    setIsVerifying(false)
  }

  const handleVerifyHash = async () => {
    if (!searchHash.trim()) return

    setIsVerifying(true)
    
    // Simulate hash verification
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mockResult: VerificationResult = {
      isValid: true,
      documentHash: searchHash,
      onChainHash: searchHash,
      timestampOnChain: '2024-12-10T14:15:00Z',
      issuer: 'Dr. Michael Chen - Health Plus Clinic',
      recordType: 'prescription',
      verificationLevel: 'high',
      blockNumber: 15421543,
      transactionHash: '0xdef789ghi012jkl345mno678pqr901stu234vwx567yza890',
      metadata: {
        fileName: 'prescription_diabetes_medication.pdf',
        fileSize: '1.8 MB',
        mimeType: 'application/pdf',
        ipfsHash: searchHash
      }
    }

    setVerificationResult(mockResult)
    setIsVerifying(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVerificationLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  return (
    <WalletConnection 
      title="Connect Wallet to Verify Documents"
      description="Verify the authenticity of medical documents using blockchain technology"
      requiredFeature="document verification"
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
            <CheckCircle className="mr-3 text-[#3ECF8E]" size={32} />
            Document Verification
          </h2>
          <p className="text-[#A3A3A3] text-lg">
            Verify the authenticity and integrity of medical documents using blockchain technology
          </p>
        </div>
      </motion.div>

      {/* Verification Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
          <CardHeader>
            <CardTitle className="text-white">Verify Medical Document</CardTitle>
            <CardDescription className="text-[#A3A3A3]">
              Upload a document or enter an IPFS hash to verify its authenticity on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-2 w-full bg-[#1F1F1F] border border-[#404040]">
                <TabsTrigger value="upload" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
                  Upload Document
                </TabsTrigger>
                <TabsTrigger value="hash" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
                  Verify by Hash
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-6">
                {/* File Upload */}
                <div className="space-y-3">
                  <Label className="text-white">Select Document to Verify</Label>
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                      dragActive
                        ? 'border-[#3ECF8E] bg-[#3ECF8E]/5'
                        : selectedFile
                        ? 'border-[#3ECF8E] bg-[#3ECF8E]/5'
                        : 'border-[#404040] bg-[#1F1F1F] hover:border-[#3ECF8E]/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileInputChange}
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    />
                    
                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-[#3ECF8E]/20 rounded-2xl flex items-center justify-center mx-auto">
                          <FileText className="text-[#3ECF8E]" size={24} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{selectedFile.name}</p>
                          <p className="text-[#A3A3A3] text-sm">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-[#404040] rounded-2xl flex items-center justify-center mx-auto">
                          <Upload className="text-[#A3A3A3]" size={24} />
                        </div>
                        <div>
                          <p className="text-white font-medium">Drop your document here, or click to browse</p>
                          <p className="text-[#A3A3A3] text-sm">
                            Supports PDF, Images, Word documents
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleVerifyFile}
                  disabled={!selectedFile || isVerifying}
                  className="w-full bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black font-medium h-12 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span className="flex items-center">
                      <div className="animate-spin mr-2 w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                      Verifying Document...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckCircle className="mr-2" size={16} />
                      Verify Document
                    </span>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="hash" className="space-y-6">
                {/* Hash Input */}
                <div className="space-y-3">
                  <Label className="text-white">IPFS Hash or Document ID</Label>
                  <div className="flex space-x-3">
                    <Input
                      value={searchHash}
                      onChange={(e) => setSearchHash(e.target.value)}
                      className="bg-[#1F1F1F] border-[#404040] text-white"
                      placeholder="QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o"
                    />
                    <Button
                      onClick={handleVerifyHash}
                      disabled={!searchHash.trim() || isVerifying}
                      className="bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black font-medium px-6 disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                      ) : (
                        <Search size={16} />
                      )}
                    </Button>
                  </div>
                  <p className="text-[#A3A3A3] text-sm">
                    Enter the IPFS hash or document ID to verify its authenticity and blockchain record
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Verification Result */}
      {verificationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                {verificationResult.isValid ? (
                  <>
                    <CheckCircle className="mr-3 text-green-400" size={24} />
                    Document Verified
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-3 text-red-400" size={24} />
                    Verification Failed
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Alert */}
              <Alert className={verificationResult.isValid ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}>
                <AlertDescription className={verificationResult.isValid ? 'text-green-400' : 'text-red-400'}>
                  {verificationResult.isValid 
                    ? 'This document has been successfully verified on the blockchain. The document hash matches the on-chain record and the issuer is authenticated.'
                    : 'This document could not be verified. Either the document has been tampered with or it was never registered on the blockchain.'
                  }
                </AlertDescription>
              </Alert>

              {verificationResult.isValid && (
                <>
                  {/* Verification Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-[#A3A3A3] text-sm">Document Information</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white">File Name:</span>
                            <span className="text-[#A3A3A3]">{verificationResult.metadata.fileName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white">File Size:</span>
                            <span className="text-[#A3A3A3]">{verificationResult.metadata.fileSize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white">MIME Type:</span>
                            <span className="text-[#A3A3A3]">{verificationResult.metadata.mimeType}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-[#A3A3A3] text-sm">Verification Level</Label>
                        <div className="mt-2">
                          <Badge className={getVerificationLevelColor(verificationResult.verificationLevel)}>
                            <Shield size={12} className="mr-1" />
                            {verificationResult.verificationLevel.toUpperCase()} CONFIDENCE
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-[#A3A3A3] text-sm">Blockchain Information</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white">Block Number:</span>
                            <span className="text-[#A3A3A3]">#{verificationResult.blockNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white">Timestamp:</span>
                            <span className="text-[#A3A3A3]">{formatDate(verificationResult.timestampOnChain)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white">Issuer:</span>
                            <span className="text-[#A3A3A3] text-right ml-4">{verificationResult.issuer}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="space-y-4">
                    <Label className="text-[#A3A3A3] text-sm">Technical Details</Label>
                    
                    <div className="space-y-3">
                      <div className="bg-[#1F1F1F] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm font-medium">IPFS Hash</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(verificationResult.metadata.ipfsHash)}
                            className="text-[#A3A3A3] hover:text-white p-1 h-auto"
                          >
                            <Copy size={12} />
                          </Button>
                        </div>
                        <p className="text-[#3ECF8E] font-mono text-xs break-all">{verificationResult.metadata.ipfsHash}</p>
                      </div>
                      
                      <div className="bg-[#1F1F1F] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm font-medium">Transaction Hash</span>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(verificationResult.transactionHash)}
                              className="text-[#A3A3A3] hover:text-white p-1 h-auto"
                            >
                              <Copy size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://sepolia.basescan.org/tx/${verificationResult.transactionHash}`, '_blank')}
                              className="text-[#A3A3A3] hover:text-white p-1 h-auto"
                            >
                              <ExternalLink size={12} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-[#3ECF8E] font-mono text-xs break-all">{verificationResult.transactionHash}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="border-[#404040] text-white hover:border-[#3ECF8E]"
                      onClick={() => window.open(`https://ipfs.io/ipfs/${verificationResult.metadata.ipfsHash}`, '_blank')}
                    >
                      <ExternalLink className="mr-2" size={14} />
                      View on IPFS
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="border-[#404040] text-white hover:border-[#3ECF8E]"
                      onClick={() => window.open(`https://sepolia.basescan.org/tx/${verificationResult.transactionHash}`, '_blank')}
                    >
                      <ExternalLink className="mr-2" size={14} />
                      View on BaseScan
                    </Button>
                    
                    <Button
                      className="bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] text-black"
                      onClick={() => {
                        // Generate verification report
                        const report = {
                          verified: verificationResult.isValid,
                          document: verificationResult.metadata.fileName,
                          verificationTime: new Date().toISOString(),
                          blockchainTimestamp: verificationResult.timestampOnChain,
                          transactionHash: verificationResult.transactionHash,
                          issuer: verificationResult.issuer
                        }
                        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'verification-report.json'
                        a.click()
                      }}
                    >
                      <FileText className="mr-2" size={14} />
                      Download Report
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
          <CardHeader>
            <CardTitle className="text-white">How Document Verification Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Upload className="text-blue-400" size={24} />
                </div>
                <h3 className="text-white font-medium">1. Document Upload</h3>
                <p className="text-[#A3A3A3] text-sm">
                  Upload your medical document or provide the IPFS hash for verification
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Search className="text-purple-400" size={24} />
                </div>
                <h3 className="text-white font-medium">2. Blockchain Lookup</h3>
                <p className="text-[#A3A3A3] text-sm">
                  We check the Base blockchain for matching document hashes and verifiable credentials
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle className="text-green-400" size={24} />
                </div>
                <h3 className="text-white font-medium">3. Verification Result</h3>
                <p className="text-[#A3A3A3] text-sm">
                  Get instant verification of document authenticity and issuer credentials
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </WalletConnection>
  )
}
