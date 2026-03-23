import { NextFunction, Request, Response } from "express";
import { AppError } from "../exceptions/app-error";
import { RefreshTokenRepository } from "../repositories/refresh_token_repository";
import { UserRepository } from "../repositories/user_repository";
import { AuthService } from "../services/auth_service";
import { EmailService } from "../services/email_service";
import { ACCESS_TOKEN_COOKIE_NAME, getCookieValue } from "../utils/cookies";
import { EmailVerificationTokenRepository } from "../repositories/email_verification_token_repository";
import { OAuthAccountRepository } from "../repositories/oauth_account_repository";

const userRepository = new UserRepository();
const emailVerificationTokenRepository = new EmailVerificationTokenRepository();
const oauthAccountRepository = new OAuthAccountRepository();
const refreshTokenRepository = new RefreshTokenRepository();
const emailService = new EmailService();
const authService = new AuthService(
  userRepository,
  emailVerificationTokenRepository,
  oauthAccountRepository,
  refreshTokenRepository,
  emailService,
);

export async function authenticateSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = getSessionToken(req);

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

  try {
    const user = await authService.authenticateAccessToken(token);
    res.locals.authenticatedUserId = user.id;
    res.locals.authenticatedUserEmail = user.email;
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
