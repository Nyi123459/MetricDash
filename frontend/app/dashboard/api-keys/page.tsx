import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  APP_ROUTES,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/common/constants/routes";
import { ApiKeysDashboard } from "@/features/api-keys/components/api-keys-dashboard";

export default async function DashboardApiKeysPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken && !refreshToken) {
    redirect(APP_ROUTES.login);
  }

  return <ApiKeysDashboard />;
}
