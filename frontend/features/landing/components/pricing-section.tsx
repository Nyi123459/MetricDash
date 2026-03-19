import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { pricingCards } from "@/features/landing/content/landing-content";

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
            Pricing direction
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Pricing is framed for a V1 launch, not a finished enterprise
            catalog.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            The current product direction still prioritizes core metadata
            quality, dashboard visibility, and reliability. These plans
            communicate that direction without pretending the billing system is
            fully shipped.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pricingCards.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-[2rem] border bg-white/5 p-8 text-white",
                plan.featured
                  ? "border-cyan-300/30 shadow-[0_28px_80px_rgba(34,211,238,0.12)]"
                  : "border-white/10",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
                    {plan.name}
                  </p>
                  <p className="mt-4 text-5xl font-semibold tracking-tight">
                    {plan.price}
                  </p>
                </div>
                {plan.featured ? (
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                    Launch focus
                  </span>
                ) : null}
              </div>

              <p className="mt-6 text-lg leading-7 text-slate-200">
                {plan.description}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                {plan.notes}
              </p>

              <ul className="mt-8 space-y-3 text-sm text-slate-300">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3"
                  >
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
                      "mt-8 w-full rounded-full",
                      plan.featured
                        ? "bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 hover:from-sky-300 hover:to-cyan-200"
                        : "bg-white/[0.08] text-white hover:bg-white/[0.14]",
                    ),
                  }),
                )}
              >
                {plan.ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
