import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { value?: number; indicatorClassName?: string }
>(({ className, value = 0, indicatorClassName, ...props }, ref) => {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0

  return (
    <div
      ref={ref}
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn("bg-primary h-full w-full flex-1 transition-all", indicatorClassName)}
        style={{ transform: `translateX(-${100 - safeValue}%)` }}
      />
    </div>
  )
})

Progress.displayName = "Progress"

export { Progress }

