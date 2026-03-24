import { HealthIndicator } from "../../contracts/health_indicator";
import { getRedisClient } from "../../lib/redis";
import { HealthDependencyCheck } from "../../models/health";

export class RedisHealthIndicator implements HealthIndicator {
  readonly name = "redis";

  async check(): Promise<HealthDependencyCheck> {
    const startedAt = Date.now();

    try {
      const redis = await getRedisClient();
      await redis.ping();

      return {
        name: this.name,
        status: "up",
        latencyMs: Math.max(0, Date.now() - startedAt),
        message: null,
      };
    } catch (error) {
      return {
        name: this.name,
        status: "down",
        latencyMs: Math.max(0, Date.now() - startedAt),
        message: error instanceof Error ? error.message : "Unknown Redis error",
      };
    }
  }
}
