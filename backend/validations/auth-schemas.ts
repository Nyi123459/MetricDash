import { z } from "zod";

export const registerBodySchema = z.object({
  email: z.email("Email must be valid"),
  password: z
    .string()
    .min(8, "Password must be between 8 and 72 characters")
    .max(72, "Password must be between 8 and 72 characters"),
  name: z
    .string()
    .trim()
    .max(100, "Name must be 100 characters or fewer")
    .optional(),
});

export const loginBodySchema = z.object({
  email: z.email("Email must be valid"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailQuerySchema = z.object({
  token: z.string().trim().min(1, "Verification token is required"),
});

export const resendVerificationBodySchema = z.object({
  email: z.email("Email must be valid"),
});

export const googleSignInBodySchema = z.object({
  idToken: z.string().trim().min(1, "Google ID token is required"),
});

export const googleLinkBodySchema = z.object({
  idToken: z.string().trim().min(1, "Google ID token is required"),
  password: z.string().min(1, "Password is required"),
});
