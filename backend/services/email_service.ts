import nodemailer from "nodemailer";
import { logger } from "../utils/logger";

export class EmailService {
  async sendVerificationEmail(email: string, verificationUrl: string) {
    const transporter = this.createTransporter();

    if (!transporter) {
      logger.warn(
        "SMTP is not configured. Verification email link generated but not sent.",
        {
          email,
          verificationUrl,
        },
      );
      return;
    }

    await transporter
      .sendMail({
        from: process.env.SMTP_FROM ?? "no-reply@metricdash.local",
        to: email,
        subject: "Verify your MetricDash account",
        text: `Welcome to MetricDash. Verify your email by opening this link: ${verificationUrl}`,
        html: `<p>Welcome to MetricDash.</p><p>Verify your email by clicking <a href="${verificationUrl}">this link</a>.</p>`,
      })
      .then(() => {
        console.log("EMail is sent");
      });
  }

  private createTransporter() {
    console.log(process.env.SMTP_HOST, process.env.SMTP_PORT);
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
      return null;
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
  }
}
