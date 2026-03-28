"use client";

import { startOfMonth } from "date-fns";
import { useState } from "react";
import {
  Database,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { getApiErrorMessage } from "@/common/lib/api-errors";
import { BillingActivityDateRangePicker } from "@/features/dashboard/components/billing-activity-date-range-picker";
import { DashboardEmptyState } from "@/features/dashboard/components/dashboard-empty-state";
import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { DashboardMetricGrid } from "@/features/dashboard/components/dashboard-metric-grid";
import { DashboardPagination } from "@/features/dashboard/components/dashboard-pagination";
import {
  formatBillingQueryDate,
  getBillingCalendarDate,
} from "@/features/dashboard/lib/billing-dates";
import { formatShortDate } from "@/features/dashboard/lib/dashboard-formatters";
import {
  formatBillableRequests,
  formatBillingDateRange,
  formatCurrencyFromCents,
} from "@/features/dashboard/lib/billing-formatters";
import { useBillingEstimate } from "@/features/dashboard/hooks/use-billing-estimate";

const BILLING_ACTIVITY_PAGE_SIZE = 14;

export function BillingDashboard() {
  const billingToday = getBillingCalendarDate();
  const [activityRange, setActivityRange] = useState<DateRange>(() => ({
    from: startOfMonth(billingToday),
    to: billingToday,
  }));
  const [activityPageState, setActivityPageState] = useState(() => ({
    rangeKey: `${formatBillingQueryDate(startOfMonth(billingToday))}:${formatBillingQueryDate(billingToday)}`,
    page: 1,
  }));
  const billingQuery = useBillingEstimate({
    startDate: formatBillingQueryDate(
      activityRange.from ?? startOfMonth(billingToday),
    ),
    endDate: formatBillingQueryDate(activityRange.to ?? billingToday),
  });
  const activityRangeKey = `${formatBillingQueryDate(
    activityRange.from ?? startOfMonth(billingToday),
  )}:${formatBillingQueryDate(activityRange.to ?? billingToday)}`;
  const activityPage =
    activityPageState.rangeKey === activityRangeKey
      ? activityPageState.page
      : 1;
  const pricingModel = billingQuery.data?.pricingModel;
  const cycle = billingQuery.data?.cycle;
  const dailyBreakdown = billingQuery.data?.dailyBreakdown ?? [];
  const displayedBreakdown = [...dailyBreakdown].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
  const activityPageCount = Math.max(
    1,
    Math.ceil(displayedBreakdown.length / BILLING_ACTIVITY_PAGE_SIZE),
  );
  const safeActivityPage = Math.min(activityPage, activityPageCount);
  const activityStartIndex =
    (safeActivityPage - 1) * BILLING_ACTIVITY_PAGE_SIZE;
  const activityPageItems = displayedBreakdown.slice(
    activityStartIndex,
    activityStartIndex + BILLING_ACTIVITY_PAGE_SIZE,
  );
  const activityEndIndex = Math.min(
    displayedBreakdown.length,
    activityStartIndex + activityPageItems.length,
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
              "Cache misses count as billable. Cache hits stay free under the launch model.",
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

            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-2">
                <section className="md-dashboard-panel p-6">
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
              </div>

              <section className="md-dashboard-panel p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                      Billing activity
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                      Select any completed date range to review daily billable
                      traffic and cumulative estimate movement. Long ranges are
                      split into pages so the activity stream stays readable.
                    </p>
                  </div>
                  <BillingActivityDateRangePicker
                    maxDate={billingToday}
                    value={activityRange}
                    onChange={setActivityRange}
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">
                    Showing{" "}
                    <span className="font-semibold text-slate-950">
                      {displayedBreakdown.length === 0
                        ? 0
                        : activityStartIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-slate-950">
                      {activityEndIndex}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-950">
                      {displayedBreakdown.length}
                    </span>{" "}
                    days in the selected range
                  </p>
                  <p className="text-sm text-slate-500">
                    Page {safeActivityPage} of {activityPageCount}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {activityPageItems.map((item) => {
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

                <div className="mt-6 border-t border-slate-200/80 pt-4">
                  <DashboardPagination
                    currentPage={safeActivityPage}
                    lastPage={activityPageCount}
                    onPageChange={(page) =>
                      setActivityPageState({ rangeKey: activityRangeKey, page })
                    }
                  />
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
                      Pricing and a dashboard estimate are available now. The
                      real Stripe customer, metering, and invoicing flow will be
                      integrated in a later phase.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </DashboardFrame>
  );
}
