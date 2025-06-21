export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  language: string
  interests: string[]
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  address?: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
}

export interface ChatRequest {
  message: string
  language: "en" | "hi" | "ta"
  sessionId?: string
  files?: ChatFile[]
}

export interface ChatFile {
  name: string
  size: number
  type: string
  data: string // base64 encoded
}

export interface NewSessionRequest {
  language: "en" | "hi" | "ta"
}

export interface VoiceToTextRequest {
  audio: File
  language: "en" | "hi" | "ta"
}

export interface TextToSpeechRequest {
  text: string
  language: "en" | "hi" | "ta"
  voice?: string
  speed?: number
}

export interface ChatHistoryParams {
  page?: number
  limit?: number
}

export interface SendMessageResponse {
  content: string
  confidence: number
  sessionId: string
}

export interface VoiceToTextResponse {
  text: string
  confidence: number
  language: string
}

export interface TextToSpeechResponse {
  audioUrl: string
  duration: number
}

export interface NewSessionResponse {
  sessionId: string
  greeting: {
    content: string
    language: string
    messageId: string
  }
}

export interface ChatHistoryResponse {
  id: string
  date: string
  title: string
  language: string
  messageCount: number
}

export interface ChatSessionMessagesResponse {
  id: string
  type: string
  content: string
  timestamp: string
  language: string
  hasFile?: boolean
}

export interface UploadDocumentRequest {
  file: File
  category: string
  tags: string[]
  description?: string
}

export interface UpdateSettingsRequest {
  preferences?: Partial<UserPreferences>
  security?: Partial<SecuritySettings>
}

export interface CreateHealthGoalRequest {
  goal: string
  target: string
  unit: string
  deadline?: string
  category?: string
}

export interface UpdateHealthMetricRequest {
  type: string
  value: string
  unit: string
  date: string
  notes?: string
}

export interface FileUpload {
  name: string
  size: number
  type: string
  data: string
}

export interface UserPreferences {
  theme: string
  notifications: {
    email: boolean
    push: boolean
  }
}

export interface SecuritySettings {
  twoFactorAuth: boolean
  passwordReset: boolean
}
