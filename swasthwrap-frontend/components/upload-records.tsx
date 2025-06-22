"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Image, Pill, Activity, Shield, Database, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WalletConnection, WalletStatus } from '@/components/wallet-connection'
import { useAccount } from 'wagmi'
import type { User } from '@/types'

interface UploadFormData {
  recordType: string
  file: File | null
  authorizedBy: string
  notes: string
}

interface UploadRecordsProps {
  user: User
}

const recordTypes = [
  { value: 'lab_report', label: 'Lab Report', icon: Activity, color: 'from-blue-500 to-blue-600' },
  { value: 'prescription', label: 'Prescription', icon: Pill, color: 'from-green-500 to-green-600' },
  { value: 'medical_image', label: 'Medical Image (X-Ray, MRI)', icon: Image, color: 'from-purple-500 to-purple-600' },
  { value: 'consultation_note', label: 'Consultation Note', icon: FileText, color: 'from-orange-500 to-orange-600' },
  { value: 'vaccination_record', label: 'Vaccination Record', icon: Shield, color: 'from-emerald-500 to-emerald-600' },
  { value: 'discharge_summary', label: 'Discharge Summary', icon: Database, color: 'from-red-500 to-red-600' },
  { value: 'other', label: 'Other', icon: FileText, color: 'from-gray-500 to-gray-600' }
]

export default function UploadRecords({ user }: UploadRecordsProps) {
  const { address, isConnected } = useAccount()
  const [formData, setFormData] = useState<UploadFormData>({
    recordType: '',
    file: null,
    authorizedBy: '',
    notes: ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)

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
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, image (JPEG, PNG, WebP), or Word document')
      return
    }

    setFormData({ ...formData, file })
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleInputChange = (value: string, field: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.file || !formData.recordType) {
      alert('Please select a file and record type')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Here you would integrate with the actual Web3 upload service
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 3000))

      setUploadProgress(100)
      setUploadComplete(true)
      
      // Reset form after successful upload
      setTimeout(() => {
        setFormData({
          recordType: '',
          file: null,
          authorizedBy: '',
          notes: ''
        })
        setUploadComplete(false)
        setIsUploading(false)
        setUploadProgress(0)
      }, 2000)

    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const selectedRecordType = recordTypes.find(type => type.value === formData.recordType)

  return (
    <WalletConnection 
      title="Connect Wallet to Upload Records"
      description="Securely upload your medical documents to IPFS and verify them on the blockchain"
      requiredFeature="document upload"
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
            <Upload className="mr-3 text-[#3ECF8E]" size={32} />
            Upload Medical Records
          </h2>
          <p className="text-[#A3A3A3] text-lg">
            Securely store your medical documents with Web3 technology and AI analysis
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
            <CardHeader>
              <CardTitle className="text-white">Upload Document</CardTitle>
              <CardDescription className="text-[#A3A3A3]">
                Choose your document type and upload your medical record
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Record Type Selection */}
                <div className="space-y-3">
                  <Label className="text-white">Record Type</Label>
                  <Select value={formData.recordType} onValueChange={(value) => handleInputChange(value, 'recordType')}>
                    <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white">
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-[#404040]">
                      {recordTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-white hover:bg-[#262626]">
                          <div className="flex items-center space-x-2">
                            <type.icon size={16} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload Area */}
                <div className="space-y-3">
                  <Label className="text-white">Document File</Label>
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                      dragActive
                        ? 'border-[#3ECF8E] bg-[#3ECF8E]/5'
                        : formData.file
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
                      id="file-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileInputChange}
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    />
                    
                    {formData.file ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-[#3ECF8E]/20 rounded-2xl flex items-center justify-center mx-auto">
                          <FileText className="text-[#3ECF8E]" size={24} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{formData.file.name}</p>
                          <p className="text-[#A3A3A3] text-sm">
                            {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-[#404040] text-white hover:bg-[#262626]"
                          onClick={() => setFormData({ ...formData, file: null })}
                        >
                          <X size={16} className="mr-2" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-[#404040] rounded-2xl flex items-center justify-center mx-auto">
                          <Upload className="text-[#A3A3A3]" size={24} />
                        </div>
                        <div>
                          <p className="text-white font-medium">Drop your file here, or click to browse</p>
                          <p className="text-[#A3A3A3] text-sm">
                            Supports PDF, Images (JPEG, PNG, WebP), Word documents up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Authorized By */}
                <div className="space-y-3">
                  <Label className="text-white">Authorized By (Doctor/Institution)</Label>
                  <Input
                    value={formData.authorizedBy}
                    onChange={(e) => handleInputChange(e.target.value, 'authorizedBy')}
                    className="bg-[#1F1F1F] border-[#404040] text-white"
                    placeholder="e.g., Dr. Smith, City Hospital"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <Label className="text-white">Additional Notes (Optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange(e.target.value, 'notes')}
                    className="bg-[#1F1F1F] border-[#404040] text-white min-h-[100px]"
                    placeholder="Any additional information about this record..."
                  />
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Upload Progress</span>
                      <span className="text-[#3ECF8E]">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-[#404040] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!formData.file || !formData.recordType || isUploading}
                  className="w-full bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black font-medium h-12 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isUploading ? (
                    uploadComplete ? (
                      <span className="flex items-center">
                        <Shield className="mr-2" size={16} />
                        Upload Complete!
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Upload className="mr-2 animate-bounce" size={16} />
                        Uploading to Web3...
                      </span>
                    )
                  ) : (
                    <span className="flex items-center">
                      <Upload className="mr-2" size={16} />
                      Upload to Blockchain
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Selected Type Info */}
          {selectedRecordType && (
            <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <selectedRecordType.icon className="mr-2 text-[#3ECF8E]" size={20} />
                  {selectedRecordType.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge className={`bg-gradient-to-r ${selectedRecordType.color} text-white`}>
                    Selected Type
                  </Badge>
                  <p className="text-[#A3A3A3] text-sm">
                    This document will be encrypted and stored on IPFS with a verifiable credential anchored on Base L2.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Web3 Features */}
          <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
            <CardHeader>
              <CardTitle className="text-white">🔒 Web3 Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#3ECF8E] rounded-full mt-2" />
                <div>
                  <p className="text-white text-sm font-medium">IPFS Storage</p>
                  <p className="text-[#A3A3A3] text-xs">Decentralized file storage</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#3ECF8E] rounded-full mt-2" />
                <div>
                  <p className="text-white text-sm font-medium">Base L2 Anchoring</p>
                  <p className="text-[#A3A3A3] text-xs">Blockchain verification</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#3ECF8E] rounded-full mt-2" />
                <div>
                  <p className="text-white text-sm font-medium">DID Credentials</p>
                  <p className="text-[#A3A3A3] text-xs">Verifiable authenticity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Tips */}
          <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
            <CardHeader>
              <CardTitle className="text-white">💡 Upload Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[#A3A3A3] text-sm">
                • Ensure documents are clear and readable
              </p>
              <p className="text-[#A3A3A3] text-sm">
                • Remove any personal information you don't want to store
              </p>
              <p className="text-[#A3A3A3] text-sm">
                • Use descriptive notes for easy identification
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </div>
    </WalletConnection>
  )
}
