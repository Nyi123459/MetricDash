import MockAdapter from "axios-mock-adapter";
import { apiClient, refreshClient } from "./api-client";

describe("apiClient response interceptor", () => {
  it("refreshes once and retries the original request after a 401", async () => {
    const mock = new MockAdapter(apiClient);
    const refreshMock = new MockAdapter(refreshClient);
    let requestAttempts = 0;

    mock.onGet("/protected").reply(() => {
      requestAttempts += 1;

      if (requestAttempts === 1) {
        return [
          401,
          {
            error: {
              code: "TOKEN_EXPIRED",
              message: "Access token expired",
            },
          },
        ];
      }

      return [200, { ok: true }];
    });

    refreshMock.onPost("/api/v1/auth/refresh").reply(200, {
      message: "Session refreshed",
      user: {
        id: 1,
        email: "user@example.com",
        name: null,
        is_email_verified: true,
        stripe_customer_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    const response = await apiClient.get("/protected");

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: true });
    expect(requestAttempts).toBe(2);

    mock.restore();
    refreshMock.restore();
  });
});
