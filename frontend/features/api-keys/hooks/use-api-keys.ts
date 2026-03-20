"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  type CreateApiKeyRequest,
} from "@/features/api-keys/services/api-key-service";

const API_KEYS_QUERY_KEY = ["api-keys"];

export function useApiKeys(page = 1, perPage = 10) {
  return useQuery({
    queryKey: [...API_KEYS_QUERY_KEY, page, perPage],
    queryFn: () => listApiKeys(page, perPage),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateApiKeyRequest) => createApiKey(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (apiKeyId: number) => revokeApiKey(apiKeyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
    },
  });
}
