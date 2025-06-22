"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, Clock, CheckCircle, XCircle, Plus, Eye, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WalletConnection, WalletStatus } from '@/components/wallet-connection'
import { useAccount } from 'wagmi'
import type { User } from '@/types'

interface ConsentRecord {
  id: string
  recipientDID: string
  recipientName: string
  recipientType: 'doctor' | 'hospital' | 'insurance' | 'researcher' | 'family'
  permissions: string[]
  recordTypes: string[]
  status: 'active' | 'revoked' | 'expired'
  grantedAt: string
  expiresAt?: string
  purpose: string
  txHash: string
}

interface ConsentManagementProps {
  user: User
}

const mockConsentRecords: ConsentRecord[] = [
  {
    id: '1',
    recipientDID: 'did:ethr:0xdoc123...abc',
    recipientName: 'Dr. Sarah Johnson',
    recipientType: 'doctor',
    permissions: ['read', 'download'],
    recordTypes: ['lab_report', 'prescription'],
    status: 'active',
    grantedAt: '2024-12-01T10:00:00Z',
    expiresAt: '2025-12-01T10:00:00Z',
    purpose: 'Ongoing diabetes treatment and monitoring',
    txHash: '0xabc123def456...'
  },
  {
    id: '2',
    recipientDID: 'did:ethr:0xhosp456...def',
    recipientName: 'City Medical Center',
    recipientType: 'hospital',
    permissions: ['read', 'download', 'share_with_specialists'],
    recordTypes: ['medical_image', 'consultation_note'],
    status: 'active',
    grantedAt: '2024-11-15T14:30:00Z',
    purpose: 'Emergency medical care and specialist consultations',
    txHash: '0xdef789ghi012...'
  },
  {
    id: '3',
    recipientDID: 'did:ethr:0xins789...ghi',
    recipientName: 'HealthGuard Insurance',
    recipientType: 'insurance',
    permissions: ['read'],
    recordTypes: ['discharge_summary', 'vaccination_record'],
    status: 'revoked',
    grantedAt: '2024-10-20T09:15:00Z',
    expiresAt: '2025-10-20T09:15:00Z',
    purpose: 'Insurance claim processing and verification',
    txHash: '0x123abc456def...'
  }
]

const recipientTypeInfo = {
  doctor: { label: 'Doctor', icon: '👨‍⚕️', color: 'from-blue-500 to-blue-600' },
  hospital: { label: 'Hospital', icon: '🏥', color: 'from-green-500 to-green-600' },
  insurance: { label: 'Insurance', icon: '🛡️', color: 'from-purple-500 to-purple-600' },
  researcher: { label: 'Researcher', icon: '🔬', color: 'from-orange-500 to-orange-600' },
  family: { label: 'Family', icon: '👨‍👩‍👧‍👦', color: 'from-pink-500 to-pink-600' }
}

const recordTypeLabels = {
  lab_report: 'Lab Reports',
  prescription: 'Prescriptions',
  medical_image: 'Medical Images',
  consultation_note: 'Consultation Notes',
  vaccination_record: 'Vaccination Records',
  discharge_summary: 'Discharge Summaries',
  other: 'Other Documents'
}

