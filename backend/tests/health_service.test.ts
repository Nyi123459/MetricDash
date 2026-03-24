import { HealthIndicator } from "../contracts/health_indicator";
import { HealthService } from "../services/health_service";

describe("HealthService", () => {
  it("returns an ok readiness status when every dependency is up", async () => {
    const service = new HealthService([
      createIndicator("database", "up"),
      createIndicator("redis", "up"),
    ]);

    const readiness = await service.getReadiness();

    expect(readiness.status).toBe("ok");
    expect(readiness.dependencies.database.status).toBe("up");
    expect(readiness.dependencies.redis.status).toBe("up");
  });

  it("returns an error readiness status when any dependency is down", async () => {
    const service = new HealthService([
      createIndicator("database", "up"),
      createIndicator("redis", "down", "Redis unavailable"),
    ]);

    const readiness = await service.getReadiness();

    expect(readiness.status).toBe("error");
    expect(readiness.dependencies.redis).toMatchObject({
      status: "down",
      message: "Redis unavailable",
    });
  });
});

function createIndicator(
  name: string,
  status: "up" | "down",
  message: string | null = null,
): HealthIndicator {
  return {
    name,
    check: async () => ({
      name,
      status,
      latencyMs: 1,
      message,
    }),
  };
}
