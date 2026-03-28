"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronRight,
  KeyRound,
  LayoutDashboard,
  ReceiptText,
  ScrollText,
  Sparkles,
  Zap,
} from "lucide-react";
import { APP_ROUTES } from "@/common/constants/routes";
import { cn } from "@/common/lib/utils";
import { LogoutButton } from "@/features/auth/components/logout-button";

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
    href: APP_ROUTES.dashboardMetadata,
    label: "Metadata",
    description: "Run the playground and inspect normalized responses.",
    icon: Sparkles,
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
      <div className="min-h-screen lg:grid lg:h-screen lg:grid-cols-[248px_minmax(0,1fr)] lg:overflow-hidden">
        <aside className="md-dashboard-sidebar hidden h-screen flex-col px-5 py-6 lg:flex">
          <div className="flex min-h-[4.5rem] items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#22d3ee_0%,#0ea5e9_100%)] shadow-[0_0_24px_rgba(34,211,238,0.18)]">
              <Zap className="size-5 text-slate-950" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-950">
                MetricDash
              </p>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <p className="px-3 text-[0.68rem] uppercase tracking-[0.22em] text-slate-500">
              Navigation
            </p>
            <nav className="md-dashboard-scroll mt-4 flex-1 overflow-y-auto overflow-x-visible pr-2">
              <div className="space-y-2 pb-2">
                {dashboardNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-label={`${item.label}. ${item.description}`}
                      className={cn(
                        "group relative block rounded-[1.35rem] border px-4 py-3.5 transition",
                        isActive
                          ? "border-cyan-400/18 bg-cyan-400/10 shadow-[0_18px_30px_rgba(34,211,238,0.08)]"
                          : "border-transparent hover:border-slate-200 hover:bg-white/70",
                      )}
                    >
                      <div className="flex items-center gap-3">
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
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              isActive ? "text-slate-950" : "text-slate-800",
                            )}
                          >
                            {item.label}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>

          <div className="mt-6 border-t border-slate-200/80 pt-5">
            <LogoutButton />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-col lg:h-screen lg:min-h-0">
          <header className="z-30 border-b border-slate-200/80 bg-white/76 py-6 backdrop-blur-xl">
            <div className="relative mx-auto w-full max-w-[1480px] px-4 lg:px-8">
              <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px" />

              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 w-full!">
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
                    <div className="hidden h-12 w-px rounded-full" />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                          {title}
                        </h1>
                      </div>
                      <p className="mt-2 w-full text-sm leading-7 text-slate-600">
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

              <div className="mt-4 lg:hidden">
                <LogoutButton className="sm:w-auto" />
              </div>
            </div>
          </header>

          <main className="md-dashboard-grid md-dashboard-scroll flex-1 lg:min-h-0 lg:overflow-y-auto">
            <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:pb-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
