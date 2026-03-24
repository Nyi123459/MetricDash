export type GetBillingEstimateInput = {
  userId: number;
  now?: Date;
};

export type BillingPricingModel = {
  name: string;
  currency: "USD";
  includedBillableRequests: number;
  overageBlockSize: number;
  overageBlockPriceCents: number;
  billableMetric: "cache_miss";
  cacheHitPolicy: "free";
  stripeIntegrationStatus: "planned";
};

export type BillingEstimateCycle = {
  periodStart: string;
  periodEnd: string;
  daysElapsed: number;
  totalDays: number;
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  billableRequests: number;
  includedBillableRequests: number;
  remainingIncludedRequests: number;
  overageRequests: number;
  estimatedCostCents: number;
  projectedBillableRequests: number;
  projectedEstimatedCostCents: number;
};

export type BillingEstimateDay = {
  date: string;
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  billableRequests: number;
  cumulativeEstimatedCostCents: number;
};

export type BillingEstimateResponse = {
  pricingModel: BillingPricingModel;
  cycle: BillingEstimateCycle;
  dailyBreakdown: BillingEstimateDay[];
};

export type UpsertBillingCycleSummaryInput = {
  userId: number;
  periodStart: Date;
  periodEnd: Date;
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  billableRequests: number;
  estimatedCostCents: number;
};
