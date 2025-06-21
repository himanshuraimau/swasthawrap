import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  MedicalDocument,
  MedicalCondition,
  HealthMetric,
  HealthGoal,
  CreateHealthGoalRequest,
  UpdateHealthMetricRequest,
  UploadDocumentRequest,
  ApiResponse,
  PaginatedResponse,
} from "@/types"

// Mock API functions
const healthAPI = {
  getDocuments: async (category?: string): Promise<PaginatedResponse<MedicalDocument>> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const mockDocuments: MedicalDocument[] = [
      {
        id: 1,
        name: "Blood Test Report - June 2024",
        type: "Lab Report",
        date: "2024-06-20",
        size: "2.3 MB",
        category: "Laboratory",
        tags: ["blood-test", "glucose", "hba1c"],
        status: "Reviewed",
      },
      {
        id: 2,
        name: "ECG Report - May 2024",
        type: "Diagnostic",
        date: "2024-05-15",
        size: "1.8 MB",
        category: "Cardiology",
        tags: ["ecg", "heart", "routine"],
        status: "Normal",
      },
      {
        id: 3,
        name: "Prescription - Dr. Sharma",
        type: "Prescription",
        date: "2024-06-01",
        size: "0.5 MB",
        category: "Medication",
        tags: ["prescription", "diabetes"],
        status: "Active",
      },
    ]

    const filtered = category
      ? mockDocuments.filter((doc) => doc.category.toLowerCase() === category.toLowerCase())
      : mockDocuments

    return {
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: 10,
      hasMore: false,
    }
  },

  getConditions: async (): Promise<ApiResponse<MedicalCondition[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 600))

    const mockConditions: MedicalCondition[] = [
      {
        id: 1,
        name: "Type 2 Diabetes",
        diagnosed: "2022-03-15",
        status: "Managed",
        severity: "Moderate",
        medications: ["Metformin 500mg", "Glipizide 5mg"],
        lastUpdate: "2024-06-15",
        notes: "Well controlled with current medication regimen",
      },
      {
        id: 2,
        name: "Hypertension",
        diagnosed: "2023-01-10",
        status: "Controlled",
        severity: "Mild",
        medications: ["Lisinopril 10mg"],
        lastUpdate: "2024-06-10",
        notes: "Blood pressure within normal range",
      },
    ]

    return { data: mockConditions, success: true }
  },

  getHealthMetrics: async (): Promise<ApiResponse<HealthMetric[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockMetrics: HealthMetric[] = [
      { date: "2024-06-20", type: "Blood Pressure", value: "128/82", unit: "mmHg", status: "Normal" },
      { date: "2024-06-20", type: "Blood Glucose", value: "145", unit: "mg/dL", status: "Elevated" },
      { date: "2024-06-15", type: "Weight", value: "75.2", unit: "kg", status: "Stable" },
      { date: "2024-06-10", type: "HbA1c", value: "7.2", unit: "%", status: "Fair" },
    ]

    return { data: mockMetrics, success: true }
  },

  getHealthGoals: async (): Promise<ApiResponse<HealthGoal[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const mockGoals: HealthGoal[] = [
      { goal: "Maintain HbA1c below 7%", target: "7.0", current: "7.2", unit: "%", progress: 85 },
      { goal: "Lose 5kg weight", target: "70", current: "75.2", unit: "kg", progress: 60 },
      { goal: "Exercise 150 min/week", target: "150", current: "120", unit: "min", progress: 80 },
    ]

    return { data: mockGoals, success: true }
  },

  uploadDocument: async (request: UploadDocumentRequest): Promise<ApiResponse<MedicalDocument>> => {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newDocument: MedicalDocument = {
      id: Date.now(),
      name: request.file.name,
      type: request.file.type,
      date: new Date().toISOString().split("T")[0],
      size: `${(request.file.size / 1024 / 1024).toFixed(1)} MB`,
      category: request.category,
      tags: request.tags,
      status: "Uploaded",
    }

    return { data: newDocument, success: true, message: "Document uploaded successfully" }
  },

  createHealthGoal: async (request: CreateHealthGoalRequest): Promise<ApiResponse<HealthGoal>> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newGoal: HealthGoal = {
      ...request,
      current: "0",
      progress: 0,
    }

    return { data: newGoal, success: true, message: "Health goal created successfully" }
  },

  updateHealthMetric: async (request: UpdateHealthMetricRequest): Promise<ApiResponse<HealthMetric>> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newMetric: HealthMetric = {
      date: request.date,
      type: request.type,
      value: request.value,
      unit: request.unit,
      status: "Normal", // This would be calculated based on the value
    }

    return { data: newMetric, success: true, message: "Health metric updated successfully" }
  },
}

// Query keys
export const healthKeys = {
  all: ["health"] as const,
  documents: (category?: string) => [...healthKeys.all, "documents", category] as const,
  conditions: () => [...healthKeys.all, "conditions"] as const,
  metrics: () => [...healthKeys.all, "metrics"] as const,
  goals: () => [...healthKeys.all, "goals"] as const,
}

// Hooks
export const useDocuments = (category?: string) => {
  return useQuery({
    queryKey: healthKeys.documents(category),
    queryFn: () => healthAPI.getDocuments(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useConditions = () => {
  return useQuery({
    queryKey: healthKeys.conditions(),
    queryFn: healthAPI.getConditions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useHealthMetrics = () => {
  return useQuery({
    queryKey: healthKeys.metrics(),
    queryFn: healthAPI.getHealthMetrics,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useHealthGoals = () => {
  return useQuery({
    queryKey: healthKeys.goals(),
    queryFn: healthAPI.getHealthGoals,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUploadDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: healthAPI.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.documents() })
    },
  })
}

export const useCreateHealthGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: healthAPI.createHealthGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.goals() })
    },
  })
}

export const useUpdateHealthMetric = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: healthAPI.updateHealthMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.metrics() })
    },
  })
}
