"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KeyRound, Link2, Sparkles } from "lucide-react";
import { APP_ROUTES } from "@/common/constants/routes";
import { getApiErrorMessage } from "@/common/lib/api-errors";
import { useApiKeys } from "@/features/api-keys/hooks/use-api-keys";
import { useDashboardMetadataPreview } from "@/features/dashboard/hooks/use-dashboard-data";

const initialFormState = {
  url: "",
  apiKeyId: "",
};

export function MetadataPreviewPanel() {
  const apiKeysQuery = useApiKeys();
  const metadataPreviewMutation = useDashboardMetadataPreview();
  const [formState, setFormState] = useState(initialFormState);
  const [clientMessage, setClientMessage] = useState<string | null>(null);

  const activeApiKeys = useMemo(
    () =>
      (apiKeysQuery.data?.data ?? []).filter((apiKey) => {
        const isRevoked = apiKey.revoked_at !== null;
        const isExpired =
          apiKey.expires_at !== null &&
          new Date(apiKey.expires_at) <= new Date();

        return !isRevoked && !isExpired;
      }),
    [apiKeysQuery.data?.data],
  );

  const selectedApiKeyId =
    formState.apiKeyId || activeApiKeys[0]?.id.toString() || "";
  const preview = metadataPreviewMutation.data;

  const metadataRows = preview
    ? [
        { label: "Normalized URL", value: preview.metadata.url },
        {
          label: "Canonical URL",
          value: preview.metadata.canonical_url ?? "Not detected",
        },
        { label: "Title", value: preview.metadata.title ?? "Not detected" },
        {
          label: "Description",
          value: preview.metadata.description ?? "Not detected",
        },
        {
          label: "Site name",
          value: preview.metadata.site_name ?? "Not detected",
        },
        {
          label: "Content type",
          value: preview.metadata.content_type ?? "Not detected",
        },
        { label: "Author", value: preview.metadata.author ?? "Not detected" },
        {
          label: "Published at",
          value: preview.metadata.published_at ?? "Not detected",
        },
        { label: "Image", value: preview.metadata.image ?? "Not detected" },
        { label: "Favicon", value: preview.metadata.favicon ?? "Not detected" },
      ]
    : [];

  const responseMetaRows = preview
    ? [
        { label: "API key", value: preview.apiKey.name },
        { label: "Cache", value: preview.metadata.cache.hit ? "Hit" : "Miss" },
        {
          label: "Remaining requests",
          value: `${preview.rateLimit.remaining} / ${preview.rateLimit.limit}`,
        },
        {
          label: "Rate reset",
          value: `${preview.rateLimit.resetAfterSeconds}s`,
        },
        { label: "Request ID", value: preview.requestId },
      ]
    : [];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientMessage(null);

    const url = formState.url.trim();
    const apiKeyId = Number(selectedApiKeyId);

    if (!url) {
      setClientMessage("URL is required.");
      return;
    }

    if (!Number.isInteger(apiKeyId) || apiKeyId <= 0) {
      setClientMessage("Select an active API key first.");
      return;
    }

    try {
      await metadataPreviewMutation.mutateAsync({
        url,
        apiKeyId,
      });
    } catch {
      return;
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="md-dashboard-panel p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
              Metadata playground
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Run the extraction pipeline
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
              Send a real preview request through one of your existing API keys.
              The backend tracks usage, rate limits, and request logging exactly
              like customer traffic.
            </p>
          </div>
          <div className="md-dashboard-pill border-cyan-500/18 bg-cyan-500/10 text-cyan-700">
            <Sparkles className="size-4" />
            Request preview
          </div>
        </div>

        <div className="mt-6">
          {apiKeysQuery.isLoading ? (
            <div className="md-dashboard-panel-muted px-4 py-6 text-sm text-slate-600">
              Loading active API keys...
            </div>
          ) : activeApiKeys.length ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="dashboard-preview-url"
                  className="text-sm font-medium text-slate-700"
                >
                  URL to extract
                </label>
                <input
                  id="dashboard-preview-url"
                  type="url"
                  className="md-dashboard-input"
                  placeholder="https://example.com/article"
                  value={formState.url}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      url: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="dashboard-preview-api-key"
                  className="text-sm font-medium text-slate-700"
                >
                  Active API key
                </label>
                <select
                  id="dashboard-preview-api-key"
                  value={selectedApiKeyId}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      apiKeyId: event.target.value,
                    }))
                  }
                  className="md-dashboard-select"
                >
                  {activeApiKeys.map((apiKey) => (
                    <option key={apiKey.id} value={apiKey.id}>
                      {apiKey.name} ({apiKey.key_prefix}...)
                    </option>
                  ))}
                </select>
              </div>

              {(clientMessage || metadataPreviewMutation.isError) && (
                <div className="rounded-2xl border border-rose-500/18 bg-rose-500/8 px-4 py-3 text-sm text-rose-700">
                  {clientMessage ??
                    getApiErrorMessage(
                      metadataPreviewMutation.error,
                      "Unable to extract metadata right now.",
                    )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="md-dashboard-button-primary inline-flex h-12 items-center justify-center gap-2 px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={metadataPreviewMutation.isPending}
                >
                  <Sparkles className="size-4" />
                  {metadataPreviewMutation.isPending
                    ? "Extracting..."
                    : "Extract metadata"}
                </button>
                <Link
                  href={APP_ROUTES.dashboardApiKeys}
                  className="md-dashboard-button-secondary inline-flex h-12 items-center justify-center px-5 text-sm font-semibold hover:bg-white"
                >
                  Manage keys
                </Link>
              </div>

              <div className="rounded-[1.35rem] border border-cyan-400/12 bg-cyan-400/6 p-4 text-sm leading-7 text-slate-600">
                The dashboard never exposes raw secrets in the browser. It sends
                the preview request through your selected key on the backend,
                then records the result in the same observability flow used by
                the public metadata API.
              </div>
            </form>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-cyan-700">
                <KeyRound className="size-5" />
              </div>
              <p className="mt-4 text-lg font-semibold text-slate-950">
                Create an API key first
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-600">
                The preview runner uses one of your active keys so the request
                follows the real MetricDash product path end to end.
              </p>
              <Link
                href={APP_ROUTES.dashboardApiKeys}
                className="md-dashboard-button-primary mt-5 inline-flex h-11 items-center justify-center px-5 text-sm font-semibold"
              >
                Open API keys
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="md-dashboard-panel p-6">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
            Normalized response
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            What the metadata engine returned
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Review response fields, request attribution, and cache details after
            each preview run.
          </p>
        </div>

        {preview ? (
          <div className="mt-6 space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {responseMetaRows.map((row) => (
                <div key={row.label} className="md-dashboard-panel-muted p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">
                    {row.label}
                  </p>
                  <p className="mt-2 break-words text-sm font-medium text-slate-950">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {metadataRows.map((row) => (
                <div key={row.label} className="md-dashboard-panel-muted p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">
                    {row.label}
                  </p>
                  <p className="mt-2 break-words text-sm leading-7 text-slate-700">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-cyan-700">
              <Link2 className="size-5" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-950">
              Run your first extraction
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-600">
              The preview payload will appear here once you submit a URL through
              one of your active API keys.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
