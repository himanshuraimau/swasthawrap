"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Mic,
  MicOff,
  Upload,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileText,
  ImageIcon,
  Loader2,
  Bot,
  User,
  AlertCircle,
  RefreshCw,
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  History,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import ChatHistory from "./chat-history"

const mockChatResponses = {
  greetings: {
    en: "Hello! I'm your AI health assistant. How can I help you today?",
    hi: "नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
    ta: "வணக்கம்! நான் உங்கள் AI சுகாதார உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
  },
  medicalTerms: {
    diabetes: {
      simple: "High blood sugar condition that affects how your body processes glucose",
      action: "Monitor diet, exercise regularly, take prescribed medications",
      severity: "manageable",
    },
    hypertension: {
      simple: "High blood pressure that puts extra strain on your heart and blood vessels",
      action: "Reduce salt intake, exercise regularly, manage stress",
      severity: "serious",
    },
    cholesterol: {
      simple: "Waxy substance in blood that can build up in arteries",
      action: "Eat healthy fats, avoid trans fats, exercise regularly",
      severity: "moderate",
    },
  },
  quickResponses: [
    "Can you explain my blood test results?",
    "What should I eat for diabetes?",
    "How to manage high blood pressure?",
    "Side effects of my medication?",
    "Healthy exercise routine suggestions",
    "When should I see a doctor?",
  ],
  errorMessages: {
    en: "I'm having trouble processing your request. Please try again.",
    hi: "मुझे आपके अनुरोध को संसाधित करने में समस्या हो रही है। कृपया पुनः प्रयास करें।",
    ta: "உங்கள் கோரிக்கையை செயல்படுத்துவதில் சிக்கல் உள்ளது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
  },
}

