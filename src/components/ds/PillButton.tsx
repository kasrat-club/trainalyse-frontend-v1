import type { ComponentProps, ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button as ShadButton } from "@/components/ui/button"

// PillButton — the design system's labelled pill button, used for the confirm
// modal's actions (Cancel / Discard) and anywhere a text pill is needed. Wraps
// the shadcn Button (ghost) so press / focus / a11y come for free, and paints our
// look on top. Two variants:
//   neutral     — grey --border outline; on hover lifts to --surface-hover, the
//                 edge brightens to --border-hover and the text to --text-hover.
//   destructive — --danger-hover (soft red) outline + --danger text; on hover the
//                 fill turns --surface-hover-danger and the text lightens.
// Both are --control-sm tall, full pills. The dark:hover mirrors each fill to
// beat shadcn ghost's own dark:hover (higher specificity).

const pillButtonVariants = cva(
  "h-[var(--control-sm)] min-w-[92px] rounded-[var(--radius-full)] border bg-transparent px-[var(--space-lg)] transition-colors",
  {
    variants: {
      variant: {
        neutral:
          "border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] dark:hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] hover:text-[var(--text-hover)]",
        destructive:
          "border-[var(--danger-hover)] text-[var(--danger)] hover:bg-[var(--surface-hover-danger)] dark:hover:bg-[var(--surface-hover-danger)] hover:text-[var(--danger-hover)]",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
)

type PillButtonProps = Omit<ComponentProps<typeof ShadButton>, "variant"> &
  VariantProps<typeof pillButtonVariants> & {
    children: ReactNode
  }

function PillButton({
  variant = "neutral",
  className,
  style,
  children,
  ...props
}: PillButtonProps) {
  return (
    <ShadButton
      variant="ghost"
      className={cn(pillButtonVariants({ variant }), className)}
      style={{
        fontSize: "var(--text-sm)",
        lineHeight: "var(--leading-sm)",
        fontWeight: "var(--font-weight-bold)",
        ...style,
      }}
      {...props}
    >
      {children}
    </ShadButton>
  )
}

export default PillButton
