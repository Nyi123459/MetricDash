import dotenv from "dotenv";
import request from "supertest";
import { hash } from "bcryptjs";
import { getPrismaClient } from "../lib/prisma";
import { createApp } from "../start/app";

dotenv.config();

const prisma = getPrismaClient();
const app = createApp();

describe("API key routes", () => {
  const testEmail = `apikey-${Date.now()}@example.com`;
  const password = "secret123";

  beforeAll(async () => {
    await prisma.apiKey.deleteMany({
      where: {
        user: {
          email: testEmail,
        },
      },
    });

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
    await prisma.apiKey.deleteMany({
      where: {
        user: {
          email: testEmail,
        },
      },
    });

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

  it("creates, lists, authenticates, and revokes API keys for the authenticated user", async () => {
    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testEmail, password });

    expect(loginResponse.status).toBe(200);

    const sessionCookies = loginResponse.headers["set-cookie"];

    const createResponse = await request(app)
      .post("/api/v1/api-keys")
      .set("Cookie", sessionCookies)
      .send({
        name: "Production bot",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.secret).toMatch(/^md_live_/);
    expect(createResponse.body.apiKey.key_hash).toBeUndefined();
    expect(createResponse.body.apiKey.expires_at).toBeTruthy();
    expect(createResponse.body.apiKey.requests_per_minute).toBe(60);

    const apiKeyId = createResponse.body.apiKey.id;

    const listResponse = await request(app)
      .get("/api/v1/api-keys")
      .set("Cookie", sessionCookies);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0]?.name).toBe("Production bot");
    expect(listResponse.body.meta).toMatchObject({
      total: 1,
      currentPage: 1,
      perPage: 10,
    });

    const authenticatedResponse = await request(app)
      .get("/api/v1/public/ping")
      .set("Authorization", `Bearer ${createResponse.body.secret}`);

    expect(authenticatedResponse.status).toBe(200);
    expect(authenticatedResponse.body.data.apiKeyId).toBe(apiKeyId);
    expect(authenticatedResponse.body.data.userId).toBeGreaterThan(0);

    const revokeResponse = await request(app)
      .post(`/api/v1/api-keys/${apiKeyId}/revoke`)
      .set("Cookie", sessionCookies);

    expect(revokeResponse.status).toBe(200);
    expect(revokeResponse.body.apiKey.revoked_at).toBeTruthy();

    const revokedResponse = await request(app)
      .get("/api/v1/public/ping")
      .set("Authorization", `Bearer ${createResponse.body.secret}`);

    expect(revokedResponse.status).toBe(401);
    expect(revokedResponse.body.error.code).toBe("API_KEY_REVOKED");
  });
});
