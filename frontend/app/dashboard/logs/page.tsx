import { LogsDashboard } from "@/features/dashboard/components/logs-dashboard";
import { requireDashboardSession } from "@/features/dashboard/lib/require-dashboard-session";

export default async function DashboardLogsPage() {
  await requireDashboardSession();

  return <LogsDashboard />;
}
