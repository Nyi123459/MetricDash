import { ApiKeyRateLimiter } from "../contracts/api_key_rate_limiter";
import { AppError } from "../exceptions/app-error";
import { RateLimitResult } from "../models/rate_limit";

type EnforceRateLimitInput = {
  apiKeyId: number;
  requestsPerMinute: number;
};

export class RateLimitService {
  constructor(private readonly rateLimiter: ApiKeyRateLimiter) {}

  async enforce(input: EnforceRateLimitInput): Promise<RateLimitResult> {
    if (
      !Number.isInteger(input.requestsPerMinute) ||
      input.requestsPerMinute <= 0
    ) {
      throw new AppError(
        500,
        "API_KEY_RATE_LIMIT_INVALID",
        "API key rate limit configuration is invalid",
      );
    }

    const result = await this.rateLimiter.consume(
      input.apiKeyId,
      input.requestsPerMinute,
    );

    return result;
  }
}
