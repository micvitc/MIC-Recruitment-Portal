import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)] active:scale-95",
        destructive:
          "bg-rose-500 text-white hover:bg-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)] active:scale-95",
        outline:
          "border border-zinc-900 bg-zinc-950/60 text-zinc-300 hover:bg-zinc-900 hover:text-white active:scale-95",
        secondary:
          "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white active:scale-95",
        ghost: "text-zinc-400 hover:bg-zinc-900 hover:text-white active:scale-95",
        link: "text-teal-400 underline-offset-4 hover:underline",
        emerald: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95",
      },
      size: {
        default: "px-4 py-2.5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
