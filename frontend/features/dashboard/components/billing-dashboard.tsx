"use client";

import {
  Database,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { getApiErrorMessage } from "@/common/lib/api-errors";
import { DashboardEmptyState } from "@/features/dashboard/components/dashboard-empty-state";
import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { DashboardMetricGrid } from "@/features/dashboard/components/dashboard-metric-grid";
import { formatShortDate } from "@/features/dashboard/lib/dashboard-formatters";
import {
  formatBillableRequests,
  formatBillingDateRange,
  formatCurrencyFromCents,
} from "@/features/dashboard/lib/billing-formatters";
import { useBillingEstimate } from "@/features/dashboard/hooks/use-billing-estimate";

export function BillingDashboard() {
  const billingQuery = useBillingEstimate();
  const pricingModel = billingQuery.data?.pricingModel;
  const cycle = billingQuery.data?.cycle;
  const dailyBreakdown = billingQuery.data?.dailyBreakdown ?? [];
  const displayedBreakdown = [...dailyBreakdown].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
  const maxBillableRequests = Math.max(
    ...displayedBreakdown.map((item) => item.billableRequests),
    1,
  );

  const summaryCards =
    pricingModel && cycle
      ? [
          {
            label: "Estimated cost so far",
            value: formatCurrencyFromCents(cycle.estimatedCostCents),
            description: `Current ${formatBillingDateRange(cycle.periodStart, cycle.periodEnd)} estimate under the launch pricing model.`,
            icon: ReceiptText,
            tone: "sky" as const,
          },
          {
            label: "Projected month-end",
            value: formatCurrencyFromCents(cycle.projectedEstimatedCostCents),
            description: `${formatBillableRequests(cycle.projectedBillableRequests)} projected billable requests at the current pace.`,
            icon: TrendingUp,
            tone: "emerald" as const,
          },
          {
            label: "Included remaining",
            value: formatBillableRequests(cycle.remainingIncludedRequests),
            description: `${formatBillableRequests(pricingModel.includedBillableRequests)} included billable requests per month.`,
            icon: ShieldCheck,
            tone: "amber" as const,
          },
          {
            label: "Billable requests",
            value: formatBillableRequests(cycle.billableRequests),
            description:
              "Cache misses count as billable. Cache hits are free in V1.",
            icon: Database,
            tone: "rose" as const,
          },
        ]
      : [];

  return (
    <DashboardFrame
      badge="Billing"
      title="Launch pricing and usage estimate"
      description="Track the current monthly billing cycle, understand what counts as billable traffic, and see a server-owned estimate before Stripe collection is added later."
    >
      <div className="space-y-6">
        {billingQuery.isLoading ? (
          <DashboardEmptyState
            title="Loading billing estimate"
            description="Calculating the current billing cycle summary from tracked usage records."
          />
        ) : billingQuery.isError ? (
          <DashboardEmptyState
            title="Unable to load billing estimate"
            description={getApiErrorMessage(
              billingQuery.error,
              "The billing estimate endpoint is not available right now.",
            )}
          />
        ) : pricingModel && cycle ? (
          <>
            <DashboardMetricGrid items={summaryCards} />

            <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
              <section className="md-dashboard-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                      Billing activity
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                      Current cycle billable traffic
                    </h2>
                  </div>
                  <div className="md-dashboard-pill border-slate-200 bg-white text-slate-700">
                    {formatBillingDateRange(cycle.periodStart, cycle.periodEnd)}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {displayedBreakdown.map((item) => {
                    const width = `${(item.billableRequests / maxBillableRequests) * 100}%`;

                    return (
                      <article
                        key={item.date}
                        className="md-dashboard-panel-muted p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {formatShortDate(item.date)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                              <span>
                                {formatBillableRequests(item.requestCount)}{" "}
                                total
                              </span>
                              <span>
                                {formatBillableRequests(item.cacheHits)} cache
                                hits
                              </span>
                              <span>
                                {formatBillableRequests(item.billableRequests)}{" "}
                                billable
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">
                            Cumulative estimate{" "}
                            {formatCurrencyFromCents(
                              item.cumulativeEstimatedCostCents,
                            )}
                          </p>
                        </div>

                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#6366f1_100%)]"
                            style={{ width }}
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-6">
                <section className="md-dashboard-panel p-6">
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                    Pricing model
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    {pricingModel.name}
                  </h2>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {[
                      {
                        label: "Included billable requests",
                        value: formatBillableRequests(
                          pricingModel.includedBillableRequests,
                        ),
                      },
                      {
                        label: "Overage rate",
                        value: `${formatCurrencyFromCents(
                          pricingModel.overageBlockPriceCents,
                        )} / ${formatBillableRequests(pricingModel.overageBlockSize)}`,
                      },
                      {
                        label: "Billable unit",
                        value: "Cache miss",
                      },
                      {
                        label: "Cache-hit policy",
                        value: "Free",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="md-dashboard-panel-muted p-4"
                      >
                        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="md-dashboard-panel p-6">
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                    Cycle snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    Current month pacing
                  </h2>

                  <div className="mt-6 space-y-4">
                    {[
                      {
                        label: "Days elapsed",
                        value: `${cycle.daysElapsed} of ${cycle.totalDays}`,
                      },
                      {
                        label: "Total requests",
                        value: formatBillableRequests(cycle.requestCount),
                      },
                      {
                        label: "Cache hits",
                        value: formatBillableRequests(cycle.cacheHits),
                      },
                      {
                        label: "Overage requests",
                        value: formatBillableRequests(cycle.overageRequests),
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4"
                      >
                        <span className="text-sm text-slate-600">
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold text-slate-950">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="md-dashboard-panel border-cyan-500/16 bg-[linear-gradient(180deg,rgba(224,242,254,0.88)_0%,rgba(248,251,255,0.96)_100%)] p-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-cyan-400/15 bg-white p-3 text-cyan-700">
                      <WalletCards className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Stripe comes later
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        V1 exposes pricing and a dashboard estimate first. The
                        real Stripe customer, metering, and invoicing flow will
                        be integrated in a later phase.
                      </p>
                    </div>
                  </div>
                </section>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </DashboardFrame>
  );
}
