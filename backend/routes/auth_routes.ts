import { Router } from "express";
import { body, query } from "express-validator";
import { AuthController } from "../controllers/auth_controller";
import { validateRequest } from "../middlewares/validate-request";
import { EmailVerificationTokenRepository } from "../repositories/email_verification_token_repository";
import { OAuthAccountRepository } from "../repositories/oauth_account_repository";
import { UserRepository } from "../repositories/user_repository";
import { AuthService } from "../services/auth_service";
import { EmailService } from "../services/email_service";

const authRouter = Router();

const userRepository = new UserRepository();
const emailVerificationTokenRepository = new EmailVerificationTokenRepository();
const oauthAccountRepository = new OAuthAccountRepository();
const emailService = new EmailService();
const authService = new AuthService(
  userRepository,
  emailVerificationTokenRepository,
  oauthAccountRepository,
  emailService,
);
const authController = new AuthController(authService);

authRouter.post(
  "/register",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .isLength({ min: 8, max: 72 })
      .withMessage("Password must be between 8 and 72 characters"),
    body("name")
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage("Name must be 100 characters or fewer"),
    validateRequest,
  ],
  authController.register,
);

authRouter.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest,
  ],
  authController.login,
);

authRouter.get(
  "/verify-email",
  [
    query("token")
      .isString()
      .notEmpty()
      .withMessage("Verification token is required"),
    validateRequest,
  ],
  authController.verifyEmail,
);

authRouter.post(
  "/resend-verification",
  [body("email").isEmail().withMessage("Email must be valid"), validateRequest],
  authController.resendVerificationEmail,
);

authRouter.post(
  "/google",
  [
    body("idToken")
      .isString()
      .notEmpty()
      .withMessage("Google ID token is required"),
    validateRequest,
  ],
  authController.googleSignIn,
);

export { authRouter };
