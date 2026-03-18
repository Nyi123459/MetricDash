import * as React from "react";
import { cn } from "@/common/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-medium text-slate-700", className)}
      {...props}
    />
  );
}

export { Label };
