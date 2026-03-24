import { RequestErrorCode } from "@prisma/client";
import { CreateRequestLogInput } from "../models/request_log";
import { RequestLogRepository } from "../repositories/request_log_repository";
import { logger } from "../utils/logger";

type TrackMetadataRequestInput = Omit<
  CreateRequestLogInput,
  "domain" | "errorCode"
> & {
  errorCode: string | null;
};

export class RequestLogService {
  constructor(private readonly requestLogRepository: RequestLogRepository) {}

  async trackMetadataRequest(input: TrackMetadataRequestInput) {
    try {
      await this.requestLogRepository.createLog({
        ...input,
        domain: this.extractDomain(input.normalizedUrl ?? input.url),
        errorCode: this.mapErrorCode(input.errorCode, input.statusCode),
      });
    } catch (error) {
      logger.error("Failed to persist request log", {
        requestId: input.requestId,
        apiKeyId: input.apiKeyId,
        userId: input.userId,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private extractDomain(value: string | null) {
    if (!value) {
      return null;
    }

    try {
      return new URL(value).hostname;
    } catch {
      return null;
    }
  }

  private mapErrorCode(
    errorCode: string | null,
    statusCode: number,
  ): RequestErrorCode | null {
    switch (errorCode) {
      case "VALIDATION_ERROR":
      case "METADATA_URL_REQUIRED":
      case "METADATA_URL_INVALID":
        return RequestErrorCode.INVALID_URL;
      case "RATE_LIMIT_EXCEEDED":
        return RequestErrorCode.RATE_LIMITED;
      case "METADATA_FETCH_TIMEOUT":
        return RequestErrorCode.FETCH_TIMEOUT;
      case "METADATA_FETCH_FAILED":
      case "METADATA_EMPTY_DOCUMENT":
        return RequestErrorCode.FETCH_FAILED;
      case "METADATA_CONTENT_TYPE_INVALID":
        return RequestErrorCode.PARSE_FAILED;
      case "INTERNAL_SERVER_ERROR":
        return RequestErrorCode.INTERNAL_ERROR;
      default:
        return statusCode >= 500 ? RequestErrorCode.UPSTREAM_ERROR : null;
    }
  }
}
