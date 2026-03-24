import dotenv from "dotenv";
import http from "http";
import request from "supertest";
import { hash } from "bcryptjs";
import { AddressInfo } from "net";
import { getPrismaClient } from "../lib/prisma";
import { createApp } from "../start/app";

dotenv.config();

const prisma = getPrismaClient();
const app = createApp();

jest.setTimeout(30000);

async function waitForDashboardActivity(
  email: string,
  expectedMinimum: number,
) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const [requestLogCount, usageRecordCount] = await Promise.all([
      prisma.requestLog.count({
        where: {
          user: {
            email,
          },
        },
      }),
      prisma.usageRecord.count({
        where: {
          user: {
            email,
          },
        },
      }),
    ]);

    if (requestLogCount >= expectedMinimum && usageRecordCount >= 1) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

describe("Dashboard routes", () => {
  const testEmail = `dashboard-${Date.now()}@example.com`;
  const password = "secret123";
  let sourceServer: http.Server;
  let sourceBaseUrl = "";
  let sessionCookies: string[] = [];
  let apiKeyId = 0;
  let apiKeySecret = "";

  beforeAll(async () => {
    await prisma.requestLog.deleteMany({
      where: {
        user: {
          email: testEmail,
        },
      },
    });

    await prisma.usageRecord.deleteMany({
      where: {
        user: {
          email: testEmail,
        },
      },
    });

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

    sourceServer = http.createServer((req, res) => {
      if (req.url === "/article") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`
          <html>
            <head>
              <title>Example article</title>
              <meta name="description" content="Example description" />
              <meta property="og:image" content="/images/cover.png" />
              <meta property="og:type" content="article" />
              <meta property="og:site_name" content="Example" />
              <link rel="canonical" href="/canonical-article" />
              <link rel="icon" href="/favicon.ico" />
            </head>
          </html>
        `);
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    });

    await new Promise<void>((resolve) => {
      sourceServer.listen(0, "127.0.0.1", () => resolve());
    });

    const address = sourceServer.address() as AddressInfo;
    sourceBaseUrl = `http://127.0.0.1:${address.port}`;

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testEmail, password });

    sessionCookies = Array.isArray(loginResponse.headers["set-cookie"])
      ? loginResponse.headers["set-cookie"]
      : [];

    const createResponse = await request(app)
      .post("/api/v1/api-keys")
      .set("Cookie", sessionCookies)
      .send({
        name: "Dashboard key",
      });

    apiKeyId = createResponse.body.apiKey.id;
    apiKeySecret = createResponse.body.secret;

    const previewResponse = await request(app)
      .post("/api/v1/dashboard/metadata-preview")
      .set("Cookie", sessionCookies)
      .send({
        apiKeyId,
        url: `${sourceBaseUrl}/article`,
      });

    expect(previewResponse.status).toBe(200);
    expect(previewResponse.body.metadata).toMatchObject({
      title: "Example article",
      content_type: "article",
    });

    const cachedPreviewResponse = await request(app)
      .post("/api/v1/dashboard/metadata-preview")
      .set("Cookie", sessionCookies)
      .send({
        apiKeyId,
        url: `${sourceBaseUrl}/article`,
      });

    expect(cachedPreviewResponse.status).toBe(200);
    expect(cachedPreviewResponse.headers["x-ratelimit-limit"]).toBeTruthy();
    expect(cachedPreviewResponse.headers["x-ratelimit-remaining"]).toBeTruthy();

    await waitForDashboardActivity(testEmail, 2);
  });

  afterAll(async () => {
    if (sourceServer) {
      await new Promise<void>((resolve, reject) => {
        sourceServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await prisma.requestLog.deleteMany({
      where: {
        user: {
          email: testEmail,
        },
      },
    });

    await prisma.usageRecord.deleteMany({
      where: {
        user: {
          email: testEmail,
        },
      },
    });

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

  it("returns overview, usage, and logs for the authenticated dashboard user", async () => {
    const overviewResponse = await request(app)
      .get("/api/v1/dashboard/overview")
      .set("Cookie", sessionCookies);

    expect(overviewResponse.status).toBe(200);
    expect(overviewResponse.body.account.email).toBe(testEmail);
    expect(overviewResponse.body.summary.totalRequests).toBeGreaterThanOrEqual(
      2,
    );
    expect(overviewResponse.body.summary.activeApiKeys).toBe(1);
    expect(Array.isArray(overviewResponse.body.usageTrend)).toBe(true);
    expect(Array.isArray(overviewResponse.body.recentRequests)).toBe(true);

    const usageResponse = await request(app)
      .get("/api/v1/dashboard/usage")
      .query({ days: 7 })
      .set("Cookie", sessionCookies);

    expect(usageResponse.status).toBe(200);
    expect(usageResponse.body.summary.totalRequests).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(usageResponse.body.apiKeyBreakdown)).toBe(true);
    expect(usageResponse.body.apiKeyBreakdown[0]?.apiKeyName).toBe(
      "Dashboard key",
    );

    const logsResponse = await request(app)
      .get("/api/v1/dashboard/logs")
      .query({ page: 1, perPage: 10 })
      .set("Cookie", sessionCookies);

    expect(logsResponse.status).toBe(200);
    expect(logsResponse.body.data).toHaveLength(2);
    expect(logsResponse.body.data[0]).toMatchObject({
      apiKeyName: "Dashboard key",
    });
    expect(logsResponse.body.meta).toMatchObject({
      currentPage: 1,
      perPage: 10,
    });
  });

  it("rejects dashboard preview requests that try to use an API key as the auth token", async () => {
    const previewResponse = await request(app)
      .post("/api/v1/dashboard/metadata-preview")
      .set("Authorization", `Bearer ${apiKeySecret}`)
      .send({
        apiKeyId,
        url: `${sourceBaseUrl}/article`,
      });

    expect(previewResponse.status).toBe(401);
    expect(previewResponse.body.error.code).toBe("ACCESS_TOKEN_INVALID");
  });
});
