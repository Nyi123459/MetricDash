import {
  requestExample,
  responseExample,
} from "@/features/landing/content/landing-content";
import styles from "@/features/landing/components/marketing-page.module.css";
import { cn } from "@/common/lib/utils";

export function ApiExampleSection() {
  return (
    <section
      id="docs"
      className="scroll-mt-24 border-y border-white/[0.08] bg-white/[0.03] px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
            API shape
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            See the response shape before you wire the UI.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            The examples stay close to the documented V1 contract: one URL goes
            in, normalized metadata and cache context come back out.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#07101f]">
            <div className="border-b border-white/10 px-6 py-4">
              <p className="text-sm font-medium text-slate-300">Request</p>
            </div>
            <pre className="overflow-x-auto p-6 text-sm leading-7 text-cyan-100">
              <code>{requestExample}</code>
            </pre>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#091325]">
            <div className="border-b border-white/10 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-300">Response</p>
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
          </div>
        </div>
      </div>
    </section>
  );
}
