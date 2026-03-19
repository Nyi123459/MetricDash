import { ApiKeyService } from "../services/api_key_service";
import { AppError } from "../exceptions/app-error";

type ApiKeyRecord = {
  id: number;
  user_id: number;
  name: string;
  key_prefix: string;
  key_hash: string;
  requests_per_minute: number;
  last_used_at: Date | null;
  revoked_at: Date | null;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

function createApiKeyServiceFixture() {
  const apiKeys: ApiKeyRecord[] = [];

  const apiKeyRepository = {
    create: jest.fn(async (data: Partial<ApiKeyRecord>) => {
      const apiKey: ApiKeyRecord = {
        id: apiKeys.length + 1,
        user_id: data.user_id ?? 0,
        name: data.name ?? "",
        key_prefix: data.key_prefix ?? "",
        key_hash: data.key_hash ?? "",
        requests_per_minute: data.requests_per_minute ?? 60,
        last_used_at: data.last_used_at ?? null,
        revoked_at: data.revoked_at ?? null,
        expires_at: data.expires_at ?? null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      apiKeys.push(apiKey);
      return apiKey;
    }),
    findAll: jest.fn(
      async ({
        filter,
      }: {
        filter: {
          groups: Array<{
            conditions: Array<{ field: string; value: number }>;
          }>;
        };
      }) => {
        const userId = filter.groups[0]?.conditions.find(
          (condition) => condition.field === "user_id",
        )?.value;

        return apiKeys
          .filter((apiKey) => apiKey.user_id === userId)
          .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      },
    ),
    findOne: jest.fn(
      async ({
        filter,
      }: {
        filter: {
          groups: Array<{
            conditions: Array<{ field: string; value?: string | number }>;
            logic?: string;
          }>;
        };
      }) => {
        const conditions = filter.groups[0]?.conditions ?? [];
        const id = conditions.find(
          (condition) => condition.field === "id",
        )?.value;
        const userId = conditions.find(
          (condition) => condition.field === "user_id",
        )?.value;
        const keyHash = conditions.find(
          (condition) => condition.field === "key_hash",
        )?.value;

        if (typeof keyHash === "string") {
          return apiKeys.find((apiKey) => apiKey.key_hash === keyHash) ?? null;
        }

        return (
          apiKeys.find(
            (apiKey) => apiKey.id === id && apiKey.user_id === userId,
          ) ?? null
        );
      },
    ),
    findById: jest.fn(async (id: number) => {
      return apiKeys.find((apiKey) => apiKey.id === id) ?? null;
    }),
    update: jest.fn(async (id: number, data: Partial<ApiKeyRecord>) => {
      const apiKey = apiKeys.find((item) => item.id === id) ?? null;

      if (!apiKey) {
        return null;
      }

      Object.assign(apiKey, data, { updated_at: new Date() });
      return apiKey;
    }),
  };

  return {
    apiKeys,
    apiKeyService: new ApiKeyService(apiKeyRepository as never),
  };
}

describe("ApiKeyService", () => {
  it("creates a hashed API key and returns the raw secret once", async () => {
    const fixture = createApiKeyServiceFixture();

    const result = await fixture.apiKeyService.create({
      userId: 1,
      name: "Production bot",
      requestsPerMinute: 120,
    });

    expect(result.secret).toMatch(/^md_live_/);
    expect(result.apiKey.name).toBe("Production bot");
    expect(result.apiKey.key_prefix).toBe(result.secret.slice(0, 15));
    expect(fixture.apiKeys[0]?.key_hash).not.toBe(result.secret);
  });

  it("revokes an owned API key", async () => {
    const fixture = createApiKeyServiceFixture();
    const created = await fixture.apiKeyService.create({
      userId: 1,
      name: "Production bot",
    });

    const revoked = await fixture.apiKeyService.revoke({
      userId: 1,
      apiKeyId: created.apiKey.id,
    });

    expect(revoked.revoked_at).toBeInstanceOf(Date);
  });

  it("updates last_used_at when an API key is authenticated", async () => {
    const fixture = createApiKeyServiceFixture();
    const created = await fixture.apiKeyService.create({
      userId: 1,
      name: "Production bot",
    });

    const authenticated = await fixture.apiKeyService.authenticate({
      rawApiKey: created.secret,
    });

    expect(authenticated.apiKey.last_used_at).toBeInstanceOf(Date);
  });

  it("rejects invalid API keys", async () => {
    const fixture = createApiKeyServiceFixture();

    await expect(
      fixture.apiKeyService.authenticate({ rawApiKey: "invalid" }),
    ).rejects.toMatchObject({
      code: "API_KEY_INVALID",
    });
  });
});
