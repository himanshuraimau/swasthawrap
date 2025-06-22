"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Upload, 
  FileText, 
  Shield, 
  ExternalLink, 
  Copy, 
  Clock,
  X,
  Hash,
  UserIcon,
  Building,
  Calendar,
  AlertCircle,
  RefreshCw,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { WalletConnection } from '@/components/wallet-connection'
import { useAccount } from 'wagmi'
import type { User } from '@/types'

interface VerificationResult {
  success: boolean
  verification: {
    status: 'verified' | 'pending' | 'flagged' | 'error'
    score: number
    timestamp: string
    verificationId: string
    checks: {
      recordExists: boolean
      ipfsIntegrity: boolean
      blockchainRecord: boolean
      hashMatch: boolean
      timestampValid: boolean
      signatureValid: boolean
      providerValid: boolean
      formatValid: boolean
      consensusCheck: boolean
      cryptoProof: boolean
    }
    recommendations: string[]
    warnings: string[]
    document?: {
      recordId: number
      documentCID: string
      recordType: string
      patientName: string
      issueDate: string
      provider: {
        id: string
        name: string
        verified: boolean
        trustScore: number
        license: string
      }
      userDID: string
    }
    blockchain: {
      network: string
      contractAddress: string
      verificationTxHash: string
      blockNumber: number
      gasUsed: number
      confirmations: number
    }
    technical: {
      hashMatched: boolean
      calculatedHash?: string
      expectedHash?: string
      ipfsAccessible: boolean
      consensusReached: boolean
      signatureVerified: boolean
    }
    provider?: {
      name: string
      verified: boolean
      trustScore: number
      license: string
      id: string
    }
    metadata: {
      verificationMethod: string
      confidenceLevel: 'high' | 'medium' | 'low'
      riskLevel: 'low' | 'medium' | 'high'
      nextVerificationDue: string
      verificationCost: string
    }
  }
  urls: {
    baseScanTx: string
    baseScanContract: string
    ipfsGateway?: string
    verificationReport: string
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
  const [recordId, setRecordId] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [verificationProgress, setVerificationProgress] = useState(0)

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
    if (!selectedFile && !searchHash && !recordId) return

    setIsVerifying(true)
    setVerificationProgress(0)
    
    // Simulate progressive verification
    const progressSteps = [
      { progress: 20, message: 'Analyzing document format...' },
      { progress: 40, message: 'Calculating document hash...' },
      { progress: 60, message: 'Checking blockchain records...' },
      { progress: 80, message: 'Verifying provider credentials...' },
      { progress: 95, message: 'Finalizing verification...' },
      { progress: 100, message: 'Verification complete!' }
    ]

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setVerificationProgress(step.progress)
    }

