import Link from "next/link";
import { Github, Linkedin, Twitter, Zap } from "lucide-react";
import { RevealInView } from "@/common/components/ui/reveal-in-view";
import { APP_ROUTES } from "@/common/constants/routes";

const productLinks = [
  { href: "#product", label: "Product" },
  { href: "#docs", label: "API shape" },
  { href: "#dashboard", label: "Dashboard" },
];

const accountLinks = [
  { href: APP_ROUTES.login, label: "Login" },
  { href: APP_ROUTES.register, label: "Register" },
  { href: APP_ROUTES.dashboard, label: "Open dashboard" },
];

const socialLinks = [
  { href: "#", label: "Twitter", icon: Twitter },
  { href: "#", label: "GitHub", icon: Github },
  { href: "#", label: "LinkedIn", icon: Linkedin },
];

export function MarketingFooter() {
  return (
    <footer className="px-4 py-14 sm:px-6 lg:px-8">
      <RevealInView className="mx-auto max-w-7xl md-site-card px-6 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-300 text-slate-950">
                <Zap className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-[0.22em] text-sky-700">
                  METRICDASH
                </p>
                <p className="text-sm text-slate-500">
                  Link intelligence API for preview-first products.
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
              Focused on the V1 workflow: auth, API keys, metadata, cache, rate
              limiting, usage, and logs for teams shipping richer URLs.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Product
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {productLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block transition hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Account
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {accountLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block transition hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Social
            </p>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="flex size-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-sky-200 hover:text-slate-950"
                >
                  <link.icon className="size-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500">
          Copyright 2026 MetricDash. Built around the current V1 product
          direction.
        </div>
      </RevealInView>
    </footer>
  );
}
