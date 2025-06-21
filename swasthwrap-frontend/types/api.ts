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
  language: string
  sessionId?: string
  files?: FileUpload[]
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
