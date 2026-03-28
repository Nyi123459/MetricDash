"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { APP_ROUTES } from "@/common/constants/routes";
import { getApiErrorMessage } from "@/common/lib/api-errors";
import { cn } from "@/common/lib/utils";
import { useLogout } from "@/features/auth/hooks/use-logout";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const logoutMutation = useLogout();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogout() {
    setErrorMessage(null);

    try {
      await logoutMutation.mutateAsync();
      router.push(APP_ROUTES.home);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Logout failed. Please try again."),
      );
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className={cn(
          "md-dashboard-button-secondary inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-white disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        <LogOut className="size-4" />
        {logoutMutation.isPending ? "Logging out..." : "Log out"}
      </button>

      {errorMessage ? (
        <p aria-live="polite" className="text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
