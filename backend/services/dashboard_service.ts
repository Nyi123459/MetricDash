import {
  DashboardApiKeyUsageItem,
  DashboardRequestLogItem,
  DashboardSummary,
  DashboardUsageSeriesPoint,
  GetDashboardOverviewInput,
  GetDashboardUsageInput,
  ListDashboardLogsInput,
} from "../models/dashboard";
import { ApiKeyRepository } from "../repositories/api_key_repository";
import { RequestLogRepository } from "../repositories/request_log_repository";
import { UsageRecordRepository } from "../repositories/usage_record_repository";

type UsageRecordWithApiKey = Awaited<
  ReturnType<UsageRecordRepository["listByUserAndDateRange"]>
>[number];

type RequestLogWithApiKey = Awaited<
  ReturnType<RequestLogRepository["listRecentForUser"]>
>[number];

export class DashboardService {
  constructor(
    private readonly usageRecordRepository: UsageRecordRepository,
    private readonly requestLogRepository: RequestLogRepository,
    private readonly apiKeyRepository: ApiKeyRepository,
  ) {}

  async getOverview(input: GetDashboardOverviewInput) {
    const startDate = this.getRangeStartDate(input.days);
    const [usageRecords, recentLogs, activeApiKeys] = await Promise.all([
      this.usageRecordRepository.listByUserAndDateRange(
        input.userId,
        startDate,
      ),
      this.requestLogRepository.listRecentForUser(input.userId, 5),
      this.apiKeyRepository.countActiveByUser(input.userId),
    ]);

    return {
      account: {
        email: input.userEmail,
      },
      summary: this.buildSummary(usageRecords, activeApiKeys),
      usageTrend: this.buildUsageSeries(usageRecords, startDate),
      recentRequests: recentLogs.map((log) =>
        this.toDashboardRequestLogItem(log),
      ),
    };
  }

  async getUsage(input: GetDashboardUsageInput) {
    const startDate = this.getRangeStartDate(input.days);
    const [usageRecords, activeApiKeys] = await Promise.all([
      this.usageRecordRepository.listByUserAndDateRange(
        input.userId,
        startDate,
      ),
      this.apiKeyRepository.countActiveByUser(input.userId),
    ]);

    return {
      summary: this.buildSummary(usageRecords, activeApiKeys),
      usageTrend: this.buildUsageSeries(usageRecords, startDate),
      apiKeyBreakdown: this.buildApiKeyBreakdown(usageRecords),
    };
  }

  async getLogs(input: ListDashboardLogsInput) {
    const [logs, summary] = await Promise.all([
      this.requestLogRepository.listForUser(
        input.userId,
        input.page,
        input.perPage,
      ),
      this.requestLogRepository.summarizeForUser(input.userId),
    ]);

    return {
      summary: {
        totalRequests: summary.totalRequests,
        requestsToday: 0,
        cacheHits: summary.cacheHits,
        cacheMisses: Math.max(0, summary.totalRequests - summary.cacheHits),
        cacheHitRate:
          summary.totalRequests > 0
            ? Math.round((summary.cacheHits / summary.totalRequests) * 100)
            : 0,
        errorCount: summary.errorCount,
        errorRate:
          summary.totalRequests > 0
            ? Math.round((summary.errorCount / summary.totalRequests) * 100)
            : 0,
        avgLatencyMs:
          summary.totalRequests > 0
            ? Math.round(summary.totalLatencyMs / summary.totalRequests)
            : 0,
        activeApiKeys: 0,
      },
      data: logs.data.map((log) => this.toDashboardRequestLogItem(log)),
      meta: logs.meta,
    };
  }

  private buildSummary(
    usageRecords: UsageRecordWithApiKey[],
    activeApiKeys: number,
  ): DashboardSummary {
    const totals = usageRecords.reduce(
      (accumulator, record) => {
        accumulator.totalRequests += record.request_count;
        accumulator.cacheHits += record.cache_hits;
        accumulator.cacheMisses += record.cache_misses;
        accumulator.errorCount += record.error_count;
        accumulator.totalLatencyMs += record.total_latency_ms;

        if (this.toDateKey(record.usage_date) === this.toDateKey(new Date())) {
          accumulator.requestsToday += record.request_count;
        }

        return accumulator;
      },
      {
        totalRequests: 0,
        requestsToday: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errorCount: 0,
        totalLatencyMs: 0,
      },
    );

    return {
      totalRequests: totals.totalRequests,
      requestsToday: totals.requestsToday,
      cacheHits: totals.cacheHits,
      cacheMisses: totals.cacheMisses,
      cacheHitRate:
        totals.totalRequests > 0
          ? Math.round((totals.cacheHits / totals.totalRequests) * 100)
          : 0,
      errorCount: totals.errorCount,
      errorRate:
        totals.totalRequests > 0
          ? Math.round((totals.errorCount / totals.totalRequests) * 100)
          : 0,
      avgLatencyMs:
        totals.totalRequests > 0
          ? Math.round(totals.totalLatencyMs / totals.totalRequests)
          : 0,
      activeApiKeys,
    };
  }

