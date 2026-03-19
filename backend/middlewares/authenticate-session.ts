import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../exceptions/app-error";
import { ACCESS_TOKEN_COOKIE_NAME, getCookieValue } from "../utils/cookies";

type TokenPayload = {
  sub: string;
  email: string;
};

export function authenticateSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = getSessionToken(req);
  const secret = process.env.JWT_SECRET;

  if (!token) {
    next(
      new AppError(
        401,
        "AUTHENTICATION_REQUIRED",
        "Authentication is required",
      ),
    );
    return;
  }

  if (!secret) {
    next(
      new AppError(500, "JWT_NOT_CONFIGURED", "JWT secret is not configured"),
    );
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    res.locals.authenticatedUserId = Number(payload.sub);
    res.locals.authenticatedUserEmail = payload.email;
    next();
  } catch {
    next(new AppError(401, "ACCESS_TOKEN_INVALID", "Access token is invalid"));
  }
}

function getSessionToken(req: Request) {
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.slice("Bearer ".length).trim();
  }

  return getCookieValue(req.headers.cookie, ACCESS_TOKEN_COOKIE_NAME);
}
