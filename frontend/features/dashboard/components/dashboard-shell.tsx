"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, KeyRound, LogOut, ShieldCheck, Zap } from "lucide-react";
import { APP_ROUTES } from "@/common/constants/routes";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { clearAuthToken } from "@/features/auth/hooks/use-auth-session";

type DashboardShellProps = {
  userEmail?: string;
};

const dashboardStats = [
  {
    label: "Metadata requests",
    value: "0",
    description:
      "Your first calls will appear here once the API key flow is live.",
    icon: Activity,
  },
  {
    label: "API keys",
    value: "0",
    description: "Create and revoke keys from the next dashboard slice.",
    icon: KeyRound,
  },
  {
    label: "Verification status",
    value: "Ready",
    description: "This shell is protected by the frontend auth cookie.",
    icon: ShieldCheck,
  },
];

export function DashboardShell({ userEmail }: DashboardShellProps) {
  const router = useRouter();

  function handleLogout() {
    clearAuthToken();
    router.push(APP_ROUTES.login);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_45%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-sky-950/5 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              <Zap className="size-3.5" />
              MetricDash
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Dashboard shell
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              This is the protected frontend starting point for your link
              intelligence product. The next slices can plug in API keys, usage
              charts, logs, and billing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:block">
              Signed in as{" "}
              <span className="font-medium text-slate-900">
                {userEmail ?? "authenticated user"}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle>Next implementation steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                Build `GET /api/v1/auth/me` next so this shell can validate the
                token against the backend instead of only checking cookie
                presence.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                Add API key management and usage widgets once the authenticated
                backend routes are ready.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                The current auth pages already call your real backend register
                and login endpoints with Axios, TanStack Query, and Zod
                validation.
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {dashboardStats.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.label} className="bg-white/90">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="text-3xl font-semibold tracking-tight text-slate-950">
                        {item.value}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card className="bg-slate-950 text-white">
              <CardContent className="p-6">
                <p className="text-sm uppercase tracking-[0.22em] text-sky-300">
                  Roadmap fit
                </p>
                <p className="mt-3 text-lg font-medium">
                  This shell is intentionally thin so the product stays focused
                  on V1: auth, API keys, metadata calls, caching, rate limiting,
                  and usage visibility.
                </p>
                <Link
                  href={APP_ROUTES.home}
                  className="mt-4 inline-flex text-sm font-medium text-sky-300 hover:text-sky-200"
                >
                  Return to landing page
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
