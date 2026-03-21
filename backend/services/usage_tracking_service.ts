import { UsageCounter } from "../contracts/usage_counter";
import { UsageCounterIncrementInput } from "../models/usage";
import { UsageRecordRepository } from "../repositories/usage_record_repository";
import { logger } from "../utils/logger";

export class UsageTrackingService {
  constructor(
    private readonly usageCounter: UsageCounter,
    private readonly usageRecordRepository: UsageRecordRepository,
  ) {}

  async trackRequest(input: UsageCounterIncrementInput) {
    try {
      const snapshot = await this.usageCounter.increment(input);

      if (snapshot) {
        await this.usageRecordRepository.saveDailySnapshot(snapshot);
        return;
      }

      await this.usageRecordRepository.incrementDailyTotals(input);
    } catch (error) {
      logger.error("Failed to track metadata usage", {
        apiKeyId: input.apiKeyId,
        userId: input.userId,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
