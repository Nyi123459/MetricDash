export type HealthStatus = "ok" | "error";
export type HealthDependencyState = "up" | "down";

export type HealthDependencyCheck = {
  name: string;
  status: HealthDependencyState;
  latencyMs: number;
  message: string | null;
};

export type HealthReadinessReport = {
  status: HealthStatus;
  dependencies: Record<string, HealthDependencyCheck>;
};
