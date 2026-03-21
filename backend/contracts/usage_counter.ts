import {
  UsageCounterIncrementInput,
  UsageCounterSnapshot,
} from "../models/usage";

export interface UsageCounter {
  increment(
    input: UsageCounterIncrementInput,
  ): Promise<UsageCounterSnapshot | null>;
}
