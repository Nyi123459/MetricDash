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

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8800";
}

async function getCookieHeader() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
  const values = [
    accessToken
      ? `${ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(accessToken)}`
      : null,
    refreshToken
      ? `${REFRESH_TOKEN_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`
      : null,
  ].filter(Boolean);

  return values.join("; ");
}

export async function getValidatedSession(): Promise<ValidatedSession | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  try {
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
