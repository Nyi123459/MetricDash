"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEYS } from "@/features/auth/constants/auth-constants";
import {
  getApiErrorMessage,
  logout,
} from "@/features/auth/services/auth-service";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: AUTH_QUERY_KEYS.logout,
    mutationFn: () => logout(),
    onSuccess: async () => {
      queryClient.clear();
    },
    meta: {
      getErrorMessage: (error: unknown) =>
        getApiErrorMessage(error, "Logout failed. Please try again."),
    },
  });
}
