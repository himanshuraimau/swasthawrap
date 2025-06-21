import type { 
  LoginRequest, 
  RegisterRequest, 
  UpdateProfileRequest, 
  User, 
  ApiResponse,
  ChatUploadedFile
} from "@/types"
import type {
  ChatRequest,
  NewSessionRequest,
  VoiceToTextRequest,
  TextToSpeechRequest,
  ChatHistoryParams,
  SendMessageResponse,
  VoiceToTextResponse,
  TextToSpeechResponse,
  NewSessionResponse,
  ChatHistoryResponse,
  ChatSessionMessagesResponse
} from "@/types/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Helper function to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  } else if (obj !== null && typeof obj === 'object') {
    const camelObj: any = {}
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      camelObj[camelKey] = toCamelCase(value)
    }
    return camelObj
  }
  return obj
}

// Helper function to convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  } else if (obj !== null && typeof obj === 'object') {
    const snakeObj: any = {}
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      snakeObj[snakeKey] = toSnakeCase(value)
    }
    return snakeObj
  }
  return obj
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    
    // Get token from localStorage on client side
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Only set Content-Type for JSON requests
    const isFormData = options.body instanceof FormData
    if (!isFormData) {
      headers["Content-Type"] = "application/json"
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    // Convert body to snake_case if it's JSON
    let body = options.body
    if (body && typeof body === 'string') {
      try {
        const parsedBody = JSON.parse(body)
        body = JSON.stringify(toSnakeCase(parsedBody))
      } catch (e) {
        // If parsing fails, use original body
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        body,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      // Convert response to camelCase
      return toCamelCase(data)
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<User & { token: string }>> {
    const response = await this.request<User & { token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token)
    }
    
    return response
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User & { token: string }>> {
    const response = await this.request<User & { token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token)
    }
    
    return response
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>("/api/auth/me")
  }

  async updateProfile(updates: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return this.request<User>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>("/api/auth/logout", {
      method: "POST",
    })
    
    this.clearToken()
    return response
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.request<void>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    })
  }

  // Chat endpoints
  async sendMessage(request: ChatRequest): Promise<ApiResponse<SendMessageResponse>> {
    return this.request<SendMessageResponse>("/api/chat/message", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async getChatHistory(params: ChatHistoryParams = {}): Promise<ApiResponse<{
    data: ChatHistoryResponse[],
    total: number,
    page: number,
    limit: number
  }>> {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append("page", params.page.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())
    
    const endpoint = `/api/chat/history${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return this.request(endpoint)
  }

  async getChatSession(sessionId: string): Promise<ApiResponse<ChatSessionMessagesResponse[]>> {
    return this.request<ChatSessionMessagesResponse[]>(`/api/chat/session/${sessionId}`)
  }

  async deleteChatSession(sessionId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/chat/session/${sessionId}`, {
      method: "DELETE",
    })
  }

  async uploadDocument(file: File): Promise<ApiResponse<ChatUploadedFile>> {
    const formData = new FormData()
    formData.append("file", file)

    return this.request<ChatUploadedFile>("/api/chat/upload", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    })
  }

  async deleteDocument(fileId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/chat/document/${fileId}`, {
      method: "DELETE",
    })
  }

  async voiceToText(audio: File, language: string = "en"): Promise<ApiResponse<VoiceToTextResponse>> {
    const formData = new FormData()
    formData.append("audio", audio)
    formData.append("language", language)

    return this.request<VoiceToTextResponse>("/api/chat/voice-to-text", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    })
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<ApiResponse<TextToSpeechResponse>> {
    return this.request<TextToSpeechResponse>("/api/chat/text-to-speech", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async startNewSession(request: NewSessionRequest): Promise<ApiResponse<NewSessionResponse>> {
    return this.request<NewSessionResponse>("/api/chat/session/new", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
