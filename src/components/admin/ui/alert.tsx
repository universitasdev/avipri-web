import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* Alert de shadcn/ui con las variantes que usa el panel: errores, éxito e información. */
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-xl border-2 px-5 py-4 text-base has-[>svg]:grid-cols-[calc(var(--spacing)*7)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-6 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "border-brand-border bg-white text-brand-text [&>svg]:text-brand-navy",
        destructive: "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600",
        success: "border-emerald-300 bg-emerald-50 text-emerald-950 [&>svg]:text-emerald-600",
        info: "border-sky-300 bg-sky-50 text-sky-950 [&>svg]:text-sky-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("col-start-2 grid justify-items-start gap-1 text-base leading-relaxed", className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
