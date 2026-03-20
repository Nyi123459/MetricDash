import { AxiosError } from "axios";

export type ApiErrorResponse = {
  error?: {
    code: string;
    message: string;
  };
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as ApiErrorResponse | undefined)?.error?.message ??
      fallback
    );
  }

  return fallback;
}

export function getApiErrorCode(error: unknown) {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorResponse | undefined)?.error?.code;
  }

  return undefined;
}
