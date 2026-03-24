import { NextFunction, Request, Response } from "express";
import { UsageTrackingService } from "../services/usage_tracking_service";

export function trackMetadataUsage(usageTrackingService: UsageTrackingService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startedAt =
      typeof res.locals.requestStartedAt === "number"
        ? res.locals.requestStartedAt
        : Date.now();

    res.on("finish", () => {
      const apiKeyId = Number(res.locals.apiKeyId);
      const userId = Number(res.locals.apiKeyUserId);

      if (!Number.isInteger(apiKeyId) || !Number.isInteger(userId)) {
        return;
      }

      const cacheStatus =
        res.locals.metadataCacheStatus === "hit" ||
        res.locals.metadataCacheStatus === "miss"
          ? res.locals.metadataCacheStatus
          : "skipped";

      void usageTrackingService.trackRequest({
        userId,
        apiKeyId,
        occurredAt: new Date(),
        cacheStatus,
        isError: res.statusCode >= 400,
        latencyMs: Math.max(0, Date.now() - startedAt),
      });
    });

    next();
  };
}
