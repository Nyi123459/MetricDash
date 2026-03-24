type DashboardEmptyStateProps = {
  title: string;
  description: string;
};

export function DashboardEmptyState({
  title,
  description,
}: DashboardEmptyStateProps) {
  return (
    <div className="md-dashboard-panel border-dashed border-slate-200 px-6 py-14 text-center">
      <p className="text-lg font-semibold text-slate-950">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}
