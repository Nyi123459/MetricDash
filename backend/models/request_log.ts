import { RequestErrorCode } from "@prisma/client";

export type CreateRequestLogInput = {
  requestId: string;
  userId: number;
  apiKeyId: number;
  url: string;
  normalizedUrl: string | null;
  canonicalUrl: string | null;
  domain: string | null;
  method: string;
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  cacheHit: boolean;
  contentType: string | null;
  errorCode: RequestErrorCode | null;
  requestedAt: Date;
};
