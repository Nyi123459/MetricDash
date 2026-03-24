"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useId, useState } from "react";
import { APP_ROUTES } from "@/common/constants/routes";
import {
  getApiErrorCode,
  getApiErrorMessage,
  googleSignIn,
} from "@/features/auth/services/auth-service";

type GoogleAuthButtonProps = {
  context: "signin" | "signup";
  redirectTo?: string;
  onError: (message: string | null) => void;
  onLinkRequired: (credential: string, message: string) => void;
};

export function GoogleAuthButton({
  context,
  redirectTo = APP_ROUTES.dashboard,
  onError,
  onLinkRequired,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const containerId = useId().replace(/:/g, "");
  const [isScriptReady, setIsScriptReady] = useState(
    typeof window !== "undefined" && Boolean(window.google),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emitError = useEffectEvent((message: string | null) => {
    onError(message);
  });
  const emitLinkRequired = useEffectEvent(
    (credential: string, message: string) => {
      onLinkRequired(credential, message);
    },
  );

  useEffect(() => {
    if (window.google && !isScriptReady) {
      setIsScriptReady(true);
    }
  }, [isScriptReady]);

  useEffect(() => {
    if (!clientId || !isScriptReady || !window.google) {
      return;
    }

    const container = document.getElementById(containerId);

    if (!container) {
      return;
    }

    container.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      context,
      callback: async ({ credential }) => {
        setIsSubmitting(true);
        emitError(null);

        try {
          await googleSignIn({ idToken: credential });
          router.push(redirectTo);
          router.refresh();
        } catch (error) {
          if (getApiErrorCode(error) === "GOOGLE_LINK_REQUIRED") {
            emitLinkRequired(
              credential,
              getApiErrorMessage(
                error,
                "Enter your password once to link this Google account.",
              ),
            );
            return;
          }

          emitError(
            getApiErrorMessage(
              error,
              "Google sign-in failed. Please try again.",
            ),
          );
        } finally {
          setIsSubmitting(false);
        }
      },
    });

    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "rectangular",
      logo_alignment: "left",
      text: context === "signup" ? "signup_with" : "signin_with",
      width: 360,
    });

    return () => {
      window.google?.accounts.id.cancel();
    };
  }, [clientId, containerId, context, isScriptReady, redirectTo, router]);

  if (!clientId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Google sign-in is not configured. Add{" "}
        <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to your frontend environment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setIsScriptReady(true)}
      />
      <div id={containerId} className="flex justify-center" />
      {isSubmitting ? (
        <p className="text-center text-xs text-slate-500">
          Completing Google sign-in...
        </p>
      ) : null}
    </div>
  );
}
