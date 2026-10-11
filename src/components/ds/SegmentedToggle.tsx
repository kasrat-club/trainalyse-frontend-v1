import { cn } from "@/lib/utils"

// SegmentedToggle — DUMB. A pill-shaped two-option selector (kg/lbs, cm/ft): a
// darker --background track with the SELECTED segment shown as a light pill —
// the exact --text-primary fill + navy text of the primary button, so it reads
// as one system without being a button. It's a SELECTOR (one of N stays chosen),
// not an action, which is why it's its own component. Controlled: the value +
// handler live in the parent.
//
// Sized with --size-toggle so it sits with a 4px inset inside a --control-sm pill
// input. Inactive segments are muted and, per the hover model, brighten to
// primary on hover; the active segment is the selected state and doesn't recolour.

type Option = { value: string; label: string }

type SegmentedToggleProps = {
  options: Option[]
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}

function SegmentedToggle({ options, value, onChange, ariaLabel }: SegmentedToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex h-[var(--size-toggle)] items-center rounded-[var(--radius-full)] p-[var(--space-2xs)]"
      style={{ background: "var(--background)" }}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-full rounded-[var(--radius-full)] px-[var(--space-md)] transition-colors",
              active
                ? "bg-[var(--text-primary)] text-[var(--background)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            )}
            style={{
              fontSize: "var(--text-sm)",
              lineHeight: "var(--leading-sm)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedToggle
