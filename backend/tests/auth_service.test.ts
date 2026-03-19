import { hash } from "bcryptjs";
import { AuthService } from "../services/auth_service";
import { AppError } from "../exceptions/app-error";

type UserRecord = {
  id: number;
  email: string;
  name: string | null;
  password_hash: string | null;
  is_email_verified: boolean;
  stripe_customer_id: string | null;
  created_at: Date;
  updated_at: Date;
};

type RefreshTokenRecord = {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

type OAuthAccountRecord = {
  id: number;
  user_id: number;
  provider: "GOOGLE";
  provider_user_id: string;
  email: string | null;
  created_at: Date;
  updated_at: Date;
};

function createAuthServiceFixture() {
  const users: UserRecord[] = [];
  const refreshTokens: RefreshTokenRecord[] = [];
  const oauthAccounts: OAuthAccountRecord[] = [];

  const userRepository = {
    findOne: jest.fn(
      async ({
        filter,
      }: {
        filter: {
          groups: Array<{
            conditions: Array<{ field: string; value: string }>;
          }>;
        };
      }) => {
        const email = filter.groups[0]?.conditions.find(
          (condition) => condition.field === "email",
        )?.value;

        return users.find((user) => user.email === email) ?? null;
      },
    ),
    findById: jest.fn(async (id: number) => {
      return users.find((user) => user.id === id) ?? null;
    }),
    create: jest.fn(async (data: Partial<UserRecord>) => {
      const user: UserRecord = {
        id: users.length + 1,
        email: data.email ?? "",
        name: data.name ?? null,
        password_hash: data.password_hash ?? null,
        is_email_verified: data.is_email_verified ?? false,
        stripe_customer_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      users.push(user);
      return user;
    }),
    update: jest.fn(),
  };

  const refreshTokenRepository = {
    create: jest.fn(async (data: Partial<RefreshTokenRecord>) => {
      const refreshToken: RefreshTokenRecord = {
        id: refreshTokens.length + 1,
        user_id: data.user_id ?? 0,
        token_hash: data.token_hash ?? "",
        expires_at: data.expires_at ?? new Date(),
        revoked_at: data.revoked_at ?? null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      refreshTokens.push(refreshToken);
      return refreshToken;
    }),
    findOne: jest.fn(
      async ({
        filter,
      }: {
        filter: {
          groups: Array<{
            conditions: Array<{ field: string; value?: string }>;
          }>;
        };
      }) => {
        const tokenHash = filter.groups[0]?.conditions.find(
          (condition) => condition.field === "token_hash",
        )?.value;

        return (
          refreshTokens.find(
            (token) =>
              token.token_hash === tokenHash && token.revoked_at === null,
          ) ?? null
        );
      },
    ),
    update: jest.fn(async (id: number, data: Partial<RefreshTokenRecord>) => {
      const token = refreshTokens.find((item) => item.id === id) ?? null;

      if (!token) {
        return null;
      }

      Object.assign(token, data, { updated_at: new Date() });
      return token;
    }),
  };

  const oauthAccountRepository = {
    findOne: jest.fn(
      async ({
        filter,
      }: {
        filter: {
          groups: Array<{
            conditions: Array<{ field: string; value?: string }>;
          }>;
        };
      }) => {
        const provider = filter.groups[0]?.conditions.find(
          (condition) => condition.field === "provider",
        )?.value;
        const providerUserId = filter.groups[0]?.conditions.find(
          (condition) => condition.field === "provider_user_id",
        )?.value;

        return (
          oauthAccounts.find(
            (account) =>
              account.provider === provider &&
              account.provider_user_id === providerUserId,
          ) ?? null
        );
      },
    ),
    create: jest.fn(async (data: Partial<OAuthAccountRecord>) => {
      const account: OAuthAccountRecord = {
        id: oauthAccounts.length + 1,
        user_id: data.user_id ?? 0,
        provider: "GOOGLE",
        provider_user_id: data.provider_user_id ?? "",
        email: data.email ?? null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      oauthAccounts.push(account);
      return account;
    }),
  };

  const authService = new AuthService(
    userRepository as never,
    {} as never,
    oauthAccountRepository as never,
    refreshTokenRepository as never,
    { sendVerificationEmail: jest.fn() } as never,
  );

  (authService as any).googleClient = {
    verifyIdToken: jest.fn(async () => ({
      getPayload: () => ({
        sub: "google-user-123",
        email: "user@example.com",
        name: "Metric Dash",
        email_verified: true,
      }),
    })),
  };

  return {
    authService,
    oauthAccounts,
    refreshTokens,
    userRepository,
  };
}

describe("AuthService", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ACCESS_EXPIRES_IN = "15m";
    process.env.REFRESH_TOKEN_EXPIRES_IN = "1d";
  });

  it("issues and rotates refresh tokens", async () => {
    const fixture = createAuthServiceFixture();
    const passwordHash = await hash("secret123", 4);

    await fixture.userRepository.create({
      email: "user@example.com",
      password_hash: passwordHash,
      is_email_verified: true,
      name: "Metric Dash",
    });

    const loginResult = await fixture.authService.login({
      email: "user@example.com",
      password: "secret123",
    });

    expect(loginResult.accessToken).toBeTruthy();
    expect(loginResult.refreshToken).toBeTruthy();
    expect(fixture.refreshTokens).toHaveLength(1);
    expect(fixture.refreshTokens[0]?.revoked_at).toBeNull();

    const refreshResult = await fixture.authService.refreshSession({
      refreshToken: loginResult.refreshToken,
    });

    expect(refreshResult.accessToken).toBeTruthy();
    expect(refreshResult.refreshToken).toBeTruthy();
    expect(refreshResult.refreshToken).not.toEqual(loginResult.refreshToken);
    expect(fixture.refreshTokens).toHaveLength(2);
    expect(fixture.refreshTokens[0]?.revoked_at).toBeInstanceOf(Date);
    expect(fixture.refreshTokens[1]?.revoked_at).toBeNull();
  });

  it("rejects invalid refresh tokens", async () => {
    const fixture = createAuthServiceFixture();

    await expect(
      fixture.authService.refreshSession({ refreshToken: "invalid-token" }),
    ).rejects.toMatchObject({
      code: "REFRESH_TOKEN_INVALID",
    });
  });

  it("requires one-time linking for an existing password account before Google can sign in", async () => {
    const fixture = createAuthServiceFixture();
    const passwordHash = await hash("secret123", 4);

    await fixture.userRepository.create({
      email: "user@example.com",
      password_hash: passwordHash,
      is_email_verified: true,
      name: "Metric Dash",
    });

    await expect(
      fixture.authService.signInWithGoogle({ idToken: "google-id-token" }),
    ).rejects.toMatchObject({
      code: "GOOGLE_LINK_REQUIRED",
    });

    const result = await fixture.authService.linkGoogleAccount({
      idToken: "google-id-token",
      password: "secret123",
    });

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(fixture.oauthAccounts).toHaveLength(1);

    const secondSignIn = await fixture.authService.signInWithGoogle({
      idToken: "google-id-token",
    });

    expect(secondSignIn.accessToken).toBeTruthy();
    expect(secondSignIn.refreshToken).toBeTruthy();
  });
});
