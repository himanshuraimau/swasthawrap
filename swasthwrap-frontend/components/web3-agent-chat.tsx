'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Shield, 
  Search, 
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  RefreshCw,
  Database,
  Activity,
  History
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data from the existing API routes
const MOCK_MEDICAL_RECORDS = [
  {
    recordId: 123456,
    documentCID: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnAQP2bDB',
    userDID: 'did:ethr:baseSepolia:0x742d35c67d391d7f1e43cc2c87bb977b66c9b007',
    provider: { name: 'Apollo Hospital Delhi', verified: true, trustScore: 98 },
    recordType: 'lab_report',
    patientName: 'John Doe',
    dateOfService: '2024-06-20',
    verificationScore: 96,
    metadata: {
      fileName: 'blood_test_results.pdf',
      notes: 'Complete blood count and lipid profile - Normal cholesterol levels, slight vitamin D deficiency'
    }
  },
  {
    recordId: 234567,
    documentCID: 'QmYFbmhdvpDfWyaTzWj8vWu5k3z2a4Y9U6QjJ4jKN8hGpE',
    provider: { name: 'AIIMS New Delhi', verified: true, trustScore: 100 },
    recordType: 'prescription',
    patientName: 'Jane Smith',
    dateOfService: '2024-06-19',
    verificationScore: 98,
    metadata: {
      fileName: 'prescription_antibiotics.pdf',
      notes: 'Antibiotic treatment for respiratory infection - 7-day course of Amoxicillin'
    }
  }
]

const MOCK_CONSENT_DATA = [
  { id: '1', provider: 'Apollo Hospital Delhi', status: 'granted', expiryDate: '2024-12-31', permissions: ['read', 'share'] },
  { id: '2', provider: 'AIIMS New Delhi', status: 'pending', expiryDate: '2024-12-31', permissions: ['read'] }
]

// Quick action prompts for Web3 health tasks
const quickActions = [
  "Analyze my latest medical file from IPFS and create an on-chain summary",
  "Help me set up consent permissions for sharing my health records",
  "Search my blockchain health records for patterns and trends", 
  "Retrieve my medical documents from the blockchain",
  "Create a verified summary of my recent lab results",
  "Manage consent for my upcoming doctor appointment"
]

// Tool status tracking
interface ToolExecution {
  toolName: string
  status: 'running' | 'completed' | 'error'
  timestamp: Date
  result?: any
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  toolInvocations?: Array<{
    toolName: string
    state: 'call' | 'result'
    args?: any
    result?: any
  }>
}

