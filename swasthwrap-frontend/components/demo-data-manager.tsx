"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database, Upload, Trash2, List, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DemoRecord {
  recordId: number
  documentCID: string
  patientName: string
  provider: string
  recordType: string
  verificationScore: number
  isValid: boolean
  timestamp?: string
}

interface DemoDataResponse {
  success: boolean
  message?: string
  data?: {
    demoRecords?: DemoRecord[]
    uploadedRecords?: DemoRecord[]
    totalRecords: number
    recordIds?: number[]
    documentCIDs?: string[]
  }
}

export function DemoDataManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [result, setResult] = useState<DemoDataResponse | null>(null)
  const [records, setRecords] = useState<DemoRecord[]>([])

  const handleAction = async (action: string) => {
    setIsLoading(true)
    setLastAction(action)

    try {
      if (action === 'list') {
        const response = await fetch('/api/demo/seed')
        const data = await response.json()
        setResult(data)
        if (data.success) {
          setRecords([...(data.data.demoRecords || []), ...(data.data.uploadedRecords || [])])
        }
      } else {
        const response = await fetch('/api/demo/seed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action })
        })
        const data = await response.json()
        setResult(data)
        
        // Refresh records after any action
        if (data.success) {
          const listResponse = await fetch('/api/demo/seed')
          const listData = await listResponse.json()
          if (listData.success) {
            setRecords([...(listData.data.demoRecords || []), ...(listData.data.uploadedRecords || [])])
          }
        }
      }
    } catch (error) {
      console.error('Demo action error:', error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Action failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'lab_report': return '🧪'
      case 'prescription': return '💊'
      case 'medical_imaging': return '🖼️'
      case 'consultation_notes': return '📋'
      case 'discharge_summary': return '📄'
      case 'vaccination_record': return '💉'
      default: return '📄'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Demo Data Manager</h2>
        <p className="text-[#A3A3A3]">
          Manage demo medical records for testing upload and verification features
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Database className="text-[#3ECF8E]" size={24} />
              <span>Demo Actions</span>
            </CardTitle>
            <CardDescription className="text-[#A3A3A3]">
              Use these buttons to seed demo data or manage existing records
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                onClick={() => handleAction('seed')}
                disabled={isLoading}
                className="bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black font-medium"
              >
                {isLoading && lastAction === 'seed' ? (
                  <RefreshCw className="animate-spin mr-2" size={16} />
                ) : (
                  <Upload className="mr-2" size={16} />
                )}
                Seed Demo Data
              </Button>

              <Button
                onClick={() => handleAction('list')}
                disabled={isLoading}
                variant="outline"
                className="border-[#404040] text-white hover:bg-[#404040]/20"
              >
                {isLoading && lastAction === 'list' ? (
                  <RefreshCw className="animate-spin mr-2" size={16} />
                ) : (
                  <List className="mr-2" size={16} />
                )}
                List Records
              </Button>

              <Button
                onClick={() => handleAction('clear')}
                disabled={isLoading}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                {isLoading && lastAction === 'clear' ? (
                  <RefreshCw className="animate-spin mr-2" size={16} />
                ) : (
                  <Trash2 className="mr-2" size={16} />
                )}
                Clear All
              </Button>

              <Button
                onClick={() => handleAction('list')}
                disabled={isLoading}
                variant="ghost"
                className="text-[#A3A3A3] hover:text-white"
              >
                {isLoading && lastAction === 'refresh' ? (
                  <RefreshCw className="animate-spin mr-2" size={16} />
                ) : (
                  <RefreshCw className="mr-2" size={16} />
                )}
                Refresh
              </Button>
            </div>

            {/* Result Display */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4"
              >
                <Alert className={`border-2 ${
                  result.success 
                    ? 'border-green-500/30 bg-green-500/10' 
                    : 'border-red-500/30 bg-red-500/10'
                }`}>
                  {result.success ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : (
                    <AlertTriangle size={16} className="text-red-400" />
                  )}
                  <AlertDescription className={result.success ? 'text-green-400' : 'text-red-400'}>
                    {result.message || (result.success ? 'Action completed successfully' : 'Action failed')}
                    {result.data && (
                      <div className="mt-2 text-sm">
                        Total Records: {result.data.totalRecords}
                        {result.data.recordIds && (
                          <div className="mt-1">
                            Record IDs: {result.data.recordIds.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Records Display */}
      {records.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <List className="text-[#3ECF8E]" size={24} />
                  <span>Available Records ({records.length})</span>
                </div>
                <Badge className="bg-[#3ECF8E]/20 text-[#3ECF8E] border-[#3ECF8E]/30">
                  Demo Data
                </Badge>
              </CardTitle>
              <CardDescription className="text-[#A3A3A3]">
                Use these record IDs and document CIDs for testing verification
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-4">
                {records.map((record, index) => (
                  <motion.div
                    key={record.recordId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-[#1F1F1F] rounded-lg border border-[#404040]/30"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{getRecordTypeIcon(record.recordType)}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-white font-medium">{record.patientName}</h4>
                          <Badge variant="outline" className="text-xs border-[#404040] text-[#A3A3A3]">
                            ID: {record.recordId}
                          </Badge>
                        </div>
                        <p className="text-[#A3A3A3] text-sm">{record.provider}</p>
                        <p className="text-[#A3A3A3] text-xs font-mono">{record.documentCID.substring(0, 20)}...</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`font-bold ${getScoreColor(record.verificationScore)}`}>
                          {record.verificationScore}/100
                        </div>
                        <Badge className={`text-xs ${
                          record.isValid 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {record.isValid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Test Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040]/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <CheckCircle className="text-[#3ECF8E]" size={24} />
              <span>Quick Test Guide</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-white font-medium">Testing Upload:</h4>
                <ol className="text-[#A3A3A3] text-sm space-y-1 list-decimal list-inside">
                  <li>Click "Seed Demo Data" to populate test records</li>
                  <li>Go to Upload Records page</li>
                  <li>Upload any PDF/image file</li>
                  <li>Fill in the form with realistic data</li>
                  <li>Watch the realistic upload progress</li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-white font-medium">Testing Verification:</h4>
                <ol className="text-[#A3A3A3] text-sm space-y-1 list-decimal list-inside">
                  <li>Use Record ID: <code className="bg-[#1F1F1F] px-1 rounded">123456</code> (high score)</li>
                  <li>Use Record ID: <code className="bg-[#1F1F1F] px-1 rounded">345678</code> (low score)</li>
                  <li>Try Document CID verification</li>
                  <li>Upload a file for hash verification</li>
                  <li>Check the detailed verification results</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
