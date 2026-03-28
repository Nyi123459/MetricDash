import { cookies } from "next/headers";
import { getValidatedSession } from "@/features/auth/lib/server-session";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

const mockCookies = jest.mocked(cookies);
const fetchMock = jest.fn();

function createCookieStore(values: Record<string, string | undefined>) {
  return {
    get: (name: string) => {
      const value = values[name];

      return value ? { name, value } : undefined;
    },
  };
}

describe("server session helpers", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("validates the server session with the access token only", async () => {
    mockCookies.mockResolvedValue(
      createCookieStore({
        metricdash_access_token: "access-token",
        metricdash_refresh_token: "refresh-token",
      }) as Awaited<ReturnType<typeof cookies>>,
    );

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: {
          id: 1,
          email: "user@example.com",
          name: "User",
          is_email_verified: true,
          stripe_customer_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
    });

    const session = await getValidatedSession();

    expect(session?.user.email).toBe("user@example.com");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8800/api/v1/auth/me",
      expect.objectContaining({
        headers: {
          Cookie: "metricdash_access_token=access-token",
        },
      }),
    );
  });

  it("does not attempt a server-side validation with only a refresh token", async () => {
    mockCookies.mockResolvedValue(
      createCookieStore({
        metricdash_access_token: undefined,
        metricdash_refresh_token: "refresh-token",
      }) as Awaited<ReturnType<typeof cookies>>,
    );

    const session = await getValidatedSession();

    expect(session).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
