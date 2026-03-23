import { randomBytes, createHash } from "crypto";
import { compare, hash } from "bcryptjs";
import { OAuthProvider, Prisma, User } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import jwt, { SignOptions } from "jsonwebtoken";
import { AppError } from "../exceptions/app-error";
import { getPrismaClient } from "../lib/prisma";
import {
  GoogleSignInInput,
  LinkGoogleAccountInput,
  LoginUserInput,
  LogoutInput,
  RefreshSessionInput,
  RegisterUserInput,
  ResendVerificationInput,
  VerifyEmailInput,
} from "../models/user";
import { EmailVerificationTokenRepository } from "../repositories/email_verification_token_repository";
import { OAuthAccountRepository } from "../repositories/oauth_account_repository";
import { RefreshTokenRepository } from "../repositories/refresh_token_repository";
import { UserRepository } from "../repositories/user_repository";
import { EmailService } from "./email_service";

export type SafeUser = Omit<User, "password_hash">;

type RegisterResult = {
  user: SafeUser;
  verificationToken: string;
};

type LoginResult = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
};

type SessionResult = {
  user: SafeUser;
  accessToken: string | null;
  refreshToken: string | null;
};

type AccessTokenPayload = {
  sub: string;
  email: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
};

export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
    private readonly oauthAccountRepository: OAuthAccountRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly emailService: EmailService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async register(input: RegisterUserInput): Promise<RegisterResult> {
    const email = input.email.trim().toLowerCase();
    const name = input.name?.trim() || null;
    const password = input.password.trim();

    this.validateRegistrationInput({
      email,
      password,
      name: name ?? undefined,
    });

    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new AppError(
        409,
        "EMAIL_ALREADY_IN_USE",
        "Email is already in use",
      );
    }

    const passwordHash = await hash(password, 12);

    let createdUser: User;

    try {
      createdUser = await this.userRepository.create({
        email,
        name,
        password_hash: passwordHash,
        is_email_verified: false,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new AppError(
          409,
          "EMAIL_ALREADY_IN_USE",
          "Email is already in use",
        );
      }

      throw error;
    }

    const verificationToken = await this.issueEmailVerificationToken(
      createdUser.id,
    );
    const verificationUrl = this.buildVerificationUrl(verificationToken);

    await this.emailService.sendVerificationEmail(
      createdUser.email,
      verificationUrl,
    );

    return {
      user: this.toSafeUser(createdUser),
      verificationToken,
    };
  }

  async login(input: LoginUserInput): Promise<LoginResult> {
    const email = input.email.trim().toLowerCase();
    const password = input.password.trim();

    if (!email) {
      throw new AppError(400, "EMAIL_REQUIRED", "Email is required");
    }

    if (!password) {
      throw new AppError(400, "PASSWORD_REQUIRED", "Password is required");
    }

    const user = await this.findUserByEmail(email);

    if (!user || !user.password_hash) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }

    const passwordMatches = await this.verifyPassword(
      password,
      user.password_hash,
    );

    if (!passwordMatches) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }

    if (!user.is_email_verified) {
      throw new AppError(
        403,
        "EMAIL_NOT_VERIFIED",
        "Email is not verified. Please verify your email before signing in.",
      );
    }

    return this.issueSession(user);
  }

  async refreshSession(input: RefreshSessionInput): Promise<LoginResult> {
    const refreshToken = input.refreshToken.trim();

    if (!refreshToken) {
      throw new AppError(
        401,
        "REFRESH_TOKEN_REQUIRED",
        "Refresh token is required",
      );
    }

    const storedRefreshToken = await this.findValidRefreshToken(refreshToken);

    if (!storedRefreshToken) {
      throw new AppError(
        401,
        "REFRESH_TOKEN_INVALID",
        "Refresh token is invalid",
      );
    }

    if (storedRefreshToken.expires_at <= new Date()) {
      await this.refreshTokenRepository.update(storedRefreshToken.id, {
        revoked_at: new Date(),
      });
      throw new AppError(
        401,
        "REFRESH_TOKEN_EXPIRED",
        "Refresh token has expired",
      );
    }

    const user = await this.userRepository.findById(storedRefreshToken.user_id);

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User was not found");
    }

    await this.refreshTokenRepository.update(storedRefreshToken.id, {
      revoked_at: new Date(),
    });

    return this.issueSession(user);
  }

  async logout(input: LogoutInput): Promise<void> {
    const refreshToken = input.refreshToken?.trim();

    if (!refreshToken) {
      return;
    }

    const storedRefreshToken = await this.findValidRefreshToken(refreshToken);

    if (!storedRefreshToken) {
      return;
    }

    await this.userRepository.update(storedRefreshToken.user_id, {
      token_version: {
        increment: 1,
      },
    } as never);

    await this.refreshTokenRepository.update(storedRefreshToken.id, {
      revoked_at: new Date(),
    });
  }

  async getCurrentSession(input: {
    accessToken?: string | null;
    refreshToken?: string | null;
  }): Promise<SessionResult> {
    const accessToken = input.accessToken?.trim() ?? "";

    if (accessToken) {
      const user = await this.getUserFromAccessToken(accessToken);

      if (user) {
        return {
          user: this.toSafeUser(user),
          accessToken: null,
          refreshToken: null,
        };
      }
    }

    const refreshToken = input.refreshToken?.trim() ?? "";

    if (!refreshToken) {
      throw new AppError(
        401,
        "AUTHENTICATION_REQUIRED",
        "Authentication is required",
      );
    }

    const refreshedSession = await this.refreshSession({ refreshToken });

    return {
      user: refreshedSession.user,
      accessToken: refreshedSession.accessToken,
      refreshToken: refreshedSession.refreshToken,
    };
  }

  async authenticateAccessToken(accessToken: string) {
    const user = await this.getUserFromAccessToken(accessToken);

    if (!user) {
      throw new AppError(
        401,
        "ACCESS_TOKEN_INVALID",
        "Access token is invalid",
      );
    }

    return this.toSafeUser(user);
  }

  async verifyEmail(input: VerifyEmailInput): Promise<LoginResult> {
    const token = input.token.trim();

    if (!token) {
      throw new AppError(
        400,
        "TOKEN_REQUIRED",
        "Verification token is required",
      );
    }

    const tokenHash = this.hashVerificationToken(token);
    const verificationToken =
      await this.emailVerificationTokenRepository.findOne({
        filter: {
          groups: [
            {
              conditions: [
                { field: "token_hash", operator: "=", value: tokenHash },
              ],
            },
          ],
        },
      });

    if (!verificationToken) {
      throw new AppError(400, "TOKEN_INVALID", "Verification token is invalid");
    }

    if (verificationToken.consumed_at) {
      throw new AppError(
        400,
        "TOKEN_ALREADY_USED",
        "Verification token was already used",
      );
    }

    if (verificationToken.expires_at < new Date()) {
      throw new AppError(
        400,
        "TOKEN_EXPIRED",
        "Verification token has expired",
      );
    }

    const updatedUser = await this.userRepository.update(
      verificationToken.user_id,
      {
        is_email_verified: true,
      },
    );

    await this.emailVerificationTokenRepository.update(verificationToken.id, {
      consumed_at: new Date(),
    });

    if (!updatedUser) {
      throw new AppError(404, "USER_NOT_FOUND", "User was not found");
    }

    return this.issueSession(updatedUser);
  }

  async resendVerificationEmail(input: ResendVerificationInput) {
    const email = input.email.trim().toLowerCase();

    if (!email) {
      throw new AppError(400, "EMAIL_REQUIRED", "Email is required");
    }

    const user = await this.findUserByEmail(email);

    if (!user || user.is_email_verified) {
      return { verificationToken: null as string | null };
    }

    await this.invalidateOutstandingVerificationTokens(user.id);

    const verificationToken = await this.issueEmailVerificationToken(user.id);
    const verificationUrl = this.buildVerificationUrl(verificationToken);

    await this.emailService.sendVerificationEmail(user.email, verificationUrl);

    return { verificationToken };
  }

  async signInWithGoogle(input: GoogleSignInInput): Promise<LoginResult> {
    const googleIdentity = await this.verifyGoogleIdentity(input.idToken);
    const { providerUserId, email, name, isGoogleAuthoritative } =
      googleIdentity;

    const existingOAuthAccount = await this.oauthAccountRepository.findOne({
      filter: {
        groups: [
          {
            conditions: [
              { field: "provider", operator: "=", value: OAuthProvider.GOOGLE },
              {
                field: "provider_user_id",
                operator: "=",
                value: providerUserId,
              },
            ],
            logic: "and",
          },
        ],
      },
    });

    if (existingOAuthAccount) {
      const existingUser = await this.userRepository.findById(
        existingOAuthAccount.user_id,
      );
      if (!existingUser) {
        throw new AppError(404, "USER_NOT_FOUND", "User was not found");
      }

      return this.issueSession(existingUser);
    }

    const existingEmailUser = await this.findUserByEmail(email);
    if (existingEmailUser && isGoogleAuthoritative) {
      await this.oauthAccountRepository.create({
        user_id: existingEmailUser.id,
        provider: OAuthProvider.GOOGLE,
        provider_user_id: providerUserId,
        email,
      });

      return this.issueSession(existingEmailUser);
    }

    if (existingEmailUser) {
      throw new AppError(
        409,
        "GOOGLE_LINK_REQUIRED",
        "A password account already exists for this email. Enter your password once to link Google sign-in.",
      );
    }

    const createdUser = await this.userRepository.create({
      email,
      name,
      password_hash: null,
      is_email_verified: true,
    });

    await this.oauthAccountRepository.create({
      user_id: createdUser.id,
      provider: OAuthProvider.GOOGLE,
      provider_user_id: providerUserId,
      email,
    });

    return this.issueSession(createdUser);
  }

  async linkGoogleAccount(input: LinkGoogleAccountInput): Promise<LoginResult> {
    const password = input.password.trim();

    if (!password) {
      throw new AppError(400, "PASSWORD_REQUIRED", "Password is required");
    }

    const googleIdentity = await this.verifyGoogleIdentity(input.idToken);
    const { providerUserId, email } = googleIdentity;

    const existingOAuthAccount = await this.oauthAccountRepository.findOne({
      filter: {
        groups: [
          {
            conditions: [
              { field: "provider", operator: "=", value: OAuthProvider.GOOGLE },
              {
                field: "provider_user_id",
                operator: "=",
                value: providerUserId,
              },
            ],
            logic: "and",
          },
        ],
      },
    });

    if (existingOAuthAccount) {
      const existingUser = await this.userRepository.findById(
        existingOAuthAccount.user_id,
      );

      if (!existingUser) {
        throw new AppError(404, "USER_NOT_FOUND", "User was not found");
      }

      return this.issueSession(existingUser);
    }

    const existingEmailUser = await this.findUserByEmail(email);

    if (!existingEmailUser || !existingEmailUser.password_hash) {
      throw new AppError(
        404,
        "ACCOUNT_NOT_FOUND",
        "No password account was found for this email",
      );
    }

    const passwordMatches = await this.verifyPassword(
      password,
      existingEmailUser.password_hash,
    );

    if (!passwordMatches) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }

    await this.oauthAccountRepository.create({
      user_id: existingEmailUser.id,
      provider: OAuthProvider.GOOGLE,
      provider_user_id: providerUserId,
      email,
    });

    return this.issueSession(existingEmailUser);
  }

  async verifyPassword(plainTextPassword: string, passwordHash: string) {
    return compare(plainTextPassword, passwordHash);
  }

  private signAccessToken(user: User) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError(
        500,
        "JWT_NOT_CONFIGURED",
        "JWT secret is not configured",
      );
    }

    return jwt.sign(
      {
        sub: String(user.id),
        email: user.email,
        tokenVersion: user.token_version,
      },
      secret,
      {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ??
          process.env.JWT_EXPIRES_IN ??
          "15m") as SignOptions["expiresIn"],
      } satisfies SignOptions,
    );
  }

  private async issueSession(user: User): Promise<LoginResult> {
    const refreshToken = randomBytes(48).toString("hex");
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    await this.refreshTokenRepository.create({
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: this.getRefreshTokenExpiryDate(),
      revoked_at: null,
    });

    return {
      user: this.toSafeUser(user),
      accessToken: this.signAccessToken(user),
      refreshToken,
    };
  }

  private async getUserFromAccessToken(accessToken: string) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError(
        500,
        "JWT_NOT_CONFIGURED",
        "JWT secret is not configured",
      );
    }

    try {
      const payload = jwt.verify(accessToken, secret) as AccessTokenPayload;
      const userId = Number(payload.sub);

      if (!Number.isFinite(userId)) {
        return null;
      }

      const user = await this.userRepository.findById(userId);

      if (!user) {
        return null;
      }

      if (user.email !== payload.email) {
        return null;
      }

      if (user.token_version !== payload.tokenVersion) {
        return null;
      }

      return user;
    } catch {
      return null;
    }
  }

  private async findValidRefreshToken(rawRefreshToken: string) {
    return this.refreshTokenRepository.findOne({
      filter: {
        groups: [
          {
            conditions: [
              {
                field: "token_hash",
                operator: "=",
                value: this.hashRefreshToken(rawRefreshToken),
              },
              {
                field: "revoked_at",
                operator: "isNull",
              },
            ],
          },
        ],
      },
    });
  }

  private async findUserByEmail(email: string) {
    return this.userRepository.findOne({
      filter: {
        groups: [
          {
            conditions: [{ field: "email", operator: "=", value: email }],
          },
        ],
      },
    });
  }

  private async issueEmailVerificationToken(userId: number) {
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = this.hashVerificationToken(rawToken);

    await this.emailVerificationTokenRepository.create({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: this.getVerificationExpiryDate(),
    });

    return rawToken;
  }

  private async invalidateOutstandingVerificationTokens(userId: number) {
    const prisma = getPrismaClient();

    await prisma.emailVerificationToken.updateMany({
      where: {
        user_id: userId,
        consumed_at: null,
      },
      data: {
        consumed_at: new Date(),
      },
    });
  }

  private buildVerificationUrl(token: string) {
    const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:8800";
    return `${baseUrl}/api/v1/auth/verify-email?token=${token}`;
  }

  getFrontendDashboardUrl() {
    const frontendBaseUrl =
      process.env.FRONTEND_APP_URL ?? "http://localhost:3000";
    return `${frontendBaseUrl}/dashboard`;
  }

  private getVerificationExpiryDate() {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    return expiresAt;
  }

  getAccessTokenMaxAgeMs() {
    return this.parseDurationToMs(process.env.JWT_ACCESS_EXPIRES_IN ?? "15m");
  }

  getRefreshTokenMaxAgeMs() {
    return this.parseDurationToMs(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "1d");
  }

  private getRefreshTokenExpiryDate() {
    return new Date(Date.now() + this.getRefreshTokenMaxAgeMs());
  }

  private hashVerificationToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private hashRefreshToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private async verifyGoogleIdentity(idTokenInput: string) {
    const idToken = idTokenInput.trim();

    if (!idToken) {
      throw new AppError(
        400,
        "ID_TOKEN_REQUIRED",
        "Google ID token is required",
      );
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new AppError(
        500,
        "GOOGLE_AUTH_NOT_CONFIGURED",
        "Google auth is not configured",
      );
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new AppError(
        400,
        "GOOGLE_PROFILE_INCOMPLETE",
        "Google account did not return a usable profile",
      );
    }

    const email = payload.email.toLowerCase();

    return {
      providerUserId: payload.sub,
      email,
      name: payload.name ?? null,
      isGoogleAuthoritative:
        email.endsWith("@gmail.com") ||
        Boolean(payload.email_verified && payload.hd),
    };
  }

  private parseDurationToMs(duration: string) {
    const trimmed = duration.trim().toLowerCase();
    const match = /^(\d+)(ms|s|m|h|d)$/.exec(trimmed);

    if (!match) {
      throw new AppError(
        500,
        "JWT_DURATION_INVALID",
        `Unsupported auth duration format: ${duration}`,
      );
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }

  private validateRegistrationInput(input: RegisterUserInput) {
    if (!input.email) {
      throw new AppError(400, "EMAIL_REQUIRED", "Email is required");
    }

    if (!this.isValidEmail(input.email)) {
      throw new AppError(400, "EMAIL_INVALID", "Email must be valid");
    }

    if (!input.password) {
      throw new AppError(400, "PASSWORD_REQUIRED", "Password is required");
    }

    if (input.password.length < 8) {
      throw new AppError(
        400,
        "PASSWORD_TOO_SHORT",
        "Password must be at least 8 characters long",
      );
    }

    if (input.password.length > 72) {
      throw new AppError(
        400,
        "PASSWORD_TOO_LONG",
        "Password must be at most 72 characters long",
      );
    }

    if (input.name && input.name.length > 100) {
      throw new AppError(
        400,
        "NAME_TOO_LONG",
        "Name must be 100 characters or fewer",
      );
    }
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }

  private toSafeUser(user: User): SafeUser {
    const { password_hash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
