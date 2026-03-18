import { z } from "zod";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/features/auth/constants/auth-constants";

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Full name is required").max(100),
    email: z.string().trim().email("Email must be valid"),
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      )
      .max(
        PASSWORD_MAX_LENGTH,
        `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
      ),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean(),
  })
  .refine((data) => data.agreeToTerms, {
    message: "You must agree to the terms to continue",
    path: ["agreeToTerms"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Email must be valid"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