export default function AIChatbot({ user }) {
  const [currentView, setCurrentView] = useState("chat") // 'chat' or 'history'
  const [currentChatId, setCurrentChatId] = useState(null)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: mockChatResponses.greetings[user.language] || mockChatResponses.greetings.en,
      timestamp: new Date(),
      language: user.language,
      status: "delivered",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(user.language)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [connectionStatus, setConnectionStatus] = useState("connected")
  const [retryCount, setRetryCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [typingIndicator, setTypingIndicator] = useState(false)
  const [messageRatings, setMessageRatings] = useState({})
  const [error, setError] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  const speechSynthesis = useRef(null)
  const retryTimeoutRef = useRef(null)

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
      setConnectionStatus("connected")
      setError(null)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setConnectionStatus("disconnected")
      setError("You're currently offline. Messages will be sent when connection is restored.")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel()
      }
    }
  }, [])

  // Save chat to history when switching views or on significant events
  const saveChatToHistory = useCallback(() => {
    if (messages.length > 1 && currentChatId) {
      const chatData = {
        id: currentChatId,
        title: generateChatTitle(),
        summary: generateChatSummary(),
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        duration: calculateChatDuration(),
        messageCount: messages.length,
        language: selectedLanguage,
        tags: extractTags(),
        category: categorizeChat(),
        isBookmarked: false,
        isArchived: false,
        confidence: calculateAverageConfidence(),
        lastMessage: messages[messages.length - 1]?.content || "",
        participants: ["user", "ai"],
        attachments: uploadedFiles.length,
        status: "completed",
        messages: messages,
      }

      // Save to localStorage or send to backend
      const existingHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]")
      const updatedHistory = existingHistory.filter((chat) => chat.id !== currentChatId)
      updatedHistory.unshift(chatData)
      localStorage.setItem("chatHistory", JSON.stringify(updatedHistory))
    }
  }, [messages, currentChatId, selectedLanguage, uploadedFiles])

  const generateChatTitle = () => {
    const userMessages = messages.filter((m) => m.type === "user")
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].content
      return firstMessage.length > 50 ? firstMessage.substring(0, 50) + "..." : firstMessage
    }
    return "Health Consultation"
  }

  const generateChatSummary = () => {
    const topics = extractTags()
    return `Discussion about ${topics.slice(0, 3).join(", ")} and related health topics`
  }

  const calculateChatDuration = () => {
    if (messages.length < 2) return "0 min"
    const start = messages[1].timestamp
    const end = messages[messages.length - 1].timestamp
    const diffInMinutes = Math.floor((end - start) / (1000 * 60))
    return `${diffInMinutes} min`
  }

  const extractTags = () => {
    const content = messages.map((m) => m.content.toLowerCase()).join(" ")
    const healthKeywords = [
      "diabetes",
      "blood pressure",
      "hypertension",
      "cholesterol",
      "medication",
      "exercise",
      "diet",
      "nutrition",
      "sleep",
      "stress",
      "heart",
      "weight",
      "blood test",
      "symptoms",
    ]
    return healthKeywords.filter((keyword) => content.includes(keyword))
  }

  const categorizeChat = () => {
    const tags = extractTags()
    if (tags.some((tag) => ["blood test", "report", "results"].includes(tag))) return "Medical Reports"
    if (tags.some((tag) => ["medication", "medicine", "drug"].includes(tag))) return "Medication"
    if (tags.some((tag) => ["exercise", "fitness", "diet", "nutrition"].includes(tag))) return "Lifestyle"
    if (tags.some((tag) => ["sleep", "stress", "mental"].includes(tag))) return "Mental Health"
    return "Health Management"
  }

  const calculateAverageConfidence = () => {
    const aiMessages = messages.filter((m) => m.type === "ai" && m.confidence)
    if (aiMessages.length === 0) return 0.85
    return aiMessages.reduce((sum, m) => sum + m.confidence, 0) / aiMessages.length
  }

  const generateAIResponse = async (userMessage, attempt = 1) => {
    try {
      setIsLoading(true)
      setTypingIndicator(true)
      setConnectionStatus("processing")
      setError(null)

      // Simulate network delay with potential failure
      const delay = 1500 + Math.random() * 1000
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional network failures
          if (Math.random() < 0.1 && attempt === 1) {
            reject(new Error("Network timeout"))
          } else {
            resolve()
          }
        }, delay)
      })

      const lowerMessage = userMessage.toLowerCase()
      let response = ""
      let confidence = 0.85
      let sources = ["Medical Database", "Health Guidelines"]
      let suggestions = ["Consult your doctor", "Monitor symptoms", "Follow medication schedule"]

      // Enhanced response generation
      if (lowerMessage.includes("diabetes")) {
        const term = mockChatResponses.medicalTerms.diabetes
        response = `${term.simple}. Here's what you can do: ${term.action}. This condition is ${term.severity} with proper care.`
        confidence = 0.92
        sources = ["Diabetes Care Guidelines", "Medical Research"]
        suggestions = ["Check blood sugar regularly", "Maintain healthy diet", "Exercise daily"]
      } else if (lowerMessage.includes("blood pressure") || lowerMessage.includes("hypertension")) {
        const term = mockChatResponses.medicalTerms.hypertension
        response = `${term.simple}. Here's what you can do: ${term.action}. This condition is ${term.severity} and requires attention.`
        confidence = 0.89
        sources = ["Cardiology Guidelines", "Blood Pressure Research"]
        suggestions = ["Monitor BP daily", "Reduce sodium intake", "Manage stress levels"]
      } else if (lowerMessage.includes("cholesterol")) {
        const term = mockChatResponses.medicalTerms.cholesterol
        response = `${term.simple}. Here's what you can do: ${term.action}. This condition is ${term.severity}.`
        confidence = 0.87
        sources = ["Lipid Management Guidelines", "Nutrition Research"]
        suggestions = ["Get lipid panel test", "Eat heart-healthy foods", "Exercise regularly"]
      } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("नमस्ते")) {
        response = mockChatResponses.greetings[selectedLanguage] || mockChatResponses.greetings.en
        confidence = 0.95
        suggestions = ["Ask about symptoms", "Upload medical reports", "Get health tips"]
      } else if (lowerMessage.includes("report") || lowerMessage.includes("test")) {
        response =
          "I can help you understand your medical reports. Please upload your report and I'll explain the key findings in simple terms. I can analyze blood tests, imaging reports, and other diagnostic documents."
        confidence = 0.88
        suggestions = ["Upload report file", "Ask specific questions", "Schedule follow-up"]
      } else if (lowerMessage.includes("medication") || lowerMessage.includes("medicine")) {
        response =
          "I can provide information about medications, including side effects, interactions, and proper usage. However, always consult your doctor before making any changes to your medication regimen. What specific medication would you like to know about?"
        confidence = 0.9
        suggestions = ["Check drug interactions", "Set medication reminders", "Consult pharmacist"]
      } else if (lowerMessage.includes("emergency") || lowerMessage.includes("urgent")) {
        response =
          "⚠️ If this is a medical emergency, please call emergency services immediately or go to the nearest hospital. For urgent but non-emergency health concerns, contact your healthcare provider. I'm here to provide general health information and support."
        confidence = 0.95
        suggestions = ["Call emergency services", "Contact your doctor", "Visit urgent care"]
      } else {
        // Generic helpful response
        const genericResponses = [
          "That's a great question about your health. Based on your profile, I recommend consulting with your healthcare provider for personalized advice. I can provide general information to help you understand your health better.",
          "I understand your concern. Let me help you with some general information, but please remember to discuss this with your doctor for personalized medical advice.",
          "Thank you for sharing that with me. Here's some general health information that might be helpful, though your doctor can provide more specific guidance based on your individual health profile.",
        ]
        response = genericResponses[Math.floor(Math.random() * genericResponses.length)]
        confidence = 0.75
      }

      setConnectionStatus("connected")
      setRetryCount(0)
      return { response, confidence, sources, suggestions }
    } catch (error) {
      console.error("AI Response Error:", error)
      setConnectionStatus("error")

      if (attempt < 3) {
        setRetryCount(attempt)
        // Exponential backoff retry
        const retryDelay = Math.pow(2, attempt) * 1000
        retryTimeoutRef.current = setTimeout(() => {
          return generateAIResponse(userMessage, attempt + 1)
        }, retryDelay)
        throw error
      } else {
        const errorResponse = mockChatResponses.errorMessages[selectedLanguage] || mockChatResponses.errorMessages.en
        return {
          response: errorResponse,
          confidence: 0.0,
          sources: [],
          suggestions: ["Try again later", "Check your connection", "Contact support"],
          isError: true,
        }
      }
    } finally {
      setIsLoading(false)
      setTypingIndicator(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const messageText = inputMessage.trim()
    setInputMessage("")

    // Generate chat ID if this is a new chat
    if (!currentChatId) {
      setCurrentChatId(`chat_${Date.now()}`)
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: messageText,
      timestamp: new Date(),
      language: selectedLanguage,
      status: "sent",
    }

    setMessages((prev) => [...prev, userMessage])

    try {
      const aiResponse = await generateAIResponse(messageText)
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: aiResponse.response,
        timestamp: new Date(),
        language: selectedLanguage,
        confidence: aiResponse.confidence,
        sources: aiResponse.sources,
        suggestions: aiResponse.suggestions,
        status: "delivered",
        isError: aiResponse.isError || false,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Auto-speak response if enabled
      if (isSpeaking && !aiResponse.isError) {
        speakMessage(aiResponse.response)
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
        language: selectedLanguage,
        status: "failed",
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
      setError("Failed to send message. Please try again.")
    }
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    // Validate file types and sizes
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf", "text/plain"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    const validFiles = files.filter((file) => {
      if (!validTypes.includes(file.type)) {
        setError(`File type ${file.type} is not supported. Please upload images, PDFs, or text files.`)
        return false
      }
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 10MB.`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const newFiles = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      status: "uploading",
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Simulate file processing
    newFiles.forEach((file, index) => {
      setTimeout(
        () => {
          setUploadedFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "processed" } : f)))

          if (index === newFiles.length - 1) {
            // Add AI response about file processing
            const fileMessage = {
              id: Date.now() + index + 2,
              type: "ai",
              content: `I've successfully processed ${newFiles.length} file(s). ${
                newFiles[0].type.includes("image")
                  ? "I can see this is a medical image. Let me analyze it for you."
                  : "I've reviewed the document content. How can I help you understand the information?"
              }`,
              timestamp: new Date(),
              language: selectedLanguage,
              hasFile: true,
              status: "delivered",
            }
            setMessages((prev) => [...prev, fileMessage])
          }
        },
        2000 + index * 500,
      )
    })
  }

  const handleVoiceToggle = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true)
      setError(null)

      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false)
        const voiceInput = "This is a simulated voice input about my health concerns and symptoms..."
        setInputMessage(voiceInput)
        textareaRef.current?.focus()
      }, 3000)
    } else {
      // Stop recording
      setIsRecording(false)
    }
  }

  const speakMessage = (text) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.current = window.speechSynthesis
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = selectedLanguage === "hi" ? "hi-IN" : selectedLanguage === "ta" ? "ta-IN" : "en-US"
      utterance.rate = 0.9
      utterance.pitch = 1
      speechSynthesis.current.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel()
    }
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      // Show temporary success feedback
      setError(null)
    })
  }

  const rateMessage = (messageId, rating) => {
    setMessageRatings((prev) => ({ ...prev, [messageId]: rating }))
  }

  const handleQuickResponse = (response) => {
    setInputMessage(response)
    textareaRef.current?.focus()
  }

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const retryLastMessage = () => {
    const lastUserMessage = [...messages].reverse().find((msg) => msg.type === "user")
    if (lastUserMessage) {
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "ai",
        content: mockChatResponses.greetings[selectedLanguage] || mockChatResponses.greetings.en,
        timestamp: new Date(),
        language: selectedLanguage,
        status: "delivered",
      },
    ])
    setUploadedFiles([])
    setError(null)
    setMessageRatings({})
    setCurrentChatId(null)
  }

  const exportChat = () => {
    const chatData = {
      user: user.name,
      timestamp: new Date().toISOString(),
      messages: messages.map((msg) => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
    }
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `health-chat-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleResumeChat = (chatData) => {
    setCurrentChatId(chatData.id)
    setMessages(chatData.messages || [])
    setSelectedLanguage(chatData.language)
    setUploadedFiles([])
    setCurrentView("chat")
  }

  const handleBackToHistory = () => {
    saveChatToHistory()
    setCurrentView("history")
  }

  const startNewChat = () => {
    saveChatToHistory()
    clearChat()
    setCurrentView("chat")
  }

  if (currentView === "history") {
    return <ChatHistory user={user} onResumeChat={handleResumeChat} />
  }

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-[#1F1F1F]" : ""}`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-[#262626] via-[#2A2A2A] to-[#262626] border-b border-[#404040]/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHistory}
              className="text-[#A3A3A3] hover:text-white hover:bg-[#404040] rounded-xl"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3ECF8E] to-[#2DD4BF] rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="text-black" size={24} />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#262626] ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "processing"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI Health Assistant</h2>
              <p className="text-[#A3A3A3] text-sm flex items-center">
                {connectionStatus === "connected" && "🟢 Online"}
                {connectionStatus === "processing" && "🟡 Processing..."}
                {connectionStatus === "error" && "🔴 Connection issues"}
                {connectionStatus === "disconnected" && "⚫ Offline"}
                {retryCount > 0 && ` • Retry ${retryCount}/3`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToHistory}
              className="bg-transparent border-[#404040] text-[#A3A3A3] hover:text-white rounded-xl transition-all duration-300"
            >
              <History className="mr-2" size={16} />
              History
            </Button>

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-32 bg-[#1F1F1F] border-[#404040] text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-[#404040]">
                <SelectItem value="en" className="text-white hover:bg-[#404040]">
                  🇺🇸 English
                </SelectItem>
                <SelectItem value="hi" className="text-white hover:bg-[#404040]">
                  🇮🇳 हिंदी
                </SelectItem>
                <SelectItem value="ta" className="text-white hover:bg-[#404040]">
                  🇮🇳 தமிழ்
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSpeaking(!isSpeaking)}
              className={`bg-transparent border-[#404040] rounded-xl transition-all duration-300 ${
                isSpeaking ? "text-[#3ECF8E] border-[#3ECF8E]" : "text-[#A3A3A3] hover:text-white"
              }`}
            >
              {isSpeaking ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-transparent border-[#404040] text-[#A3A3A3] hover:text-white rounded-xl transition-all duration-300"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportChat}
              className="bg-transparent border-[#404040] text-[#A3A3A3] hover:text-white rounded-xl transition-all duration-300"
            >
              <Download size={16} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={startNewChat}
              className="bg-transparent border-[#404040] text-[#A3A3A3] hover:text-white rounded-xl transition-all duration-300"
            >
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="text-red-400" size={20} />
                <span className="text-red-200 text-sm">{error}</span>
              </div>
              <div className="flex items-center space-x-2">
                {connectionStatus === "error" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryLastMessage}
                    className="bg-transparent border-red-400 text-red-400 hover:bg-red-400/10 rounded-xl"
                  >
                    <RefreshCw size={14} className="mr-1" />
                    Retry
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:bg-red-400/10 rounded-xl"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Response Buttons */}
      <div className="p-6 border-b border-[#404040]/30">
        <div className="flex flex-wrap gap-3">
          {mockChatResponses.quickResponses.map((response, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickResponse(response)}
              className="bg-gradient-to-r from-[#1F1F1F] to-[#262626] border-[#404040] text-[#A3A3A3] hover:border-[#3ECF8E] hover:text-white text-xs rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              {response}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-6 ${
                  message.type === "user"
                    ? "bg-gradient-to-br from-[#3ECF8E] to-[#2DD4BF] text-black"
                    : message.isError
                      ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 text-white"
                      : "bg-gradient-to-br from-[#262626] to-[#1F1F1F] text-white border border-[#404040]/50"
                }`}
              >
                <div className="flex items-start space-x-4">
                  {message.type === "ai" && (
                    <div
                      className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 ${
                        message.isError ? "bg-red-500/20 text-red-400" : "bg-[#3ECF8E]/20 text-[#3ECF8E]"
                      }`}
                    >
                      {message.isError ? <AlertCircle size={16} /> : <Bot size={16} />}
                    </div>
                  )}
                  {message.type === "user" && (
                    <div className="w-8 h-8 bg-black/20 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={16} className="text-black" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>

                    {/* Message metadata for AI responses */}
                    {message.type === "ai" && !message.isError && (
                      <div className="mt-4 space-y-3">
                        {message.confidence && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-[#A3A3A3]">Confidence:</span>
                            <div className="flex-1 h-1 bg-[#404040] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] rounded-full transition-all duration-1000"
                                style={{ width: `${message.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-[#3ECF8E] font-medium">
                              {Math.round(message.confidence * 100)}%
                            </span>
                          </div>
                        )}

                        {message.suggestions && message.suggestions.length > 0 && (
                          <div>
                            <p className="text-xs text-[#A3A3A3] mb-2">Suggestions:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-[#3ECF8E]/10 border-[#3ECF8E]/30 text-[#3ECF8E] text-xs cursor-pointer hover:bg-[#3ECF8E]/20 transition-colors"
                                  onClick={() => handleQuickResponse(suggestion)}
                                >
                                  {suggestion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {message.sources && message.sources.length > 0 && (
                          <div>
                            <p className="text-xs text-[#A3A3A3] mb-1">Sources:</p>
                            <p className="text-xs text-[#A3A3A3]">{message.sources.join(", ")}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message actions */}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {message.status === "failed" && " • Failed"}
                        {message.status === "sent" && " • Sent"}
                        {message.status === "delivered" && " • ✓"}
                      </span>
                      {message.type === "ai" && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(message.content)}
                            className="h-8 w-8 p-0 hover:bg-white/10 rounded-xl transition-all duration-300"
                          >
                            <Copy size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakMessage(message.content)}
                            className="h-8 w-8 p-0 hover:bg-white/10 rounded-xl transition-all duration-300"
                          >
                            <Volume2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rateMessage(message.id, "up")}
                            className={`h-8 w-8 p-0 hover:bg-white/10 rounded-xl transition-all duration-300 ${
                              messageRatings[message.id] === "up" ? "text-[#3ECF8E]" : ""
                            }`}
                          >
                            <ThumbsUp size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rateMessage(message.id, "down")}
                            className={`h-8 w-8 p-0 hover:bg-white/10 rounded-xl transition-all duration-300 ${
                              messageRatings[message.id] === "down" ? "text-red-400" : ""
                            }`}
                          >
                            <ThumbsDown size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {typingIndicator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-br from-[#262626] to-[#1F1F1F] border border-[#404040]/50 rounded-3xl p-6 flex items-center space-x-4">
                <div className="w-8 h-8 bg-[#3ECF8E]/20 rounded-2xl flex items-center justify-center">
                  <Bot size={16} className="text-[#3ECF8E]" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#3ECF8E] rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-[#3ECF8E] rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-[#3ECF8E] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
                <span className="text-[#A3A3A3] text-sm">AI is thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 border-t border-[#404040]/30"
          >
            <div className="flex flex-wrap gap-3">
              {uploadedFiles.map((file) => (
                <Card key={file.id} className="bg-[#262626] border-[#404040] p-3 rounded-2xl">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#3ECF8E]/10 flex items-center justify-center">
                        {file.type.includes("image") ? (
                          <ImageIcon size={16} className="text-[#3ECF8E]" />
                        ) : (
                          <FileText size={16} className="text-[#3ECF8E]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{file.name}</p>
                        <p className="text-[#A3A3A3] text-xs">
                          {(file.size / 1024 / 1024).toFixed(1)} MB • {file.status === "uploading" && "Uploading..."}
                          {file.status === "processed" && "✓ Processed"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0 text-[#A3A3A3] hover:text-red-400 hover:bg-red-400/10 rounded-xl"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Input Area */}
      <div className="p-6 border-t border-[#404040]/30 bg-gradient-to-r from-[#262626] via-[#2A2A2A] to-[#262626]">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isOnline
                  ? "Ask me about your health..."
                  : "You're offline. Messages will be sent when connection is restored."
              }
              className="bg-[#1F1F1F] border-[#404040] text-white placeholder:text-[#A3A3A3] focus:border-[#3ECF8E] resize-none rounded-2xl min-h-[60px] max-h-[120px]"
              rows={2}
              disabled={!isOnline}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
          </div>

          <div className="flex flex-col space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="hidden"
              multiple
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isOnline}
              className="bg-transparent border-[#404040] text-[#A3A3A3] hover:border-[#3ECF8E] hover:text-white rounded-2xl h-12 px-4 transition-all duration-300 transform hover:scale-105"
            >
              <Upload size={18} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleVoiceToggle}
              disabled={!isOnline}
              className={`bg-transparent border-[#404040] hover:border-[#3ECF8E] hover:text-white rounded-2xl h-12 px-4 transition-all duration-300 transform hover:scale-105 ${
                isRecording ? "text-[#F97316] border-[#F97316] animate-pulse" : "text-[#A3A3A3]"
              }`}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>

            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || !isOnline}
              className="bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black rounded-2xl h-12 px-6 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </Button>
          </div>
        </div>

        {/* Voice Recording Indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center justify-center space-x-3 text-[#F97316] text-sm"
            >
              <div className="w-3 h-3 bg-[#F97316] rounded-full animate-pulse" />
              <span>Recording... Speak clearly about your health concerns</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRecording(false)}
                className="text-[#F97316] hover:bg-[#F97316]/10 rounded-xl"
              >
                Stop
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Offline Indicator */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center justify-center space-x-2 text-[#A3A3A3] text-sm"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>You're currently offline. Check your internet connection.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
