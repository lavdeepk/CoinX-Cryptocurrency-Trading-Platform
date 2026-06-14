// Reusable UI component module for button.
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-cyan-300/35 bg-cyan-300/12 text-cyan-100 shadow-[0_8px_20px_rgba(8,47,73,0.22)] hover:border-cyan-300/55 hover:bg-cyan-300/18",
        destructive:
          "bg-red-500 text-white shadow-[0_8px_20px_rgba(239,68,68,0.2)] hover:bg-red-400",
        outline:
          "border border-white/15 bg-slate-900/70 text-slate-100 shadow-sm hover:border-cyan-300/40 hover:bg-white/10",
        secondary:
          "bg-slate-800 text-slate-100 shadow-sm hover:bg-slate-700/90",
        ghost: "text-slate-200 hover:bg-white/10 hover:text-white",
        link: "text-cyan-300 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const normalizedVariant = variant || "default";
  const normalizedSize = size || "default";
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant: normalizedVariant, size: normalizedSize, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
