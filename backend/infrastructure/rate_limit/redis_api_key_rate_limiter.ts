import { ApiKeyRateLimiter } from "../../contracts/api_key_rate_limiter";
import { getRedisClient } from "../../lib/redis";
import { RateLimitResult } from "../../models/rate_limit";

export class RedisApiKeyRateLimiter implements ApiKeyRateLimiter {
  private static readonly WINDOW_SECONDS = 60;

  async consume(apiKeyId: number, limit: number): Promise<RateLimitResult> {
    try {
      const redis = await getRedisClient();
      const key = this.getWindowKey(apiKeyId);
      const currentCount = await redis.incr(key);

      if (currentCount === 1) {
        await redis.expire(key, RedisApiKeyRateLimiter.WINDOW_SECONDS);
      }

      const ttl = await redis.ttl(key);
      const resetAfterSeconds =
        ttl > 0 ? ttl : RedisApiKeyRateLimiter.WINDOW_SECONDS;
      const remaining = Math.max(0, limit - currentCount);

      return {
        allowed: currentCount <= limit,
        limit,
        remaining,
        resetAfterSeconds,
        retryAfterSeconds: currentCount <= limit ? 0 : resetAfterSeconds,
      };
    } catch {
      return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - 1),
        resetAfterSeconds: RedisApiKeyRateLimiter.WINDOW_SECONDS,
        retryAfterSeconds: 0,
      };
    }
  }

  private getWindowKey(apiKeyId: number) {
    const currentWindow = Math.floor(
      Date.now() / (RedisApiKeyRateLimiter.WINDOW_SECONDS * 1000),
    );

    return `rate-limit:api-key:${apiKeyId}:${currentWindow}`;
  }
}
