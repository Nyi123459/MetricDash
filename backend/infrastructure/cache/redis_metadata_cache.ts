import { createHash } from "crypto";
import {
  MetadataCache,
  MetadataCacheEntry,
} from "../../contracts/metadata_cache";
import { getRedisClient } from "../../lib/redis";
import { MetadataResponse } from "../../models/metadata";

const DEFAULT_METADATA_CACHE_TTL_SECONDS = 43200;

export class RedisMetadataCache implements MetadataCache {
  async get(url: string): Promise<MetadataCacheEntry | null> {
    try {
      const redis = await getRedisClient();
      const key = this.getCacheKey(url);
      const [payload, ttl] = await Promise.all([
        redis.get(key),
        redis.ttl(key),
      ]);

      if (!payload) {
        return null;
      }

      return {
        metadata: JSON.parse(payload) as MetadataResponse,
        ttl: ttl > 0 ? ttl : 0,
      };
    } catch {
      return null;
    }
  }

  async set(url: string, metadata: MetadataResponse): Promise<void> {
    try {
      const redis = await getRedisClient();
      await redis.set(this.getCacheKey(url), JSON.stringify(metadata), {
        EX: this.getCacheTtlSeconds(),
      });
    } catch {
      // Metadata cache should never block the upstream fetch path.
    }
  }

  async delete(url: string): Promise<void> {
    try {
      const redis = await getRedisClient();
      await redis.del(this.getCacheKey(url));
    } catch {
      // Cache invalidation is best effort.
    }
  }

  private getCacheKey(url: string) {
    const urlHash = createHash("sha256").update(url).digest("hex");
    return `metadata:response:${urlHash}`;
  }

  private getCacheTtlSeconds() {
    const configuredTtlSeconds = Number(
      process.env.METADATA_CACHE_TTL_SECONDS ??
        DEFAULT_METADATA_CACHE_TTL_SECONDS.toString(),
    );

    if (
      !Number.isInteger(configuredTtlSeconds) ||
      configuredTtlSeconds <= 0 ||
      configuredTtlSeconds > 86400
    ) {
      return DEFAULT_METADATA_CACHE_TTL_SECONDS;
    }

    return configuredTtlSeconds;
  }
}
