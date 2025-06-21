import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ChatMessage, ChatSession, ApiResponse, PaginatedResponse } from "@/types"
import type { 
  ChatRequest, 
  NewSessionRequest,
  VoiceToTextRequest,
  TextToSpeechRequest,
  SendMessageResponse,
  VoiceToTextResponse,
  TextToSpeechResponse,
  NewSessionResponse,
  ChatHistoryResponse,
  ChatSessionMessagesResponse
} from "@/types/api"
import { useChatStore } from "@/store"
import { apiClient } from "@/lib/api"

// Query keys
export const chatKeys = {
  all: ["chat"] as const,
  history: (page?: number) => [...chatKeys.all, "history", page] as const,
  session: (id: string) => [...chatKeys.all, "session", id] as const,
}

// Hooks
export const useSendMessage = () => {
  const { addMessage, setTyping } = useChatStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ChatRequest) => apiClient.sendMessage(request),
    onMutate: async (request) => {
      setTyping(true)

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now(),
        type: "user",
        content: request.message,
        timestamp: new Date(),
        language: request.language,
      }
      addMessage(userMessage)
    },
    onSuccess: (response, request) => {
      setTyping(false)

      // Add AI response
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response.data.content,
        timestamp: new Date(),
        language: request.language,
        confidence: response.data.confidence,
      }
      addMessage(aiMessage)

      // Invalidate chat history to refresh
      queryClient.invalidateQueries({ queryKey: chatKeys.history() })
    },
    onError: (error) => {
      setTyping(false)
      console.error("Failed to send message:", error)
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "Sorry, I'm having trouble processing your message. Please try again.",
        timestamp: new Date(),
        language: "en",
      }
      addMessage(errorMessage)
    },
  })
}

export const useChatHistory = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: chatKeys.history(page),
    queryFn: async () => {
      const response = await apiClient.getChatHistory({ page, limit })
      return {
        data: response.data.data.map((session: ChatHistoryResponse): ChatSession => ({
          id: session.id,
          date: session.date,
          title: session.title,
          language: session.language,
          messageCount: session.messageCount,
          messages: session.messageCount,
          summary: `Chat with ${session.messageCount} messages`,
          tags: [],
          bookmark: false,
          duration: "N/A"
        })),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        hasMore: response.data.page * response.data.limit < response.data.total
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useChatSession = (sessionId: string) => {
  return useQuery({
    queryKey: chatKeys.session(sessionId),
    queryFn: async () => {
      const response = await apiClient.getChatSession(sessionId)
      return {
        data: response.data.map((msg: ChatSessionMessagesResponse): ChatMessage => ({
          id: msg.id,
          type: msg.type as "user" | "ai",
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          language: msg.language,
          hasFile: msg.hasFile
        }))
      }
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useStartNewSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: NewSessionRequest) => apiClient.startNewSession(request),
    onSuccess: () => {
      // Invalidate chat history to refresh
      queryClient.invalidateQueries({ queryKey: chatKeys.history() })
    },
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (sessionId: string) => apiClient.deleteChatSession(sessionId),
    onSuccess: () => {
      // Invalidate chat history to refresh
      queryClient.invalidateQueries({ queryKey: chatKeys.history() })
    },
  })
}

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: (file: File) => apiClient.uploadDocument(file),
  })
}

export const useVoiceToText = () => {
  return useMutation({
    mutationFn: ({ audio, language }: { audio: File; language: string }) => 
      apiClient.voiceToText(audio, language),
  })
}

export const useTextToSpeech = () => {
  return useMutation({
    mutationFn: (request: TextToSpeechRequest) => apiClient.textToSpeech(request),
  })
}
