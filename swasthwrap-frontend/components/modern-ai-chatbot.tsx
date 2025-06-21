"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Mic,
  MicOff,
  Upload,
  Copy,
  FileText,
  Loader2,
  Bot,
  User as UserIcon,
  AlertCircle,
  RefreshCw,
  X,
  Volume2,
  VolumeX,
  History,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import ChatHistory from "./chat-history"
import { useChat } from "@/lib/react-query/hooks/useChat"
import { fileToBase64, formatFileSize, isValidAudioFile, isValidDocumentFile, getLanguageCode, formatTimestamp } from "@/lib/chat-utils"
import type { ChatFile } from "@/types/api"

const quickResponses = [
  "Can you explain my blood test results?",
  "What should I eat for diabetes?", 
  "How to manage high blood pressure?",
  "Side effects of my medication?",
  "Healthy exercise routine suggestions",
  "When should I see a doctor?",
]

import type { User } from "@/types"

export default function ModernAIChatbot({ user }: { user: User }) {
  const { toast } = useToast()
  const [currentView, setCurrentView] = useState("chat") // 'chat' or 'history'
  const [inputMessage, setInputMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(getLanguageCode(user.language))
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  // Use the real API hooks
  const {
    messages,
    isTyping,
    currentSessionId,
    chatHistory,
    isLoadingHistory,
    isSending,
    isStartingSession,
    isUploadingDocument,
    isConvertingVoice,
    isConvertingText,
    sendMessage,
    startNewSession,
    loadSession,
    deleteSession,
    uploadDocument,
    convertVoiceToText,
    convertTextToSpeech,
    sendError,
    voiceError,
    speechError
  } = useChat()

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setError(null)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setError("You're currently offline. Messages will be sent when connection is restored.")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Initialize session on mount
  useEffect(() => {
    if (!currentSessionId) {
      startNewSession(selectedLanguage)
    }
  }, [])

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0) return
    if (!isOnline) {
      toast({
        title: "No internet connection",
        description: "Please check your connection and try again.",
        variant: "destructive"
      })
      return
    }

    try {
      setError(null)
      const messageText = inputMessage.trim()
      setInputMessage("")

      // Convert uploaded files to base64
      const files: ChatFile[] = []
      for (const file of uploadedFiles) {
        if (isValidDocumentFile(file)) {
          const base64Data = await fileToBase64(file)
          files.push({
            name: file.name,
            size: file.size,
            type: file.type,
            data: base64Data
          })
        }
      }

      await sendMessage({
        message: messageText,
        language: selectedLanguage,
        sessionId: currentSessionId || undefined,
        files: files.length > 0 ? files : undefined
      })

      // Clear uploaded files after sending
      setUploadedFiles([])

    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Failed to send message",
        description: "Please try again in a moment.",
        variant: "destructive"
      })
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const maxSize = 10 * 1024 * 1024 // 10MB
    const validFiles = files.filter((file) => {
      if (!isValidDocumentFile(file)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive"
        })
        return false
      }
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive"
        })
        return false
      }
      return true
    })

    setUploadedFiles((prev) => [...prev, ...validFiles])
  }

  // Handle voice recording
  const handleVoiceToggle = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        recordedChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = async () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/wav' })
          const audioFile = new File([blob], 'recording.wav', { type: 'audio/wav' })
          
          try {
            const response = await convertVoiceToText(audioFile, selectedLanguage)
            if (response.data.text) {
              setInputMessage(response.data.text)
              textareaRef.current?.focus()
            }
          } catch (error) {
            toast({
              title: "Voice recognition failed",
              description: "Please try recording again.",
              variant: "destructive"
            })
          }

          // Stop all tracks
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        setIsRecording(true)
      } catch (error) {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive"
        })
      }
    } else {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    }
  }

  // Handle text to speech
  const handleTextToSpeech = async (text: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
      }

      const response = await convertTextToSpeech({
        text,
        language: selectedLanguage,
        speed: 1.0
      })

      if (response.data.audioUrl) {
        const audio = new Audio(response.data.audioUrl)
        audioRef.current = audio
        audio.play()
        setIsSpeaking(true)
        
        audio.onended = () => {
          setIsSpeaking(false)
        }
      }
    } catch (error) {
      toast({
        title: "Text-to-speech failed",
        description: "Unable to generate audio.",
        variant: "destructive"
      })
    }
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsSpeaking(false)
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Message copied successfully.",
      })
    })
  }

  const handleQuickResponse = (response: string) => {
    setInputMessage(response)
    textareaRef.current?.focus()
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStartNewChat = async () => {
    try {
      await startNewSession(selectedLanguage)
      toast({
        title: "New chat started",
        description: "Ready for a new conversation!",
      })
    } catch (error) {
      toast({
        title: "Failed to start new chat",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleResumeChat = (sessionId: string) => {
    loadSession(sessionId)
    setCurrentView("chat")
  }

  if (currentView === "history") {
    return (
      <ChatHistory 
        user={user} 
        onResumeChat={handleResumeChat}
      />
    )
  }

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-[#1F1F1F]" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="h-8 w-8 text-blue-400" />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
              isOnline ? "bg-green-400" : "bg-red-400"
            }`} />
          </div>
          <div>
            <h3 className="text-white font-medium">SwasthWrap AI</h3>
            <p className="text-gray-400 text-sm">
              {isTyping ? "Typing..." : isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as "en" | "hi" | "ta")}>
            <SelectTrigger className="w-24 bg-[#3A3A3A] border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="hi">हि</SelectItem>
              <SelectItem value="ta">த</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView("history")}
            className="text-gray-400 hover:text-white"
          >
            <History className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartNewChat}
            disabled={isStartingSession}
            className="text-gray-400 hover:text-white"
          >
            {isStartingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {(error || sendError || voiceError || speechError) && (
        <div className="p-3 bg-red-900/20 border-b border-red-800">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              {error || sendError?.message || voiceError?.message || speechError?.message}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                <div className="flex-shrink-0">
                  {message.type === "user" ? (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className={`flex flex-col ${message.type === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-[#2A2A2A] text-gray-100 border border-gray-700"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {message.confidence && (
                      <div className="mt-2 text-xs opacity-70">
                        Confidence: {Math.round(message.confidence * 100)}%
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    
                    {message.type === "ai" && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(message.content)}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-300"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTextToSpeech(message.content)}
                          disabled={isConvertingText}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-300"
                        >
                          {isConvertingText ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
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
      </div>

      {/* Quick Responses */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-gray-800">
          <p className="text-gray-400 text-sm mb-3">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickResponses.map((response, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickResponse(response)}
                className="text-xs bg-[#2A2A2A] border-gray-600 hover:bg-[#3A3A3A] text-gray-300"
              >
                {response}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* File Uploads Display */}
      {uploadedFiles.length > 0 && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-[#2A2A2A] border border-gray-600 rounded-lg p-2">
                <FileText className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">{file.name}</span>
                <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-4 w-4 p-0 text-gray-500 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-[#2A2A2A]">
        <div className="flex gap-3">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your health question here..."
              className="min-h-[60px] max-h-32 bg-[#1F1F1F] border-gray-600 text-white placeholder-gray-400 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingDocument}
              className="h-10 w-10 p-0 text-gray-400 hover:text-white"
            >
              {isUploadingDocument ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceToggle}
              disabled={isConvertingVoice}
              className={`h-10 w-10 p-0 ${isRecording ? "text-red-400" : "text-gray-400 hover:text-white"}`}
            >
              {isConvertingVoice ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            <Button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && uploadedFiles.length === 0) || isSending || !isOnline}
              className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isSpeaking && (
          <div className="mt-2 flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">Playing audio response...</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopSpeaking}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
            >
              <VolumeX className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        onChange={handleFileUpload}
        className="hidden"
      />

      <audio ref={audioRef} />
    </div>
  )
}
