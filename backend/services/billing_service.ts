import {
  BillingEstimateCycle,
  BillingEstimateDay,
  BillingEstimateResponse,
  BillingPricingModel,
  GetBillingEstimateInput,
} from "../models/billing";
import { BillingCycleRepository } from "../repositories/billing_cycle_repository";
import { UsageRecordRepository } from "../repositories/usage_record_repository";

type UsageRecordWithApiKey = Awaited<
  ReturnType<UsageRecordRepository["listByUserAndDateRange"]>
>[number];

export const V1_LAUNCH_PRICING_MODEL: BillingPricingModel = {
  name: "V1 launch pricing",
  currency: "USD",
  includedBillableRequests: 10_000,
  overageBlockSize: 1_000,
  overageBlockPriceCents: 60,
  billableMetric: "cache_miss",
  cacheHitPolicy: "free",
  stripeIntegrationStatus: "planned",
};

export class BillingService {
  constructor(
    private readonly usageRecordRepository: UsageRecordRepository,
    private readonly billingCycleRepository: BillingCycleRepository,
  ) {}

  async getEstimate(
    input: GetBillingEstimateInput,
  ): Promise<BillingEstimateResponse> {
    const now = input.now ?? new Date();
    const cycleWindow = this.getCycleWindow(now);
    const usageRecords =
      await this.usageRecordRepository.listByUserAndDateRange(
        input.userId,
        cycleWindow.periodStart,
      );

    const cycle = this.buildCycleEstimate(usageRecords, cycleWindow, now);
    const dailyBreakdown = this.buildDailyBreakdown(
      usageRecords,
      cycleWindow.periodStart,
      now,
    );

    await this.billingCycleRepository.upsertCycleSummary({
      userId: input.userId,
      periodStart: cycleWindow.periodStart,
      periodEnd: cycleWindow.periodEnd,
      requestCount: cycle.requestCount,
      cacheHits: cycle.cacheHits,
      cacheMisses: cycle.cacheMisses,
      billableRequests: cycle.billableRequests,
      estimatedCostCents: cycle.estimatedCostCents,
    });

    return {
      pricingModel: V1_LAUNCH_PRICING_MODEL,
      cycle,
      dailyBreakdown,
    };
  }

  private buildCycleEstimate(
    usageRecords: UsageRecordWithApiKey[],
    cycleWindow: { periodStart: Date; periodEnd: Date; totalDays: number },
    now: Date,
  ): BillingEstimateCycle {
    const totals = usageRecords.reduce(
      (accumulator, record) => {
        accumulator.requestCount += record.request_count;
        accumulator.cacheHits += record.cache_hits;
        accumulator.cacheMisses += record.cache_misses;
        return accumulator;
      },
      {
        requestCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
      },
    );

    const billableRequests = totals.cacheMisses;
    const estimatedCostCents =
      this.calculateEstimatedCostCents(billableRequests);
    const daysElapsed = Math.max(
      1,
      Math.floor(
        (this.toBillingDate(now).getTime() -
          cycleWindow.periodStart.getTime()) /
          (24 * 60 * 60 * 1000),
      ) + 1,
    );
    const projectedBillableRequests = Math.ceil(
      (billableRequests / daysElapsed) * cycleWindow.totalDays,
    );

    return {
      periodStart: this.toDateKey(cycleWindow.periodStart),
      periodEnd: this.toDateKey(cycleWindow.periodEnd),
      daysElapsed,
      totalDays: cycleWindow.totalDays,
      requestCount: totals.requestCount,
      cacheHits: totals.cacheHits,
      cacheMisses: totals.cacheMisses,
      billableRequests,
      includedBillableRequests:
        V1_LAUNCH_PRICING_MODEL.includedBillableRequests,
      remainingIncludedRequests: Math.max(
        0,
        V1_LAUNCH_PRICING_MODEL.includedBillableRequests - billableRequests,
      ),
      overageRequests: Math.max(
        0,
        billableRequests - V1_LAUNCH_PRICING_MODEL.includedBillableRequests,
      ),
      estimatedCostCents,
      projectedBillableRequests,
      projectedEstimatedCostCents: this.calculateEstimatedCostCents(
        projectedBillableRequests,
      ),
    };
  }

  private buildDailyBreakdown(
    usageRecords: UsageRecordWithApiKey[],
    periodStart: Date,
    now: Date,
  ): BillingEstimateDay[] {
    const aggregatedByDate = new Map<
      string,
      { requestCount: number; cacheHits: number; cacheMisses: number }
    >();

    for (const record of usageRecords) {
      const key = this.toDateKey(record.usage_date);
      const current = aggregatedByDate.get(key) ?? {
        requestCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
      };

      current.requestCount += record.request_count;
      current.cacheHits += record.cache_hits;
      current.cacheMisses += record.cache_misses;

      aggregatedByDate.set(key, current);
    }

    const breakdown: BillingEstimateDay[] = [];
    const cursor = new Date(periodStart);
    const lastVisibleDate = this.toDateKey(now);
    let cumulativeBillableRequests = 0;

    while (this.toDateKey(cursor) <= lastVisibleDate) {
      const key = this.toDateKey(cursor);
      const bucket = aggregatedByDate.get(key) ?? {
        requestCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
      };

      cumulativeBillableRequests += bucket.cacheMisses;

      breakdown.push({
        date: key,
        requestCount: bucket.requestCount,
        cacheHits: bucket.cacheHits,
        cacheMisses: bucket.cacheMisses,
        billableRequests: bucket.cacheMisses,
        cumulativeEstimatedCostCents: this.calculateEstimatedCostCents(
          cumulativeBillableRequests,
        ),
      });

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return breakdown;
  }

  private calculateEstimatedCostCents(billableRequests: number) {
    const includedRequests = V1_LAUNCH_PRICING_MODEL.includedBillableRequests;
    const overageRequests = Math.max(0, billableRequests - includedRequests);

    return Math.ceil(
      (overageRequests * V1_LAUNCH_PRICING_MODEL.overageBlockPriceCents) /
        V1_LAUNCH_PRICING_MODEL.overageBlockSize,
    );
  }

  private getCycleWindow(now: Date) {
    const periodStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const periodEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
    );
    const totalDays = periodEnd.getUTCDate();

    return {
      periodStart,
      periodEnd,
      totalDays,
    };
  }

  private toDateKey(value: Date) {
    return value.toISOString().slice(0, 10);
  }

  private toBillingDate(value: Date) {
    return new Date(`${value.toISOString().slice(0, 10)}T00:00:00.000Z`);
  }
}
