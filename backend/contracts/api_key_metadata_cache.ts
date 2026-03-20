import { ApiKey } from "@prisma/client";

export interface ApiKeyMetadataCache {
  get(keyHash: string): Promise<ApiKey | null>;
  set(apiKey: ApiKey): Promise<void>;
  delete(keyHash: string): Promise<void>;
}
