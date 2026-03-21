import { UsageRecord } from "@prisma/client";
import { PrismaAdapter } from "../adapter/prisma";
import { getPrismaClient } from "../lib/prisma";
import {
  UsageCounterIncrementInput,
  UsageCounterSnapshot,
} from "../models/usage";
import BaseRepository from "./base_repository";

export class UsageRecordRepository extends BaseRepository<UsageRecord> {
  private readonly prisma = getPrismaClient();

  constructor() {
    const prisma = getPrismaClient();
    super(new PrismaAdapter<UsageRecord>(prisma.usageRecord));
  }

  async saveDailySnapshot(snapshot: UsageCounterSnapshot) {
    const usageDate = this.toUsageDate(snapshot.usageDate);

    return this.prisma.usageRecord.upsert({
      where: {
        api_key_id_usage_date: {
          api_key_id: snapshot.apiKeyId,
          usage_date: usageDate,
        },
      },
      create: {
        user_id: snapshot.userId,
        api_key_id: snapshot.apiKeyId,
        usage_date: usageDate,
        request_count: snapshot.requestCount,
        cache_hits: snapshot.cacheHits,
        cache_misses: snapshot.cacheMisses,
        error_count: snapshot.errorCount,
        total_latency_ms: snapshot.totalLatencyMs,
      },
      update: {
        user_id: snapshot.userId,
        request_count: snapshot.requestCount,
        cache_hits: snapshot.cacheHits,
        cache_misses: snapshot.cacheMisses,
        error_count: snapshot.errorCount,
        total_latency_ms: snapshot.totalLatencyMs,
      },
    });
  }

  async incrementDailyTotals(input: UsageCounterIncrementInput) {
    const usageDate = this.toUsageDate(input.occurredAt);
    const cacheHits = input.cacheStatus === "hit" ? 1 : 0;
    const cacheMisses = input.cacheStatus === "miss" ? 1 : 0;
    const errorCount = input.isError ? 1 : 0;

    return this.prisma.usageRecord.upsert({
      where: {
        api_key_id_usage_date: {
          api_key_id: input.apiKeyId,
          usage_date: usageDate,
        },
      },
      create: {
        user_id: input.userId,
        api_key_id: input.apiKeyId,
        usage_date: usageDate,
        request_count: 1,
        cache_hits: cacheHits,
        cache_misses: cacheMisses,
        error_count: errorCount,
        total_latency_ms: input.latencyMs,
      },
      update: {
        request_count: {
          increment: 1,
        },
        cache_hits: {
          increment: cacheHits,
        },
        cache_misses: {
          increment: cacheMisses,
        },
        error_count: {
          increment: errorCount,
        },
        total_latency_ms: {
          increment: input.latencyMs,
        },
      },
    });
  }

  private toUsageDate(value: Date) {
    return new Date(`${value.toISOString().slice(0, 10)}T00:00:00.000Z`);
  }
}
