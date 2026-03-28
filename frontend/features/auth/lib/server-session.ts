import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  APP_ROUTES,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/common/constants/routes";
import type { AuthUser } from "@/features/auth/services/auth-service";

type ValidatedSession = {
  user: AuthUser;
};

type SessionCookies = {
  accessToken: string | null;
  refreshToken: string | null;
};

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8800";
}

async function getSessionCookies(): Promise<SessionCookies> {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? null,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value ?? null,
  };
}

function buildAccessTokenCookieHeader(accessToken: string | null) {
  if (!accessToken) {
    return "";
  }

  return `${ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(accessToken)}`;
}

export async function getValidatedSession(): Promise<ValidatedSession | null> {
  const { accessToken } = await getSessionCookies();
  const cookieHeader = buildAccessTokenCookieHeader(accessToken);

  if (!cookieHeader) {
    return null;
  }

  try {
    // Server components cannot persist rotated cookies back to the browser, so
    // we intentionally validate only the access token here.
    const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { user: AuthUser };

    return {
      user: payload.user,
    };
  } catch {
    return null;
  }
}

export async function hasRefreshTokenSessionCandidate() {
  const { refreshToken } = await getSessionCookies();
  return Boolean(refreshToken);
}

export async function requireValidatedSession() {
  const session = await getValidatedSession();

  if (!session) {
    redirect(APP_ROUTES.login);
  }

  return session;
}

export async function redirectAuthenticatedUser() {
  const session = await getValidatedSession();

  if (session) {
    redirect(APP_ROUTES.dashboard);
  }

  return session;
}
