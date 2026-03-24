import { UsageCounter } from "../../contracts/usage_counter";
import { getRedisClient } from "../../lib/redis";
import {
  UsageCounterIncrementInput,
  UsageCounterSnapshot,
} from "../../models/usage";
import { logger } from "../../utils/logger";

export class RedisUsageCounter implements UsageCounter {
  private static readonly RETENTION_DAYS = 8;
  private static readonly TRANSACTION_REPLY_LENGTH = 9;

  async increment(
    input: UsageCounterIncrementInput,
  ): Promise<UsageCounterSnapshot | null> {
    this.assertValidInput(input);

    try {
      const redis = await getRedisClient();
      const usageDate = this.toUtcUsageDateKey(input.occurredAt);
      const key = this.getCounterKey(input.apiKeyId, usageDate);

      const incrementCacheHits = input.cacheStatus === "hit" ? 1 : 0;
      const incrementCacheMisses = input.cacheStatus === "miss" ? 1 : 0;
      const incrementErrorCount = input.isError ? 1 : 0;
      const expiresAt = this.getBucketExpiryDate(input.occurredAt);

      const counterUpdates = redis.multi();
      counterUpdates.hSetNX(key, "user_id", input.userId.toString());
      counterUpdates.hSetNX(key, "api_key_id", input.apiKeyId.toString());
      counterUpdates.hSetNX(key, "usage_date", usageDate);
      counterUpdates.hIncrBy(key, "request_count", 1);
      counterUpdates.hIncrBy(key, "cache_hits", incrementCacheHits);
      counterUpdates.hIncrBy(key, "cache_misses", incrementCacheMisses);
      counterUpdates.hIncrBy(key, "error_count", incrementErrorCount);
      counterUpdates.hIncrBy(key, "total_latency_ms", input.latencyMs);
      counterUpdates.expireAt(key, expiresAt);
      const transactionReplies =
        (await counterUpdates.exec()) as unknown as number[];

      if (
        transactionReplies.length !== RedisUsageCounter.TRANSACTION_REPLY_LENGTH
      ) {
        throw new Error(
          "Redis usage counter transaction returned an unexpected reply shape",
        );
      }

      const [
        _userIdWasSet,
        _apiKeyIdWasSet,
        _usageDateWasSet,
        requestCount,
        cacheHits,
        cacheMisses,
        errorCount,
        totalLatencyMs,
        _expiryWasSet,
      ] = transactionReplies;

      return {
        userId: input.userId,
        apiKeyId: input.apiKeyId,
        usageDate: this.toUtcUsageDateValue(usageDate),
        requestCount,
        cacheHits,
        cacheMisses,
        errorCount,
        totalLatencyMs,
      };
    } catch (error) {
      logger.error("Redis usage counter increment failed", {
        apiKeyId: input.apiKeyId,
        userId: input.userId,
        usageDate: this.toUtcUsageDateKey(input.occurredAt),
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }

  private getCounterKey(apiKeyId: number, usageDate: string) {
    return `usage:daily:${apiKeyId}:${usageDate}`;
  }

  private toUtcUsageDateKey(value: Date) {
    return value.toISOString().slice(0, 10);
  }

  private toUtcUsageDateValue(value: string) {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private getBucketExpiryDate(value: Date) {
    const usageDayStart = this.toUtcUsageDateValue(
      this.toUtcUsageDateKey(value),
    );
    const expiresAt = new Date(usageDayStart);

    expiresAt.setUTCDate(
      expiresAt.getUTCDate() + RedisUsageCounter.RETENTION_DAYS + 1,
    );

    return expiresAt;
  }

  private assertValidInput(input: UsageCounterIncrementInput) {
    if (!Number.isSafeInteger(input.userId) || input.userId <= 0) {
      throw new Error("Usage counter userId must be a positive safe integer");
    }

    if (!Number.isSafeInteger(input.apiKeyId) || input.apiKeyId <= 0) {
      throw new Error("Usage counter apiKeyId must be a positive safe integer");
    }

    if (
      !(input.occurredAt instanceof Date) ||
      Number.isNaN(input.occurredAt.getTime())
    ) {
      throw new Error("Usage counter occurredAt must be a valid Date");
    }

    if (!Number.isSafeInteger(input.latencyMs) || input.latencyMs < 0) {
      throw new Error(
        "Usage counter latencyMs must be a non-negative safe integer",
      );
    }
  }
}
