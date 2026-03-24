import { MetadataResponse } from "./metadata";
import { RateLimitResult } from "./rate_limit";

export type GetDashboardOverviewInput = {
  userId: number;
  userEmail: string | null;
  days: number;
};

export type GetDashboardUsageInput = {
  userId: number;
  days: number;
};

export type ListDashboardLogsInput = {
  userId: number;
  page: number;
  perPage: number;
};

export type PreviewDashboardMetadataInput = {
  userId: number;
  apiKeyId: number;
  url: string;
  requestId: string;
  endpoint: string;
};

export type DashboardUsageSeriesPoint = {
  date: string;
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  errorCount: number;
  avgLatencyMs: number;
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

export type DashboardMetadataPreview = {
  apiKey: {
    id: number;
    name: string;
  };
  metadata: MetadataResponse;
  rateLimit: RateLimitResult;
};
