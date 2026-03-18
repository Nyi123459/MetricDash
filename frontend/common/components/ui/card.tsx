import * as React from "react";
import { cn } from "@/common/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/80 bg-card text-card-foreground shadow-2xl shadow-sky-950/8 backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-2 p-8", className)} {...props} />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-2xl font-semibold tracking-tight text-slate-950",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-slate-600", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-8 pb-8", className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
