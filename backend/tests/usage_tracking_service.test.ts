import { UsageTrackingService } from "../services/usage_tracking_service";

describe("UsageTrackingService", () => {
  it("persists Redis snapshots into daily usage records", async () => {
    const usageCounter = {
      increment: jest.fn(async () => ({
        userId: 3,
        apiKeyId: 9,
        usageDate: new Date("2026-03-21T00:00:00.000Z"),
        requestCount: 4,
        cacheHits: 2,
        cacheMisses: 2,
        errorCount: 1,
        totalLatencyMs: 980,
      })),
    };

    const usageRecordRepository = {
      saveDailySnapshot: jest.fn(async () => undefined),
      incrementDailyTotals: jest.fn(async () => undefined),
    };

    const service = new UsageTrackingService(
      usageCounter as never,
      usageRecordRepository as never,
    );

    await service.trackRequest({
      userId: 3,
      apiKeyId: 9,
      occurredAt: new Date("2026-03-21T09:30:00.000Z"),
      cacheStatus: "hit",
      isError: false,
      latencyMs: 120,
    });

    expect(usageRecordRepository.saveDailySnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 3,
        apiKeyId: 9,
        requestCount: 4,
      }),
    );
    expect(usageRecordRepository.incrementDailyTotals).not.toHaveBeenCalled();
  });

  it("falls back to direct database increments when Redis is unavailable", async () => {
    const usageCounter = {
      increment: jest.fn(async () => null),
    };

    const usageRecordRepository = {
      saveDailySnapshot: jest.fn(async () => undefined),
      incrementDailyTotals: jest.fn(async () => undefined),
    };

    const service = new UsageTrackingService(
      usageCounter as never,
      usageRecordRepository as never,
    );

    await service.trackRequest({
      userId: 3,
      apiKeyId: 9,
      occurredAt: new Date("2026-03-21T09:30:00.000Z"),
      cacheStatus: "miss",
      isError: true,
      latencyMs: 250,
    });

    expect(usageRecordRepository.incrementDailyTotals).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 3,
        apiKeyId: 9,
        cacheStatus: "miss",
        isError: true,
      }),
    );
  });
});
