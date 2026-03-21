jest.mock("../lib/redis", () => ({
  getRedisClient: jest.fn(),
}));

import { getRedisClient } from "../lib/redis";
import { RedisUsageCounter } from "../infrastructure/usage/redis_usage_counter";

type MockRedisMulti = {
  hSetNX: jest.Mock;
  hIncrBy: jest.Mock;
  expireAt: jest.Mock;
  exec: jest.Mock;
};

function createMockMulti(replies: unknown[]): MockRedisMulti {
  const multi = {
    hSetNX: jest.fn(),
    hIncrBy: jest.fn(),
    expireAt: jest.fn(),
    exec: jest.fn(async () => replies),
  } satisfies MockRedisMulti;

  multi.hSetNX.mockReturnValue(multi);
  multi.hIncrBy.mockReturnValue(multi);
  multi.expireAt.mockReturnValue(multi);

  return multi;
}

describe("RedisUsageCounter", () => {
  it("builds the snapshot from the atomic Redis transaction replies", async () => {
    const multi = createMockMulti([1, 1, 1, 5, 2, 3, 1, 480, 1]);
    const redis = {
      multi: jest.fn(() => multi),
    };

    (getRedisClient as jest.Mock).mockResolvedValue(redis);

    const counter = new RedisUsageCounter();
    const result = await counter.increment({
      userId: 3,
      apiKeyId: 9,
      occurredAt: new Date("2026-03-21T09:30:00.000Z"),
      cacheStatus: "hit",
      isError: true,
      latencyMs: 120,
    });

    expect(redis.multi).toHaveBeenCalled();
    expect(multi.hSetNX).toHaveBeenNthCalledWith(1, expect.any(String), "user_id", "3");
    expect(multi.hSetNX).toHaveBeenNthCalledWith(2, expect.any(String), "api_key_id", "9");
    expect(multi.hSetNX).toHaveBeenNthCalledWith(3, expect.any(String), "usage_date", "2026-03-21");
    expect(multi.hIncrBy).toHaveBeenNthCalledWith(1, expect.any(String), "request_count", 1);
    expect(multi.hIncrBy).toHaveBeenNthCalledWith(2, expect.any(String), "cache_hits", 1);
    expect(multi.hIncrBy).toHaveBeenNthCalledWith(3, expect.any(String), "cache_misses", 0);
    expect(multi.hIncrBy).toHaveBeenNthCalledWith(4, expect.any(String), "error_count", 1);
    expect(multi.hIncrBy).toHaveBeenNthCalledWith(5, expect.any(String), "total_latency_ms", 120);
    expect(multi.expireAt).toHaveBeenCalledWith(
      expect.any(String),
      new Date("2026-03-30T00:00:00.000Z"),
    );
    expect(result).toMatchObject({
      userId: 3,
      apiKeyId: 9,
      requestCount: 5,
      cacheHits: 2,
      cacheMisses: 3,
      errorCount: 1,
      totalLatencyMs: 480,
      usageDate: new Date("2026-03-21T00:00:00.000Z"),
    });
  });

  it("returns null and logs when Redis fails", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    (getRedisClient as jest.Mock).mockRejectedValue(
      new Error("Redis unavailable"),
    );

    const counter = new RedisUsageCounter();
    const result = await counter.increment({
      userId: 3,
      apiKeyId: 9,
      occurredAt: new Date("2026-03-21T09:30:00.000Z"),
      cacheStatus: "miss",
      isError: false,
      latencyMs: 90,
    });

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("rejects invalid latency values before touching Redis", async () => {
    const counter = new RedisUsageCounter();

    await expect(
      counter.increment({
        userId: 3,
        apiKeyId: 9,
        occurredAt: new Date("2026-03-21T09:30:00.000Z"),
        cacheStatus: "miss",
        isError: false,
        latencyMs: -1,
      }),
    ).rejects.toThrow("latencyMs");

    expect(getRedisClient).not.toHaveBeenCalled();
  });
});
