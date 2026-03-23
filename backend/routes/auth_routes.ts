import { Router } from "express";
import { AuthController } from "../controllers/auth_controller";
import { validateRequest } from "../middlewares/validate-request";
import { EmailVerificationTokenRepository } from "../repositories/email_verification_token_repository";
import { OAuthAccountRepository } from "../repositories/oauth_account_repository";
import { RefreshTokenRepository } from "../repositories/refresh_token_repository";
import { UserRepository } from "../repositories/user_repository";
import { AuthService } from "../services/auth_service";
import { EmailService } from "../services/email_service";
import {
  googleLinkBodySchema,
  googleSignInBodySchema,
  loginBodySchema,
  registerBodySchema,
  resendVerificationBodySchema,
  verifyEmailQuerySchema,
} from "../validations/auth-schemas";

const authRouter = Router();

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
const authController = new AuthController(authService);

authRouter.post(
  "/register",
  validateRequest({ body: registerBodySchema }),
  authController.register,
);

authRouter.post(
  "/login",
  validateRequest({ body: loginBodySchema }),
  authController.login,
);

authRouter.get("/me", authController.me);

authRouter.post("/refresh", authController.refresh);

authRouter.post("/logout", authController.logout);

authRouter.get(
  "/verify-email",
  validateRequest({ query: verifyEmailQuerySchema }),
  authController.verifyEmail,
);

authRouter.post(
  "/resend-verification",
  validateRequest({ body: resendVerificationBodySchema }),
  authController.resendVerificationEmail,
);

authRouter.post(
  "/google",
  validateRequest({ body: googleSignInBodySchema }),
  authController.googleSignIn,
);

authRouter.post(
  "/google/link",
  validateRequest({ body: googleLinkBodySchema }),
  authController.linkGoogleAccount,
);

export { authRouter };
