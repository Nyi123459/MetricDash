import request from "supertest";
import { createApp } from "../start/app";

describe("Health routes", () => {
  const app = createApp();

  it("returns a liveness payload and echoes the incoming request ID", async () => {
    const response = await request(app)
      .get("/health")
      .set("X-Request-Id", "mdreq-health-check");

    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toBe("mdreq-health-check");
    expect(response.body).toMatchObject({
      status: "ok",
      service: "metricdash-backend",
      requestId: "mdreq-health-check",
      checks: {
        app: {
          status: "up",
        },
      },
    });
  });
});
