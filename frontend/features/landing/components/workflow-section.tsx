import { workflowSteps } from "@/features/landing/content/landing-content";

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="scroll-mt-24 border-y border-white/[0.08] bg-white/[0.03] px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
            How it works
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            The V1 loop stays intentionally simple.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            A clean metadata path matters more than flashy platform sprawl. The
            flow below mirrors the current product direction and dashboard
            story.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-[2rem] border border-white/10 bg-[#09101d] p-6"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-300 text-slate-950">
                <step.icon className="size-7" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Step {index + 1}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
