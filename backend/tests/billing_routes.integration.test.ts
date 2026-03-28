import dotenv from "dotenv";
import request from "supertest";
import { hash } from "bcryptjs";
import { getPrismaClient } from "../lib/prisma";
import { createApp } from "../start/app";

dotenv.config();

const prisma = getPrismaClient();
const app = createApp();

describe("Billing routes", () => {
  const testEmail = `billing-${Date.now()}@example.com`;
  const password = "secret123";
  let sessionCookies: string[] = [];
  const expectedToday = new Date().toISOString().slice(0, 10);

  beforeAll(async () => {
    await prisma.billingCycle.deleteMany({
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

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password_hash: await hash(password, 4),
        is_email_verified: true,
      },
    });

    const apiKey = await prisma.apiKey.create({
      data: {
        user_id: user.id,
        name: "Billing key",
        key_prefix: "md_live_billing",
        key_hash: `hash-${Date.now()}`,
      },
    });

    await prisma.usageRecord.createMany({
      data: [
        {
          user_id: user.id,
          api_key_id: apiKey.id,
          usage_date: new Date("2026-03-05T00:00:00.000Z"),
          request_count: 4000,
          cache_hits: 1000,
          cache_misses: 3000,
          error_count: 12,
          total_latency_ms: 250_000,
        },
        {
          user_id: user.id,
          api_key_id: apiKey.id,
          usage_date: new Date("2026-03-12T00:00:00.000Z"),
          request_count: 9500,
          cache_hits: 0,
          cache_misses: 9500,
          error_count: 14,
          total_latency_ms: 410_000,
        },
      ],
    });

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testEmail, password });

    sessionCookies = Array.isArray(loginResponse.headers["set-cookie"])
      ? loginResponse.headers["set-cookie"]
      : [];
  });

  afterAll(async () => {
    await prisma.billingCycle.deleteMany({
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

  it("returns a billing estimate and stores the current cycle summary", async () => {
    const response = await request(app)
      .get("/api/v1/billing/estimate")
      .set("Cookie", sessionCookies);

    expect(response.status).toBe(200);
    expect(response.body.pricingModel).toMatchObject({
      currency: "USD",
      includedBillableRequests: 10000,
      overageBlockPriceCents: 60,
    });
    expect(response.body.activityRange).toEqual({
      startDate: "2026-03-01",
      endDate: expectedToday,
    });
    expect(response.body.cycle).toMatchObject({
      requestCount: 13500,
      cacheHits: 1000,
      cacheMisses: 12500,
      billableRequests: 12500,
      overageRequests: 2500,
      estimatedCostCents: 150,
    });
    expect(Array.isArray(response.body.dailyBreakdown)).toBe(true);

    const storedBillingCycle = await prisma.billingCycle.findFirst({
      where: {
        user: {
          email: testEmail,
        },
      },
      orderBy: {
        period_start: "desc",
      },
    });

    expect(storedBillingCycle).not.toBeNull();
    expect(storedBillingCycle?.billable_requests).toBe(12500);
    expect(storedBillingCycle?.estimated_cost_cents).toBe(150);
  });

  it("filters billing activity by the requested date range", async () => {
    const response = await request(app)
      .get("/api/v1/billing/estimate")
      .query({
        startDate: "2026-03-10",
        endDate: "2026-03-12",
      })
      .set("Cookie", sessionCookies);

    expect(response.status).toBe(200);
    expect(response.body.activityRange).toEqual({
      startDate: "2026-03-10",
      endDate: "2026-03-12",
    });
    expect(response.body.cycle.billableRequests).toBe(12500);
    expect(response.body.dailyBreakdown).toHaveLength(3);
    expect(response.body.dailyBreakdown[0]).toMatchObject({
      date: "2026-03-10",
      requestCount: 0,
      billableRequests: 0,
    });
    expect(response.body.dailyBreakdown[2]).toMatchObject({
      date: "2026-03-12",
      requestCount: 9500,
      billableRequests: 9500,
    });
  });
});
