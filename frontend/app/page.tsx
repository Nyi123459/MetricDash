import type { Metadata } from "next";
import { redirectAuthenticatedUser } from "@/features/auth/lib/server-session";
import { MarketingPage } from "@/features/landing/components/marketing-page";

export const metadata: Metadata = {
  title: "MetricDash | Link Intelligence API",
  description:
    "Turn pasted URLs into fast, normalized metadata with auth, API keys, usage tracking, and dashboard visibility.",
};

export default async function HomePage() {
  await redirectAuthenticatedUser();

  return <MarketingPage />;
}
