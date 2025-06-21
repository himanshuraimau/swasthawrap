import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes("4")) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error("Mutation error:", error)
        // You can add global error handling here
        // For example, show a toast notification
      },
    },
  },
})

// Query key factory for consistent key management
export const queryKeys = {
  auth: ["auth"] as const,
  chat: ["chat"] as const,
  health: ["health"] as const,
  settings: ["settings"] as const,
  user: (id: string) => ["user", id] as const,
  documents: (category?: string) => ["documents", category] as const,
  chatHistory: (page?: number) => ["chat", "history", page] as const,
}
