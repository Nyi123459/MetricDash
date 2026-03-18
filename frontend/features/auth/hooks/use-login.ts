"use client";

import { useMutation } from "@tanstack/react-query";
import { AUTH_QUERY_KEYS } from "@/features/auth/constants/auth-constants";
import {
  getApiErrorMessage,
  login,
  type LoginRequest,
} from "@/features/auth/services/auth-service";

export function useLogin() {
  return useMutation({
    mutationKey: AUTH_QUERY_KEYS.login,
    mutationFn: (payload: LoginRequest) => login(payload),
    meta: {
      getErrorMessage: (error: unknown) =>
        getApiErrorMessage(error, "Login failed. Please try again."),
    },
  });
}
