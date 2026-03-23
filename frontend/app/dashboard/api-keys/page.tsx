import { ApiKeysDashboard } from "@/features/api-keys/components/api-keys-dashboard";
import { requireDashboardSession } from "@/features/dashboard/lib/require-dashboard-session";

export default async function DashboardApiKeysPage() {
  await requireDashboardSession();

  return <ApiKeysDashboard />;
}
