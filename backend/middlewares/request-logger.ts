import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

function isValidRequestId(value: string) {
  return /^[a-zA-Z0-9-_.]{8,128}$/.test(value);
}

function resolveRequestId(req: Request) {
  const incomingHeader = req.headers["x-request-id"];
  const candidate = Array.isArray(incomingHeader)
    ? incomingHeader[0]
    : incomingHeader;

  if (candidate && isValidRequestId(candidate)) {
    return candidate;
  }

  return randomUUID();
}

function resolveLogLevel(statusCode: number): "info" | "warn" | "error" {
  if (statusCode >= 500) {
    return "error";
  }

  if (statusCode >= 400) {
    return "warn";
  }

  return "info";
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = resolveRequestId(req);
  const startedAt = Date.now();

  res.locals.requestId = requestId;
  res.locals.requestStartedAt = startedAt;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const logLevel = resolveLogLevel(res.statusCode);

    logger[logLevel]("HTTP request completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip,
      userAgent: req.get("user-agent") ?? null,
      authenticatedUserId:
        res.locals.authenticatedUserId ?? res.locals.apiKeyUserId ?? null,
      apiKeyId: res.locals.apiKeyId ?? null,
      errorCode: res.locals.errorCode ?? null,
    });
  });

  next();
}
