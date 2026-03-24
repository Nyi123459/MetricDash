import { HealthIndicator } from "../../contracts/health_indicator";
import { getPrismaClient } from "../../lib/prisma";
import { HealthDependencyCheck } from "../../models/health";

export class PrismaHealthIndicator implements HealthIndicator {
  readonly name = "database";

  async check(): Promise<HealthDependencyCheck> {
    const startedAt = Date.now();

    try {
      const prisma = getPrismaClient();
      await prisma.$queryRaw`SELECT 1`;

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
        message:
          error instanceof Error ? error.message : "Unknown database error",
      };
    }
  }
}
