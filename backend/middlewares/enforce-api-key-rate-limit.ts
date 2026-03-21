import { NextFunction, Request, Response } from "express";
import { AppError } from "../exceptions/app-error";
import { RateLimitService } from "../services/rate_limit_service";

export function enforceApiKeyRateLimit(rateLimitService: RateLimitService) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKeyId = Number(res.locals.apiKeyId);
      const requestsPerMinute = Number(res.locals.apiKeyRequestsPerMinute);

      const result = await rateLimitService.enforce({
        apiKeyId,
        requestsPerMinute,
      });

      res.setHeader("X-RateLimit-Limit", result.limit.toString());
      res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
      res.setHeader(
        "X-RateLimit-Reset",
        result.resetAfterSeconds.toString(),
      );

      if (!result.allowed) {
        res.setHeader("Retry-After", result.retryAfterSeconds.toString());
        next(
          new AppError(
            429,
            "RATE_LIMIT_EXCEEDED",
            "API key rate limit exceeded",
          ),
        );
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
