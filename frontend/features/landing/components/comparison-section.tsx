import { comparisonRows } from "@/features/landing/content/landing-content";

export function ComparisonSection() {
  return (
    <section className="border-y border-white/[0.08] bg-white/[0.03] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
            Build vs buy
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Why not build it yourself?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            Because a reliable preview pipeline is more than one parser. It is a
            collection of contracts, protections, and dashboards that all need
            to agree with each other.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-[#07101f]">
          <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.04] text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            <div className="px-5 py-4">Capability</div>
            <div className="px-5 py-4 text-center">Build yourself</div>
            <div className="px-5 py-4 text-center text-cyan-200">
              MetricDash
            </div>
          </div>

          {comparisonRows.map((row) => (
            <div
              key={row.feature}
              className="grid grid-cols-3 border-b border-white/[0.08] last:border-b-0"
            >
              <div className="px-5 py-5 text-sm text-slate-200">
                {row.feature}
              </div>
              <div className="px-5 py-5 text-center text-sm text-slate-400">
                {row.diy}
              </div>
              <div className="px-5 py-5 text-center text-sm font-medium text-cyan-100">
                {row.metricdash}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
