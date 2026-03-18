"use client";

import { AUTH_COOKIE_NAME } from "@/common/constants/routes";

export function setAuthToken(token: string) {
  document.cookie = `${AUTH_COOKIE_NAME}=${token}; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`;
}

export function clearAuthToken() {
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
