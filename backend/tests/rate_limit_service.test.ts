import { RateLimitService } from "../services/rate_limit_service";

describe("RateLimitService", () => {
  it("returns limiter metadata when the request is within budget", async () => {
    const rateLimiter = {
      consume: jest.fn(async () => ({
        allowed: true,
        limit: 60,
        remaining: 59,
        resetAfterSeconds: 60,
        retryAfterSeconds: 0,
      })),
    };

    const service = new RateLimitService(rateLimiter);
    const result = await service.enforce({
      apiKeyId: 1,
      requestsPerMinute: 60,
    });

    expect(result).toMatchObject({
      allowed: true,
      limit: 60,
      remaining: 59,
    });
  });

  it("returns a blocked result when the API key budget is exceeded", async () => {
    const rateLimiter = {
      consume: jest.fn(async () => ({
        allowed: false,
        limit: 1,
        remaining: 0,
        resetAfterSeconds: 12,
        retryAfterSeconds: 12,
      })),
    };

    const service = new RateLimitService(rateLimiter);
    const result = await service.enforce({
      apiKeyId: 1,
      requestsPerMinute: 1,
    });

    expect(result).toMatchObject({
      allowed: false,
      retryAfterSeconds: 12,
    });
  });
});
