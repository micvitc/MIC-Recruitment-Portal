import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, icon, ...props }, ref) => {
    return (
      <div className="relative inline-flex w-full items-center">
        {icon && <div className="absolute left-3 text-zinc-500 pointer-events-none">{icon}</div>}
        <select
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-zinc-900 bg-zinc-950 py-2.5 pr-10 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer transition-all",
            icon ? "pl-9" : "pl-4",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 h-4 w-4 text-zinc-500 pointer-events-none" />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
