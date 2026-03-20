import { ApiKey } from "@prisma/client";
import { getRedisClient } from "../../lib/redis";
import { ApiKeyMetadataCache } from "../../contracts/api_key_metadata_cache";

type SerializedApiKey = Omit<
  ApiKey,
  "last_used_at" | "revoked_at" | "expires_at" | "created_at" | "updated_at"
> & {
  last_used_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

const API_KEY_METADATA_TTL_SECONDS = 300;

export class RedisApiKeyMetadataCache implements ApiKeyMetadataCache {
  async get(keyHash: string): Promise<ApiKey | null> {
    try {
      const redis = await getRedisClient();
      const payload = await redis.get(this.getCacheKey(keyHash));

      if (!payload) {
        return null;
      }

      return this.deserialize(JSON.parse(payload) as SerializedApiKey);
    } catch {
      return null;
    }
  }

  async set(apiKey: ApiKey): Promise<void> {
    try {
      const redis = await getRedisClient();
      await redis.set(
        this.getCacheKey(apiKey.key_hash),
        this.serialize(apiKey),
        {
          EX: API_KEY_METADATA_TTL_SECONDS,
        },
      );
    } catch {
      // Keep API key auth resilient even when Redis is unavailable.
    }
  }

  async delete(keyHash: string): Promise<void> {
    try {
      const redis = await getRedisClient();
      await redis.del(this.getCacheKey(keyHash));
    } catch {
      // Cache invalidation should not block the primary DB-backed workflow.
    }
  }

  private getCacheKey(keyHash: string) {
    return `api-key:metadata:${keyHash}`;
  }

  private serialize(apiKey: ApiKey) {
    return JSON.stringify({
      ...apiKey,
      last_used_at: apiKey.last_used_at?.toISOString() ?? null,
      revoked_at: apiKey.revoked_at?.toISOString() ?? null,
      expires_at: apiKey.expires_at?.toISOString() ?? null,
      created_at: apiKey.created_at.toISOString(),
      updated_at: apiKey.updated_at.toISOString(),
    } satisfies SerializedApiKey);
  }

  private deserialize(payload: SerializedApiKey): ApiKey {
    return {
      ...payload,
      last_used_at: payload.last_used_at
        ? new Date(payload.last_used_at)
        : null,
      revoked_at: payload.revoked_at ? new Date(payload.revoked_at) : null,
      expires_at: payload.expires_at ? new Date(payload.expires_at) : null,
      created_at: new Date(payload.created_at),
      updated_at: new Date(payload.updated_at),
    };
  }
}
