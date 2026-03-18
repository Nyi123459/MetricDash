"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { APP_ROUTES } from "@/common/constants/routes";
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
import { useLogin } from "@/features/auth/hooks/use-login";
import { setAuthToken } from "@/features/auth/hooks/use-auth-session";
import { getApiErrorMessage } from "@/features/auth/services/auth-service";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/validations/auth-schemas";

type FieldErrors = Partial<Record<keyof LoginFormValues, string>>;

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormValues>({
    email: "",
    password: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerMessage(null);

    const parsed = loginSchema.safeParse(formData);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof LoginFormValues | undefined;

        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }

      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});

    try {
      const response = await loginMutation.mutateAsync(parsed.data);
      setFormData({email: "", password: ""});
      setAuthToken(response.accessToken);
      router.push(APP_ROUTES.dashboard);
      router.refresh();
    } catch (error) {
      setServerMessage(
        getApiErrorMessage(error, "Login failed. Please try again."),
      );
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eff6ff_38%,_#f8fafc_100%)] px-4 py-12">
      <div className="absolute inset-0 bg-[linear-gradient(155deg,rgba(14,165,233,0.08),transparent_35%,rgba(15,23,42,0.08))]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl bg-slate-950 shadow-xl shadow-slate-900/20">
            <ArrowRight className="size-7 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to manage keys, usage, and request logs for MetricDash.
          </p>
        </div>

        <Card className="border-white/70">
          <CardHeader className="pb-4">
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              This page uses your backend login API through Axios and TanStack
              Query.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-3.5 size-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-11"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                  />
                </div>
                {fieldErrors.email ? (
                  <p className="text-xs text-rose-600">{fieldErrors.email}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href={APP_ROUTES.register}
                    className="text-xs font-medium text-sky-700 hover:text-sky-800"
                  >
                    Need an account?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-3.5 size-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-11 pr-11"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-3 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p className="text-xs text-rose-600">
                    {fieldErrors.password}
                  </p>
                ) : null}
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
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>

              <p className="text-center text-sm text-slate-600">
                New to MetricDash?{" "}
                <Link
                  className="font-medium text-sky-700 hover:text-sky-800"
                  href={APP_ROUTES.register}
                >
                  Create an account
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
