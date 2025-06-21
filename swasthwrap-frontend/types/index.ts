export interface User {
  id: string
  name: string
  email: string
  password?: string
  language: "en" | "hi" | "ta"
  interests: string[]
  healthScore: number
  streak: number
  upcomingAppointments: number
  medicationsDue: number
  avatar?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  address?: string
  emergencyContact?: EmergencyContact
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface ChatMessage {
  id: number
  type: "user" | "ai"
  content: string
  timestamp: Date
  language: string
  hasFile?: boolean
}

export interface ChatSession {
  id: number
  date: string
  title: string
  summary: string
  messages: number
  language: string
  tags: string[]
  bookmark: boolean
  duration: string
}

export interface MedicalDocument {
  id: number
  name: string
  type: string
  date: string
  size: string
  category: string
  tags: string[]
  status: string
  url?: string
}

export interface MedicalCondition {
  id: number
  name: string
  diagnosed: string
  status: "Managed" | "Controlled" | "Active" | "Resolved"
  severity: "Mild" | "Moderate" | "Severe"
  medications: string[]
  lastUpdate: string
  notes: string
}

export interface HealthMetric {
  date: string
  type: string
  value: string
  unit: string
  status: "Normal" | "Elevated" | "Low" | "High" | "Fair" | "Stable"
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  prescribedBy: string
  startDate?: string
  endDate?: string
  instructions?: string
}

export interface HealthGoal {
  goal: string
  target: string
  current: string
  unit: string
  progress: number
  deadline?: string
  category?: string
}

export interface NotificationSettings {
  medication: {
    enabled: boolean
    time: string
    sound: boolean
  }
  appointments: {
    enabled: boolean
    advance: string
    sound: boolean
  }
  healthTips: {
    enabled: boolean
    frequency: string
  }
  reports: {
    enabled: boolean
    email: boolean
  }
  emergency: {
    enabled: boolean
    sms: boolean
  }
}

export interface UserPreferences {
  language: {
    primary: string
    secondary: string
  }
  units: {
    weight: "kg" | "lbs"
    height: "cm" | "ft"
    temperature: "celsius" | "fahrenheit"
  }
  notifications: NotificationSettings
  display: {
    fontSize: "small" | "medium" | "large"
    animations: boolean
    compactMode: boolean
  }
  privacy: {
    shareWithDoctors: boolean
    anonymousData: boolean
    marketingEmails: boolean
    dataRetention: string
  }
}

export interface ConnectedService {
  name: string
  connected: boolean
  lastSync: string | null
}

export interface LoginSession {
  device: string
  location: string
  lastActive: string
  current: boolean
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  lastPasswordChange: string
  loginSessions: LoginSession[]
}

export interface DashboardStats {
  totalReports: number
  chatSessions: number
  healthGoalsAchieved: number
  medicationsTracked: number
}

export interface ActivityItem {
  type: string
  content: string
  time: string
  icon: string
}

export interface Reminder {
  type: string
  title: string
  time: string
  urgent: boolean
}

export interface HealthTip {
  en: string
  hi: string
  ta: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface FileUpload {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
}

export interface AIResponse {
  content: string
  confidence: number
  sources?: string[]
  suggestions?: string[]
}

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
