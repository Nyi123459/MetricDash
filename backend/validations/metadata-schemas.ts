import { z } from "zod";

export const metadataQuerySchema = z.object({
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
