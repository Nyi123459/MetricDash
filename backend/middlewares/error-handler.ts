import { AppError } from "../exceptions/app-error";
import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} was not found`,
    },
    requestId: res.locals.requestId,
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const code = error instanceof AppError ? error.code : "INTERNAL_SERVER_ERROR";
  const message =
    error instanceof Error ? error.message : "Internal server error";

  logger.error("Unhandled request error", {
    requestId: res.locals.requestId,
    code,
    statusCode,
    message,
    stack: error instanceof Error ? error.stack : undefined,
  });

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
    requestId: res.locals.requestId,
  });
}
