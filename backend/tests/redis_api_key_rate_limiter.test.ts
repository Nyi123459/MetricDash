jest.mock("../lib/redis", () => ({
  getRedisClient: jest.fn(),
}));

import { getRedisClient } from "../lib/redis";
import { RedisApiKeyRateLimiter } from "../infrastructure/rate_limit/redis_api_key_rate_limiter";

describe("RedisApiKeyRateLimiter", () => {
  it("returns remaining budget for requests within the current minute window", async () => {
    const redis = {
      incr: jest.fn(async () => 1),
      expire: jest.fn(async () => 1),
      ttl: jest.fn(async () => 45),
    };

    (getRedisClient as jest.Mock).mockResolvedValue(redis);

    const limiter = new RedisApiKeyRateLimiter();
    const result = await limiter.consume(12, 60);

    expect(redis.expire).toHaveBeenCalled();
    expect(result).toMatchObject({
      allowed: true,
      limit: 60,
      remaining: 59,
      resetAfterSeconds: 45,
      retryAfterSeconds: 0,
    });
  });

  it("blocks requests that exceed the configured per-minute budget", async () => {
    const redis = {
      incr: jest.fn(async () => 3),
      expire: jest.fn(async () => 1),
      ttl: jest.fn(async () => 32),
    };

    (getRedisClient as jest.Mock).mockResolvedValue(redis);

    const limiter = new RedisApiKeyRateLimiter();
    const result = await limiter.consume(12, 2);

    expect(result).toMatchObject({
      allowed: false,
      limit: 2,
      remaining: 0,
      resetAfterSeconds: 32,
      retryAfterSeconds: 32,
    });
  });
});
