"use client";

import type { LucideIcon } from "lucide-react";
import { RevealInView } from "@/common/components/ui/reveal-in-view";

type AuthShellProps = {
  badge: string;
  title: string;
  description: string;
  icon: LucideIcon;
  sideTitle: string;
  sideDescription: string;
  highlights: Array<{
    title: string;
    description: string;
  }>;
  children: React.ReactNode;
};

export function AuthShell({
  badge,
  title,
  description,
  icon: Icon,
  sideTitle,
  sideDescription,
  highlights,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),transparent)]" />

      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <RevealInView className="hidden lg:block">
          <section className="md-site-card overflow-hidden border-transparent bg-[linear-gradient(180deg,#091426_0%,#10203a_100%)] p-8 text-white shadow-[0_36px_90px_rgba(15,23,42,0.24)]">
            <div className="flex size-16 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(135deg,#22d3ee_0%,#0ea5e9_100%)] text-slate-950 shadow-lg shadow-cyan-500/20">
              <Icon className="size-8" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              {badge}
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
              {sideTitle}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
              {sideDescription}
            </p>

            <div className="mt-8 grid gap-4">
              {highlights.map((highlight, index) => (
                <RevealInView
                  key={highlight.title}
                  delayMs={100 + index * 80}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5"
                >
                  <p className="text-sm font-semibold text-white">
                    {highlight.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {highlight.description}
                  </p>
                </RevealInView>
              ))}
            </div>
          </section>
        </RevealInView>

        <RevealInView delayMs={120} className="mx-auto w-full max-w-xl">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto flex size-16 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(135deg,#22d3ee_0%,#0ea5e9_100%)] text-slate-950 shadow-xl shadow-cyan-500/20 lg:mx-0">
              <Icon className="size-8" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              {badge}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              {title}
            </h1>
            <p className="mt-3 text-base leading-8 text-slate-600">
              {description}
            </p>
          </div>

          {children}
        </RevealInView>
      </div>
    </div>
  );
}