  private buildUsageSeries(
    usageRecords: UsageRecordWithApiKey[],
    startDate: Date,
  ): DashboardUsageSeriesPoint[] {
    const aggregatedByDate = new Map<
      string,
      {
        requestCount: number;
        cacheHits: number;
        cacheMisses: number;
        errorCount: number;
        totalLatencyMs: number;
      }
    >();

    for (const record of usageRecords) {
      const key = this.toDateKey(record.usage_date);
      const current = aggregatedByDate.get(key) ?? {
        requestCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errorCount: 0,
        totalLatencyMs: 0,
      };

      current.requestCount += record.request_count;
      current.cacheHits += record.cache_hits;
      current.cacheMisses += record.cache_misses;
      current.errorCount += record.error_count;
      current.totalLatencyMs += record.total_latency_ms;

      aggregatedByDate.set(key, current);
    }

    const series: DashboardUsageSeriesPoint[] = [];
    const cursor = new Date(startDate);
    const today = this.toDateKey(new Date());

    while (this.toDateKey(cursor) <= today) {
      const key = this.toDateKey(cursor);
      const bucket = aggregatedByDate.get(key) ?? {
        requestCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errorCount: 0,
        totalLatencyMs: 0,
      };

      series.push({
        date: key,
        requestCount: bucket.requestCount,
        cacheHits: bucket.cacheHits,
        cacheMisses: bucket.cacheMisses,
        errorCount: bucket.errorCount,
        avgLatencyMs:
          bucket.requestCount > 0
            ? Math.round(bucket.totalLatencyMs / bucket.requestCount)
            : 0,
      });

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return series;
  }

  private buildApiKeyBreakdown(
    usageRecords: UsageRecordWithApiKey[],
  ): DashboardApiKeyUsageItem[] {
    const aggregatedByApiKey = new Map<
      number,
      {
        apiKeyId: number;
        apiKeyName: string;
        requestCount: number;
        cacheHits: number;
        cacheMisses: number;
        errorCount: number;
        totalLatencyMs: number;
        revokedAt: Date | null;
        expiresAt: Date | null;
      }
    >();

    for (const record of usageRecords) {
      const current = aggregatedByApiKey.get(record.api_key_id) ?? {
        apiKeyId: record.api_key_id,
        apiKeyName: record.api_key.name,
        requestCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errorCount: 0,
        totalLatencyMs: 0,
        revokedAt: record.api_key.revoked_at,
        expiresAt: record.api_key.expires_at,
      };

      current.requestCount += record.request_count;
      current.cacheHits += record.cache_hits;
      current.cacheMisses += record.cache_misses;
      current.errorCount += record.error_count;
      current.totalLatencyMs += record.total_latency_ms;

      aggregatedByApiKey.set(record.api_key_id, current);
    }

    return Array.from(aggregatedByApiKey.values())
      .sort((left, right) => right.requestCount - left.requestCount)
      .map((item) => ({
        apiKeyId: item.apiKeyId,
        apiKeyName: item.apiKeyName,
        requestCount: item.requestCount,
        cacheHits: item.cacheHits,
        cacheMisses: item.cacheMisses,
        errorCount: item.errorCount,
        avgLatencyMs:
          item.requestCount > 0
            ? Math.round(item.totalLatencyMs / item.requestCount)
            : 0,
        cacheHitRate:
          item.requestCount > 0
            ? Math.round((item.cacheHits / item.requestCount) * 100)
            : 0,
        status:
          item.revokedAt !== null
            ? "revoked"
            : item.expiresAt !== null && item.expiresAt <= new Date()
              ? "expired"
              : "active",
      }));
  }

  private toDashboardRequestLogItem(
    log: RequestLogWithApiKey,
  ): DashboardRequestLogItem {
    return {
      id: log.id,
      requestId: log.request_id,
      apiKeyId: log.api_key_id,
      apiKeyName: log.api_key.name,
      url: log.url,
      normalizedUrl: log.normalized_url,
      canonicalUrl: log.canonical_url,
      domain: log.domain,
      method: log.method,
      endpoint: log.endpoint,
      statusCode: log.status_code,
      latencyMs: log.latency_ms,
      cacheHit: log.cache_hit,
      contentType: log.content_type,
      errorCode: log.error_code,
      requestedAt: log.requested_at.toISOString(),
    };
  }

  private getRangeStartDate(days: number) {
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
    return startDate;
  }

  private toDateKey(value: Date) {
    return value.toISOString().slice(0, 10);
  }
}
