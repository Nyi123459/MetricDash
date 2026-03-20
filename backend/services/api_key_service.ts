import { createHash, randomBytes } from "crypto";
import { ApiKey } from "@prisma/client";
import { ApiKeyMetadataCache } from "../contracts/api_key_metadata_cache";
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
  private static readonly DEFAULT_REQUESTS_PER_MINUTE = 60;

  constructor(
    private readonly apiKeyRepository: ApiKeyRepository,
    private readonly apiKeyMetadataCache?: ApiKeyMetadataCache,
  ) {}

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

    const secret = this.generateRawApiKey();

    const createdApiKey = await this.apiKeyRepository.create({
      user_id: input.userId,
      name,
      key_prefix: this.getKeyPrefix(secret),
      key_hash: this.hashApiKey(secret),
      requests_per_minute: ApiKeyService.DEFAULT_REQUESTS_PER_MINUTE,
      expires_at: this.getSystemManagedExpiryDate(),
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

    await this.apiKeyMetadataCache?.delete(apiKey.key_hash);

    return this.toPublicApiKey(revokedApiKey);
  }

  async authenticate(
    input: AuthenticateApiKeyInput,
  ): Promise<AuthenticatedApiKeyResult> {
    const rawApiKey = input.rawApiKey.trim();

    if (!rawApiKey) {
      throw new AppError(401, "API_KEY_REQUIRED", "API key is required");
    }

    const keyHash = this.hashApiKey(rawApiKey);

    const apiKey =
      (await this.apiKeyMetadataCache?.get(keyHash)) ??
      (await this.apiKeyRepository.findOne({
        filter: {
          groups: [
            {
              conditions: [
                {
                  field: "key_hash",
                  operator: "=",
                  value: keyHash,
                },
              ],
            },
          ],
        },
      }));

    if (!apiKey) {
      throw new AppError(401, "API_KEY_INVALID", "API key is invalid");
    }

    if (apiKey.key_hash !== keyHash) {
      await this.apiKeyMetadataCache?.delete(keyHash);
      throw new AppError(401, "API_KEY_INVALID", "API key is invalid");
    }

    if (apiKey.revoked_at) {
      await this.apiKeyMetadataCache?.delete(keyHash);
      throw new AppError(401, "API_KEY_REVOKED", "API key has been revoked");
    }

    if (apiKey.expires_at && apiKey.expires_at <= new Date()) {
      await this.apiKeyMetadataCache?.delete(keyHash);
      throw new AppError(401, "API_KEY_EXPIRED", "API key has expired");
    }

    if (!this.apiKeyMetadataCache || apiKey.last_used_at === null) {
      await this.apiKeyMetadataCache?.set(apiKey);
    }

    await this.apiKeyRepository.update(apiKey.id, {
      last_used_at: new Date(),
    });

    const refreshedApiKey = await this.apiKeyRepository.findById(apiKey.id);
    const authenticatedApiKey = refreshedApiKey ?? apiKey;

    await this.apiKeyMetadataCache?.set(authenticatedApiKey);

    return {
      apiKey: authenticatedApiKey,
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

  private getSystemManagedExpiryDate() {
    const configuredTtlDays = Number(process.env.API_KEY_TTL_DAYS ?? "90");

    if (
      !Number.isInteger(configuredTtlDays) ||
      configuredTtlDays <= 0 ||
      configuredTtlDays > 365
    ) {
      throw new AppError(
        500,
        "API_KEY_TTL_INVALID",
        "API key TTL configuration must be an integer between 1 and 365 days",
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + configuredTtlDays);

    return expiresAt;
  }

  private toPublicApiKey(apiKey: ApiKey): ApiKeyRecord {
    const { key_hash: _keyHash, ...publicApiKey } = apiKey;
    return publicApiKey;
  }
}
