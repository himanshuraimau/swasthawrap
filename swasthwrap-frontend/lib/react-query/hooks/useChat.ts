import { useChatStore } from "@/store"
import { 
  useSendMessage, 
  useChatHistory, 
  useChatSession, 
  useStartNewSession,
  useDeleteSession,
  useUploadDocument,
  useVoiceToText,
  useTextToSpeech
} from "../queries/chat"
import type { ChatRequest, NewSessionRequest, TextToSpeechRequest } from "@/types/api"

export function useChat() {
  const { messages, isTyping, currentSessionId, clearMessages, setSessionId } = useChatStore()

  const sendMessageMutation = useSendMessage()
  const startNewSessionMutation = useStartNewSession()
  const deleteSessionMutation = useDeleteSession()
  const uploadDocumentMutation = useUploadDocument()
  const voiceToTextMutation = useVoiceToText()
  const textToSpeechMutation = useTextToSpeech()

  const { data: chatHistory, isLoading: isLoadingHistory } = useChatHistory()
  const { data: sessionMessages, isLoading: isLoadingSession } = useChatSession(currentSessionId || "")

  const sendMessage = async (request: ChatRequest) => {
    return sendMessageMutation.mutateAsync(request)
  }

  const startNewSession = async (language: "en" | "hi" | "ta" = "en") => {
    const response = await startNewSessionMutation.mutateAsync({ language })
    setSessionId(response.data.sessionId)
    clearMessages()
    
    // Add greeting message
    const { addMessage } = useChatStore.getState()
    addMessage({
      id: response.data.greeting.messageId,
      type: "ai",
      content: response.data.greeting.content,
      timestamp: new Date(),
      language: response.data.greeting.language,
    })
    
    return response.data.sessionId
  }

  const loadSession = (sessionId: string) => {
    setSessionId(sessionId)
    clearMessages()
  }

  const deleteSession = async (sessionId: string) => {
    return deleteSessionMutation.mutateAsync(sessionId)
  }

  const uploadDocument = async (file: File) => {
    return uploadDocumentMutation.mutateAsync(file)
  }

  const convertVoiceToText = async (audio: File, language: string = "en") => {
    return voiceToTextMutation.mutateAsync({ audio, language })
  }

  const convertTextToSpeech = async (request: TextToSpeechRequest) => {
    return textToSpeechMutation.mutateAsync(request)
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
    isStartingSession: startNewSessionMutation.isPending,
    isDeletingSession: deleteSessionMutation.isPending,
    isUploadingDocument: uploadDocumentMutation.isPending,
    isConvertingVoice: voiceToTextMutation.isPending,
    isConvertingText: textToSpeechMutation.isPending,
    sendMessage,
    startNewSession,
    loadSession,
    deleteSession,
    uploadDocument,
    convertVoiceToText,
    convertTextToSpeech,
    sendError: sendMessageMutation.error,
    startSessionError: startNewSessionMutation.error,
    deleteSessionError: deleteSessionMutation.error,
    uploadError: uploadDocumentMutation.error,
    voiceError: voiceToTextMutation.error,
    speechError: textToSpeechMutation.error,
  }
}
