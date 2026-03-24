import { AppError } from "../exceptions/app-error";
import {
  DashboardMetadataPreview,
  PreviewDashboardMetadataInput,
} from "../models/dashboard";
import { ApiKeyRepository } from "../repositories/api_key_repository";
import { MetadataService } from "./metadata_service";
import { RateLimitService } from "./rate_limit_service";
import { RequestLogService } from "./request_log_service";
import { UsageTrackingService } from "./usage_tracking_service";

export class DashboardMetadataPreviewService {
  constructor(
    private readonly apiKeyRepository: ApiKeyRepository,
    private readonly metadataService: MetadataService,
    private readonly rateLimitService: RateLimitService,
    private readonly usageTrackingService: UsageTrackingService,
    private readonly requestLogService: RequestLogService,
  ) {}

  async preview(
    input: PreviewDashboardMetadataInput,
  ): Promise<DashboardMetadataPreview> {
    const apiKey = await this.apiKeyRepository.findOwnedByUser(
      input.userId,
      input.apiKeyId,
    );

    if (!apiKey) {
      throw new AppError(404, "API_KEY_NOT_FOUND", "API key was not found");
    }

    if (apiKey.revoked_at) {
      throw new AppError(400, "API_KEY_REVOKED", "API key has been revoked");
    }

    if (apiKey.expires_at && apiKey.expires_at <= new Date()) {
      throw new AppError(400, "API_KEY_EXPIRED", "API key has expired");
    }

    await this.apiKeyRepository.update(apiKey.id, {
      last_used_at: new Date(),
    });

    const rateLimit = await this.rateLimitService.enforce({
      apiKeyId: apiKey.id,
      requestsPerMinute: apiKey.requests_per_minute,
    });

    if (!rateLimit.allowed) {
      await Promise.allSettled([
        this.requestLogService.trackMetadataRequest({
          requestId: input.requestId,
          userId: input.userId,
          apiKeyId: apiKey.id,
          url: input.url,
          normalizedUrl: null,
          canonicalUrl: null,
          method: "POST",
          endpoint: input.endpoint,
          statusCode: 429,
          latencyMs: 0,
          cacheHit: false,
          contentType: null,
          errorCode: "RATE_LIMIT_EXCEEDED",
          requestedAt: new Date(),
        }),
        this.usageTrackingService.trackRequest({
          userId: input.userId,
          apiKeyId: apiKey.id,
          occurredAt: new Date(),
          cacheStatus: "skipped",
          isError: true,
          latencyMs: 0,
        }),
      ]);

      throw new AppError(
        429,
        "RATE_LIMIT_EXCEEDED",
        "API key rate limit exceeded",
      );
    }

    const requestedAt = new Date();
    const startedAt = Date.now();

    try {
      const metadata = await this.metadataService.getMetadata({
        url: input.url,
        requestId: input.requestId,
      });
      const latencyMs = Math.max(0, Date.now() - startedAt);
      const cacheStatus = metadata.cache.hit ? "hit" : "miss";

      await Promise.allSettled([
        this.requestLogService.trackMetadataRequest({
          requestId: input.requestId,
          userId: input.userId,
          apiKeyId: apiKey.id,
          url: input.url,
          normalizedUrl: metadata.url,
          canonicalUrl: metadata.canonical_url,
          method: "POST",
          endpoint: input.endpoint,
          statusCode: 200,
          latencyMs,
          cacheHit: metadata.cache.hit,
          contentType: metadata.content_type,
          errorCode: null,
          requestedAt,
        }),
        this.usageTrackingService.trackRequest({
          userId: input.userId,
          apiKeyId: apiKey.id,
          occurredAt: requestedAt,
          cacheStatus,
          isError: false,
          latencyMs,
        }),
      ]);

      return {
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
        },
        metadata,
        rateLimit,
      };
    } catch (error) {
      const appError =
        error instanceof AppError
          ? error
          : new AppError(
              500,
              "INTERNAL_SERVER_ERROR",
              "Unable to preview metadata",
            );

      await Promise.allSettled([
        this.requestLogService.trackMetadataRequest({
          requestId: input.requestId,
          userId: input.userId,
          apiKeyId: apiKey.id,
          url: input.url,
          normalizedUrl: null,
          canonicalUrl: null,
          method: "POST",
          endpoint: input.endpoint,
          statusCode: appError.statusCode,
          latencyMs: Math.max(0, Date.now() - startedAt),
          cacheHit: false,
          contentType: null,
          errorCode: appError.code,
          requestedAt,
        }),
        this.usageTrackingService.trackRequest({
          userId: input.userId,
          apiKeyId: apiKey.id,
          occurredAt: requestedAt,
          cacheStatus: "skipped",
          isError: true,
          latencyMs: Math.max(0, Date.now() - startedAt),
        }),
      ]);

      throw error;
    }
  }
}
