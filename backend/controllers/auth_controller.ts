import { Request, Response } from "express";
import { AuthService } from "../services/auth_service";
import {
  clearSessionCookies,
  getCookieValue,
  REFRESH_TOKEN_COOKIE_NAME,
  setSessionCookies,
} from "../utils/cookies";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const result = await this.authService.register({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
    });

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      requiresEmailVerification: true,
      user: result.user,
      verificationToken:
        process.env.NODE_ENV === "production"
          ? undefined
          : result.verificationToken,
      requestId: res.locals.requestId,
    });
  };

  login = async (req: Request, res: Response) => {
    const result = await this.authService.login({
      email: req.body.email,
      password: req.body.password,
    });

    console.log("Result", result);

    setSessionCookies(
      res,
      result.accessToken,
      result.refreshToken,
      this.authService.getAccessTokenMaxAgeMs(),
      this.authService.getRefreshTokenMaxAgeMs(),
    );

    res.status(200).json({
      message: "Login succeeded",
      user: result.user,
      requestId: res.locals.requestId,
    });
  };

  refresh = async (req: Request, res: Response) => {
    const refreshToken = getCookieValue(
      req.headers.cookie,
      REFRESH_TOKEN_COOKIE_NAME,
    );
    const result = await this.authService.refreshSession({
      refreshToken: refreshToken ?? "",
    });

    setSessionCookies(
      res,
      result.accessToken,
      result.refreshToken,
      this.authService.getAccessTokenMaxAgeMs(),
      this.authService.getRefreshTokenMaxAgeMs(),
    );

    res.status(200).json({
      message: "Session refreshed",
      user: result.user,
      requestId: res.locals.requestId,
    });
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = getCookieValue(
      req.headers.cookie,
      REFRESH_TOKEN_COOKIE_NAME,
    );

    await this.authService.logout({ refreshToken });
    clearSessionCookies(res);

    res.status(200).json({
      message: "Logout succeeded",
      requestId: res.locals.requestId,
    });
  };

  verifyEmail = async (req: Request, res: Response) => {
    const result = await this.authService.verifyEmail({
      token: String(req.query.token ?? ""),
    });

    setSessionCookies(
      res,
      result.accessToken,
      result.refreshToken,
      this.authService.getAccessTokenMaxAgeMs(),
      this.authService.getRefreshTokenMaxAgeMs(),
    );

    res.redirect(302, this.authService.getFrontendDashboardUrl());
  };

  resendVerificationEmail = async (req: Request, res: Response) => {
    const result = await this.authService.resendVerificationEmail({
      email: req.body.email,
    });

    res.status(200).json({
      message:
        "If an unverified account exists for that email, a verification email has been sent.",
      verificationToken:
        process.env.NODE_ENV === "production"
          ? undefined
          : result.verificationToken,
      requestId: res.locals.requestId,
    });
  };

  googleSignIn = async (req: Request, res: Response) => {
    const result = await this.authService.signInWithGoogle({
      idToken: req.body.idToken,
    });

    setSessionCookies(
      res,
      result.accessToken,
      result.refreshToken,
      this.authService.getAccessTokenMaxAgeMs(),
      this.authService.getRefreshTokenMaxAgeMs(),
    );

    res.status(200).json({
      message: "Google sign-in succeeded",
      user: result.user,
      requestId: res.locals.requestId,
    });
  };

  linkGoogleAccount = async (req: Request, res: Response) => {
    const result = await this.authService.linkGoogleAccount({
      idToken: req.body.idToken,
      password: req.body.password,
    });

    setSessionCookies(
      res,
      result.accessToken,
      result.refreshToken,
      this.authService.getAccessTokenMaxAgeMs(),
      this.authService.getRefreshTokenMaxAgeMs(),
    );

    res.status(200).json({
      message: "Google account linked successfully",
      user: result.user,
      requestId: res.locals.requestId,
    });
  };
}
