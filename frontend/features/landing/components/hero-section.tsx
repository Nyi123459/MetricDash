import Link from "next/link";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { buttonVariants } from "@/common/components/ui/button";
import { APP_ROUTES } from "@/common/constants/routes";
import { cn } from "@/common/lib/utils";

export function HeroSection() {
  return (
    <section className="relative px-4 pb-0 pt-16 sm:px-6 lg:px-8 lg:pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto min-w-0 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            <Sparkles className="size-3.5" />
            V1 link preview workflow
          </div>

          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            URL Intelligence, Delivered as an API
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            MetricDash helps chat, community, and publishing teams ship reliable
            link previews without owning scraping, caching, API key lifecycle,
            usage tracking, and request visibility from day one.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={APP_ROUTES.register}
              className={cn(
                buttonVariants({
                  size: "lg",
                  className:
                    "rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 px-7 text-slate-950 shadow-xl shadow-cyan-500/25 hover:from-sky-300 hover:to-cyan-200",
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
                  className:
                    "rounded-full border-white/15 bg-white/5 px-7 text-white hover:bg-white/10",
                }),
              )}
            >
              Open dashboard
              <LockKeyhole className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
