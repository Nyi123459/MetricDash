import { apiClient } from "@/common/lib/api-client";

export type DashboardSummary = {
  totalRequests: number;
  requestsToday: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  errorCount: number;
  errorRate: number;
  avgLatencyMs: number;
  activeApiKeys: number;
};

export type DashboardUsageTrendPoint = {
  date: string;
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  errorCount: number;
  avgLatencyMs: number;
};

export type DashboardRequestLogItem = {
  id: number;
  requestId: string;
  apiKeyId: number;
  apiKeyName: string;
  url: string;
  normalizedUrl: string | null;
  canonicalUrl: string | null;
  domain: string | null;
  method: string;
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  cacheHit: boolean;
  contentType: string | null;
  errorCode: string | null;
  requestedAt: string;
};

export type DashboardApiKeyUsageItem = {
  apiKeyId: number;
  apiKeyName: string;
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  errorCount: number;
  avgLatencyMs: number;
  cacheHitRate: number;
  status: "active" | "revoked" | "expired";
};

export type DashboardMetadataPreviewRequest = {
  apiKeyId: number;
  url: string;
};

export type DashboardMetadataPreviewResponse = {
  apiKey: {
    id: number;
    name: string;
  };
  metadata: {
    url: string;
    canonical_url: string | null;
    title: string | null;
    description: string | null;
    image: string | null;
    favicon: string | null;
    site_name: string | null;
    content_type: string | null;
    author: string | null;
    published_at: string | null;
    cache: {
      hit: boolean;
      ttl: number;
    };
  };
  rateLimit: {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAfterSeconds: number;
    retryAfterSeconds: number;
  };
  requestId: string;
};

export type DashboardOverviewResponse = {
  account: {
    email: string | null;
  };
  summary: DashboardSummary;
  usageTrend: DashboardUsageTrendPoint[];
  recentRequests: DashboardRequestLogItem[];
  requestId: string;
};

export type DashboardUsageResponse = {
  summary: DashboardSummary;
  usageTrend: DashboardUsageTrendPoint[];
  apiKeyBreakdown: DashboardApiKeyUsageItem[];
  requestId: string;
};

export type DashboardLogsResponse = {
  summary: DashboardSummary;
  data: DashboardRequestLogItem[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    firstPage: number;
    hasMorePages: boolean;
    lastPage: number;
  };
  requestId: string;
};

export async function getDashboardOverview(days = 7) {
  const response = await apiClient.get<DashboardOverviewResponse>(
    "/api/v1/dashboard/overview",
    {
      params: { days },
    },
  );

  return response.data;
}

export async function getDashboardUsage(days = 7) {
  const response = await apiClient.get<DashboardUsageResponse>(
    "/api/v1/dashboard/usage",
    {
      params: { days },
    },
  );

  return response.data;
}

export async function getDashboardLogs(page = 1, perPage = 20) {
  const response = await apiClient.get<DashboardLogsResponse>(
    "/api/v1/dashboard/logs",
    {
      params: { page, perPage },
    },
  );

  return response.data;
}

export async function previewDashboardMetadata(
  payload: DashboardMetadataPreviewRequest,
) {
  const response = await apiClient.post<DashboardMetadataPreviewResponse>(
    "/api/v1/dashboard/metadata-preview",
    payload,
  );

  return response.data;
}
