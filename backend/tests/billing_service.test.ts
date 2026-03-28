import { BillingService } from "../services/billing_service";

describe("BillingService", () => {
  it("treats cache misses as billable usage and persists the cycle summary", async () => {
    const usageRecordRepository = {
      listByUserAndDateRange: jest.fn(async () => [
        {
          usage_date: new Date("2026-03-01T00:00:00.000Z"),
          request_count: 120,
          cache_hits: 90,
          cache_misses: 30,
        },
        {
          usage_date: new Date("2026-03-22T00:00:00.000Z"),
          request_count: 80,
          cache_hits: 20,
          cache_misses: 60,
        },
      ]),
    };
    const billingCycleRepository = {
      upsertCycleSummary: jest.fn(async () => undefined),
    };
    const billingService = new BillingService(
      usageRecordRepository as never,
      billingCycleRepository as never,
    );

    const result = await billingService.getEstimate({
      userId: 42,
      now: new Date("2026-03-22T10:00:00.000Z"),
    });

    expect(result.pricingModel.billableMetric).toBe("cache_miss");
    expect(result.activityRange).toEqual({
      startDate: "2026-03-01",
      endDate: "2026-03-22",
    });
    expect(result.cycle.requestCount).toBe(200);
    expect(result.cycle.cacheHits).toBe(110);
    expect(result.cycle.cacheMisses).toBe(90);
    expect(result.cycle.billableRequests).toBe(90);
    expect(result.cycle.estimatedCostCents).toBe(0);
    expect(
      result.dailyBreakdown[result.dailyBreakdown.length - 1],
    ).toMatchObject({
      date: "2026-03-22",
      billableRequests: 60,
      cumulativeEstimatedCostCents: 0,
    });
    expect(billingCycleRepository.upsertCycleSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 42,
        requestCount: 200,
        billableRequests: 90,
        estimatedCostCents: 0,
      }),
    );
  });

  it("estimates overage cost once the included monthly requests are exceeded", async () => {
    const usageRecordRepository = {
      listByUserAndDateRange: jest.fn(async () => [
        {
          usage_date: new Date("2026-03-10T00:00:00.000Z"),
          request_count: 12_500,
          cache_hits: 0,
          cache_misses: 12_500,
        },
      ]),
    };
    const billingCycleRepository = {
      upsertCycleSummary: jest.fn(async () => undefined),
    };
    const billingService = new BillingService(
      usageRecordRepository as never,
      billingCycleRepository as never,
    );

    const result = await billingService.getEstimate({
      userId: 7,
      now: new Date("2026-03-22T10:00:00.000Z"),
    });

    expect(result.cycle.remainingIncludedRequests).toBe(0);
    expect(result.cycle.overageRequests).toBe(2_500);
    expect(result.cycle.estimatedCostCents).toBe(150);
    expect(result.cycle.projectedEstimatedCostCents).toBeGreaterThanOrEqual(
      result.cycle.estimatedCostCents,
    );
  });

  it("builds the activity breakdown from an explicit date range without changing the current monthly estimate", async () => {
    const listByUserAndDateRange = jest
      .fn()
      .mockResolvedValueOnce([
        {
          usage_date: new Date("2026-03-01T00:00:00.000Z"),
          request_count: 120,
          cache_hits: 90,
          cache_misses: 30,
        },
        {
          usage_date: new Date("2026-03-22T00:00:00.000Z"),
          request_count: 80,
          cache_hits: 20,
          cache_misses: 60,
        },
      ])
      .mockResolvedValueOnce([
        {
          usage_date: new Date("2026-03-12T00:00:00.000Z"),
          request_count: 70,
          cache_hits: 10,
          cache_misses: 60,
        },
      ]);
    const usageRecordRepository = {
      listByUserAndDateRange,
    };
    const billingCycleRepository = {
      upsertCycleSummary: jest.fn(async () => undefined),
    };
    const billingService = new BillingService(
      usageRecordRepository as never,
      billingCycleRepository as never,
    );

    const result = await billingService.getEstimate({
      userId: 99,
      now: new Date("2026-03-22T10:00:00.000Z"),
      activityStartDate: new Date("2026-03-10T00:00:00.000Z"),
      activityEndDate: new Date("2026-03-12T00:00:00.000Z"),
    });

    expect(result.activityRange).toEqual({
      startDate: "2026-03-10",
      endDate: "2026-03-12",
    });
    expect(result.cycle.billableRequests).toBe(90);
    expect(result.dailyBreakdown).toHaveLength(3);
    expect(result.dailyBreakdown[0]).toMatchObject({
      date: "2026-03-10",
      requestCount: 0,
      billableRequests: 0,
    });
    expect(result.dailyBreakdown[2]).toMatchObject({
      date: "2026-03-12",
      requestCount: 70,
      billableRequests: 60,
    });
    expect(listByUserAndDateRange).toHaveBeenNthCalledWith(
      2,
      99,
      new Date("2026-03-10T00:00:00.000Z"),
      new Date("2026-03-12T00:00:00.000Z"),
    );
  });
});
