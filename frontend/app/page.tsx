import type { Metadata } from "next";
import { MarketingPage } from "@/features/landing/components/marketing-page";

export const metadata: Metadata = {
  title: "MetricDash | Link Intelligence API",
  description:
    "Turn pasted URLs into fast, normalized metadata with auth, API keys, usage tracking, and dashboard visibility.",
};

export default function HomePage() {
  return <MarketingPage />;
}
