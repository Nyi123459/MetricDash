import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/common/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/35 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,#22d3ee_0%,#38bdf8_55%,#0ea5e9_100%)] text-sky-950 shadow-lg shadow-sky-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/24",
        outline:
          "border border-slate-200 bg-white/80 text-slate-900 hover:-translate-y-0.5 hover:bg-white",
        ghost: "text-slate-700 hover:bg-white/70",
        link: "text-sky-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-2xl px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>
>(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
