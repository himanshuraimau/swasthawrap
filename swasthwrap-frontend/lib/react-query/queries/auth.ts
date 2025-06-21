import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { LoginRequest, RegisterRequest, UpdateProfileRequest, User, ApiResponse } from "@/types"
import { useAuthStore } from "@/store"

// Mock API functions (replace with actual API calls)
const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<User>> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock user data
    const mockUsers = [
      {
        id: "1",
        name: "Demo User",
        email: "demo@swasthwrap.com",
        language: "en" as const,
        interests: ["diabetes", "heart"],
        healthScore: 85,
        streak: 10,
        upcomingAppointments: 2,
        medicationsDue: 1,
      },
    ]

    const user = mockUsers.find((u) => u.email === credentials.email)

    if (user) {
      return { data: user, success: true, message: "Login successful" }
    } else {
      throw new Error("Invalid credentials")
    }
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<User>> => {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      healthScore: Math.floor(Math.random() * 25) + 70,
      streak: 0,
      upcomingAppointments: 0,
      medicationsDue: 0,
    }

    return { data: newUser, success: true, message: "Registration successful" }
  },

  updateProfile: async (updates: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock updated user
    const updatedUser: User = {
      id: "1",
      name: updates.name || "Demo User",
      email: updates.email || "demo@swasthwrap.com",
      language: "en",
      interests: ["diabetes", "heart"],
      healthScore: 85,
      streak: 10,
      upcomingAppointments: 2,
      medicationsDue: 1,
      ...updates,
    }

    return { data: updatedUser, success: true, message: "Profile updated successfully" }
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const storedUser = localStorage.getItem("swasthwrap_user")
    if (storedUser) {
      return { data: JSON.parse(storedUser), success: true }
    }

    throw new Error("No user found")
  },
}

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
}

// Hooks
export const useLogin = () => {
  const { login } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response) => {
      login(response.data)
      queryClient.setQueryData(authKeys.user(), response.data)
    },
    onError: (error) => {
      console.error("Login failed:", error)
    },
  })
}

export const useRegister = () => {
  const { login } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (response) => {
      login(response.data)
      queryClient.setQueryData(authKeys.user(), response.data)
    },
    onError: (error) => {
      console.error("Registration failed:", error)
    },
  })
}

export const useUpdateProfile = () => {
  const { updateUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (response) => {
      updateUser(response.data)
      queryClient.setQueryData(authKeys.user(), response.data)
    },
    onError: (error) => {
      console.error("Profile update failed:", error)
    },
  })
}

export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authAPI.getCurrentUser,
    enabled: isAuthenticated && !user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}
