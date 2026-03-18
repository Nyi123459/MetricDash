import Link from "next/link";
import { ArrowRight, LockKeyhole, Sparkles, Zap } from "lucide-react";
import { APP_ROUTES } from "@/common/constants/routes";
import { buttonVariants } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { cn } from "@/common/lib/utils";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#e0f2fe_0%,_#f8fafc_40%,_#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(14,165,233,0.10),transparent_30%,rgba(15,23,42,0.06))]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-between gap-10">
        <header className="flex items-center justify-between py-3">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/80 px-4 py-2 shadow-lg shadow-sky-950/5 backdrop-blur">
            <span className="flex size-9 items-center justify-center rounded-full bg-slate-950 text-white">
              <Zap className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950">MetricDash</p>
              <p className="text-xs text-slate-500">Link intelligence API</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={APP_ROUTES.login}
              className={cn(
                buttonVariants({ variant: "ghost", className: "rounded-full" }),
              )}
            >
              Login
            </Link>
            <Link
              href={APP_ROUTES.register}
              className={cn(
                buttonVariants({ className: "rounded-full bg-slate-950" }),
              )}
            >
              Get started
            </Link>
          </div>
        </header>

        <section className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.9fr]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              <Sparkles className="size-3.5" />
              V1 auth foundation
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Turn pasted links into fast, trustworthy metadata for your
              product.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              The frontend now includes a zip-inspired registration page, a real
              login flow backed by your auth API, and a protected dashboard
              shell ready for API keys, usage, and logs.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href={APP_ROUTES.register}
                className={cn(
                  buttonVariants({
                    size: "lg",
                    className: "rounded-full bg-slate-950 px-7",
                  }),
                )}
              >
                Create account
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={APP_ROUTES.dashboard}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "rounded-full px-7",
                  }),
                )}
              >
                Open dashboard
                <LockKeyhole className="size-4" />
              </Link>
            </div>
          </div>

          <Card className="bg-white/90">
            <CardContent className="space-y-6 p-6">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-sky-300">
                  Frontend status
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  Auth UI ready
                </p>
                <p className="mt-3 text-sm text-slate-300">
                  Axios, TanStack Query, Zod, and shadcn-style primitives are
                  wired in for the first product-facing flow.
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  "Feature-based auth folders for hooks, services, validations, and components",
                  "Registration page rebuilt from the reference zip into the Next.js app",
                  "Protected dashboard redirect using the auth cookie",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
