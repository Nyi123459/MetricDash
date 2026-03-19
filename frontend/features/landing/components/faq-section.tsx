import { ChevronDown } from "lucide-react";
import { faqs } from "@/features/landing/content/landing-content";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-y border-white/[0.08] bg-white/[0.03] px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
            FAQ
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Questions teams usually ask before shipping previews.
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-[1.75rem] border border-white/10 bg-[#07101f] p-6 text-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                <span className="text-lg font-semibold">{faq.question}</span>
                <ChevronDown className="size-5 text-slate-400 transition group-open:rotate-180" />
              </summary>
              <p className="mt-4 leading-7 text-slate-300">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
