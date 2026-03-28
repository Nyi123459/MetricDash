import { MetadataDashboard } from "@/features/dashboard/components/metadata-dashboard";
import { requireDashboardSession } from "@/features/dashboard/lib/require-dashboard-session";

export default async function DashboardMetadataPage() {
  await requireDashboardSession();

  return <MetadataDashboard />;
}
