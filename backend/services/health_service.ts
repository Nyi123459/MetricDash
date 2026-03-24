import { HealthIndicator } from "../contracts/health_indicator";
import {
  HealthDependencyCheck,
  HealthReadinessReport,
  HealthStatus,
} from "../models/health";

export class HealthService {
  private readonly indicators = new Map<string, HealthIndicator>();

  constructor(healthIndicators: HealthIndicator[]) {
    for (const indicator of healthIndicators) {
      this.indicators.set(indicator.name, indicator);
    }
  }

  async getDependency(name: string): Promise<HealthDependencyCheck | null> {
    const indicator = this.indicators.get(name);

    if (!indicator) {
      return null;
    }

    return indicator.check();
  }

  async getReadiness(): Promise<HealthReadinessReport> {
    const checks = await Promise.all(
      Array.from(this.indicators.values(), (indicator) => indicator.check()),
    );
    const dependencies = Object.fromEntries(
      checks.map((check) => [check.name, check]),
    );
    const status: HealthStatus = checks.every((check) => check.status === "up")
      ? "ok"
      : "error";

    return {
      status,
      dependencies,
    };
  }
}
