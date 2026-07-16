import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-900 text-zinc-100",
        secondary:
          "border-transparent bg-zinc-950 text-zinc-450",
        destructive:
          "border-transparent bg-rose-500/15 text-rose-450 border border-rose-500/30",
        outline: "text-zinc-200 border-zinc-900",
        success: "border-transparent bg-emerald-500/15 text-emerald-450 border border-emerald-500/30",
        warning: "border-transparent bg-amber-500/15 text-amber-450 border border-amber-500/30",
        info: "border-transparent bg-blue-500/15 text-blue-450 border border-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
