import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ChatRequest, ChatMessage, ChatSession, AIResponse, ApiResponse, PaginatedResponse } from "@/types"
import { useChatStore } from "@/store"

// Mock API functions
const chatAPI = {
  sendMessage: async (request: ChatRequest): Promise<ApiResponse<AIResponse>> => {
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

    const lowerMessage = request.message.toLowerCase()
    let content = ""

    // Mock AI responses based on message content
    if (lowerMessage.includes("diabetes")) {
      content =
        "High blood sugar condition that affects how your body processes glucose. Here's what you can do: Monitor diet, exercise regularly, take prescribed medications. This condition is manageable with proper care."
    } else if (lowerMessage.includes("blood pressure") || lowerMessage.includes("hypertension")) {
      content =
        "High blood pressure that puts extra strain on your heart and blood vessels. Here's what you can do: Reduce salt intake, exercise regularly, manage stress. This condition is serious and requires attention."
    } else if (lowerMessage.includes("cholesterol")) {
      content =
        "Waxy substance in blood that can build up in arteries. Here's what you can do: Eat healthy fats, avoid trans fats, exercise regularly. This condition is moderate."
    } else {
      const genericResponses = [
        "That's a great question about your health. Based on your profile, I recommend consulting with your healthcare provider for personalized advice.",
        "I understand your concern. Let me help you with some general information, but please remember to discuss this with your doctor.",
        "Thank you for sharing that with me. Here's some general health information that might be helpful, though your doctor can provide more specific guidance.",
      ]
      content = genericResponses[Math.floor(Math.random() * genericResponses.length)]
    }

    return {
      data: {
        content,
        confidence: 0.85,
        sources: ["Medical Database", "Health Guidelines"],
        suggestions: ["Consult your doctor", "Monitor symptoms", "Follow medication schedule"],
      },
      success: true,
    }
  },

  getChatHistory: async (page = 1, limit = 10): Promise<PaginatedResponse<ChatSession>> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const mockSessions: ChatSession[] = [
      {
        id: 1,
        date: "2024-06-20",
        title: "Blood Test Results Discussion",
        summary: "Discussed elevated glucose levels and dietary recommendations",
        messages: 12,
        language: "hi",
        tags: ["diabetes", "diet", "blood-test"],
        bookmark: true,
        duration: "15 min",
      },
      {
        id: 2,
        date: "2024-06-18",
        title: "Medication Side Effects Query",
        summary: "Asked about potential side effects of Metformin",
        messages: 8,
        language: "en",
        tags: ["medication", "side-effects"],
        bookmark: false,
        duration: "8 min",
      },
      {
        id: 3,
        date: "2024-06-15",
        title: "Exercise Routine Planning",
        summary: "Created a personalized exercise plan for diabetes management",
        messages: 20,
        language: "en",
        tags: ["exercise", "diabetes", "fitness"],
        bookmark: true,
        duration: "25 min",
      },
    ]

    return {
      data: mockSessions,
      total: mockSessions.length,
      page,
      limit,
      hasMore: false,
    }
  },

  getChatSession: async (sessionId: string): Promise<ApiResponse<ChatMessage[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockMessages: ChatMessage[] = [
      {
        id: 1,
        type: "ai",
        content: "Hello! How can I help you with your health today?",
        timestamp: new Date(),
        language: "en",
      },
    ]

    return { data: mockMessages, success: true }
  },
}

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
    mutationFn: chatAPI.sendMessage,
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
      }
      addMessage(aiMessage)

      // Invalidate chat history to refresh
      queryClient.invalidateQueries({ queryKey: chatKeys.history() })
    },
    onError: () => {
      setTyping(false)
    },
  })
}

export const useChatHistory = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: chatKeys.history(page),
    queryFn: () => chatAPI.getChatHistory(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useChatSession = (sessionId: string) => {
  return useQuery({
    queryKey: chatKeys.session(sessionId),
    queryFn: () => chatAPI.getChatSession(sessionId),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