export default function ConsentManagement({ user }: ConsentManagementProps) {
  const { address, isConnected } = useAccount()
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only load consents if wallet is connected
    if (isConnected) {
      // Simulate loading consents
      setTimeout(() => {
        setConsents(mockConsentRecords)
        setLoading(false)
      }, 1000)
    }
  }, [isConnected])

  const handleToggleConsent = async (consentId: string) => {
    setConsents(prev => prev.map(consent => 
      consent.id === consentId 
        ? { ...consent, status: consent.status === 'active' ? 'revoked' : 'active' }
        : consent
    ))
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'revoked': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'expired': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const activeConsents = consents.filter(c => c.status === 'active').length
  const totalConsents = consents.length

  return (
    <WalletConnection 
      title="Connect Wallet for Consent Management"
      description="Manage who can access your medical records with blockchain-secured permissions"
      requiredFeature="consent management"
    >
      <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3ECF8E]/20 via-[#262626] to-[#1F1F1F] p-8 border border-[#3ECF8E]/20"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3ECF8E]/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Shield className="mr-3 text-[#3ECF8E]" size={32} />
              Consent Management
            </h2>
            <p className="text-[#A3A3A3] text-lg">
              Control who can access your medical records and for what purpose
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black font-medium">
                <Plus className="mr-2" size={16} />
                Grant Access
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1F1F1F] border-[#404040] text-white">
              <DialogHeader>
                <DialogTitle>Grant Medical Record Access</DialogTitle>
                <DialogDescription className="text-[#A3A3A3]">
                  Provide access to specific medical records for healthcare providers or other authorized parties.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recipient Name</Label>
                    <Input className="bg-[#262626] border-[#404040]" placeholder="Dr. John Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient Type</Label>
                    <Select>
                      <SelectTrigger className="bg-[#262626] border-[#404040]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#262626] border-[#404040]">
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="family">Family Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>DID or Wallet Address</Label>
                  <Input className="bg-[#262626] border-[#404040]" placeholder="did:ethr:0x..." />
                </div>
                
                <div className="space-y-2">
                  <Label>Purpose of Access</Label>
                  <Input className="bg-[#262626] border-[#404040]" placeholder="Ongoing treatment and consultation" />
                </div>
                
                <div className="flex space-x-4">
                  <Button variant="outline" className="flex-1 border-[#404040]" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-[#3ECF8E] text-black hover:bg-[#2DD4BF]">
                    Grant Access
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                  <p className="text-[#A3A3A3] text-sm">Active Consents</p>
                  <p className="text-3xl font-bold text-white">{activeConsents}</p>
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
                  <p className="text-[#A3A3A3] text-sm">Total Consents</p>
                  <p className="text-3xl font-bold text-white">{totalConsents}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <Users className="text-blue-400" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A3A3A3] text-sm">Revoked</p>
                  <p className="text-3xl font-bold text-white">
                    {consents.filter(c => c.status === 'revoked').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                  <XCircle className="text-red-400" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Consent List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
          <CardHeader>
            <CardTitle className="text-white">Access Permissions</CardTitle>
            <CardDescription className="text-[#A3A3A3]">
              Manage who has access to your medical records and what they can do with them
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-[#1F1F1F] rounded-2xl"></div>
                  </div>
                ))}
              </div>
            ) : consents.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="mx-auto text-[#404040] mb-4" size={48} />
                <p className="text-white text-lg font-medium mb-2">No Consent Records</p>
                <p className="text-[#A3A3A3] text-sm mb-6">
                  Start granting access to healthcare providers to see consent records here.
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] text-black"
                >
                  <Plus className="mr-2" size={16} />
                  Grant First Access
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {consents.map((consent, index) => {
                  const typeInfo = recipientTypeInfo[consent.recipientType as keyof typeof recipientTypeInfo]
                  
                  return (
                    <motion.div
                      key={consent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-[#1F1F1F] to-[#262626] rounded-2xl p-6 border border-[#404040]/30"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${typeInfo.color} rounded-2xl flex items-center justify-center text-white text-xl`}>
                            {typeInfo.icon}
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-white font-medium text-lg">{consent.recipientName}</h3>
                              <Badge className={getStatusColor(consent.status)}>
                                {consent.status === 'active' && <CheckCircle size={12} className="mr-1" />}
                                {consent.status === 'revoked' && <XCircle size={12} className="mr-1" />}
                                {consent.status === 'expired' && <Clock size={12} className="mr-1" />}
                                {consent.status.charAt(0).toUpperCase() + consent.status.slice(1)}
                              </Badge>
                              <Badge className={`bg-gradient-to-r ${typeInfo.color} text-white`}>
                                {typeInfo.label}
                              </Badge>
                            </div>
                            
                            <p className="text-[#A3A3A3] text-sm mb-3">{consent.purpose}</p>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-[#A3A3A3]">Granted</p>
                                <p className="text-white">{formatDate(consent.grantedAt)}</p>
                              </div>
                              {consent.expiresAt && (
                                <div>
                                  <p className="text-[#A3A3A3]">Expires</p>
                                  <p className="text-white">{formatDate(consent.expiresAt)}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-[#A3A3A3]">Record Types</p>
                                <p className="text-white">
                                  {consent.recordTypes.map(type => 
                                    recordTypeLabels[type as keyof typeof recordTypeLabels]
                                  ).join(', ')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-[#A3A3A3] text-sm">
                              {consent.status === 'active' ? 'Active' : 'Revoked'}
                            </span>
                            <Switch
                              checked={consent.status === 'active'}
                              onCheckedChange={() => handleToggleConsent(consent.id)}
                              className="data-[state=checked]:bg-[#3ECF8E]"
                            />
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#404040] text-[#A3A3A3] hover:border-[#3ECF8E] hover:text-white"
                          >
                            <Settings size={14} className="mr-2" />
                            Manage
                          </Button>
                        </div>
                      </div>
                      
                      {/* Permissions and Technical Details */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-[#A3A3A3] text-sm mb-2">Permissions</p>
                          <div className="flex flex-wrap gap-2">
                            {consent.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="border-[#404040] text-[#A3A3A3]">
                                {permission.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-[#404040]/30">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-[#A3A3A3] mb-1">Recipient DID</p>
                              <p className="text-[#3ECF8E] font-mono break-all">{consent.recipientDID}</p>
                            </div>
                            <div>
                              <p className="text-[#A3A3A3] mb-1">Transaction Hash</p>
                              <p className="text-[#3ECF8E] font-mono break-all">{consent.txHash}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </WalletConnection>
  )
}
