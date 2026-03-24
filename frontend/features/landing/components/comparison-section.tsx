import { comparisonRows } from "@/features/landing/content/landing-content";

export function ComparisonSection() {
  return (
    <section className="md-site-section-alt px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="md-site-kicker">Build vs buy</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Why not build it yourself?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Because a reliable preview pipeline is more than one parser. It is a
            collection of contracts, protections, and dashboards that all need
            to agree with each other.
          </p>
        </div>

        <div className="md-site-card mt-12 overflow-hidden">
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <div className="px-5 py-4">Capability</div>
            <div className="px-5 py-4 text-center">Build yourself</div>
            <div className="px-5 py-4 text-center text-sky-700">MetricDash</div>
          </div>

          {comparisonRows.map((row) => (
            <div
              key={row.feature}
              className="grid grid-cols-3 border-b border-slate-200 last:border-b-0"
            >
              <div className="px-5 py-5 text-sm text-slate-900">
                {row.feature}
              </div>
              <div className="px-5 py-5 text-center text-sm text-slate-500">
                {row.diy}
              </div>
              <div className="px-5 py-5 text-center text-sm font-medium text-sky-700">
                {row.metricdash}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
