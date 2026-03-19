import { Response } from "express";

export const ACCESS_TOKEN_COOKIE_NAME = "metricdash_access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "metricdash_refresh_token";

type SameSiteValue = "lax" | "strict" | "none";

function getCookieSameSite(): "lax" | "strict" | "none" {
  const value = process.env.AUTH_COOKIE_SAME_SITE?.toLowerCase();

  if (value === "strict" || value === "none") {
    return value;
  }

  return "lax";
}

function isSecureCookieEnabled() {
  return process.env.AUTH_COOKIE_SECURE === "true";
}

function getBaseCookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: isSecureCookieEnabled(),
    sameSite: getCookieSameSite() satisfies SameSiteValue,
    path: "/",
    maxAge: maxAgeMs,
  };
}

export function setSessionCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  accessTokenMaxAgeMs: number,
  refreshTokenMaxAgeMs: number,
) {
  res.cookie(
    ACCESS_TOKEN_COOKIE_NAME,
    accessToken,
    getBaseCookieOptions(accessTokenMaxAgeMs),
  );
  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    getBaseCookieOptions(refreshTokenMaxAgeMs),
  );
}

export function clearSessionCookies(res: Response) {
  const options = {
    httpOnly: true,
    secure: isSecureCookieEnabled(),
    sameSite: getCookieSameSite() satisfies SameSiteValue,
    path: "/",
  };

  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, options);
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, options);
}

export function getCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.trim().split("=");

    if (rawName === name) {
      return decodeURIComponent(rawValueParts.join("="));
    }
  }

  return null;
}
