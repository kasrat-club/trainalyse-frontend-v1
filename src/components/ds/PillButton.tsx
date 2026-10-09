import type { ComponentProps, ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button as ShadButton } from "@/components/ui/button"

// PillButton — the design system's labelled pill button, used for the confirm
// modal's actions (Cancel / Discard), the login button, and anywhere a text pill
// is needed. Wraps the shadcn Button (ghost) so press / focus / a11y come for
// free, and paints our look on top. Three variants:
//   primary     — THE main action (Login / Save): a light --text-primary fill
//                 with navy --background text; on hover the FILL darkens one step
//                 to --text-muted (navy text unchanged).
//   brand       — the amber signature pill (Clear Date): a --brand fill with navy
//                 --on-brand text; on hover the fill lifts to --brand-hover.
//   neutral     — grey --border outline; on hover lifts to --surface-hover and the
//                 edge brightens to --border-hover. The text stays primary (already
//                 the brightest — the surface/border lift is the feedback).
//   destructive — --danger-hover (soft red) outline + --danger text; on hover the
//                 fill turns --surface-hover-danger and the text lightens.
// HOVER MODEL: colours below primary (muted/faint) brighten UP to primary on
// hover; things already at primary don't recolour — their fill/border does the
// work. All are --control-sm tall, full pills. The dark:hover mirrors each fill
// to beat shadcn ghost's own dark:hover (higher specificity).

const pillButtonVariants = cva(
  "h-[var(--control-sm)] min-w-[var(--width-pill-min)] rounded-[var(--radius-full)] border bg-transparent px-[var(--space-lg)] transition-colors",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-[var(--text-primary)] text-[var(--background)] hover:bg-[var(--text-muted)] dark:hover:bg-[var(--text-muted)] hover:text-[var(--background)] dark:hover:text-[var(--background)]",
        brand:
          "border-transparent bg-[var(--brand)] text-[var(--on-brand)] hover:bg-[var(--brand-hover)] dark:hover:bg-[var(--brand-hover)] hover:text-[var(--on-brand)] dark:hover:text-[var(--on-brand)]",
        neutral:
          "border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] dark:hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)]",
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
