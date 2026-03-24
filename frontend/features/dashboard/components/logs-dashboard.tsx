"use client";

import { useMemo, useState } from "react";
import {
  Clock3,
  ExternalLink,
  Gauge,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { getApiErrorMessage } from "@/common/lib/api-errors";
import {
  formatCount,
  formatDateTime,
  formatLatency,
  formatPercentage,
} from "@/features/dashboard/lib/dashboard-formatters";
import { useDashboardLogs } from "@/features/dashboard/hooks/use-dashboard-data";
import { DashboardEmptyState } from "@/features/dashboard/components/dashboard-empty-state";
import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { DashboardMetricGrid } from "@/features/dashboard/components/dashboard-metric-grid";
import type { DashboardRequestLogItem } from "@/features/dashboard/services/dashboard-service";

const LOGS_PER_PAGE = 20;

export function LogsDashboard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cacheFilter, setCacheFilter] = useState("all");
  const [selectedLog, setSelectedLog] =
    useState<DashboardRequestLogItem | null>(null);
  const logsQuery = useDashboardLogs(page, LOGS_PER_PAGE);

  const summary = logsQuery.data?.summary;
  const summaryCards = summary
    ? [
        {
          label: "Logged requests",
          value: formatCount(summary.totalRequests),
          description:
            "Authenticated metadata calls persisted to the request log table.",
          icon: ShieldCheck,
          tone: "sky" as const,
        },
        {
          label: "Cache hit rate",
          value: formatPercentage(summary.cacheHitRate),
          description: `${formatCount(summary.cacheHits)} requests were served from cache.`,
          icon: Zap,
          tone: "emerald" as const,
        },
        {
          label: "Error rate",
          value: formatPercentage(summary.errorRate),
          description: `${formatCount(summary.errorCount)} logged requests ended with an error.`,
          icon: ShieldAlert,
          tone: "rose" as const,
        },
        {
          label: "Average latency",
          value: formatLatency(summary.avgLatencyMs),
          description:
            "Latency captured from the tracked metadata request pipeline.",
          icon: Gauge,
          tone: "amber" as const,
        },
      ]
    : [];

  const filteredLogs = useMemo(() => {
    const records = logsQuery.data?.data ?? [];
    const normalizedSearch = search.trim().toLowerCase();

    return records.filter((logItem) => {
      const matchesSearch =
        !normalizedSearch ||
        logItem.url.toLowerCase().includes(normalizedSearch) ||
        logItem.requestId.toLowerCase().includes(normalizedSearch) ||
        logItem.apiKeyName.toLowerCase().includes(normalizedSearch) ||
        (logItem.errorCode ?? "").toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || String(logItem.statusCode) === statusFilter;
      const matchesCache =
        cacheFilter === "all" ||
        (cacheFilter === "hit" && logItem.cacheHit) ||
        (cacheFilter === "miss" && !logItem.cacheHit);

      return matchesSearch && matchesStatus && matchesCache;
    });
  }, [cacheFilter, logsQuery.data?.data, search, statusFilter]);

  return (
    <DashboardFrame
      badge="Logs"
      title="Request stream and diagnostics"
      description="Review recent authenticated metadata requests, inspect individual outcomes, and drill into request-level details when something looks off."
    >
      <div className="space-y-6">
        {logsQuery.isLoading ? (
          <DashboardEmptyState
            title="Loading request logs"
            description="Fetching recent request history from the dashboard logs endpoint."
          />
        ) : logsQuery.isError ? (
          <DashboardEmptyState
            title="Unable to load request logs"
            description={getApiErrorMessage(
              logsQuery.error,
              "The logs endpoint is not available right now.",
            )}
          />
        ) : (
          <>
            <DashboardMetricGrid items={summaryCards} />

            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="md-dashboard-panel-muted flex h-12 flex-1 items-center gap-3 px-4">
                <Search className="size-4 text-slate-500" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by URL, request ID, key name, or error code"
                  className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="md-dashboard-select h-12 xl:w-48"
              >
                <option value="all">All statuses</option>
                <option value="200">200</option>
                <option value="400">400</option>
                <option value="401">401</option>
                <option value="404">404</option>
                <option value="415">415</option>
                <option value="429">429</option>
                <option value="500">500</option>
                <option value="502">502</option>
                <option value="504">504</option>
              </select>

              <select
                value={cacheFilter}
                onChange={(event) => setCacheFilter(event.target.value)}
                className="md-dashboard-select h-12 xl:w-44"
              >
                <option value="all">All cache states</option>
                <option value="hit">Cache hit</option>
                <option value="miss">Cache miss</option>
              </select>
            </div>

            <section className="md-dashboard-panel overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                    Paginated request history
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    Latest metadata request outcomes
                  </h2>
                </div>
                <div className="md-dashboard-pill border-slate-200 bg-white text-slate-700">
                  {filteredLogs.length} visible on page{" "}
                  {logsQuery.data?.meta.currentPage ?? page}
                </div>
              </div>

              <div className="hidden grid-cols-[1.35fr_0.9fr_0.6fr_0.7fr_0.8fr_1.1fr_40px] gap-4 border-b border-slate-200 px-6 py-4 md:grid">
                {[
                  "Request",
                  "API key",
                  "Status",
                  "Cache",
                  "Latency",
                  "Observed",
                  "",
                ].map((heading) => (
                  <div key={heading} className="md-dashboard-table-header">
                    {heading}
                  </div>
                ))}
              </div>

              <div className="md-dashboard-scroll divide-y divide-slate-200">
                {filteredLogs.length ? (
                  filteredLogs.map((logItem) => (
                    <button
                      key={logItem.id}
                      type="button"
                      className="md-dashboard-table-row w-full px-6 py-4 text-left"
                      onClick={() => setSelectedLog(logItem)}
                    >
                      <div className="grid gap-4 md:grid-cols-[1.35fr_0.9fr_0.6fr_0.7fr_0.8fr_1.1fr_40px] md:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">
                            {logItem.domain ?? logItem.url}
                          </p>
                          <p className="mt-2 truncate font-mono text-xs text-slate-500">
                            {logItem.url}
                          </p>
                          <p className="mt-2 text-[0.68rem] uppercase tracking-[0.14em] text-slate-600">
                            {logItem.requestId}
                          </p>
                        </div>

                        <div className="text-sm text-slate-700">
                          <p className="font-semibold text-slate-950">
                            {logItem.apiKeyName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {logItem.errorCode ?? "No mapped error"}
                          </p>
                        </div>

                        <div>
                          <StatusBadge statusCode={logItem.statusCode} />
                        </div>

                        <div>
                          <CacheBadge cacheHit={logItem.cacheHit} />
                        </div>

                        <div className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <Clock3 className="size-4 text-slate-500" />
                          {formatLatency(logItem.latencyMs)}
                        </div>

                        <div className="text-sm text-slate-600">
                          {formatDateTime(logItem.requestedAt)}
                        </div>

                        <div className="flex justify-end text-slate-600">
                          <ExternalLink className="size-4" />
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-6">
                    <DashboardEmptyState
                      title="No request logs match the current filters"
                      description="Try widening the search or selecting a broader cache or status filter."
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Page {logsQuery.data?.meta.currentPage ?? page} of{" "}
                  {logsQuery.data?.meta.lastPage ?? 1}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="md-dashboard-button-secondary inline-flex h-11 items-center justify-center px-4 text-sm font-semibold hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="md-dashboard-button-secondary inline-flex h-11 items-center justify-center px-4 text-sm font-semibold hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={!(logsQuery.data?.meta.hasMorePages ?? false)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {selectedLog ? (
        <LogDetailDrawer
          logItem={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      ) : null}
    </DashboardFrame>
  );
}

function LogDetailDrawer({
  logItem,
  onClose,
}: {
  logItem: DashboardRequestLogItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/36 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
              Request detail
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {logItem.domain ?? "Metadata request"}
            </h2>
            <p className="mt-2 font-mono text-xs text-slate-500">
              {logItem.requestId}
            </p>
          </div>
          <button
            type="button"
            className="md-dashboard-button-secondary inline-flex size-11 items-center justify-center hover:bg-white"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="md-dashboard-scroll flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <section className="md-dashboard-panel-muted p-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge statusCode={logItem.statusCode} />
              <CacheBadge cacheHit={logItem.cacheHit} />
              <span className="md-dashboard-pill border-slate-200 bg-white text-slate-700">
                {logItem.contentType ?? "Unknown content type"}
              </span>
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                  Requested URL
                </p>
                <p className="mt-2 break-all font-mono text-xs text-slate-700">
                  {logItem.url}
                </p>
              </div>
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                  Normalized URL
                </p>
                <p className="mt-2 break-all font-mono text-xs text-slate-700">
                  {logItem.normalizedUrl ?? "Not captured"}
                </p>
              </div>
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                  Canonical URL
                </p>
                <p className="mt-2 break-all font-mono text-xs text-slate-700">
                  {logItem.canonicalUrl ?? "Not captured"}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {[
              { label: "API key", value: logItem.apiKeyName },
              { label: "Endpoint", value: logItem.endpoint },
              { label: "Method", value: logItem.method },
              { label: "Latency", value: formatLatency(logItem.latencyMs) },
              {
                label: "Observed at",
                value: formatDateTime(logItem.requestedAt),
              },
              { label: "Error code", value: logItem.errorCode ?? "None" },
            ].map((item) => (
              <div key={item.label} className="md-dashboard-panel-muted p-4">
                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-950">
                  {item.value}
                </p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ statusCode }: { statusCode: number }) {
  const tones: Record<number, string> = {
    200: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
    429: "border-violet-500/20 bg-violet-500/10 text-violet-700",
    415: "border-amber-500/20 bg-amber-500/10 text-amber-700",
    502: "border-rose-500/20 bg-rose-500/10 text-rose-700",
    504: "border-rose-500/20 bg-rose-500/10 text-rose-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] ${
        tones[statusCode] ?? "border-slate-200 bg-white text-slate-700"
      }`}
    >
      {statusCode}
    </span>
  );
}

function CacheBadge({ cacheHit }: { cacheHit: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] ${
        cacheHit
          ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-700"
          : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      {cacheHit ? "Hit" : "Miss"}
    </span>
  );
}
