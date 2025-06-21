import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { LoginRequest, RegisterRequest, UpdateProfileRequest, User, ApiResponse } from "@/types"
import { useAuthStore } from "@/store"
import { apiClient } from "@/lib/api"

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
}

// Hooks
export const useLogin = () => {
  const { login } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<User & { token: string }>, Error, LoginRequest>({
    mutationFn: apiClient.login.bind(apiClient),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Remove token from user data before storing in state
        const { token, ...userData } = response.data
        login(userData)
        queryClient.setQueryData(authKeys.user(), userData)
      }
    },
    onError: (error) => {
      console.error("Login failed:", error)
    },
  })
}

export const useRegister = () => {
  const { login } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<User & { token: string }>, Error, RegisterRequest>({
    mutationFn: apiClient.register.bind(apiClient),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Remove token from user data before storing in state
        const { token, ...userData } = response.data
        login(userData)
        queryClient.setQueryData(authKeys.user(), userData)
      }
    },
    onError: (error) => {
      console.error("Registration failed:", error)
    },
  })
}

export const useUpdateProfile = () => {
  const { updateUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<User>, Error, UpdateProfileRequest>({
    mutationFn: apiClient.updateProfile.bind(apiClient),
    onSuccess: (response) => {
      if (response.success && response.data) {
        updateUser(response.data)
        queryClient.setQueryData(authKeys.user(), response.data)
      }
    },
    onError: (error) => {
      console.error("Profile update failed:", error)
    },
  })
}

export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuthStore()

  return useQuery<ApiResponse<User>, Error, User>({
    queryKey: authKeys.user(),
    queryFn: apiClient.getCurrentUser.bind(apiClient),
    enabled: isAuthenticated && !user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    select: (response) => response.data,
  })
}

export const useLogout = () => {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<void>, Error, void>({
    mutationFn: apiClient.logout.bind(apiClient),
    onSuccess: () => {
      logout()
      queryClient.clear()
    },
    onError: (error) => {
      console.error("Logout failed:", error)
      // Even if logout fails on server, clear local state
      logout()
      queryClient.clear()
    },
  })
}
