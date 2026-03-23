"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/common/lib/utils";

type RevealInViewProps = {
  as?: keyof React.JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  once?: boolean;
  threshold?: number;
};

export function RevealInView({
  as = "div",
  children,
  className,
  delayMs = 0,
  once = true,
  threshold = 0.16,
}: RevealInViewProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return false;
    }

    return (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof window.IntersectionObserver !== "function"
    );
  });
  const sharedProps = useMemo(
    () => ({
      className: cn("md-reveal", className),
      "data-in-view": isVisible ? "true" : "false",
      style: {
        transitionDelay: `${delayMs}ms`,
      },
    }),
    [className, delayMs, isVisible],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    if (typeof window.IntersectionObserver !== "function") {
      return;
    }

    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, threshold]);

  switch (as) {
    case "section":
      return (
        <section ref={ref as React.RefObject<HTMLElement>} {...sharedProps}>
          {children}
        </section>
      );
    case "article":
      return (
        <article ref={ref as React.RefObject<HTMLElement>} {...sharedProps}>
          {children}
        </article>
      );
    case "aside":
      return (
        <aside ref={ref as React.RefObject<HTMLElement>} {...sharedProps}>
          {children}
        </aside>
      );
    case "header":
      return (
        <header ref={ref as React.RefObject<HTMLElement>} {...sharedProps}>
          {children}
        </header>
      );
    case "footer":
      return (
        <footer ref={ref as React.RefObject<HTMLElement>} {...sharedProps}>
          {children}
        </footer>
      );
    case "span":
      return (
        <span ref={ref as React.RefObject<HTMLSpanElement>} {...sharedProps}>
          {children}
        </span>
      );
    default:
      return (
        <div ref={ref as React.RefObject<HTMLDivElement>} {...sharedProps}>
          {children}
        </div>
      );
  }
}
