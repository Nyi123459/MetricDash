import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8800",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8800",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshRequest: Promise<void> | null = null;

function shouldRefreshRequest(error: AxiosError) {
  const errorCode = (
    error.response?.data as { error?: { code?: string } } | undefined
  )?.error?.code;

  return (
    error.response?.status === 401 &&
    error.config?.url !== "/api/v1/auth/refresh" &&
    errorCode !== "INVALID_CREDENTIALS"
  );
}

async function refreshSession() {
  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post("/api/v1/auth/refresh")
      .then(() => undefined)
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig | undefined;

    if (!config || config._retry || !shouldRefreshRequest(error)) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      await refreshSession();
      return apiClient(config);
    } catch (refreshError) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  },
);
