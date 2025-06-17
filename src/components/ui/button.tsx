import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:scale-[1.02] active:scale-[0.98] font-display",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-white hover:shadow-glow shadow-soft",
        destructive:
          "bg-gradient-danger text-white hover:shadow-glow shadow-soft",
        outline:
          "border-2 border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-primary hover:text-primary hover:shadow-soft transition-all duration-300",
        secondary:
          "bg-gradient-surface text-gray-800 hover:shadow-soft shadow-sm border border-gray-200/50",
        ghost: "hover:bg-white/60 hover:text-primary rounded-xl backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-purple-600 transition-colors",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-14 rounded-2xl px-10 text-lg font-bold",
        icon: "h-11 w-11 rounded-xl",
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
