import { RevealInView } from "@/common/components/ui/reveal-in-view";
import { workflowSteps } from "@/features/landing/content/landing-content";

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="md-site-section md-site-section-alt px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <RevealInView className="max-w-3xl">
          <p className="md-site-kicker">How it works</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            The V1 loop stays intentionally simple.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            A clean metadata path matters more than flashy platform sprawl. The
            flow below mirrors the current product direction and dashboard
            story.
          </p>
        </RevealInView>

        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <RevealInView
              key={step.title}
              delayMs={index * 60}
              className="md-site-card relative h-full p-6"
            >
              <div className="md-site-icon-badge">
                <step.icon className="size-7" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                Step {index + 1}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {step.description}
              </p>
            </RevealInView>
          ))}
        </div>
      </div>
    </section>
  );
}
