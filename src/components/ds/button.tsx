import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button as ShadButton } from "@/components/ui/button"

// Design-system Button.
//
// This is NOT a rebuilt button — it WRAPS the shared shadcn <Button>, so every
// shadcn behavior is inherited untouched: the press bounce (active:translate-y),
// focus ring, keyboard/accessibility handling, disabled state, icon sizing and
// asChild. We only layer OUR look on top: color, padding and text size.
//
// How the override works: shadcn's default variant paints bg-primary /
// text-primary-foreground; the classes below are appended AFTER those, so
// tailwind-merge lets ours win for the exact properties we change (background,
// text colour, padding, height, font-size) while leaving all the behaviour
// classes in shadcn's base alone.
//
// Tokens come from new-design-system.css and only resolve inside a `.ds-scope`
// wrapper, so this component is styled only where that scope is present.

const dsButtonVariants = cva("", {
  variants: {
    // The three looks. Behaviour is identical across them — only colour differs.
    variant: {
      // The minimal token set has no hover/active COLOUR shades, so hover and
      // press are expressed as behaviour (opacity / brightness) instead of a
      // second colour token — see new-design-system.css.
      primary:
        "border-transparent bg-[var(--brand)] text-[color:var(--on-brand)] hover:opacity-90 active:opacity-80",
      secondary:
        "border-[var(--border)] bg-[var(--surface)] text-[color:var(--text-primary)] hover:brightness-125 active:brightness-110",
      default:
        "border-[var(--border)] bg-transparent text-[color:var(--text-primary)] hover:bg-[var(--surface)] active:bg-[var(--surface)]",
    },
    // Padding + height + text size. (Corner radius & the press bounce stay as
    // shadcn set them.) The scale only goes sm/md/lg, and the largest space
    // token is --space-lg, so lg reuses it for padding and grows via height.
    size: {
      sm: "h-9 px-[var(--space-md)] text-[length:var(--text-sm)]",
      md: "h-10 px-[var(--space-lg)] text-[length:var(--text-md)]",
      lg: "h-12 px-[var(--space-lg)] text-[length:var(--text-md)]",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})

// Take shadcn's button props but swap ITS variant/size types for ours.
type DSButtonProps = Omit<
  React.ComponentProps<typeof ShadButton>,
  "variant" | "size"
> &
  VariantProps<typeof dsButtonVariants>

function Button({ variant, size, className, ...props }: DSButtonProps) {
  // variant/size drive OUR classes only; they are not forwarded to ShadButton,
  // which keeps its own default variant as the behaviour base we paint over.
  return (
    <ShadButton
      className={cn(dsButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, dsButtonVariants }
