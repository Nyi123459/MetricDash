import {
  requestExample,
  responseExample,
} from "@/features/landing/content/landing-content";
import { RevealInView } from "@/common/components/ui/reveal-in-view";
import styles from "@/features/landing/components/marketing-page.module.css";
import { cn } from "@/common/lib/utils";

export function ApiExampleSection() {
  return (
    <section
      id="docs"
      className="md-site-section md-site-section-alt px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <RevealInView className="max-w-5xl">
          <p className="md-site-kicker">API shape</p>
          <h2 className="mt-4 text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            See the response shape before you wire the UI.
          </h2>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600">
            The examples stay close to the documented API contract: one URL goes
            in, normalized metadata and cache context come back out.
          </p>
        </RevealInView>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <RevealInView className="md-site-code-panel">
            <div className="md-site-code-strip px-6 py-4">
              <p className="text-sm font-medium text-slate-100">Request</p>
            </div>
            <pre className="overflow-x-auto p-6 text-sm leading-7 text-cyan-100">
              <code>{requestExample}</code>
            </pre>
          </RevealInView>

          <RevealInView delayMs={100} className="md-site-code-panel">
            <div className="md-site-code-strip px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-100">Response</p>
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">
                  200 OK
                </p>
              </div>
            </div>
            <pre
              className={cn(
                "overflow-x-auto p-6 text-sm leading-7 text-slate-200",
                styles.responseCodeWrap,
              )}
            >
              <code>{responseExample}</code>
            </pre>
          </RevealInView>
        </div>
      </div>
    </section>
  );
}
