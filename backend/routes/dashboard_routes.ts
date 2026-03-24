import { Router } from "express";
import { DashboardController } from "../controllers/dashboard_controller";
import { RedisMetadataCache } from "../infrastructure/cache/redis_metadata_cache";
import { RedisApiKeyRateLimiter } from "../infrastructure/rate_limit/redis_api_key_rate_limiter";
import { RedisUsageCounter } from "../infrastructure/usage/redis_usage_counter";
import { authenticateSession } from "../middlewares/authenticate-session";
import { validateRequest } from "../middlewares/validate-request";
import { ApiKeyRepository } from "../repositories/api_key_repository";
import { RequestLogRepository } from "../repositories/request_log_repository";
import { UsageRecordRepository } from "../repositories/usage_record_repository";
import { DashboardMetadataPreviewService } from "../services/dashboard_metadata_preview_service";
import { DashboardService } from "../services/dashboard_service";
import { MetadataService } from "../services/metadata_service";
import { RateLimitService } from "../services/rate_limit_service";
import { RequestLogService } from "../services/request_log_service";
import { UsageTrackingService } from "../services/usage_tracking_service";
import {
  dashboardLogsQuerySchema,
  dashboardMetadataPreviewBodySchema,
  dashboardRangeQuerySchema,
} from "../validations/dashboard-schemas";

const dashboardRouter = Router();
const usageRecordRepository = new UsageRecordRepository();
const requestLogRepository = new RequestLogRepository();
const apiKeyRepository = new ApiKeyRepository();
const metadataCache = new RedisMetadataCache();
const rateLimiter = new RedisApiKeyRateLimiter();
const usageCounter = new RedisUsageCounter();
const dashboardService = new DashboardService(
  usageRecordRepository,
  requestLogRepository,
  apiKeyRepository,
);
const metadataService = new MetadataService(fetch, metadataCache);
const rateLimitService = new RateLimitService(rateLimiter);
const requestLogService = new RequestLogService(requestLogRepository);
const usageTrackingService = new UsageTrackingService(
  usageCounter,
  usageRecordRepository,
);
const dashboardMetadataPreviewService = new DashboardMetadataPreviewService(
  apiKeyRepository,
  metadataService,
  rateLimitService,
  usageTrackingService,
  requestLogService,
);
const dashboardController = new DashboardController(
  dashboardService,
  dashboardMetadataPreviewService,
);

dashboardRouter.use(authenticateSession);

dashboardRouter.get(
  "/overview",
  validateRequest({ query: dashboardRangeQuerySchema }),
  dashboardController.overview,
);

dashboardRouter.get(
  "/usage",
  validateRequest({ query: dashboardRangeQuerySchema }),
  dashboardController.usage,
);

dashboardRouter.get(
  "/logs",
  validateRequest({ query: dashboardLogsQuerySchema }),
  dashboardController.logs,
);

dashboardRouter.post(
  "/metadata-preview",
  validateRequest({ body: dashboardMetadataPreviewBodySchema }),
  dashboardController.previewMetadata,
);

export { dashboardRouter };
