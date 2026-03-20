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

describe("Metadata routes", () => {
  const testEmail = `metadata-${Date.now()}@example.com`;
  const password = "secret123";
  let sourceServer: http.Server;
  let sourceBaseUrl = "";
  let apiKeySecret = "";

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

    const sessionCookies = loginResponse.headers["set-cookie"];

    const createResponse = await request(app)
      .post("/api/v1/api-keys")
      .set("Cookie", sessionCookies)
      .send({
        name: "Metadata bot",
      });

    apiKeySecret = createResponse.body.secret;
  });

  afterAll(async () => {
    sourceServer.close();

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

  it("returns normalized metadata for an authenticated API key", async () => {
    const metadataResponse = await request(app)
      .get("/api/v1/metadata")
      .query({ url: `${sourceBaseUrl}/article` })
      .set("Authorization", `Bearer ${apiKeySecret}`);

    expect(metadataResponse.status).toBe(200);
    expect(metadataResponse.body).toMatchObject({
      url: `${sourceBaseUrl}/article`,
      canonical_url: `${sourceBaseUrl}/canonical-article`,
      title: "Example article",
      description: "Example description",
      image: `${sourceBaseUrl}/images/cover.png`,
      favicon: `${sourceBaseUrl}/favicon.ico`,
      site_name: "Example",
      content_type: "article",
      cache: {
        hit: false,
        ttl: 0,
      },
    });
  });

  it("rejects requests with a missing URL query", async () => {
    const metadataResponse = await request(app)
      .get("/api/v1/metadata")
      .set("Authorization", `Bearer ${apiKeySecret}`);

    expect(metadataResponse.status).toBe(400);
    expect(metadataResponse.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
      message: "URL is required",
    });
  });

  it("rejects requests with an invalid URL query", async () => {
    const metadataResponse = await request(app)
      .get("/api/v1/metadata")
      .query({ url: "ftp://example.com/file" })
      .set("Authorization", `Bearer ${apiKeySecret}`);

    expect(metadataResponse.status).toBe(400);
    expect(metadataResponse.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
      message: "URL must be a valid http or https URL",
    });
  });
});
