"use client";

import { useMutation } from "@tanstack/react-query";
import { AUTH_QUERY_KEYS } from "@/features/auth/constants/auth-constants";
import {
  getApiErrorMessage,
  register,
  type RegisterRequest,
} from "@/features/auth/services/auth-service";

export function useRegister() {
  return useMutation({
    mutationKey: AUTH_QUERY_KEYS.register,
    mutationFn: (payload: RegisterRequest) => register(payload),
    meta: {
      getErrorMessage: (error: unknown) =>
        getApiErrorMessage(error, "Registration failed. Please try again."),
    },
  });
}
