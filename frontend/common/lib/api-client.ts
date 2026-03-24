import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _requestId?: string;
    _requestRetryCount?: number;
    requestRetryPolicy?: {
      retries: number;
      retryDelayMs: number;
    };
  }
}

const API_TIMEOUT_MS = 10000;
const SAFE_RETRY_METHODS = new Set(["get", "head", "options"]);

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8800",
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8800",
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshRequest: Promise<void> | null = null;

function generateRequestId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `mdreq-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function ensureRequestId(config: InternalAxiosRequestConfig) {
  const requestId = config._requestId ?? generateRequestId();

  config._requestId = requestId;

  if (typeof config.headers.set === "function") {
    config.headers.set("X-Request-Id", requestId);
  } else {
    config.headers["X-Request-Id"] = requestId;
  }

  return config;
}

function applyDefaultRetryPolicy(config: InternalAxiosRequestConfig) {
  if (config.requestRetryPolicy) {
    return config;
  }

  config.requestRetryPolicy = SAFE_RETRY_METHODS.has(
    String(config.method ?? "get").toLowerCase(),
  )
    ? { retries: 1, retryDelayMs: 250 }
    : { retries: 0, retryDelayMs: 0 };

  return config;
}

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

function shouldRetryRequest(error: AxiosError) {
  const config = error.config as InternalAxiosRequestConfig | undefined;
  const retryPolicy = config?.requestRetryPolicy;
  const retryCount = config?._requestRetryCount ?? 0;
  const method = String(config?.method ?? "get").toLowerCase();

  if (!config || !retryPolicy || retryCount >= retryPolicy.retries) {
    return false;
  }

  if (
    !SAFE_RETRY_METHODS.has(method) ||
    config.url === "/api/v1/auth/refresh"
  ) {
    return false;
  }

  const statusCode = error.response?.status;

  return (
    error.code === "ECONNABORTED" ||
    !error.response ||
    statusCode === 408 ||
    statusCode === 429 ||
    (typeof statusCode === "number" && statusCode >= 500)
  );
}

async function retryRequest(error: AxiosError) {
  const config = error.config as InternalAxiosRequestConfig;
  const retryDelayMs = config.requestRetryPolicy?.retryDelayMs ?? 0;

  config._requestRetryCount = (config._requestRetryCount ?? 0) + 1;

  if (retryDelayMs > 0) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, retryDelayMs * config._requestRetryCount!);
    });
  }

  return apiClient(config);
}

apiClient.interceptors.request.use((config) =>
  applyDefaultRetryPolicy(ensureRequestId(config)),
);

refreshClient.interceptors.request.use((config) => ensureRequestId(config));

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig | undefined;

    if (shouldRetryRequest(error)) {
      return retryRequest(error);
    }

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
