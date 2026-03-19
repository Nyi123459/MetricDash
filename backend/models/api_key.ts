export interface CreateApiKeyInput {
  userId: number;
  name: string;
  requestsPerMinute?: number;
  expiresAt?: string | null;
}

export interface RevokeApiKeyInput {
  userId: number;
  apiKeyId: number;
}

export interface ListApiKeysInput {
  userId: number;
  page: number;
  perPage: number;
}

export interface AuthenticateApiKeyInput {
  rawApiKey: string;
}
