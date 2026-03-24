"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { APP_ROUTES } from "@/common/constants/routes";
import { getApiErrorMessage } from "@/common/lib/api-errors";
import {
  formatCount,
  formatDateTime,
  formatLatency,
  formatPercentage,
  formatShortDate,
} from "@/features/dashboard/lib/dashboard-formatters";
import { useDashboardOverview } from "@/features/dashboard/hooks/use-dashboard-data";
import { MetadataPreviewPanel } from "@/features/dashboard/components/metadata-preview-panel";
import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { DashboardMetricGrid } from "@/features/dashboard/components/dashboard-metric-grid";
import { DashboardEmptyState } from "@/features/dashboard/components/dashboard-empty-state";

const rangeOptions = [7, 14, 30] as const;
const requestPipeline = [
  "Validate key",
  "Check cache",
  "Fetch source",
  "Normalize fields",
  "Return payload",
];

export function DashboardShell() {
  const [days, setDays] = useState<(typeof rangeOptions)[number]>(7);
  const overviewQuery = useDashboardOverview(days);

  const summary = overviewQuery.data?.summary;
  const summaryCards = summary
    ? [
        {
          label: `Requests (${days}d)`,
          value: formatCount(summary.totalRequests),
          description: `${formatCount(summary.requestsToday)} recorded today.`,
          icon: Activity,
          tone: "sky" as const,
        },
        {
          label: "Active API keys",
          value: formatCount(summary.activeApiKeys),
          description:
            "Server-managed credentials currently allowed to call the API.",
          icon: KeyRound,
          tone: "emerald" as const,
        },
        {
          label: "Cache hit rate",
          value: formatPercentage(summary.cacheHitRate),
          description: `${formatCount(summary.cacheHits)} hits vs ${formatCount(summary.cacheMisses)} misses.`,
          icon: Zap,
          tone: "amber" as const,
        },
        {
          label: "Error rate",
          value: formatPercentage(summary.errorRate),
          description: `${formatCount(summary.errorCount)} requests ended with a client or upstream error.`,
          icon: ShieldCheck,
          tone: "rose" as const,
        },
      ]
    : [];

  const quickLinks = [
    {
      href: APP_ROUTES.dashboardApiKeys,
      title: "Manage API keys",
      description:
        "Provision new credentials, reveal the secret once, and revoke access safely.",
    },
    {
      href: APP_ROUTES.dashboardUsage,
      title: "Inspect usage",
      description:
        "Review request volume, cache efficiency, and latency across the current window.",
    },
    {
      href: APP_ROUTES.dashboardLogs,
      title: "Investigate logs",
      description:
        "Open the request stream when a customer reports upstream failures or odd metadata.",
    },
    {
      href: APP_ROUTES.dashboardBilling,
      title: "Review billing",
      description:
        "See launch pricing, included usage, and the current monthly estimate before Stripe goes live.",
    },
  ];

  const usageTrend = overviewQuery.data?.usageTrend ?? [];
  const displayedUsageTrend = [...usageTrend].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
  const recentRequests = overviewQuery.data?.recentRequests ?? [];
  const maxRequests = Math.max(
    ...usageTrend.map((point) => point.requestCount),
    1,
  );

  return (
    <DashboardFrame
      badge="Overview"
      title="MetricDash command center"
      description="Track authenticated traffic, cache behavior, reliability signals, and the latest request outcomes from the same dashboard shell."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={
                days === option
                  ? "md-dashboard-button-primary inline-flex h-11 items-center justify-center px-4 text-sm font-semibold"
                  : "md-dashboard-button-secondary inline-flex h-11 items-center justify-center px-4 text-sm font-semibold hover:bg-white"
              }
              onClick={() => setDays(option)}
            >
              Last {option} days
            </button>
          ))}
        </div>

        {overviewQuery.isLoading ? (
          <DashboardEmptyState
            title="Loading dashboard overview"
            description="Pulling usage records and recent request activity from the backend."
          />
        ) : overviewQuery.isError ? (
          <DashboardEmptyState
            title="Unable to load dashboard overview"
            description={getApiErrorMessage(
              overviewQuery.error,
              "The overview endpoint is not available right now.",
            )}
          />
        ) : (
          <>
            <DashboardMetricGrid items={summaryCards} />

            <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
              <section className="md-dashboard-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                      Request volume
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                      Activity over the last {days} days
                    </h2>
                  </div>
                  <div className="md-dashboard-pill border-slate-200 bg-white text-slate-700">
                    Cache hit rate{" "}
                    {formatPercentage(summary?.cacheHitRate ?? 0)}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {displayedUsageTrend.length ? (
                    displayedUsageTrend.map((point) => {
                      const requestWidth = `${(point.requestCount / maxRequests) * 100}%`;
                      const hitRatio =
                        point.requestCount > 0
                          ? (point.cacheHits / point.requestCount) * 100
                          : 0;
                      const errorRatio =
                        point.requestCount > 0
                          ? (point.errorCount / point.requestCount) * 100
                          : 0;

                      return (
                        <article
                          key={point.date}
                          className="md-dashboard-panel-muted p-4"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {formatShortDate(point.date)}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                                <span>
                                  {formatCount(point.requestCount)} requests
                                </span>
                                <span>
                                  {formatCount(point.cacheHits)} cache hits
                                </span>
                                <span>
                                  {formatCount(point.errorCount)} errors
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">
                              Avg latency {formatLatency(point.avgLatencyMs)}
                            </p>
                          </div>

                          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="flex h-full overflow-hidden rounded-full"
                              style={{ width: requestWidth }}
                            >
                              <div
                                className="h-full bg-cyan-400"
                                style={{ width: `${Math.max(hitRatio, 8)}%` }}
                              />
                              <div
                                className="h-full bg-indigo-400"
                                style={{
                                  width: `${Math.max(100 - hitRatio - errorRatio, 0)}%`,
                                }}
                              />
                              <div
                                className="h-full bg-rose-400"
                                style={{ width: `${Math.max(errorRatio, 0)}%` }}
                              />
                            </div>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <DashboardEmptyState
                      title="No usage recorded yet"
                      description="Once authenticated metadata requests start flowing, the daily trend will appear here."
                    />
                  )}
                </div>
              </section>

              <section className="md-dashboard-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                      Recent request stream
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                      Latest authenticated metadata calls
                    </h2>
                  </div>
                  <Link
                    href={APP_ROUTES.dashboardLogs}
                    className="md-dashboard-pill border-cyan-500/16 bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/16"
                  >
                    Open logs
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                <div className="mt-6 space-y-3">
                  {recentRequests.length ? (
                    recentRequests.map((requestItem) => (
                      <article
                        key={requestItem.id}
                        className="md-dashboard-panel-muted p-4"
                      >
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950">
                              {requestItem.domain ?? requestItem.url}
                            </p>
                            <p className="mt-2 truncate font-mono text-xs text-slate-500">
                              {requestItem.url}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-slate-500">
                              <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                                {requestItem.apiKeyName}
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                                Status {requestItem.statusCode}
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                                {requestItem.cacheHit
                                  ? "Cache hit"
                                  : "Cache miss"}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-slate-600 xl:text-right">
                            <p>{formatLatency(requestItem.latencyMs)}</p>
                            <p>{formatDateTime(requestItem.requestedAt)}</p>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <DashboardEmptyState
                      title="No recent requests yet"
                      description="Authenticated metadata calls will show up here as soon as your app starts using the API."
                    />
                  )}
                </div>
              </section>
            </div>

            <MetadataPreviewPanel />
          </>
        )}
      </div>
    </DashboardFrame>
  );
}