// Mock tool responses based on user input
const getMockToolResponse = (userInput: string) => {
  const input = userInput.toLowerCase()
  
  if (input.includes('analyze') || input.includes('medical file') || input.includes('lab') || input.includes('blood')) {
    return {
      toolInvocations: [{
        toolName: 'medicalFileReader',
        state: 'call' as const,
        args: { documentCID: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnAQP2bDB' }
      }, {
        toolName: 'medicalSummarizer',
        state: 'result' as const,
        result: {
          summary: 'Blood test analysis shows normal cholesterol levels (185 mg/dL), normal glucose (95 mg/dL), but slight vitamin D deficiency (22 ng/mL). Recommend vitamin D supplementation.',
          keyFindings: ['Normal cholesterol', 'Normal glucose', 'Low vitamin D'],
          recommendations: ['Take vitamin D3 1000 IU daily', 'Retest in 3 months']
        }
      }],
      response: "I've analyzed your latest blood test results from Apollo Hospital Delhi. Your cholesterol and glucose levels are within normal ranges, which is excellent! However, I found a slight vitamin D deficiency. I've created an on-chain verified summary and recommend taking vitamin D3 supplements. The blockchain record has been updated with this analysis."
    }
  }
  
  if (input.includes('consent') || input.includes('permission') || input.includes('sharing')) {
    return {
      toolInvocations: [{
        toolName: 'consentManager',
        state: 'call' as const,
        args: { action: 'review_permissions' }
      }, {
        toolName: 'consentManager',
        state: 'result' as const,
        result: {
          currentConsents: MOCK_CONSENT_DATA,
          pendingRequests: 1,
          activePermissions: 2
        }
      }],
      response: "I've reviewed your current consent settings. You have active permissions with Apollo Hospital Delhi and a pending request from AIIMS New Delhi. Your data sharing is properly controlled through smart contracts. Would you like me to help you modify any permissions or approve the pending request?"
    }
  }
  
  if (input.includes('search') || input.includes('records') || input.includes('history') || input.includes('patterns')) {
    return {
      toolInvocations: [{
        toolName: 'blockchainRecordRetriever',
        state: 'call' as const,
        args: { userDID: 'did:ethr:baseSepolia:0x742d35c67d391d7f1e43cc2c87bb977b66c9b007' }
      }, {
        toolName: 'multiDocAnalyzer',
        state: 'result' as const,
        result: {
          totalRecords: MOCK_MEDICAL_RECORDS.length,
          recordTypes: ['lab_report', 'prescription'],
          healthTrends: ['Stable cholesterol over 6 months', 'Occasional respiratory infections'],
          lastUpdate: '2024-06-20'
        }
      }],
      response: `I've searched your blockchain health records and found ${MOCK_MEDICAL_RECORDS.length} verified documents. Key patterns include stable cholesterol levels over the past 6 months and occasional respiratory infections. Your records show good overall health with consistent monitoring. All documents are properly verified and stored on IPFS with on-chain references.`
    }
  }
  
  if (input.includes('retrieve') || input.includes('documents') || input.includes('download')) {
    return {
      toolInvocations: [{
        toolName: 'blockchainRecordRetriever',
        state: 'result' as const,
        result: {
          records: MOCK_MEDICAL_RECORDS.map(r => ({
            id: r.recordId,
            name: r.metadata.fileName,
            type: r.recordType,
            provider: r.provider.name,
            date: r.dateOfService
          }))
        }
      }],
      response: "I've retrieved your medical documents from the blockchain. You have verified records including blood test results from Apollo Hospital Delhi and prescription records from AIIMS New Delhi. All documents are cryptographically verified and can be accessed securely through IPFS."
    }
  }
  
  if (input.includes('verify') || input.includes('summary') || input.includes('create')) {
    return {
      toolInvocations: [{
        toolName: 'medicalSummarizer',
        state: 'result' as const,
        result: {
          verifiedSummary: 'Patient shows stable health indicators with minor vitamin D deficiency. Recent lab work confirms normal metabolic function.',
          onChainHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
          verificationScore: 96
        }
      }],
      response: "I've created a verified medical summary and stored it on-chain. The summary confirms your stable health indicators with a verification score of 96%. The cryptographic hash has been recorded on the blockchain for tamper-proof verification. Healthcare providers can now access this verified summary with your consent."
    }
  }
  
  // Default response
  return {
    toolInvocations: [{
      toolName: 'medicalFileReader',
      state: 'call' as const,
      args: { query: userInput }
    }],
    response: "I'm your Web3 Health Agent, specialized in blockchain health records and medical data analysis. I can help you analyze medical files, manage consent permissions, search your health records, and create verified summaries. Try asking me to analyze your lab results, manage consent settings, or search your blockchain health records!"
  }
}

export default function Web3AgentChat() {
  const { toast } = useToast()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Mock chat functionality
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    const userInput = input.trim()
    setInput('')
    setIsLoading(true)
    setError(null)
    
    // Simulate tool execution delay
    setTimeout(() => {
      const mockResponse = getMockToolResponse(userInput)
      
      // Add tool executions
      if (mockResponse.toolInvocations) {
        mockResponse.toolInvocations.forEach(tool => {
          if (tool.state === 'call') {
            setToolExecutions(prev => [...prev, {
              toolName: tool.toolName,
              status: 'running',
              timestamp: new Date()
            }])
          }
        })
      }
      
      // Simulate processing time
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: mockResponse.response,
          timestamp: new Date(),
          toolInvocations: mockResponse.toolInvocations
        }
        
        setMessages(prev => [...prev, assistantMessage])
        
        // Update tool executions to completed
        setToolExecutions(prev => 
          prev.map(exec => 
            exec.status === 'running' 
              ? { ...exec, status: 'completed' }
              : exec
          )
        )
        
        setIsLoading(false)
      }, 1500)
    }, 500)
  }

  // Auto-scroll to bottom when new messages arrive - improved version with smart scrolling
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current
        const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100
        
        // Only auto-scroll if user is near the bottom (to not interrupt manual scrolling)
        if (isNearBottom) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          })
        }
      }
    })
    
    return () => cancelAnimationFrame(timer)
  }, [messages, isLoading])

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    handleSubmit(e)
  }

  // Handle quick action click
  const handleQuickAction = (action: string) => {
    setInput(action)
    textareaRef.current?.focus()
  }

  // Copy message to clipboard
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Message copied successfully.",
      })
    })
  }

  // Start new conversation
  const handleNewChat = () => {
    window.location.reload() // Simple way to reset chat
  }

  // Get tool icon
  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'medicalFileReader':
        return <FileText className="h-3 w-3" />
      case 'medicalSummarizer':
        return <Database className="h-3 w-3" />
      case 'consentManager':
        return <Shield className="h-3 w-3" />
      case 'multiDocAnalyzer':
        return <Activity className="h-3 w-3" />
      case 'blockchainRecordRetriever':
        return <Search className="h-3 w-3" />
      default:
        return <Bot className="h-3 w-3" />
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-400" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-400" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  // Format tool name for display
  const formatToolName = (toolName: string) => {
    return toolName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-[650px] sm:h-[600px]">
      <div className="h-full bg-[#1F1F1F] rounded-xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col">        {/* Header */}
        <div className="bg-[#2A2A2A] px-4 sm:px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-400" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#2A2A2A]" />
              </div>
              <div className="hidden sm:block">
                <h3 className="text-white font-semibold text-sm">Web3 Health Agent</h3>
                <p className="text-gray-400 text-xs">AI-powered blockchain health assistant</p>
              </div>
              <div className="block sm:hidden">
                <h3 className="text-white font-semibold text-xs">Web3 Agent</h3>
                <p className="text-gray-400 text-xs">Blockchain Health AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                Web3 Enabled
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>        {/* Error Banner */}
        {error && (
          <div className="px-4 sm:px-6 py-3 bg-red-900/20 border-b border-red-800 flex-shrink-0">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}{/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth overscroll-contain bg-[#1A1A1A]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto">
                <Bot className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Welcome to Web3 Health Agent
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  I specialize in blockchain health records, medical file analysis, and consent management. 
                  Try one of the quick actions below or ask me anything!
                </p>
              </div>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#2A2A2A] text-gray-100 border border-gray-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Tool Invocations */}
                  {message.toolInvocations && message.toolInvocations.length > 0 && (
                    <div className="mt-2 space-y-2 w-full">
                      {message.toolInvocations.map((invocation, toolIndex) => (
                        <div 
                          key={toolIndex} 
                          className="bg-[#1F1F1F] border border-gray-700 rounded-lg p-3 text-sm"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getToolIcon(invocation.toolName)}
                            <span className="font-medium text-gray-300">
                              {formatToolName(invocation.toolName)}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                invocation.state === 'call' && "border-blue-600 text-blue-400",
                                invocation.state === 'result' && "border-green-600 text-green-400"
                              )}
                            >
                              {invocation.state}
                            </Badge>
                          </div>
                          
                          {invocation.args && (
                            <div className="mb-2">
                              <div className="text-xs text-gray-500 mb-1">Parameters:</div>
                              <div className="bg-[#262626] rounded p-2 text-xs text-gray-300 font-mono">
                                {JSON.stringify(invocation.args, null, 2)}
                              </div>
                            </div>
                          )}

                          {(invocation as any).result && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Result:</div>
                              <div className="bg-green-900/20 border border-green-800 rounded p-2 text-xs text-green-300">
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify((invocation as any).result, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </span>
                    
                    {message.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(message.content)}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-gray-300"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-[#2A2A2A] border border-gray-700 p-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="p-4 sm:p-6 border-t border-gray-800 bg-[#2A2A2A] flex-shrink-0">
            <p className="text-gray-400 text-sm mb-3">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-xs bg-[#1F1F1F] border-gray-600 hover:bg-[#3A3A3A] text-gray-300"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        )}        {/* Tool Execution Status */}
        {toolExecutions.length > 0 && (
          <div className="px-4 sm:px-6 pb-2 flex-shrink-0">
            <div className="bg-[#1F1F1F] border border-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-2">Recent Tool Activity:</div>
              <div className="space-y-1">
                {toolExecutions.slice(-3).map((execution, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {getToolIcon(execution.toolName)}
                    <span className="text-gray-300">{formatToolName(execution.toolName)}</span>
                    {getStatusIcon(execution.status)}
                    <span className="text-gray-500 ml-auto">
                      {execution.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}        {/* Input Area */}
        <div className="p-4 sm:p-6 border-t border-gray-800 bg-[#2A2A2A] flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me about blockchain health records, medical analysis, or consent management..."
                className="min-h-[60px] max-h-32 bg-[#1F1F1F] border-gray-600 text-gray-100 placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
            </div>

            <div className="flex flex-col justify-end">
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-[60px] w-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
