import { Card, CardContent } from "@/common/components/ui/card";
import { RevealInView } from "@/common/components/ui/reveal-in-view";
import { featureHighlights } from "@/features/landing/content/landing-content";

export function FeaturesSection() {
  return (
    <section className="md-site-section px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealInView className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="md-site-kicker">Feature coverage</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
              Everything around the metadata call that teams usually forget to
              budget for.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            The page mirrors the current product direction: auth, API keys,
            metadata extraction, cache, rate limiting, usage counting, logs, and
            dashboard visibility.
          </p>
        </RevealInView>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {featureHighlights.map((feature, index) => (
            <RevealInView key={feature.title} delayMs={index * 60}>
              <Card className="md-site-card h-full border-transparent">
                <CardContent className="p-8">
                  <div className="md-site-icon-badge">
                    <feature.icon className="size-7" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </RevealInView>
          ))}
        </div>
      </div>
    </section>
  );
}
