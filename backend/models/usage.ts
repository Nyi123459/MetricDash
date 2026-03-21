export type UsageCounterIncrementInput = {
  userId: number;
  apiKeyId: number;
  occurredAt: Date;
  cacheStatus: "hit" | "miss" | "skipped";
  isError: boolean;
  latencyMs: number;
};

export type UsageCounterSnapshot = {
  userId: number;
  apiKeyId: number;
  usageDate: Date;
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  errorCount: number;
  totalLatencyMs: number;
};
