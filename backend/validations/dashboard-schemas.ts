import { z } from "zod";

export const dashboardRangeQuerySchema = z.object({
  days: z.coerce
    .number()
    .int("Days must be a positive integer")
    .positive("Days must be a positive integer")
    .max(30, "Days must be 30 or fewer")
    .default(7),
});

export const dashboardLogsQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be a positive integer")
    .positive("Page must be a positive integer")
    .default(1),
  perPage: z.coerce
    .number()
    .int("Per-page must be a positive integer")
    .positive("Per-page must be a positive integer")
    .max(50, "Per-page must be 50 or fewer")
    .default(20),
});

export const dashboardMetadataPreviewBodySchema = z.object({
  apiKeyId: z.coerce
    .number()
    .int("API key is required")
    .positive("API key is required"),
  url: z
    .string({ error: "URL is required" })
    .trim()
    .min(1, "URL is required")
    .refine((value) => {
      try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    }, "URL must be a valid http or https URL"),
});
