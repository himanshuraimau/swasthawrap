import {
  useDocuments,
  useConditions,
  useHealthMetrics,
  useHealthGoals,
  useUploadDocument,
  useCreateHealthGoal,
  useUpdateHealthMetric,
} from "../queries/health"
import type { UploadDocumentRequest, CreateHealthGoalRequest, UpdateHealthMetricRequest } from "@/types"

export function useHealth() {
  const { data: documents, isLoading: isLoadingDocuments } = useDocuments()
  const { data: conditions, isLoading: isLoadingConditions } = useConditions()
  const { data: metrics, isLoading: isLoadingMetrics } = useHealthMetrics()
  const { data: goals, isLoading: isLoadingGoals } = useHealthGoals()

  const uploadDocumentMutation = useUploadDocument()
  const createGoalMutation = useCreateHealthGoal()
  const updateMetricMutation = useUpdateHealthMetric()

  const uploadDocument = async (request: UploadDocumentRequest) => {
    return uploadDocumentMutation.mutateAsync(request)
  }

  const createHealthGoal = async (request: CreateHealthGoalRequest) => {
    return createGoalMutation.mutateAsync(request)
  }

  const updateHealthMetric = async (request: UpdateHealthMetricRequest) => {
    return updateMetricMutation.mutateAsync(request)
  }

  return {
    documents: documents?.data || [],
    conditions: conditions?.data || [],
    metrics: metrics?.data || [],
    goals: goals?.data || [],
    isLoadingDocuments,
    isLoadingConditions,
    isLoadingMetrics,
    isLoadingGoals,
    isUploading: uploadDocumentMutation.isPending,
    isCreatingGoal: createGoalMutation.isPending,
    isUpdatingMetric: updateMetricMutation.isPending,
    uploadDocument,
    createHealthGoal,
    updateHealthMetric,
    uploadError: uploadDocumentMutation.error,
    createGoalError: createGoalMutation.error,
    updateMetricError: updateMetricMutation.error,
  }
}
