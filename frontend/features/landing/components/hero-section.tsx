import Link from "next/link";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { buttonVariants } from "@/common/components/ui/button";
import { RevealInView } from "@/common/components/ui/reveal-in-view";
import { APP_ROUTES } from "@/common/constants/routes";
import { cn } from "@/common/lib/utils";
import styles from "@/features/landing/components/marketing-page.module.css";

export function HeroSection() {
  return (
    <section className="md-site-section relative px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <RevealInView className="min-w-0 max-w-2xl">
          <div className="md-site-kicker">
            <Sparkles className="size-3.5" />
            Link preview workflow
          </div>

          <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
            URL Intelligence, Delivered as an API
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            MetricDash helps chat, community, and publishing teams ship reliable
            link previews without owning scraping, caching, API key lifecycle,
            usage tracking, and request visibility from day one.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href={APP_ROUTES.register}
              className={cn(
                buttonVariants({
                  size: "lg",
                  className: "md-site-button-primary px-7",
                }),
              )}
            >
              Create account
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={APP_ROUTES.dashboard}
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "md-site-button-secondary px-7",
                }),
              )}
            >
              Open dashboard
              <LockKeyhole className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Cache-aware", "Repeat previews stay fast and predictable."],
              ["Operational", "Keys, usage, and logs stay visible together."],
              [
                "Preview focused",
                "Built for preview-heavy products, not generic BI.",
              ],
            ].map(([title, description], index) => (
              <RevealInView
                key={title}
                delayMs={80 + index * 80}
                className="md-site-card-muted p-5"
              >
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </RevealInView>
            ))}
          </div>
        </RevealInView>

        <RevealInView
          delayMs={120}
          className={cn("relative", styles.heroOrbit)}
        >
          <div className="md-site-card relative overflow-hidden p-6 sm:p-7">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Command preview
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                  Link intelligence console
                </h2>
              </div>
              <span className="md-site-kicker border-transparent bg-slate-950/95 text-cyan-200">
                Live view
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ["12,847", "Requests this month"],
                ["68%", "Cache hit ratio"],
                ["45ms", "Average response"],
              ].map(([value, label]) => (
                <div key={label} className="md-site-card-muted p-4">
                  <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    {value}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="md-site-card-muted p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">
                    Request volume progress
                  </p>
                  <p className="text-sm font-medium text-sky-700">
                    12,847 / 50,000
                  </p>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[26%] rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_100%)]" />
                </div>
                <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white px-4 py-3">
                    Cache miss billing is isolated from hits.
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    Usage and request logs stay in the same surface.
                  </div>
                </div>
              </div>

              <div className="md-site-code-panel overflow-hidden rounded-[1.75rem]">
                <div className="md-site-code-strip flex items-center justify-between gap-3 px-5 py-4">
                  <p className="text-sm font-medium text-slate-100">
                    Recent requests
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                    Pipeline
                  </p>
                </div>
                <div className="space-y-3 p-5 text-sm">
                  {[
                    ["200", "https://example.com/article", "cache hit"],
                    ["200", "https://newsroom.app/post/launch", "fresh fetch"],
                    ["422", "notaurl", "validation error"],
                  ].map(([status, url, note]) => (
                    <div
                      key={`${status}-${url}`}
                      className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={cn(
                            "font-mono text-xs font-semibold uppercase tracking-[0.16em]",
                            status === "200"
                              ? "text-emerald-300"
                              : "text-amber-300",
                          )}
                        >
                          {status}
                        </span>
                        <span className="text-slate-400">{note}</span>
                      </div>
                      <p className="mt-3 break-all font-mono text-slate-100">
                        {url}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "md-site-card absolute -bottom-6 -left-4 hidden max-w-xs p-5 lg:block",
              styles.floatingCard,
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              Reliability
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              One workflow for auth, cache, rate limits, and request visibility.
            </p>
          </div>
        </RevealInView>
      </div>
    </section>
  );
}
