import { Router } from "express";
import { MetadataController } from "../controllers/metadata_controller";
import { RedisMetadataCache } from "../infrastructure/cache/redis_metadata_cache";
import { RedisApiKeyRateLimiter } from "../infrastructure/rate_limit/redis_api_key_rate_limiter";
import { RedisUsageCounter } from "../infrastructure/usage/redis_usage_counter";
import { authenticateApiKey } from "../middlewares/authenticate-api-key";
import { enforceApiKeyRateLimit } from "../middlewares/enforce-api-key-rate-limit";
import { trackMetadataRequestLog } from "../middlewares/track-metadata-request-log";
import { trackMetadataUsage } from "../middlewares/track-metadata-usage";
import { validateRequest } from "../middlewares/validate-request";
import { RequestLogRepository } from "../repositories/request_log_repository";
import { UsageRecordRepository } from "../repositories/usage_record_repository";
import { MetadataService } from "../services/metadata_service";
import { RateLimitService } from "../services/rate_limit_service";
import { RequestLogService } from "../services/request_log_service";
import { UsageTrackingService } from "../services/usage_tracking_service";
import { metadataQuerySchema } from "../validations/metadata-schemas";

const metadataRouter = Router();
const metadataCache = new RedisMetadataCache();
const rateLimiter = new RedisApiKeyRateLimiter();
const usageCounter = new RedisUsageCounter();
const usageRecordRepository = new UsageRecordRepository();
const requestLogRepository = new RequestLogRepository();
const metadataService = new MetadataService(fetch, metadataCache);
const rateLimitService = new RateLimitService(rateLimiter);
const requestLogService = new RequestLogService(requestLogRepository);
const usageTrackingService = new UsageTrackingService(
  usageCounter,
  usageRecordRepository,
);
const metadataController = new MetadataController(metadataService);

metadataRouter.get(
  "/",
  authenticateApiKey,
  trackMetadataRequestLog(requestLogService),
  trackMetadataUsage(usageTrackingService),
  enforceApiKeyRateLimit(rateLimitService),
  validateRequest({ query: metadataQuerySchema }),
  metadataController.get,
);

export { metadataRouter };
