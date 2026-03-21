import { RateLimitResult } from "../models/rate_limit";

export interface ApiKeyRateLimiter {
  consume(apiKeyId: number, limit: number): Promise<RateLimitResult>;
}
