import { randomBytes, createHash } from "crypto";
import { compare, hash } from "bcryptjs";
import { OAuthProvider, Prisma, User } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import jwt, { SignOptions } from "jsonwebtoken";
import { AppError } from "../exceptions/app-error";
import { getPrismaClient } from "../lib/prisma";
import {
  GoogleSignInInput,
  LoginUserInput,
  RegisterUserInput,
  ResendVerificationInput,
  VerifyEmailInput,
} from "../models/user";
import { EmailVerificationTokenRepository } from "../repositories/email_verification_token_repository";
import { OAuthAccountRepository } from "../repositories/oauth_account_repository";
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
};

export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
    private readonly oauthAccountRepository: OAuthAccountRepository,
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

    return {
      user: this.toSafeUser(user),
      accessToken: this.signAccessToken(user),
    };
  }

  async verifyEmail(input: VerifyEmailInput): Promise<SafeUser> {
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

    return this.toSafeUser(updatedUser);
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

  async signInWithGoogle(input: GoogleSignInInput): Promise<SafeUser> {
    const idToken = input.idToken.trim();

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

    const providerUserId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name ?? null;

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

      return this.toSafeUser(existingUser);
    }

    const existingEmailUser = await this.findUserByEmail(email);
    if (existingEmailUser) {
      throw new AppError(
        409,
        "ACCOUNT_ALREADY_EXISTS",
        "An account with this email already exists. Sign in with email/password first, then add Google linking later.",
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

    return this.toSafeUser(createdUser);
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
      },
      secret,
      {
        expiresIn: (process.env.JWT_EXPIRES_IN ??
          "1d") as SignOptions["expiresIn"],
      } satisfies SignOptions,
    );
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

  private getVerificationExpiryDate() {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    return expiresAt;
  }

  private hashVerificationToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
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
