import { requireValidatedSession } from "@/features/auth/lib/server-session";

export async function requireDashboardSession() {
  await requireValidatedSession();
}
