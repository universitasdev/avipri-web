"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/** Barra de progreso. Sin `value` se muestra como actividad indeterminada. */
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn("relative h-3 w-full overflow-hidden rounded-full bg-slate-200", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full bg-brand-navy transition-all",
          value == null && "w-1/3 animate-pulse",
        )}
        style={value == null ? undefined : { width: `${value}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