    try {
      let fileData: string | undefined
      
      if (selectedFile) {
        // Convert file to base64 for hash calculation
        const buffer = await selectedFile.arrayBuffer()
        fileData = Buffer.from(buffer).toString('base64')
      }

      const response = await fetch('/api/verify/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentCID: searchHash || undefined,
          recordId: recordId || undefined,
          userAddress: address,
          fileData: fileData
        })
      })

      const result = await response.json()
      setVerificationResult(result)
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationResult({
        success: false,
        verification: {
          status: 'error',
          score: 0,
          timestamp: new Date().toISOString(),
          verificationId: '',
          checks: {
            recordExists: false,
            ipfsIntegrity: false,
            blockchainRecord: false,
            hashMatch: false,
            timestampValid: false,
            signatureValid: false,
            providerValid: false,
            formatValid: false,
            consensusCheck: false,
            cryptoProof: false
          },
          recommendations: ['Please try again or contact support'],
          warnings: ['Verification system temporarily unavailable'],
          blockchain: {
            network: '',
            contractAddress: '',
            verificationTxHash: '',
            blockNumber: 0,
            gasUsed: 0,
            confirmations: 0
          },
          technical: {
            hashMatched: false,
            ipfsAccessible: false,
            consensusReached: false,
            signatureVerified: false
          },
          metadata: {
            verificationMethod: '',
            confidenceLevel: 'low',
            riskLevel: 'high',
            nextVerificationDue: '',
            verificationCost: ''
          }
        },
        urls: {
          baseScanTx: '',
          baseScanContract: '',
          verificationReport: ''
        }
      })
    } finally {
      setIsVerifying(false)
      setVerificationProgress(0)
    }
  }

  const handleVerifyByHash = async () => {
    if (!searchHash) return
    setSelectedFile(null)
    setRecordId('')
    await handleVerifyFile()
  }

  const handleVerifyByRecordId = async () => {
    if (!recordId) return
    setSelectedFile(null)
    setSearchHash('')
    await handleVerifyFile()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'flagged': return 'text-red-400'
      case 'error': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="text-green-400" size={24} />
      case 'pending': return <Clock className="text-yellow-400" size={24} />
      case 'flagged': return <AlertTriangle className="text-red-400" size={24} />
      case 'error': return <X className="text-gray-400" size={24} />
      default: return <AlertCircle className="text-gray-400" size={24} />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-500'
    if (score >= 70) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-rose-500'
  }

  return (
    <WalletConnection title="Verify Documents" description="Connect your wallet to verify the authenticity of medical documents">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Document Verification</h1>
          <p className="text-[#A3A3A3] text-lg max-w-2xl mx-auto">
            Verify the authenticity and integrity of medical documents using blockchain technology. 
            Upload a file or search by document hash or record ID.
          </p>
        </motion.div>

        {/* Verification Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-[#1F1F1F] border border-[#404040]">
              <TabsTrigger value="upload" className="text-white data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
                <Upload size={16} className="mr-2" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="hash" className="text-white data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
                <Hash size={16} className="mr-2" />
                By Hash/CID
              </TabsTrigger>
              <TabsTrigger value="record" className="text-white data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
                <Search size={16} className="mr-2" />
                By Record ID
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Upload className="text-[#3ECF8E]" size={24} />
                    <span>Upload Document to Verify</span>
                  </CardTitle>
                  <CardDescription className="text-[#A3A3A3]">
                    Upload the document you want to verify against blockchain records
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                      dragActive 
                        ? 'border-[#3ECF8E] bg-[#3ECF8E]/10' 
                        : selectedFile 
                          ? 'border-[#3ECF8E] bg-[#3ECF8E]/5'
                          : 'border-[#404040] hover:border-[#3ECF8E]/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center space-x-3">
                        <FileText className="text-[#3ECF8E]" size={32} />
                        <div className="text-left">
                          <p className="text-white font-medium">{selectedFile.name}</p>
                          <p className="text-[#A3A3A3] text-sm">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="mx-auto text-[#A3A3A3]" size={48} />
                        <div>
                          <p className="text-white font-medium">Drop your file here or click to browse</p>
                          <p className="text-[#A3A3A3] text-sm">PDF, JPEG, PNG, DICOM files up to 10MB</p>
                        </div>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      onChange={handleFileInputChange}
                      accept=".pdf,.jpg,.jpeg,.png,.dcm"
                      className="hidden"
                      id="file-upload"
                    />
                    
                    {!selectedFile && (
                      <label
                        htmlFor="file-upload"
                        className="mt-4 inline-block bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black font-medium py-2 px-6 rounded-xl cursor-pointer transition-all duration-300"
                      >
                        Choose File
                      </label>
                    )}
                  </div>

                  <Button
                    onClick={handleVerifyFile}
                    disabled={!selectedFile || isVerifying}
                    className="w-full bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black font-medium h-12 text-lg"
                  >
                    {isVerifying ? (
                      <span className="flex items-center space-x-2">
                        <RefreshCw className="animate-spin" size={20} />
                        <span>Verifying...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <Shield size={20} />
                        <span>Verify Document</span>
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hash" className="space-y-6">
              <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Hash className="text-[#3ECF8E]" size={24} />
                    <span>Verify by Document Hash/CID</span>
                  </CardTitle>
                  <CardDescription className="text-[#A3A3A3]">
                    Enter the IPFS CID or document hash to verify its authenticity
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Document CID or Hash</Label>
                    <Input
                      value={searchHash}
                      onChange={(e) => setSearchHash(e.target.value)}
                      placeholder="Qm... or document hash"
                      className="bg-[#1F1F1F] border-[#404040] text-white font-mono"
                    />
                  </div>

                  <Button
                    onClick={handleVerifyByHash}
                    disabled={!searchHash || isVerifying}
                    className="w-full bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black font-medium h-12 text-lg"
                  >
                    {isVerifying ? (
                      <span className="flex items-center space-x-2">
                        <RefreshCw className="animate-spin" size={20} />
                        <span>Verifying...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <Search size={20} />
                        <span>Verify by Hash</span>
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="record" className="space-y-6">
              <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Search className="text-[#3ECF8E]" size={24} />
                    <span>Verify by Record ID</span>
                  </CardTitle>
                  <CardDescription className="text-[#A3A3A3]">
                    Enter the medical record ID to verify the document
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Medical Record ID</Label>
                    <Input
                      value={recordId}
                      onChange={(e) => setRecordId(e.target.value)}
                      placeholder="Enter record ID (e.g., 123456)"
                      className="bg-[#1F1F1F] border-[#404040] text-white"
                    />
                  </div>

                  <Button
                    onClick={handleVerifyByRecordId}
                    disabled={!recordId || isVerifying}
                    className="w-full bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black font-medium h-12 text-lg"
                  >
                    {isVerifying ? (
                      <span className="flex items-center space-x-2">
                        <RefreshCw className="animate-spin" size={20} />
                        <span>Verifying...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <Search size={20} />
                        <span>Verify by Record ID</span>
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Verification Progress */}
        <AnimatePresence>
          {isVerifying && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <RefreshCw className="text-[#3ECF8E] animate-spin" size={24} />
                    <span>Verification in Progress</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A3A3A3]">Progress</span>
                      <span className="text-[#3ECF8E]">{verificationProgress}%</span>
                    </div>
                    <Progress value={verificationProgress} className="h-2" />
                  </div>
                  
                  <p className="text-[#A3A3A3] text-sm">
                    Please wait while we verify your document against blockchain records...
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Results */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Main Status Card */}
              <Card className={`bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-2 ${
                verificationResult.verification.status === 'verified' ? 'border-green-500/50' :
                verificationResult.verification.status === 'pending' ? 'border-yellow-500/50' :
                'border-red-500/50'
              }`}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(verificationResult.verification.status)}
                      <span>Verification Result</span>
                    </div>
                    <Badge className={`${getStatusColor(verificationResult.verification.status)} bg-transparent border`}>
                      {verificationResult.verification.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Verification Score */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-white text-lg">Verification Score</Label>
                      <span className="text-2xl font-bold text-white">{verificationResult.verification.score}/100</span>
                    </div>
                    <div className="w-full bg-[#404040] rounded-full h-4">
                      <div 
                        className={`bg-gradient-to-r ${getScoreColor(verificationResult.verification.score)} h-4 rounded-full transition-all duration-1000`}
                        style={{ width: `${verificationResult.verification.score}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-[#A3A3A3]">
                      <span>Risk Level: {verificationResult.verification.metadata.riskLevel}</span>
                      <span>Confidence: {verificationResult.verification.metadata.confidenceLevel}</span>
                    </div>
                  </div>

                  {/* Document Information */}
                  {verificationResult.verification.document && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-[#1F1F1F] rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <UserIcon size={16} className="text-[#3ECF8E]" />
                          <Label className="text-[#A3A3A3] text-sm">Patient Name</Label>
                        </div>
                        <p className="text-white font-medium">{verificationResult.verification.document.patientName}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Building size={16} className="text-[#3ECF8E]" />
                          <Label className="text-[#A3A3A3] text-sm">Healthcare Provider</Label>
                        </div>
                        <p className="text-white font-medium">{verificationResult.verification.document.provider.name}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-[#3ECF8E]" />
                          <Label className="text-[#A3A3A3] text-sm">Issue Date</Label>
                        </div>
                        <p className="text-white font-medium">
                          {new Date(verificationResult.verification.document.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FileText size={16} className="text-[#3ECF8E]" />
                          <Label className="text-[#A3A3A3] text-sm">Record Type</Label>
                        </div>
                        <p className="text-white font-medium">{verificationResult.verification.document.recordType}</p>
                      </div>
                    </div>
                  )}

                  {/* Verification Checks */}
                  <div className="space-y-3">
                    <Label className="text-white text-lg">Verification Checks</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(verificationResult.verification.checks).map(([key, passed]) => (
                        <div key={key} className="flex items-center space-x-2 p-2 bg-[#1F1F1F] rounded">
                          {passed ? (
                            <CheckCircle size={16} className="text-green-400" />
                          ) : (
                            <X size={16} className="text-red-400" />
                          )}
                          <span className="text-sm text-white capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations and Warnings */}
                  {(verificationResult.verification.recommendations.length > 0 || 
                    verificationResult.verification.warnings.length > 0) && (
                    <div className="space-y-4">
                      {verificationResult.verification.recommendations.length > 0 && (
                        <Alert className="border-[#3ECF8E]/30 bg-[#3ECF8E]/10">
                          <CheckCircle size={16} className="text-[#3ECF8E]" />
                          <AlertDescription className="text-[#3ECF8E]">
                            <strong>Recommendations:</strong>
                            <ul className="mt-2 space-y-1">
                              {verificationResult.verification.recommendations.map((rec, index) => (
                                <li key={index} className="text-sm">• {rec}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {verificationResult.verification.warnings.length > 0 && (
                        <Alert className="border-yellow-500/30 bg-yellow-500/10">
                          <AlertTriangle size={16} className="text-yellow-500" />
                          <AlertDescription className="text-yellow-500">
                            <strong>Warnings:</strong>
                            <ul className="mt-2 space-y-1">
                              {verificationResult.verification.warnings.map((warning, index) => (
                                <li key={index} className="text-sm">• {warning}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button
                      onClick={() => window.open(verificationResult.urls.baseScanTx, '_blank')}
                      className="bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/30 hover:bg-[#3ECF8E]/30"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      View on BaseScan
                    </Button>
                    
                    {verificationResult.urls.ipfsGateway && (
                      <Button
                        onClick={() => window.open(verificationResult.urls.ipfsGateway!, '_blank')}
                        className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                      >
                        <Hash size={16} className="mr-2" />
                        View on IPFS
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => window.open(verificationResult.urls.verificationReport, '_blank')}
                      className="bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"
                    >
                      <Download size={16} className="mr-2" />
                      Download Report
                    </Button>
                    
                    <Button
                      onClick={() => copyToClipboard(verificationResult.verification.verificationId)}
                      variant="ghost"
                      className="text-[#A3A3A3] hover:text-white"
                    >
                      <Copy size={16} className="mr-2" />
                      Copy Verification ID
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </WalletConnection>
  )
}
