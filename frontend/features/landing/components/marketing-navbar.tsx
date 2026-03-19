import Link from "next/link";
import { Zap } from "lucide-react";
import { buttonVariants } from "@/common/components/ui/button";
import { APP_ROUTES } from "@/common/constants/routes";
import { cn } from "@/common/lib/utils";
import { navItems } from "@/features/landing/content/landing-content";

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={APP_ROUTES.home} className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Zap className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[0.24em] text-cyan-200/80">
              METRICDASH
            </span>
            <span className="block text-sm text-slate-400">
              Link intelligence API
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={APP_ROUTES.login}
            className={cn(
              buttonVariants({
                variant: "ghost",
                className:
                  "rounded-full border border-white/10 bg-white/5 px-5 text-slate-100 hover:bg-white/10 hover:text-white",
              }),
            )}
          >
            Login
          </Link>
          <Link
            href={APP_ROUTES.register}
            className={cn(
              buttonVariants({
                className:
                  "rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 px-5 text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-sky-300 hover:to-cyan-200",
              }),
            )}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
