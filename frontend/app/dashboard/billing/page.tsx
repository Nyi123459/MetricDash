import { BillingDashboard } from "@/features/dashboard/components/billing-dashboard";
import { requireDashboardSession } from "@/features/dashboard/lib/require-dashboard-session";

export default async function DashboardBillingPage() {
  await requireDashboardSession();

  return <BillingDashboard />;
}
