import { cn } from "@/lib/utils"
import { Button as ShadButton } from "@/components/ui/button"

// ClearDateButton — DUMB. The solid-brand "Clear Date" button that appears
// centred on Home while a date filter is active. Wraps the shadcn Button
// (variant="ghost") for the press / focus behaviour and paints the brand look on
// top: a --brand fill that lightens to --brand-hover on hover (dark:hover mirrors
// it to beat shadcn's own dark hover), dark --on-brand text, soft --radius-md.

type ClearDateButtonProps = {
  onClick?: () => void
  className?: string
}

function ClearDateButton({ onClick, className }: ClearDateButtonProps) {
  return (
    <ShadButton
      variant="ghost"
      onClick={onClick}
      className={cn(
        "h-[var(--control-sm)] rounded-[var(--radius-md)] bg-[var(--brand)] px-[var(--space-lg)] transition-colors hover:bg-[var(--brand-hover)] dark:hover:bg-[var(--brand-hover)]",
        className,
      )}
      style={{
        color: "var(--on-brand)",
        fontSize: "var(--text-sm)",
        lineHeight: "var(--leading-sm)",
        fontWeight: "var(--font-weight-bold)",
      }}
    >
      Clear Date
    </ShadButton>
  )
}

export default ClearDateButton
