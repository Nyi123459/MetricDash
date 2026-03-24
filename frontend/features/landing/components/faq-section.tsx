import { ChevronDown } from "lucide-react";
import { RevealInView } from "@/common/components/ui/reveal-in-view";
import { faqs } from "@/features/landing/content/landing-content";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="md-site-section md-site-section-alt px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <RevealInView className="text-center">
          <p className="md-site-kicker">FAQ</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            Questions teams usually ask before shipping previews.
          </h2>
        </RevealInView>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <RevealInView key={faq.question} delayMs={index * 60}>
              <details className="group md-site-card p-6 text-slate-950">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                  <span className="text-lg font-semibold">{faq.question}</span>
                  <ChevronDown className="size-5 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <p className="mt-4 leading-7 text-slate-600">{faq.answer}</p>
              </details>
            </RevealInView>
          ))}
        </div>
      </div>
    </section>
  );
}
