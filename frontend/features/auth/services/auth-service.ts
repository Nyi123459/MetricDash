import { apiClient } from "@/common/lib/api-client";
import { getApiErrorCode, getApiErrorMessage } from "@/common/lib/api-errors";

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

export type GoogleSignInRequest = {
  idToken: string;
};

export type GoogleLinkRequest = {
  idToken: string;
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
};

export type RefreshResponse = {
  message: string;
  user: AuthUser;
};

export type LogoutResponse = {
  message: string;
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

export async function googleSignIn(payload: GoogleSignInRequest) {
  const response = await apiClient.post<LoginResponse>(
    "/api/v1/auth/google",
    payload,
  );
  return response.data;
}

export async function linkGoogleAccount(payload: GoogleLinkRequest) {
  const response = await apiClient.post<LoginResponse>(
    "/api/v1/auth/google/link",
    payload,
  );
  return response.data;
}

export async function refreshSession() {
  const response = await apiClient.post<RefreshResponse>(
    "/api/v1/auth/refresh",
  );
  return response.data;
}

export async function logout() {
  const response = await apiClient.post<LogoutResponse>("/api/v1/auth/logout");
  return response.data;
}

export { getApiErrorCode, getApiErrorMessage };
