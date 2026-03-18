import { Request, Response } from "express";
import { AuthService } from "../services/auth_service";

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

    res.status(200).json({
      message: "Login succeeded",
      user: result.user,
      accessToken: result.accessToken,
      requestId: res.locals.requestId,
    });
  };

  verifyEmail = async (req: Request, res: Response) => {
    const user = await this.authService.verifyEmail({
      token: String(req.query.token ?? ""),
    });

    res.status(200).json({
      message: "Email verified successfully",
      user,
      requestId: res.locals.requestId,
    });
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
    const user = await this.authService.signInWithGoogle({
      idToken: req.body.idToken,
    });

    res.status(200).json({
      message: "Google sign-in succeeded",
      user,
      requestId: res.locals.requestId,
    });
  };
}
