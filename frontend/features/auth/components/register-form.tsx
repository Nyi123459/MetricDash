"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
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
import { useRegister } from "@/features/auth/hooks/use-register";
import { getApiErrorMessage } from "@/features/auth/services/auth-service";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/validations/auth-schemas";

type FieldErrors = Partial<Record<keyof RegisterFormValues, string>>;

const formState = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: true,
}

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormValues>(formState);

  const strength = useMemo(() => {
    if (!formData.password) return 0;
    if (formData.password.length < 8) return 1;
    if (formData.password.length < 12) return 2;
    return 3;
  }, [formData.password]);

  const strengthLabel = ["", "Weak", "Medium", "Strong"][strength];
  const strengthColor = ["", "bg-rose-500", "bg-amber-500", "bg-emerald-500"][
    strength
  ];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerMessage(null);

    const parsed = registerSchema.safeParse(formData);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof RegisterFormValues | undefined;
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});

    try {
      await registerMutation.mutateAsync({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      });
      setFormData(formState)
      setServerMessage(
        "Account created. Check your inbox for the verification email.",
      );
      window.setTimeout(() => router.push(APP_ROUTES.login), 1200);
    } catch (error) {
      setServerMessage(
        getApiErrorMessage(error, "Registration failed. Please try again."),
      );
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eff6ff_35%,_#f8fafc_100%)] px-4 py-12">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),transparent_35%,rgba(15,23,42,0.08))]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-600 to-blue-800 shadow-xl shadow-sky-500/30">
            <User className="size-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Create account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Join MetricDash and ship better link intelligence faster.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Referenced from your zip and rebuilt in a feature-based Next.js
              structure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-3.5 size-5 text-slate-400" />
                  <Input
                    id="name"
                    className="pl-11"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </div>
                {fieldErrors.name ? (
                  <p className="text-xs text-rose-600">{fieldErrors.name}</p>
                ) : null}
              </div>

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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-3.5 size-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-11 pr-11"
                    placeholder="Create a strong password"
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
                {formData.password ? (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <span
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            level <= strength ? strengthColor : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      Password strength:{" "}
                      <span className="font-medium text-slate-700">
                        {strengthLabel}
                      </span>
                    </p>
                  </div>
                ) : null}
                {fieldErrors.password ? (
                  <p className="text-xs text-rose-600">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-3.5 size-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pl-11 pr-11"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-4 top-3 text-slate-400 transition hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword ? (
                  <p className="text-xs text-rose-600">
                    {fieldErrors.confirmPassword}
                  </p>
                ) : null}
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      agreeToTerms: event.target.checked,
                    }))
                  }
                  className="mt-0.5 size-4 rounded border-slate-300 text-sky-600"
                />
                <span>
                  I agree to the{" "}
                  <span className="font-medium text-slate-900">Terms</span> and{" "}
                  <span className="font-medium text-slate-900">
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>
              {fieldErrors.agreeToTerms ? (
                <p className="text-xs text-rose-600">
                  {fieldErrors.agreeToTerms}
                </p>
              ) : null}

              {serverMessage ? (
                <div
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${
                    registerMutation.isSuccess
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {registerMutation.isSuccess ? (
                    <Check className="size-4" />
                  ) : null}
                  {serverMessage}
                </div>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-blue-800"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending
                  ? "Creating account..."
                  : "Create account"}
              </Button>

              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                Or continue with
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full rounded-2xl"
              >
                Continue with Google
              </Button>

              <p className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  className="font-medium text-sky-700 hover:text-sky-800"
                  href={APP_ROUTES.login}
                >
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
