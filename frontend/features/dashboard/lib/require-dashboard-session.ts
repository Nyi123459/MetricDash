import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/common/constants/routes";
import {
  getValidatedSession,
  hasRefreshTokenSessionCandidate,
} from "@/features/auth/lib/server-session";

export async function requireDashboardSession() {
  const session = await getValidatedSession();

  if (session) {
    return session;
  }

  if (await hasRefreshTokenSessionCandidate()) {
    return null;
  }

  redirect(APP_ROUTES.login);
}
