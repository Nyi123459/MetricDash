import { MetadataResponse } from "../models/metadata";

export type MetadataCacheEntry = {
  metadata: MetadataResponse;
  ttl: number;
};

export interface MetadataCache {
  get(url: string): Promise<MetadataCacheEntry | null>;
  set(url: string, metadata: MetadataResponse): Promise<void>;
  delete(url: string): Promise<void>;
}
