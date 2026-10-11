import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// DateField — DUMB. A read-only trigger field shaped like the text inputs (same
// pill, border, height) that shows the chosen date or a placeholder plus a
// trailing calendar glyph, and opens the date picker when tapped. It's a BUTTON,
// not a text input — you don't type a date here, you pick it. Controlled by the
// parent: it just displays `value` (a pre-formatted string) and reports taps.

type DateFieldProps = {
  value?: string
  placeholder?: string
  onClick?: () => void
  error?: boolean
  id?: string
}

function DateField({
  value,
  placeholder = "Select your date of birth",
  onClick,
  error = false,
  id,
}: DateFieldProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[var(--control-sm)] w-full items-center justify-between gap-[var(--space-sm)] rounded-[var(--radius-full)] border bg-transparent px-[var(--space-lg)] text-left outline-none transition-colors",
        error
          ? "border-[var(--danger)] shadow-[var(--shadow-focus-danger)]"
          : "border-[var(--border)] focus-visible:border-[var(--border-hover)] focus-visible:shadow-[var(--shadow-focus)]",
      )}
    >
      <span
        className="min-w-0 truncate"
        style={{
          color: error
            ? "var(--danger)"
            : value
              ? "var(--text-primary)"
              : "var(--text-muted)",
          fontSize: "var(--text-md)",
          lineHeight: "var(--leading-md)",
        }}
      >
        {value ?? placeholder}
      </span>
      <CalendarIcon
        className="size-[var(--icon-sm)] shrink-0"
        style={{ color: error ? "var(--danger)" : "var(--text-muted)" }}
      />
    </button>
  )
}

export default DateField
