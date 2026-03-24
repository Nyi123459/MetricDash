"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronRight,
  Circle,
  KeyRound,
  LayoutDashboard,
  ReceiptText,
  ScrollText,
  Sparkles,
  Zap,
} from "lucide-react";
import { APP_ROUTES } from "@/common/constants/routes";
import { cn } from "@/common/lib/utils";

type DashboardFrameProps = {
  badge: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

type BreadcrumbItem = {
  label: string;
  href?: string;
};

const dashboardNavItems = [
  {
    href: APP_ROUTES.dashboard,
    label: "Overview",
    description: "Health, recent requests, and quick actions.",
    icon: LayoutDashboard,
  },
  {
    href: APP_ROUTES.dashboardApiKeys,
    label: "API keys",
    description: "Provision and revoke keys for customer apps.",
    icon: KeyRound,
  },
  {
    href: APP_ROUTES.dashboardUsage,
    label: "Usage",
    description: "Daily request volume, cache efficiency, and latency.",
    icon: Activity,
  },
  {
    href: APP_ROUTES.dashboardLogs,
    label: "Logs",
    description: "Recent request outcomes for debugging and audits.",
    icon: ScrollText,
  },
  {
    href: APP_ROUTES.dashboardBilling,
    label: "Billing",
    description: "Launch pricing, billable requests, and cost estimates.",
    icon: ReceiptText,
  },
] as const;

export function DashboardFrame({
  badge,
  title,
  description,
  children,
}: DashboardFrameProps) {
  const pathname = usePathname();
  const breadcrumbItems: BreadcrumbItem[] =
    pathname === APP_ROUTES.dashboard
      ? [{ label: "MetricDash", href: APP_ROUTES.dashboard }, { label: badge }]
      : [
          { label: "MetricDash", href: APP_ROUTES.dashboard },
          { label: "Dashboard", href: APP_ROUTES.dashboard },
          { label: badge },
        ];

  return (
    <div className="md-dashboard-shell">
      <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="md-dashboard-sidebar md-dashboard-scroll hidden min-h-screen flex-col px-5 py-6 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#22d3ee_0%,#0ea5e9_100%)] shadow-[0_0_24px_rgba(34,211,238,0.18)]">
              <Zap className="size-5 text-slate-950" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-950">
                MetricDash
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                SaaS Console
              </p>
            </div>
          </div>

          <div className="md-dashboard-panel-muted mt-8 p-4">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-slate-500">
              Workspace
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              Production Control Room
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="md-dashboard-pill border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
                <Circle className="size-2 fill-current" />
                Production
              </span>
              <span className="md-dashboard-pill border-cyan-500/20 bg-cyan-500/10 text-cyan-700">
                <Sparkles className="size-3.5" />
                Live telemetry
              </span>
            </div>
          </div>

          <nav className="mt-8 flex flex-1 flex-col">
            <p className="px-3 text-[0.68rem] uppercase tracking-[0.22em] text-slate-500">
              Navigation
            </p>
            <div className="mt-4 space-y-2">
              {dashboardNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group block rounded-[1.35rem] border px-4 py-3.5 transition",
                      isActive
                        ? "border-cyan-400/18 bg-cyan-400/10 shadow-[0_18px_30px_rgba(34,211,238,0.08)]"
                        : "border-transparent hover:border-slate-200 hover:bg-white/70",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "rounded-2xl p-3 transition",
                          isActive
                            ? "bg-cyan-400/14 text-cyan-700"
                            : "bg-slate-100 text-slate-500 group-hover:text-slate-900",
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            isActive ? "text-slate-950" : "text-slate-800",
                          )}
                        >
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="md-dashboard-panel-muted p-4">
            <p className="text-sm font-semibold text-slate-950">
              Operator session
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Review traffic, keys, cache health, and request-level debugging.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                <Circle className="size-2 fill-current text-emerald-400" />
                Protected workspace
              </span>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-col">
          <header className="z-30 border-b border-slate-200/80 bg-white/76 py-6 backdrop-blur-xl">
            <div className="relative mx-auto w-full max-w-[1480px] px-4 lg:px-8">
              <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />

              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 max-w-3xl">
                  <nav
                    aria-label="Breadcrumb"
                    className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500"
                  >
                    {breadcrumbItems.map((item, index) => {
                      const isLastItem = index === breadcrumbItems.length - 1;

                      return (
                        <div
                          key={`${item.label}-${index}`}
                          className="flex items-center gap-2"
                        >
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="transition hover:text-slate-200"
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <span aria-current="page" className="text-sky-700">
                              {item.label}
                            </span>
                          )}

                          {!isLastItem ? (
                            <ChevronRight className="size-3.5 text-slate-700" />
                          ) : null}
                        </div>
                      );
                    })}
                  </nav>

                  <div className="mt-3 flex items-start gap-4">
                    <div className="hidden h-12 w-px rounded-full bg-gradient-to-b from-sky-400 via-cyan-300 to-transparent sm:block" />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                          {title}
                        </h1>
                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                          <Sparkles className="size-3.5" />
                          {badge}
                        </span>
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <nav className="md-dashboard-scroll mt-4 flex gap-3 overflow-x-auto pb-1 lg:hidden">
                {dashboardNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "shrink-0 rounded-full border px-4 py-3 text-sm transition",
                        isActive
                          ? "border-cyan-400/20 bg-cyan-400/10 text-slate-950"
                          : "border-slate-200 bg-white text-slate-500 hover:text-slate-900",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="size-4" />
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          <main className="md-dashboard-grid flex-1">
            <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
