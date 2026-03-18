import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { APP_ROUTES, AUTH_COOKIE_NAME } from "@/common/constants/routes";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect(APP_ROUTES.login);
  }

  return <DashboardShell />;
}
