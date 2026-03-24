export interface GetMetadataInput {
  url: string;
  requestId?: string;
}

export interface MetadataResponse {
  url: string;
  canonical_url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  site_name: string | null;
  content_type: string | null;
  author: string | null;
  published_at: string | null;
  cache: {
    hit: boolean;
    ttl: number;
  };
}
