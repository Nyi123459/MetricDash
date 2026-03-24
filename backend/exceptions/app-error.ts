export type AppErrorDetails =
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: AppErrorDetails,
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace?.(this, AppError);
  }
}
