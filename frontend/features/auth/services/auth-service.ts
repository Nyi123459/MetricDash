import { AxiosError } from "axios";
import { apiClient } from "@/common/lib/api-client";

export type AuthUser = {
  id: number;
  email: string;
  name: string | null;
  is_email_verified: boolean;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterResponse = {
  message: string;
  requiresEmailVerification: boolean;
  user: AuthUser;
  verificationToken?: string | null;
};

export type LoginResponse = {
  message: string;
  user: AuthUser;
  accessToken: string;
};

export type ApiErrorResponse = {
  error?: {
    code: string;
    message: string;
  };
};

export async function register(payload: RegisterRequest) {
  const response = await apiClient.post<RegisterResponse>(
    "/api/v1/auth/register",
    payload,
  );
  return response.data;
}

export async function login(payload: LoginRequest) {
  const response = await apiClient.post<LoginResponse>(
    "/api/v1/auth/login",
    payload,
  );
  return response.data;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as ApiErrorResponse | undefined)?.error?.message ??
      fallback
    );
  }

  return fallback;
}
