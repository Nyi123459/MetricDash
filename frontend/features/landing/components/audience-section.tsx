import { Card, CardContent } from "@/common/components/ui/card";
import { RevealInView } from "@/common/components/ui/reveal-in-view";
import { audiences } from "@/features/landing/content/landing-content";

export function AudienceSection() {
  return (
    <section
      id="product"
      className="md-site-section px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <RevealInView className="max-w-3xl">
          <p className="md-site-kicker">Who it is for</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            A focused product for link-heavy experiences.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            MetricDash is not trying to be every kind of analytics platform. It
            is designed around the link preview workflow that matters in chat,
            community, and publishing products.
          </p>
        </RevealInView>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {audiences.map((audience, index) => (
            <RevealInView key={audience.title} delayMs={index * 70}>
              <Card className="md-site-card h-full border-transparent">
                <CardContent className="p-8">
                  <div className="md-site-icon-badge">
                    <audience.icon className="size-7" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    {audience.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-slate-600">
                    {audience.description}
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
