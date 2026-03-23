import { requireDashboardSession } from "@/features/dashboard/lib/require-dashboard-session";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default async function DashboardPage() {
  await requireDashboardSession();

  return <DashboardShell />;
}
