import { Request, Response, NextFunction } from "express";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function getAllowedOrigins() {
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins?.length
    ? configuredOrigins
    : DEFAULT_ALLOWED_ORIGINS;
}

export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}
