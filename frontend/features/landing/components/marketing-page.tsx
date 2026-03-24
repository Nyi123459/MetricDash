import { cn } from "@/common/lib/utils";
import { AudienceSection } from "@/features/landing/components/audience-section";
import { ApiExampleSection } from "@/features/landing/components/api-example-section";
import { DashboardPreviewSection } from "@/features/landing/components/dashboard-preview-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { FeaturesSection } from "@/features/landing/components/features-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import { MarketingFooter } from "@/features/landing/components/marketing-footer";
import { MarketingNavbar } from "@/features/landing/components/marketing-navbar";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { WorkflowSection } from "@/features/landing/components/workflow-section";
import styles from "@/features/landing/components/marketing-page.module.css";

export function MarketingPage() {
  return (
    <main
      className={cn(
        "md-site-shell relative isolate min-h-screen text-slate-950",
        styles.page,
      )}
    >
      <div
        className={cn(
          "md-site-grid pointer-events-none absolute inset-0 opacity-70",
          styles.pageGlow,
        )}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_64%)]" />

      <div className="relative">
        <MarketingNavbar />
        <HeroSection />
        <AudienceSection />
        <WorkflowSection />
        <FeaturesSection />
        <ApiExampleSection />
        <DashboardPreviewSection />
        <PricingSection />
        <FaqSection />
        <MarketingFooter />
      </div>
    </main>
  );
}
