"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDashboardLogs,
  getDashboardOverview,
  getDashboardUsage,
  previewDashboardMetadata,
  type DashboardMetadataPreviewRequest,
} from "@/features/dashboard/services/dashboard-service";

const DASHBOARD_QUERY_KEY = ["dashboard"];
const API_KEYS_QUERY_KEY = ["api-keys"];

export function useDashboardOverview(days = 7) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "overview", days],
    queryFn: () => getDashboardOverview(days),
  });
}

export function useDashboardUsage(days = 7) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "usage", days],
    queryFn: () => getDashboardUsage(days),
  });
}

export function useDashboardLogs(page = 1, perPage = 20) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "logs", page, perPage],
    queryFn: () => getDashboardLogs(page, perPage),
  });
}

export function useDashboardMetadataPreview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DashboardMetadataPreviewRequest) =>
      previewDashboardMetadata(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY }),
      ]);
    },
  });
}
