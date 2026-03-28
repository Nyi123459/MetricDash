import { LucideIcon } from "lucide-react";
import { cn } from "@/common/lib/utils";

type DashboardMetricItem = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "sky" | "emerald" | "amber" | "rose";
};

type DashboardMetricGridProps = {
  items: DashboardMetricItem[];
};

const toneClasses: Record<DashboardMetricItem["tone"], string> = {
  sky: "border border-cyan-400/18 bg-cyan-500/10 text-cyan-700",
  emerald: "border border-emerald-400/18 bg-emerald-500/10 text-emerald-700",
  amber: "border border-amber-400/18 bg-amber-500/10 text-amber-700",
  rose: "border border-rose-400/18 bg-rose-500/10 text-rose-700",
};

export function DashboardMetricGrid({ items }: DashboardMetricGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className="md-dashboard-panel relative overflow-hidden p-5"
          >
            <div className="absolute inset-x-0 top-0 h-px" />
            <div className="flex flex-col items-start justify-between gap-4">
              <div className="flex items-start justify-between w-full">
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    {item.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-2xl p-3 shadow-[0_0_30px_rgba(15,23,42,0.18)]",
                    toneClasses[item.tone],
                  )}
                >
                  <Icon className="size-5" />
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
