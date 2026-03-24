import { AxiosError } from "axios";

export type ApiErrorResponse = {
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
  timestamp?: string;
};

function getApiErrorResponse(error: AxiosError) {
  return error.response?.data as ApiErrorResponse | undefined;
}

function getApiErrorRequestIdFromHeaders(error: AxiosError) {
  const headerValue = error.response?.headers?.["x-request-id"];

  return typeof headerValue === "string" ? headerValue : undefined;
}

export function getApiErrorRequestId(error: unknown) {
  if (error instanceof AxiosError) {
    return (
      getApiErrorResponse(error)?.requestId ??
      getApiErrorRequestIdFromHeaders(error)
    );
  }

  return undefined;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const apiError = getApiErrorResponse(error);
    const requestId = getApiErrorRequestId(error);

    const message =
      apiError?.error?.message ??
      (error.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : !error.response
          ? "Unable to reach the server. Please try again."
          : fallback);

    return requestId ? `${message} Request ID: ${requestId}` : message;
  }

  return fallback;
}

export function getApiErrorCode(error: unknown) {
  if (error instanceof AxiosError) {
    return getApiErrorResponse(error)?.error?.code;
  }

  return undefined;
}
