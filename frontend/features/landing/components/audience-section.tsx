import { Card, CardContent } from "@/common/components/ui/card";
import { audiences } from "@/features/landing/content/landing-content";

export function AudienceSection() {
  return (
    <section
      id="product"
      className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
            Who it is for
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            A focused product for link-heavy experiences.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            MetricDash is not trying to be every kind of analytics platform. It
            is designed around the link preview workflow that matters in chat,
            community, and publishing products.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {audiences.map((audience) => (
            <Card
              key={audience.title}
              className="border-white/10 bg-white/5 text-white transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
            >
              <CardContent className="p-8">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-300/[0.12] text-cyan-200">
                  <audience.icon className="size-7" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold">
                  {audience.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-300">
                  {audience.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
