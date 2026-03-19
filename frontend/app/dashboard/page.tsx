import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  APP_ROUTES,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/common/constants/routes";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken && !refreshToken) {
    redirect(APP_ROUTES.login);
  }

  return <DashboardShell />;
}
