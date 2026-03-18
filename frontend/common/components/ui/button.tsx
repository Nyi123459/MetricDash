import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/common/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50",
  {
    variants: {
      variant: {
        default:
          "bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800",
        outline:
          "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        ghost: "text-slate-700 hover:bg-slate-100",
        link: "text-sky-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-xl px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
