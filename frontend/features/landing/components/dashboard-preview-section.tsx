import { Card, CardContent } from "@/common/components/ui/card";
import { cn } from "@/common/lib/utils";
import styles from "@/features/landing/components/marketing-page.module.css";

const statCards = [
  {
    label: "Requests this month",
    value: "12,847",
    note: "Usage view shows trend and volume",
  },
  {
    label: "Cache hit ratio",
    value: "68%",
    note: "Hot URLs stay responsive for repeat previews",
  },
  {
    label: "Average response time",
    value: "45ms",
    note: "Visibility into the happy path and regressions",
  },
];

const recentRequests = [
  {
    status: "200",
    url: "https://example.com/article",
    note: "cache hit",
    time: "2m ago",
  },
  {
    status: "200",
    url: "https://newsroom.app/post/launch",
    note: "fresh fetch",
    time: "5m ago",
  },
  {
    status: "422",
    url: "notaurl",
    note: "validation error",
    time: "11m ago",
  },
];

export function DashboardPreviewSection() {
  return (
    <section
      id="dashboard"
      className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
            Dashboard visibility
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Built for dashboard visibility, not just raw API responses.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            The product loop continues after the request succeeds. Teams need to
            inspect key usage, logs, cache behavior, and operational signals
            from the same product surface.
          </p>
        </div>

        <Card
          className={cn(
            "relative mt-12 overflow-visible border-white/10 bg-white/5 text-white shadow-[0_28px_80px_rgba(15,23,42,0.3)]",
            styles.floatCard,
          )}
        >
          <CardContent className="p-0">
            <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {statCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-[1.75rem] border border-white/10 bg-[#08111f] p-5"
                    >
                      <p className="text-sm text-slate-400">{card.label}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">
                        {card.value}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {card.note}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-[#08111f] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        Request volume progress
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        One place to connect traffic growth with product usage.
                      </p>
                    </div>
                    <p className="text-sm font-medium text-cyan-200">
                      12,847 / 50,000
                    </p>
                  </div>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full w-[26%] rounded-full bg-gradient-to-r from-sky-400 to-cyan-300" />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-[#08111f] p-6">
                <p className="text-lg font-semibold text-white">
                  Recent requests
                </p>
                <div className="mt-5 space-y-4 text-sm">
                  {recentRequests.map((request) => (
                    <div
                      key={`${request.status}-${request.url}`}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span
                          className={`font-mono ${
                            request.status === "200"
                              ? "text-emerald-300"
                              : "text-amber-300"
                          }`}
                        >
                          {request.status}
                        </span>
                        <span className="text-slate-500">{request.time}</span>
                      </div>
                      <p className="mt-3 break-all font-mono text-slate-200">
                        {request.url}
                      </p>
                      <p className="mt-2 text-slate-400">{request.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
