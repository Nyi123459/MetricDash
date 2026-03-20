import { ApiKeyService } from "../services/api_key_service";

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
  const apiKeyMetadataCache = {
    get: jest.fn<Promise<ApiKeyRecord | null>, [string]>(
      async (_keyHash: string) => null,
    ),
    set: jest.fn(async (_apiKey: ApiKeyRecord) => undefined),
    delete: jest.fn(async (_keyHash: string) => undefined),
  };

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
    apiKeyMetadataCache,
    apiKeyRepository,
    apiKeyService: new ApiKeyService(
      apiKeyRepository as never,
      apiKeyMetadataCache as never,
    ),
  };
}

describe("ApiKeyService", () => {
  it("creates a hashed API key and returns the raw secret once", async () => {
    const fixture = createApiKeyServiceFixture();

    const result = await fixture.apiKeyService.create({
      userId: 1,
      name: "Production bot",
    });

    expect(result.secret).toMatch(/^md_live_/);
    expect(result.apiKey.name).toBe("Production bot");
    expect(result.apiKey.key_prefix).toBe(result.secret.slice(0, 15));
    expect(fixture.apiKeys[0]?.key_hash).not.toBe(result.secret);
    expect(result.apiKey.requests_per_minute).toBe(60);
    expect(result.apiKey.expires_at).toBeInstanceOf(Date);
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
    expect(fixture.apiKeyMetadataCache.set).toHaveBeenCalled();
  });

  it("rejects invalid API keys", async () => {
    const fixture = createApiKeyServiceFixture();

    await expect(
      fixture.apiKeyService.authenticate({ rawApiKey: "invalid" }),
    ).rejects.toMatchObject({
      code: "API_KEY_INVALID",
    });
  });

  it("uses cached API key metadata during authentication", async () => {
    const fixture = createApiKeyServiceFixture();
    const created = await fixture.apiKeyService.create({
      userId: 1,
      name: "Cached key",
    });

    fixture.apiKeyMetadataCache.get.mockResolvedValueOnce(fixture.apiKeys[0]);

    await fixture.apiKeyService.authenticate({
      rawApiKey: created.secret,
    });

    expect(fixture.apiKeyRepository.findOne).not.toHaveBeenCalled();
  });

  it("invalidates cached metadata when a key is revoked", async () => {
    const fixture = createApiKeyServiceFixture();
    const created = await fixture.apiKeyService.create({
      userId: 1,
      name: "Production bot",
    });

    await fixture.apiKeyService.revoke({
      userId: 1,
      apiKeyId: created.apiKey.id,
    });

    expect(fixture.apiKeyMetadataCache.delete).toHaveBeenCalledWith(
      fixture.apiKeys[0]?.key_hash,
    );
  });
});
