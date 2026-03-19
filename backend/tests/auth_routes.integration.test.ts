import dotenv from "dotenv";
import request from "supertest";
import { hash } from "bcryptjs";
import { getPrismaClient } from "../lib/prisma";
import { createApp } from "../start/app";

dotenv.config();

const prisma = getPrismaClient();
const app = createApp();

describe("Auth routes", () => {
  const testEmail = `auth-${Date.now()}@example.com`;
  const password = "secret123";

  beforeAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: testEmail,
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: testEmail,
      },
    });

    await prisma.user.create({
      data: {
        email: testEmail,
        password_hash: await hash(password, 4),
        is_email_verified: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: testEmail,
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: testEmail,
      },
    });

    await prisma.$disconnect();
  });

  it("logs in, refreshes the session, and logs out", async () => {
    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testEmail, password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("metricdash_access_token="),
        expect.stringContaining("metricdash_refresh_token="),
      ]),
    );

    const refreshCookie = loginResponse.headers["set-cookie"];

    const refreshResponse = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", refreshCookie);

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.message).toBe("Session refreshed");
    expect(refreshResponse.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("metricdash_access_token="),
        expect.stringContaining("metricdash_refresh_token="),
      ]),
    );

    const logoutResponse = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", refreshResponse.headers["set-cookie"]);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.message).toBe("Logout succeeded");
  });
});
