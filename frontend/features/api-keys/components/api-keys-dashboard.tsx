"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, ShieldCheck, Trash2, Zap } from "lucide-react";
import { getApiErrorMessage } from "@/common/lib/api-errors";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "@/features/api-keys/hooks/use-api-keys";
import { maskApiKey } from "@/features/api-keys/lib/mask-api-key";
import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { DashboardMetricGrid } from "@/features/dashboard/components/dashboard-metric-grid";
import { DashboardEmptyState } from "@/features/dashboard/components/dashboard-empty-state";

type CreateFormState = {
  name: string;
};

const initialFormState: CreateFormState = {
  name: "",
};

export function ApiKeysDashboard() {
  const apiKeysQuery = useApiKeys();
  const createApiKeyMutation = useCreateApiKey();
  const revokeApiKeyMutation = useRevokeApiKey();
  const [createFormState, setCreateFormState] = useState(initialFormState);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  // const [copiedPrefixKeyId, setCopiedPrefixKeyId] = useState<number | null>(
  //   null,
  // );

  const apiKeys = apiKeysQuery.data?.data ?? [];
  console.log("API Keys:", apiKeys);
  const activeKeysCount = apiKeys.filter((apiKey) => {
    const isRevoked = apiKey.revoked_at !== null;
    const isExpired =
      apiKey.expires_at !== null && new Date(apiKey.expires_at) <= new Date();

    return !isRevoked && !isExpired;
  }).length;
  const revokedKeysCount = apiKeys.filter(
    (apiKey) => apiKey.revoked_at !== null,
  ).length;

  const statusCards = [
    {
      label: "Active keys",
      value: `${activeKeysCount}`,
      description:
        "Credentials currently available for authenticated metadata traffic.",
      icon: KeyRound,
      tone: "emerald" as const,
    },
    {
      label: "Stored keys",
      value: `${apiKeys.length}`,
      description:
        "Includes active, revoked, and expired keys kept for audit history.",
      icon: ShieldCheck,
      tone: "sky" as const,
    },
    {
      label: "Revoked keys",
      value: `${revokedKeysCount}`,
      description:
        "Historical credentials retained for debugging and compliance.",
      icon: Trash2,
      tone: "rose" as const,
    },
    {
      label: "Rate budget policy",
      value: "60 rpm",
      description:
        "Current keys inherit the server-managed request budget by default.",
      icon: Zap,
      tone: "amber" as const,
    },
  ];

  async function handleCreateApiKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerMessage(null);

    const name = createFormState.name.trim();

    if (!name) {
      setServerMessage("API key name is required.");
      return;
    }

    try {
      const result = await createApiKeyMutation.mutateAsync({
        name,
      });

      setCreatedSecret(result.secret);
      setCopiedSecret(false);
      setCreateFormState(initialFormState);
    } catch (error) {
      setServerMessage(
        getApiErrorMessage(error, "Unable to create API key right now."),
      );
    }
  }

  async function handleRevokeApiKey(apiKeyId: number) {
    setServerMessage(null);

    try {
      await revokeApiKeyMutation.mutateAsync(apiKeyId);
    } catch (error) {
      setServerMessage(
        getApiErrorMessage(error, "Unable to revoke API key right now."),
      );
    }
  }

  async function handleCopySecret() {
    if (!createdSecret) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdSecret);
      setCopiedSecret(true);
    } catch {
      setServerMessage("Clipboard access failed. Copy the key manually.");
    }
  }

  // async function handleCopyKeyPrefix(apiKeyId: number, keyPrefix: string) {
  //   try {
  //     await navigator.clipboard.writeText(maskApiKey(keyPrefix));
  //     setServerMessage(null);
  //     setCopiedPrefixKeyId(apiKeyId);
  //   } catch {
  //     setServerMessage("Clipboard access failed. Copy the key prefix manually.");
  //   }
  // }

  return (
    <DashboardFrame
      badge="API Keys"
      title="Credential control room"
      description="Create server-owned API keys, reveal the raw secret once, and revoke access without losing audit history."
    >
      <div className="space-y-6">
        <DashboardMetricGrid items={statusCards} />

        <div className="flex flex-col gap-6">
          <section className="space-y-6">
            <section className="md-dashboard-panel p-6">
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                Create Key
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                The backend returns the secret only once. Expiry and request
                budget remain system-owned and are not editable from the
                dashboard.
              </p>

              <form
                onSubmit={handleCreateApiKey}
                className="mt-6 space-y-5 flex items-center justify-between"
              >
                <div className="space-y-2 w-[85%]">
                  <label
                    htmlFor="api-key-name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Display name
                  </label>
                  <input
                    id="api-key-name"
                    className="md-dashboard-input"
                    placeholder="Production crawler"
                    value={createFormState.name}
                    onChange={(event) =>
                      setCreateFormState((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </div>

                {serverMessage ? (
                  <div className="rounded-2xl border border-rose-500/18 bg-rose-500/8 px-4 py-3 text-sm text-rose-700">
                    {serverMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="md-dashboard-button-primary inline-flex h-12 items-center justify-center gap-2 px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={createApiKeyMutation.isPending}
                >
                  <KeyRound className="size-4" />
                  {createApiKeyMutation.isPending
                    ? "Creating key..."
                    : "Create API key"}
                </button>
              </form>
            </section>

            <section className="md-dashboard-panel-muted p-5 flex items-center gap-1">
              <p className="text-sm font-semibold text-red-500">
                Security notice :
              </p>
              <p className="text-sm leading-7 text-slate-600">
                Never commit raw API keys to source control. Store them in a
                secrets manager or environment variable as soon as you create
                them.
              </p>
            </section>
          </section>

          <section className="space-y-6">
            {createdSecret ? (
              <section className="md-dashboard-panel border-cyan-500/16 bg-[linear-gradient(180deg,rgba(224,242,254,0.88)_0%,rgba(248,251,255,0.96)_100%)] p-6">
                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-cyan-700">
                  Copy now
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Your new secret is ready
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  This raw API key will not be shown again after you leave or
                  refresh the page.
                </p>
                <div className="mt-5 overflow-x-auto rounded-2xl border border-cyan-400/15 bg-white px-4 py-4 font-mono text-sm text-cyan-700">
                  {createdSecret}
                </div>
                <button
                  type="button"
                  className="md-dashboard-button-secondary mt-4 inline-flex h-11 items-center justify-center gap-2 px-4 text-sm font-semibold hover:bg-white"
                  onClick={handleCopySecret}
                >
                  {copiedSecret ? (
                    <>
                      <Check className="size-4 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      Copy secret
                    </>
                  )}
                </button>
              </section>
            ) : null}

            <section className="md-dashboard-panel overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    Existing Keys
                  </h2>
                </div>
                <div className="md-dashboard-pill border-slate-200 bg-white text-slate-700">
                  {apiKeys.length} total keys
                </div>
              </div>

              {apiKeysQuery.isLoading ? (
                <div className="p-6">
                  <DashboardEmptyState
                    title="Loading API keys"
                    description="Fetching stored API keys and security metadata."
                  />
                </div>
              ) : apiKeysQuery.isError ? (
                <div className="p-6">
                  <DashboardEmptyState
                    title="Unable to load API keys"
                    description={getApiErrorMessage(
                      apiKeysQuery.error,
                      "Unable to load API keys right now.",
                    )}
                  />
                </div>
              ) : apiKeys.length ? (
                <>
                  <div className="hidden grid-cols-[1.2fr_0.8fr_0.85fr_0.85fr_0.7fr_120px] gap-4 border-b border-slate-200 px-6 py-4 md:grid">
                    {[
                      "Key",
                      "Created",
                      "Last used",
                      "Expires",
                      "Status",
                      "Action",
                    ].map((heading) => (
                      <div key={heading} className="md-dashboard-table-header">
                        {heading}
                      </div>
                    ))}
                  </div>

                  <div className="divide-y divide-slate-200">
                    {apiKeys.map((apiKey) => {
                      const isRevoked = apiKey.revoked_at !== null;
                      const isExpired =
                        apiKey.expires_at !== null &&
                        new Date(apiKey.expires_at) <= new Date();

                      return (
                        <article
                          key={apiKey.id}
                          className="md-dashboard-table-row px-6 py-5"
                        >
                          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.85fr_0.85fr_0.7fr_120px] md:items-center">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {apiKey.name}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <p className="font-mono text-xs text-slate-500">
                                  {maskApiKey(apiKey.key_prefix)}
                                </p>
                                {/* <button
                                  type="button"
                                  className="inline-flex size-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-cyan-300 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                                  aria-label={`Copy ${apiKey.name} key prefix`}
                                  title="Copy key prefix"
                                  onClick={() =>
                                    handleCopyKeyPrefix(
                                      apiKey.id,
                                      apiKey.key_prefix,
                                    )
                                  }
                                >
                                  {copiedPrefixKeyId === apiKey.id ? (
                                    <Check className="size-3.5" />
                                  ) : (
                                    <Copy className="size-3.5" />
                                  )}
                                </button> */}
                              </div>
                              <p className="mt-2 text-[0.68rem] uppercase tracking-[0.14em] text-slate-600">
                                {apiKey.requests_per_minute} rpm
                              </p>
                            </div>

                            <div className="text-sm text-slate-600">
                              {formatDate(apiKey.created_at)}
                            </div>
                            <div className="text-sm text-slate-600">
                              {formatDate(apiKey.last_used_at)}
                            </div>
                            <div className="text-sm text-slate-600">
                              {formatDate(apiKey.expires_at)}
                            </div>
                            <div>
                              <StatusBadge
                                isRevoked={isRevoked}
                                isExpired={isExpired}
                              />
                            </div>

                            <div>
                              <button
                                type="button"
                                className="md-dashboard-button-secondary inline-flex h-10 items-center justify-center gap-2 px-4 text-sm font-semibold hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => handleRevokeApiKey(apiKey.id)}
                                disabled={
                                  isRevoked || revokeApiKeyMutation.isPending
                                }
                              >
                                <Trash2 className="size-4" />
                                {isRevoked ? "Revoked" : "Revoke"}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="p-6">
                  <DashboardEmptyState
                    title="No API keys yet"
                    description="Create your first key to start authenticating backend metadata requests."
                  />
                </div>
              )}
            </section>
          </section>
        </div>
      </div>
    </DashboardFrame>
  );
}

function StatusBadge({
  isRevoked,
  isExpired,
}: {
  isRevoked: boolean;
  isExpired: boolean;
}) {
  if (isRevoked) {
    return (
      <span className="inline-flex rounded-full border border-rose-500/18 bg-rose-500/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-rose-700">
        Revoked
      </span>
    );
  }

  if (isExpired) {
    return (
      <span className="inline-flex rounded-full border border-amber-500/18 bg-amber-500/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-amber-700">
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-emerald-500/18 bg-emerald-500/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-emerald-700">
      Active
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
