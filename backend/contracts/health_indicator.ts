import { HealthDependencyCheck } from "../models/health";

export interface HealthIndicator {
  readonly name: string;
  check(): Promise<HealthDependencyCheck>;
}
