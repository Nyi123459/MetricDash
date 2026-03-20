import { apiClient } from "@/common/lib/api-client";

export type ApiKeyRecord = {
  id: number;
  user_id: number;
  name: string;
  key_prefix: string;
  requests_per_minute: number;
  last_used_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ListApiKeysResponse = {
  data: ApiKeyRecord[];
  meta: {
    total: number;
    currentPage: number;
    perPage: number;
    totalPages: number;
  };
  requestId: string;
};

export type CreateApiKeyRequest = {
  name: string;
};

export type CreateApiKeyResponse = {
  message: string;
  apiKey: ApiKeyRecord;
  secret: string;
  requestId: string;
};

export type RevokeApiKeyResponse = {
  message: string;
  apiKey: ApiKeyRecord;
  requestId: string;
};

export async function listApiKeys(page = 1, perPage = 10) {
  const response = await apiClient.get<ListApiKeysResponse>(
    "/api/v1/api-keys",
    {
      params: { page, perPage },
    },
  );

  return response.data;
}

export async function createApiKey(payload: CreateApiKeyRequest) {
  const response = await apiClient.post<CreateApiKeyResponse>(
    "/api/v1/api-keys",
    payload,
  );

  return response.data;
}

export async function revokeApiKey(apiKeyId: number) {
  const response = await apiClient.post<RevokeApiKeyResponse>(
    `/api/v1/api-keys/${apiKeyId}/revoke`,
  );

  return response.data;
}
