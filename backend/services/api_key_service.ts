import { createHash, randomBytes } from "crypto";
import { ApiKey } from "@prisma/client";
import { AppError } from "../exceptions/app-error";
import {
  AuthenticateApiKeyInput,
  CreateApiKeyInput,
  ListApiKeysInput,
  RevokeApiKeyInput,
} from "../models/api_key";
import { ApiKeyRepository } from "../repositories/api_key_repository";
import { PaginatedResult } from "../types/base_repository";

type ApiKeyRecord = Omit<ApiKey, "key_hash">;

type CreateApiKeyResult = {
  apiKey: ApiKeyRecord;
  secret: string;
};

type AuthenticatedApiKeyResult = {
  apiKey: ApiKey;
};

export class ApiKeyService {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async create(input: CreateApiKeyInput): Promise<CreateApiKeyResult> {
    const name = input.name.trim();

    if (!name) {
      throw new AppError(
        400,
        "API_KEY_NAME_REQUIRED",
        "API key name is required",
      );
    }

    if (name.length > 100) {
      throw new AppError(
        400,
        "API_KEY_NAME_TOO_LONG",
        "API key name must be 100 characters or fewer",
      );
    }

    const requestsPerMinute = input.requestsPerMinute ?? 60;

    if (!Number.isInteger(requestsPerMinute) || requestsPerMinute <= 0) {
      throw new AppError(
        400,
        "API_KEY_RATE_LIMIT_INVALID",
        "Requests per minute must be a positive integer",
      );
    }

    const expiresAt = this.parseExpiryDate(input.expiresAt);
    const secret = this.generateRawApiKey();

    const createdApiKey = await this.apiKeyRepository.create({
      user_id: input.userId,
      name,
      key_prefix: this.getKeyPrefix(secret),
      key_hash: this.hashApiKey(secret),
      requests_per_minute: requestsPerMinute,
      expires_at: expiresAt,
      revoked_at: null,
      last_used_at: null,
    });

    return {
      apiKey: this.toPublicApiKey(createdApiKey),
      secret,
    };
  }

  async listForUser(
    input: ListApiKeysInput,
  ): Promise<PaginatedResult<ApiKeyRecord>> {
    const apiKeys = await this.apiKeyRepository.findPaginated({
      filter: {
        groups: [
          {
            conditions: [
              { field: "user_id", operator: "=", value: input.userId },
            ],
          },
        ],
      },
      sort: { field: "created_at", sort: "desc" },
      pagination: {
        page: input.page,
        perPage: input.perPage,
      },
    });

    return {
      data: apiKeys.data.map((apiKey) => this.toPublicApiKey(apiKey)),
      meta: apiKeys.meta,
    };
  }

  async revoke(input: RevokeApiKeyInput): Promise<ApiKeyRecord> {
    const apiKey = await this.findOwnedApiKey(input.userId, input.apiKeyId);

    if (!apiKey) {
      throw new AppError(404, "API_KEY_NOT_FOUND", "API key was not found");
    }

    const revokedApiKey =
      apiKey.revoked_at === null
        ? await this.apiKeyRepository.update(apiKey.id, {
            revoked_at: new Date(),
          })
        : apiKey;

    if (!revokedApiKey) {
      throw new AppError(404, "API_KEY_NOT_FOUND", "API key was not found");
    }

    return this.toPublicApiKey(revokedApiKey);
  }

  async authenticate(
    input: AuthenticateApiKeyInput,
  ): Promise<AuthenticatedApiKeyResult> {
    const rawApiKey = input.rawApiKey.trim();

    if (!rawApiKey) {
      throw new AppError(401, "API_KEY_REQUIRED", "API key is required");
    }

    const apiKey = await this.apiKeyRepository.findOne({
      filter: {
        groups: [
          {
            conditions: [
              {
                field: "key_hash",
                operator: "=",
                value: this.hashApiKey(rawApiKey),
              },
            ],
          },
        ],
      },
    });

    if (!apiKey) {
      throw new AppError(401, "API_KEY_INVALID", "API key is invalid");
    }

    if (apiKey.revoked_at) {
      throw new AppError(401, "API_KEY_REVOKED", "API key has been revoked");
    }

    if (apiKey.expires_at && apiKey.expires_at <= new Date()) {
      throw new AppError(401, "API_KEY_EXPIRED", "API key has expired");
    }

    await this.apiKeyRepository.update(apiKey.id, {
      last_used_at: new Date(),
    });

    const refreshedApiKey = await this.apiKeyRepository.findById(apiKey.id);

    return {
      apiKey: refreshedApiKey ?? apiKey,
    };
  }

  private async findOwnedApiKey(userId: number, apiKeyId: number) {
    return this.apiKeyRepository.findOne({
      filter: {
        groups: [
          {
            conditions: [
              { field: "id", operator: "=", value: apiKeyId },
              { field: "user_id", operator: "=", value: userId },
            ],
            logic: "and",
          },
        ],
      },
    });
  }

  private generateRawApiKey() {
    return `md_live_${randomBytes(24).toString("hex")}`;
  }

  private getKeyPrefix(rawApiKey: string) {
    return rawApiKey.slice(0, 15);
  }

  private hashApiKey(rawApiKey: string) {
    return createHash("sha256").update(rawApiKey).digest("hex");
  }

  private parseExpiryDate(expiresAt: string | null | undefined) {
    if (!expiresAt) {
      return null;
    }

    const parsed = new Date(expiresAt);

    if (Number.isNaN(parsed.getTime())) {
      throw new AppError(
        400,
        "API_KEY_EXPIRY_INVALID",
        "API key expiry must be a valid ISO datetime",
      );
    }

    return parsed;
  }

  private toPublicApiKey(apiKey: ApiKey): ApiKeyRecord {
    const { key_hash: _keyHash, ...publicApiKey } = apiKey;
    return publicApiKey;
  }
}
