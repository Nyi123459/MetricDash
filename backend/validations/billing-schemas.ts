import { z } from "zod";

const billingDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date filters must use YYYY-MM-DD format.");

export const billingEstimateQuerySchema = z
  .object({
    startDate: billingDateSchema.optional(),
    endDate: billingDateSchema.optional(),
  })
  .superRefine((value, context) => {
    const hasStartDate = Boolean(value.startDate);
    const hasEndDate = Boolean(value.endDate);

    if (hasStartDate !== hasEndDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date and end date must be provided together.",
        path: hasStartDate ? ["endDate"] : ["startDate"],
      });
      return;
    }

    if (!value.startDate || !value.endDate) {
      return;
    }

    const startDate = new Date(`${value.startDate}T00:00:00.000Z`);
    const endDate = new Date(`${value.endDate}T00:00:00.000Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (startDate > endDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be before or equal to end date.",
        path: ["startDate"],
      });
    }

    if (endDate > today) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be in the future.",
        path: ["endDate"],
      });
    }
  });
