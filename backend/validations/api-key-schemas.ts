import { z } from "zod";

export const createApiKeyBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "API key name is required")
    .max(100, "API key name must be 100 characters or fewer"),
});

export const listApiKeysQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be a positive integer")
    .positive("Page must be a positive integer")
    .default(1),
  perPage: z.coerce
    .number()
    .int("Per-page must be a positive integer")
    .positive("Per-page must be a positive integer")
    .max(100, "Per-page must be 100 or fewer")
    .default(10),
});

export const revokeApiKeyParamsSchema = z.object({
  id: z.coerce
    .number()
    .int("API key id must be valid")
    .positive("API key id must be valid"),
});
