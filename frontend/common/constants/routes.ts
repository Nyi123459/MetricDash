export const APP_ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  dashboardApiKeys: "/dashboard/api-keys",
} as const;

export const ACCESS_TOKEN_COOKIE_NAME = "metricdash_access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "metricdash_refresh_token";
