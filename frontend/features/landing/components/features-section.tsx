import { Card, CardContent } from "@/common/components/ui/card";
import { featureHighlights } from "@/features/landing/content/landing-content";

export function FeaturesSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              Feature coverage
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Everything around the metadata call that teams usually forget to
              budget for.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-300">
            The page mirrors the current product direction: auth, API keys,
            metadata extraction, cache, rate limiting, usage counting, logs, and
            dashboard visibility.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {featureHighlights.map((feature) => (
            <Card
              key={feature.title}
              className="border-white/10 bg-white/5 text-white transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20"
            >
              <CardContent className="p-8">
                <feature.icon className="size-10 text-cyan-200" />
                <h3 className="mt-6 text-2xl font-semibold">{feature.title}</h3>
                <p className="mt-4 text-base leading-7 text-slate-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
