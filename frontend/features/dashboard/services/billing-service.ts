import { apiClient } from "@/common/lib/api-client";

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

export type BillingEstimateActivityRange = {
  startDate: string;
  endDate: string;
};

export type BillingEstimateResponse = {
  pricingModel: BillingPricingModel;
  cycle: BillingEstimateCycle;
  activityRange: BillingEstimateActivityRange;
  dailyBreakdown: BillingEstimateDay[];
  requestId: string;
};

export async function getBillingEstimate(
  activityRange: BillingEstimateActivityRange,
) {
  const response = await apiClient.get<BillingEstimateResponse>(
    "/api/v1/billing/estimate",
    {
      params: activityRange,
    },
  );

  return response.data;
}
