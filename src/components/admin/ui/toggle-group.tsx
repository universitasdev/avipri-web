"use client"

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

/*
 * ToggleGroup de shadcn/ui como selector segmentado (una opción a la vez), con botones
 * grandes: la opción elegida queda en azul marino.
 */
function ToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-lg border border-brand-border bg-slate-50 p-1",
        className
      )}
      {...props}
    />
  )
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-base font-medium text-slate-600 transition-colors outline-none hover:text-brand-navy focus-visible:ring-2 focus-visible:ring-brand-navy/40 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-brand-navy data-[state=on]:text-white data-[state=on]:shadow-sm [&_svg]:size-5",
        className
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
