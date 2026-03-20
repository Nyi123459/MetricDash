"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { APP_ROUTES } from "@/common/constants/routes";
import { getApiErrorMessage } from "@/common/lib/api-errors";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "@/features/api-keys/hooks/use-api-keys";

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

  const activeKeysCount = useMemo(
    () =>
      apiKeysQuery.data?.data.filter((apiKey) => apiKey.revoked_at === null)
        .length ?? 0,
    [apiKeysQuery.data?.data],
  );

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

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_42%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-cyan-950/5 backdrop-blur md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-800">
              <Sparkles className="size-3.5" />
              Week 3
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              API key control room
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Create keys for customer apps, reveal the raw secret once, and
              revoke access without deleting history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={APP_ROUTES.dashboard}
              className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to dashboard
            </Link>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[0.95fr_1.25fr]">
          <div className="grid gap-6">
            <Card className="bg-white/90">
              <CardHeader className="pb-5">
                <CardTitle>Create API key</CardTitle>
                <CardDescription>
                  The backend returns the secret only once. Save it with your
                  app config before leaving this page. Expiry is assigned by the
                  server security policy, not by dashboard input.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateApiKey} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="api-key-name">Display name</Label>
                    <Input
                      id="api-key-name"
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
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {serverMessage}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-2xl bg-slate-950"
                    disabled={createApiKeyMutation.isPending}
                  >
                    <KeyRound className="size-4" />
                    {createApiKeyMutation.isPending
                      ? "Creating key..."
                      : "Create API key"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-slate-950 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-white">Live status</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">
                    Active keys
                  </p>
                  <p className="mt-3 text-4xl font-semibold">
                    {activeKeysCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">
                    Auth route
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            {createdSecret ? (
              <Card className="border-cyan-200 bg-cyan-50/90">
                <CardHeader className="pb-4">
                  <CardTitle className="text-cyan-950">
                    Copy this secret now
                  </CardTitle>
                  <CardDescription className="text-cyan-900/80">
                    This raw API key will not be shown again after you leave or
                    refresh the page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-cyan-200 bg-white px-4 py-3 font-mono text-sm text-slate-900">
                    {createdSecret}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-cyan-200 bg-white"
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
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            <Card className="bg-white/90">
              <CardHeader className="pb-4">
                <CardTitle>Existing keys</CardTitle>
                <CardDescription>
                  Masked display, usage timestamps, and revoke controls all live
                  here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiKeysQuery.isLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                    Loading API keys...
                  </div>
                ) : apiKeysQuery.isError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
                    {getApiErrorMessage(
                      apiKeysQuery.error,
                      "Unable to load API keys right now.",
                    )}
                  </div>
                ) : apiKeysQuery.data?.data.length ? (
                  apiKeysQuery.data.data.map((apiKey) => {
                    const isRevoked = apiKey.revoked_at !== null;
                    const isExpired =
                      apiKey.expires_at !== null &&
                      new Date(apiKey.expires_at) <= new Date();

                    return (
                      <article
                        key={apiKey.id}
                        className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-3">
                            <div>
                              <p className="text-lg font-semibold text-slate-950">
                                {apiKey.name}
                              </p>
                              <p className="mt-1 font-mono text-sm text-slate-600">
                                {maskApiKey(apiKey.key_prefix)}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.2em]">
                              <span className="rounded-full bg-slate-900 px-3 py-1 text-white">
                                {isRevoked
                                  ? "Revoked"
                                  : isExpired
                                    ? "Expired"
                                    : "Active"}
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                                {apiKey.requests_per_minute} rpm
                              </span>
                            </div>

                            <dl className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                              <div>
                                <dt className="font-medium text-slate-900">
                                  Created
                                </dt>
                                <dd>{formatDate(apiKey.created_at)}</dd>
                              </div>
                              <div>
                                <dt className="font-medium text-slate-900">
                                  Last used
                                </dt>
                                <dd>{formatDate(apiKey.last_used_at)}</dd>
                              </div>
                              <div>
                                <dt className="font-medium text-slate-900">
                                  Expires
                                </dt>
                                <dd>{formatDate(apiKey.expires_at)}</dd>
                              </div>
                              <div>
                                <dt className="font-medium text-slate-900">
                                  Revoked
                                </dt>
                                <dd>{formatDate(apiKey.revoked_at)}</dd>
                              </div>
                            </dl>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-50"
                            onClick={() => handleRevokeApiKey(apiKey.id)}
                            disabled={
                              isRevoked || revokeApiKeyMutation.isPending
                            }
                          >
                            <Trash2 className="size-4" />
                            {isRevoked ? "Revoked" : "Revoke"}
                          </Button>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
                    No API keys yet. Create your first key to start
                    authenticating backend requests.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function maskApiKey(keyPrefix: string) {
  return `${keyPrefix}${"*".repeat(16)}`;
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
