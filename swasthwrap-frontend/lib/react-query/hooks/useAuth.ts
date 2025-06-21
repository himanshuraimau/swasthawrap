"use client"

import { useAuthStore } from "@/store"
import { useLogin, useRegister, useUpdateProfile, useCurrentUser, useLogout } from "../queries/auth"
import type { LoginRequest, RegisterRequest, UpdateProfileRequest } from "@/types"

export function useAuth() {
  const { user, isAuthenticated, logout: storeLogout, setLoading } = useAuthStore()

  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const updateProfileMutation = useUpdateProfile()
  const logoutMutation = useLogout()
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser()

  const handleLogin = async (credentials: LoginRequest) => {
    setLoading(true)
    try {
      await loginMutation.mutateAsync(credentials)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (userData: RegisterRequest) => {
    setLoading(true)
    try {
      await registerMutation.mutateAsync(userData)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (updates: UpdateProfileRequest) => {
    return updateProfileMutation.mutateAsync(updates)
  }

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return {
    user: user || currentUser,
    isAuthenticated,
    isLoading: isLoadingUser || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    login: handleLogin,
    register: handleRegister,
    updateProfile: handleUpdateProfile,
    logout: handleLogout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    updateError: updateProfileMutation.error,
    isUpdating: updateProfileMutation.isPending,
  }
}
