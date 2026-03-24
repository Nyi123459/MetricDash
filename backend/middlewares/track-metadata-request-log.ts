import { NextFunction, Request, Response } from "express";
import { RequestLogService } from "../services/request_log_service";

export function trackMetadataRequestLog(requestLogService: RequestLogService) {
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

      const rawUrl = Array.isArray(req.query.url)
        ? String(req.query.url[0] ?? "")
        : String(req.query.url ?? "");

      void requestLogService.trackMetadataRequest({
        requestId: String(res.locals.requestId ?? ""),
        userId,
        apiKeyId,
        url: rawUrl,
        normalizedUrl: res.locals.metadataNormalizedUrl ?? null,
        canonicalUrl: res.locals.metadataCanonicalUrl ?? null,
        method: req.method,
        endpoint: req.baseUrl,
        statusCode: res.statusCode,
        latencyMs: Math.max(0, Date.now() - startedAt),
        cacheHit: res.locals.metadataCacheStatus === "hit",
        contentType: res.locals.metadataContentType ?? null,
        errorCode: res.locals.errorCode ?? null,
        requestedAt: new Date(),
      });
    });

    next();
  };
}
