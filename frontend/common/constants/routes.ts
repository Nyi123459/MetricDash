export const APP_ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  dashboardApiKeys: "/dashboard/api-keys",
  dashboardUsage: "/dashboard/usage",
  dashboardLogs: "/dashboard/logs",
  dashboardBilling: "/dashboard/billing",
} as const;

export const ACCESS_TOKEN_COOKIE_NAME = "metricdash_access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "metricdash_refresh_token";
