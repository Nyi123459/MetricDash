import request from "supertest";
import { createApp } from "../start/app";

describe("CORS middleware", () => {
  const app = createApp();

  it("allows the request ID header during preflight", async () => {
    const response = await request(app)
      .options("/api/v1/dashboard/overview")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET")
      .set("Access-Control-Request-Headers", "content-type,x-request-id");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
    const allowedHeaders = response.headers["access-control-allow-headers"];

    expect(allowedHeaders.toLowerCase()).toContain("x-request-id");
    expect(allowedHeaders.toLowerCase()).toContain("content-type");
  });
});
