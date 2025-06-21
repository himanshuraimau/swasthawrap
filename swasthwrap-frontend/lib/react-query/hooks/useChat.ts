import { useChatStore } from "@/store"
import { useSendMessage, useChatHistory, useChatSession } from "../queries/chat"
import type { ChatRequest } from "@/types"

export function useChat() {
  const { messages, isTyping, currentSessionId, clearMessages, setSessionId } = useChatStore()

  const sendMessageMutation = useSendMessage()
  const { data: chatHistory, isLoading: isLoadingHistory } = useChatHistory()
  const { data: sessionMessages, isLoading: isLoadingSession } = useChatSession(currentSessionId || "")

  const sendMessage = async (request: ChatRequest) => {
    return sendMessageMutation.mutateAsync(request)
  }

  const startNewSession = () => {
    clearMessages()
    setSessionId("")
  }

  const loadSession = (sessionId: string) => {
    setSessionId(sessionId)
    clearMessages()
  }

  return {
    messages,
    isTyping,
    currentSessionId,
    chatHistory: chatHistory?.data || [],
    sessionMessages: sessionMessages?.data || [],
    isLoadingHistory,
    isLoadingSession,
    isSending: sendMessageMutation.isPending,
    sendMessage,
    startNewSession,
    loadSession,
    sendError: sendMessageMutation.error,
  }
}
