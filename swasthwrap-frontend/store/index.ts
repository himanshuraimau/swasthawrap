import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, ChatMessage, UserPreferences, SecuritySettings } from "@/types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  setLoading: (loading: boolean) => void
}

interface ChatState {
  messages: ChatMessage[]
  isTyping: boolean
  currentSessionId: string | null
  addMessage: (message: ChatMessage) => void
  setTyping: (typing: boolean) => void
  clearMessages: () => void
  setSessionId: (sessionId: string) => void
}

interface SettingsState {
  preferences: UserPreferences
  security: SecuritySettings
  updatePreferences: (updates: Partial<UserPreferences>) => void
  updateSecurity: (updates: Partial<SecuritySettings>) => void
  resetSettings: () => void
}

interface UIState {
  sidebarOpen: boolean
  activeSection: string
  notifications: number
  theme: "dark" | "light"
  setSidebarOpen: (open: boolean) => void
  setActiveSection: (section: string) => void
  setNotifications: (count: number) => void
  setTheme: (theme: "dark" | "light") => void
}

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user: User) => {
        set({ user, isAuthenticated: true, isLoading: false })
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, isLoading: false })
        localStorage.removeItem("swasthwrap_user")
      },
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates }
          set({ user: updatedUser })
        }
      },
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)

// Chat Store
export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isTyping: false,
  currentSessionId: null,
  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },
  setTyping: (typing: boolean) => {
    set({ isTyping: typing })
  },
  clearMessages: () => {
    set({ messages: [] })
  },
  setSessionId: (sessionId: string) => {
    set({ currentSessionId: sessionId })
  },
}))

// Settings Store
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      preferences: {
        language: { primary: "en", secondary: "hi" },
        units: { weight: "kg", height: "cm", temperature: "celsius" },
        notifications: {
          medication: { enabled: true, time: "09:00", sound: true },
          appointments: { enabled: true, advance: "1 hour", sound: true },
          healthTips: { enabled: true, frequency: "daily" },
          reports: { enabled: true, email: true },
          emergency: { enabled: true, sms: true },
        },
        display: {
          fontSize: "medium",
          animations: true,
          compactMode: false,
        },
        privacy: {
          shareWithDoctors: true,
          anonymousData: false,
          marketingEmails: false,
          dataRetention: "2 years",
        },
      },
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: new Date().toISOString(),
        loginSessions: [],
      },
      updatePreferences: (updates: Partial<UserPreferences>) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }))
      },
      updateSecurity: (updates: Partial<SecuritySettings>) => {
        set((state) => ({
          security: { ...state.security, ...updates },
        }))
      },
      resetSettings: () => {
        // Reset to default values
        set({
          preferences: {
            language: { primary: "en", secondary: "hi" },
            units: { weight: "kg", height: "cm", temperature: "celsius" },
            notifications: {
              medication: { enabled: true, time: "09:00", sound: true },
              appointments: { enabled: true, advance: "1 hour", sound: true },
              healthTips: { enabled: true, frequency: "daily" },
              reports: { enabled: true, email: true },
              emergency: { enabled: true, sms: true },
            },
            display: {
              fontSize: "medium",
              animations: true,
              compactMode: false,
            },
            privacy: {
              shareWithDoctors: true,
              anonymousData: false,
              marketingEmails: false,
              dataRetention: "2 years",
            },
          },
        })
      },
    }),
    {
      name: "settings-storage",
    },
  ),
)

// UI Store
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeSection: "dashboard",
  notifications: 3,
  theme: "dark",
  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open })
  },
  setActiveSection: (section: string) => {
    set({ activeSection: section })
  },
  setNotifications: (count: number) => {
    set({ notifications: count })
  },
  setTheme: (theme: "dark" | "light") => {
    set({ theme })
  },
}))
