import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  APP_ROUTES,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/common/constants/routes";

function hasSession(request: NextRequest) {
  return Boolean(
    request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value ||
    request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value,
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = hasSession(request);

  if (!authenticated && pathname.startsWith(APP_ROUTES.dashboard)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = APP_ROUTES.login;
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
