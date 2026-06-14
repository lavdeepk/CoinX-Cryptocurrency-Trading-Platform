// Reusable UI component module for badge.
import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300/35",
  {
    variants: {
      variant: {
        default:
          "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
        secondary:
          "border-white/20 bg-white/10 text-slate-100",
        destructive:
          "border-red-400/30 bg-red-400/15 text-red-200",
        outline: "border-white/20 text-slate-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
