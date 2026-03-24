import { UsageDashboard } from "@/features/dashboard/components/usage-dashboard";
import { requireDashboardSession } from "@/features/dashboard/lib/require-dashboard-session";

export default async function DashboardUsagePage() {
  await requireDashboardSession();

  return <UsageDashboard />;
}
