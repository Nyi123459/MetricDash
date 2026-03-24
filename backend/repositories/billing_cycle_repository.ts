import { BillingCycle, BillingCycleStatus } from "@prisma/client";
import { PrismaAdapter } from "../adapter/prisma";
import { getPrismaClient } from "../lib/prisma";
import { UpsertBillingCycleSummaryInput } from "../models/billing";
import BaseRepository from "./base_repository";

export class BillingCycleRepository extends BaseRepository<BillingCycle> {
  private readonly prisma = getPrismaClient();

  constructor() {
    const prisma = getPrismaClient();
    super(new PrismaAdapter<BillingCycle>(prisma.billingCycle));
  }

  async upsertCycleSummary(input: UpsertBillingCycleSummaryInput) {
    const periodStart = this.toBillingDate(input.periodStart);
    const periodEnd = this.toBillingDate(input.periodEnd);

    return this.prisma.billingCycle.upsert({
      where: {
        user_id_period_start_period_end: {
          user_id: input.userId,
          period_start: periodStart,
          period_end: periodEnd,
        },
      },
      create: {
        user_id: input.userId,
        period_start: periodStart,
        period_end: periodEnd,
        request_count: input.requestCount,
        cache_hits: input.cacheHits,
        cache_misses: input.cacheMisses,
        billable_requests: input.billableRequests,
        estimated_cost_cents: input.estimatedCostCents,
        status: BillingCycleStatus.OPEN,
      },
      update: {
        request_count: input.requestCount,
        cache_hits: input.cacheHits,
        cache_misses: input.cacheMisses,
        billable_requests: input.billableRequests,
        estimated_cost_cents: input.estimatedCostCents,
        status: BillingCycleStatus.OPEN,
      },
    });
  }

  private toBillingDate(value: Date) {
    return new Date(`${value.toISOString().slice(0, 10)}T00:00:00.000Z`);
  }
}
