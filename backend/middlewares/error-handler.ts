import { AppError } from "../exceptions/app-error";
import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} was not found`,
      details: {
        method: req.method,
        path: req.originalUrl,
      },
    },
    requestId: res.locals.requestId,
    timestamp: new Date().toISOString(),
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
    error instanceof AppError ? error.message : "Internal server error";
  const details = error instanceof AppError ? error.details : undefined;
  const logLevel = statusCode >= 500 ? "error" : "warn";

  logger[logLevel]("Unhandled request error", {
    requestId: res.locals.requestId,
    code,
    statusCode,
    message: error instanceof Error ? error.message : "Internal server error",
    details,
    stack: error instanceof Error ? error.stack : undefined,
  });

  res.locals.errorCode = code;

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    requestId: res.locals.requestId,
    timestamp: new Date().toISOString(),
  });
}
