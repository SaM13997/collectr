import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, type HTMLMotionProps } from "motion/react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[9px] text-sm font-medium transition-[box-shadow,background-color] disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none active:transition-none outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 shrink-0",
  {
    variants: {
      variant: {
        default: [
          "bg-[#36322F]",
          "text-[#fff]",
          "hover:enabled:bg-[#4a4542]",
          "disabled:bg-[#8c8885]",
          "[box-shadow:inset_0px_-2.108433723449707px_0px_0px_#171310,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(58,_33,_8,_58%)]",
          "hover:enabled:[box-shadow:inset_0px_-2.53012px_0px_0px_#171310,_0px_1.44578px_7.59036px_0px_rgba(58,_33,_8,_64%)]",
          "disabled:shadow-none",
          "active:bg-[#2A2724]",
          "active:[box-shadow:inset_0px_-1.5px_0px_0px_#171310,_0px_0.5px_2px_0px_rgba(58,_33,_8,_70%)]",
        ],
        primary: [
          "bg-[#2C7BE5]",
          "text-[#fff]",
          "hover:enabled:bg-[#3D8DF5]",
          "disabled:bg-[#9FC3F5]",
          "[box-shadow:inset_0px_-2.108433723449707px_0px_0px_#1A68D1,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(28,_100,_242,_58%)]",
          "hover:enabled:[box-shadow:inset_0px_-2.53012px_0px_0px_#2C7BE5,_0px_1.44578px_7.59036px_0px_rgba(28,_100,_242,_64%)]",
          "disabled:shadow-none",
          "active:bg-[#1A68D1]",
          "active:[box-shadow:inset_0px_-1.5px_0px_0px_#1554AB,_0px_0.5px_2px_0px_rgba(28,_100,_242,_70%)]",
        ],
        secondary: [
          "bg-[#FFFFFF]",
          "text-[#36322F]",
          "hover:enabled:bg-[#F8F8F8]",
          "disabled:bg-[#F0F0F0]",
          "[box-shadow:inset_0px_-2.108433723449707px_0px_0px_#E0E0E0,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(0,_0,_0,_10%)]",
          "hover:enabled:[box-shadow:inset_0px_-2.53012px_0px_0px_#E8E8E8,_0px_1.44578px_7.59036px_0px_rgba(0,_0,_0,_12%)]",
          "disabled:shadow-none",
          "border",
          "border-[#E0E0E0]",
          "active:bg-[#F0F0F0]",
          "active:[box-shadow:inset_0px_-1.5px_0px_0px_#D8D8D8,_0px_0.5px_2px_0px_rgba(0,_0,_0,_15%)]",
        ],
        destructive: [
          "bg-[#E6492D]",
          "text-[#fff]",
          "hover:enabled:bg-[#F05B41]",
          "disabled:bg-[#F5A799]",
          "[box-shadow:inset_0px_-2.108433723449707px_0px_0px_#D63A1F,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(214,_58,_31,_58%)]",
          "hover:enabled:[box-shadow:inset_0px_-2.53012px_0px_0px_#E6492D,_0px_1.44578px_7.59036px_0px_rgba(214,_58,_31,_64%)]",
          "disabled:shadow-none",
          "active:bg-[#D63A1F]",
          "active:[box-shadow:inset_0px_-1.5px_0px_0px_#B22E17,_0px_0.5px_2px_0px_rgba(214,_58,_31,_70%)]",
        ],
        outline: [
          "bg-[#FFFFFF]",
          "text-[#36322F]",
          "hover:enabled:bg-[#F8F8F8]",
          "disabled:bg-[#F0F0F0]",
          "[box-shadow:inset_0px_-2.108433723449707px_0px_0px_#E0E0E0,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(0,_0,_0,_10%)]",
          "hover:enabled:[box-shadow:inset_0px_-2.53012px_0px_0px_#E8E8E8,_0px_1.44578px_7.59036px_0px_rgba(0,_0,_0,_12%)]",
          "disabled:shadow-none",
          "border",
          "border-[#E0E0E0]",
          "active:bg-[#F0F0F0]",
          "active:[box-shadow:inset_0px_-1.5px_0px_0px_#D8D8D8,_0px_0.5px_2px_0px_rgba(0,_0,_0,_15%)]",
        ],
        ghost: "transition-colors duration-150 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 transition-colors duration-150 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3 text-base",
        sm: "h-9 rounded-[8px] px-3 has-[>svg]:px-2.5 text-xs py-1",
        lg: "h-14 rounded-[11px] px-6 py-3 has-[>svg]:px-4 text-lg",
        icon: "size-11 min-h-11 min-w-11",
        "icon-sm": "size-9 min-h-9 min-w-9",
        "icon-lg": "size-14 min-h-14 min-w-14",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, asChild = false, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          data-slot="button"
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    // Convert string ref to callback or use as is (Framer Motion usually handles standard refs)
    return (
      <motion.button
        ref={ref as any}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        {...(props as any)}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        <motion.span
          initial={{ opacity: 1 }}
          animate={{ opacity: loading ? 0.7 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center gap-2"
        >
          {children}
        </motion.span>
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
