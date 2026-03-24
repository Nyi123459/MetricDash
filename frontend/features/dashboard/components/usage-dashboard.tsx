"use client";

import { useState } from "react";
import { Activity, Gauge, ShieldAlert, Zap } from "lucide-react";
import { getApiErrorMessage } from "@/common/lib/api-errors";
import {
  formatCount,
  formatLatency,
  formatPercentage,
  formatShortDate,
} from "@/features/dashboard/lib/dashboard-formatters";
import { useDashboardUsage } from "@/features/dashboard/hooks/use-dashboard-data";
import { DashboardEmptyState } from "@/features/dashboard/components/dashboard-empty-state";
import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { DashboardMetricGrid } from "@/features/dashboard/components/dashboard-metric-grid";

const rangeOptions = [7, 14, 30] as const;

export function UsageDashboard() {
  const [days, setDays] = useState<(typeof rangeOptions)[number]>(7);
  const usageQuery = useDashboardUsage(days);

  const summary = usageQuery.data?.summary;
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
          label: "Average latency",
          value: formatLatency(summary.avgLatencyMs),
          description:
            "Average response time from the tracked request history.",
          icon: Gauge,
          tone: "amber" as const,
        },
        {
          label: "Cache hit rate",
          value: formatPercentage(summary.cacheHitRate),
          description: `${formatCount(summary.cacheHits)} cache hits during the selected range.`,
          icon: Zap,
          tone: "emerald" as const,
        },
        {
          label: "Errors",
          value: formatCount(summary.errorCount),
          description: `${formatPercentage(summary.errorRate)} of tracked requests returned an error.`,
          icon: ShieldAlert,
          tone: "rose" as const,
        },
      ]
    : [];

  const usageTrend = usageQuery.data?.usageTrend ?? [];
  const displayedUsageTrend = [...usageTrend].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
  const apiKeyBreakdown = usageQuery.data?.apiKeyBreakdown ?? [];
  const maxRequests = Math.max(
    ...usageTrend.map((point) => point.requestCount),
    1,
  );
  const peakDay = usageTrend.reduce<(typeof usageTrend)[number] | null>(
    (currentPeak, point) =>
      !currentPeak || point.requestCount > currentPeak.requestCount
        ? point
        : currentPeak,
    null,
  );

  return (
    <DashboardFrame
      badge="Usage"
      title="Traffic and cache analytics"
      description="Inspect daily request flow, cache efficiency, latency posture, and which API keys are driving the most metadata volume."
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

        {usageQuery.isLoading ? (
          <DashboardEmptyState
            title="Loading usage analytics"
            description="Collecting usage records for the selected date range."
          />
        ) : usageQuery.isError ? (
          <DashboardEmptyState
            title="Unable to load usage analytics"
            description={getApiErrorMessage(
              usageQuery.error,
              "The usage endpoint is not available right now.",
            )}
          />
        ) : (
          <>
            <DashboardMetricGrid items={summaryCards} />

            <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
              <section className="md-dashboard-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                      Daily traffic
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                      Request volume and cache split
                    </h2>
                  </div>
                  {peakDay ? (
                    <div className="md-dashboard-pill border-cyan-500/16 bg-cyan-500/10 text-cyan-700">
                      Peak {formatShortDate(peakDay.date)}:{" "}
                      {formatCount(peakDay.requestCount)}
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 space-y-4">
                  {displayedUsageTrend.length ? (
                    displayedUsageTrend.map((point) => {
                      const width = `${(point.requestCount / maxRequests) * 100}%`;
                      const hitRatio =
                        point.requestCount > 0
                          ? (point.cacheHits / point.requestCount) * 100
                          : 0;
                      const missRatio =
                        point.requestCount > 0
                          ? (point.cacheMisses / point.requestCount) * 100
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
                                  {formatCount(point.requestCount)} total
                                </span>
                                <span>{formatCount(point.cacheHits)} hits</span>
                                <span>
                                  {formatCount(point.cacheMisses)} misses
                                </span>
                                <span>
                                  {formatCount(point.errorCount)} errors
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">
                              {formatLatency(point.avgLatencyMs)}
                            </p>
                          </div>

                          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="flex h-full overflow-hidden rounded-full"
                              style={{ width }}
                            >
                              <div
                                className="h-full bg-cyan-400"
                                style={{ width: `${Math.max(hitRatio, 8)}%` }}
                              />
                              <div
                                className="h-full bg-indigo-400"
                                style={{ width: `${Math.max(missRatio, 8)}%` }}
                              />
                              <div
                                className="h-full bg-rose-400"
                                style={{
                                  width: `${Math.max(100 - hitRatio - missRatio, 0)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <DashboardEmptyState
                      title="No usage data yet"
                      description="Daily usage rows will appear here after the first authenticated metadata requests are tracked."
                    />
                  )}
                </div>
              </section>

              <section className="md-dashboard-panel p-6">
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                    API key breakdown
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    Which keys are driving traffic
                  </h2>
                </div>

                <div className="mt-6 space-y-4">
                  {apiKeyBreakdown.length ? (
                    apiKeyBreakdown.map((item, index) => {
                      const width = apiKeyBreakdown[0]?.requestCount
                        ? `${(item.requestCount / apiKeyBreakdown[0].requestCount) * 100}%`
                        : "0%";

                      return (
                        <article
                          key={item.apiKeyId}
                          className="md-dashboard-panel-muted p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {item.apiKeyName}
                              </p>
                              <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
                                Rank #{index + 1} - {item.status}
                              </p>
                            </div>
                            <p className="text-sm text-slate-700">
                              {formatCount(item.requestCount)} requests
                            </p>
                          </div>

                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#6366f1_100%)]"
                              style={{ width }}
                            />
                          </div>

                          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                            <p>
                              Cache hit rate:{" "}
                              {formatPercentage(item.cacheHitRate)}
                            </p>
                            <p>Errors: {formatCount(item.errorCount)}</p>
                            <p>
                              Average latency:{" "}
                              {formatLatency(item.avgLatencyMs)}
                            </p>
                            <p>Status: {item.status}</p>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <DashboardEmptyState
                      title="No key usage breakdown yet"
                      description="API key aggregates will appear here after tracked traffic is written to usage records."
                    />
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </DashboardFrame>
  );
}
