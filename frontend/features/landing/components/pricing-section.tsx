import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/common/components/ui/button";
import { RevealInView } from "@/common/components/ui/reveal-in-view";
import { cn } from "@/common/lib/utils";
import { pricingCards } from "@/features/landing/content/landing-content";

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="md-site-section px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <RevealInView className="max-w-5xl">
          <p className="md-site-kicker">Pricing direction</p>
          <h2 className="mt-4 text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            Pricing is framed for launch, not a finished enterprise catalog.
          </h2>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600">
            The current product direction still prioritizes core metadata
            quality, dashboard visibility, and reliability. These plans
            communicate that direction without pretending the billing system is
            fully shipped.
          </p>
        </RevealInView>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pricingCards.map((plan, index) => (
            <RevealInView key={plan.name} delayMs={index * 70}>
              <div
                className={cn(
                  "md-site-card h-full p-8",
                  plan.featured &&
                    "border-sky-200 shadow-[0_32px_84px_rgba(14,165,233,0.14)]",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                      {plan.name}
                    </p>
                    <p className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-slate-950">
                      {plan.price}
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-lg leading-7 text-slate-900">
                  {plan.description}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {plan.notes}
                </p>

                <ul className="mt-8 space-y-3 text-sm text-slate-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="md-site-card-muted px-4 py-3">
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={cn(
                    buttonVariants({
                      size: "lg",
                      className: cn(
                        "mt-8 w-full",
                        plan.featured
                          ? "md-site-button-primary"
                          : "md-site-button-secondary",
                      ),
                    }),
                  )}
                >
                  {plan.ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </RevealInView>
          ))}
        </div>
      </div>
    </section>
  );
}
