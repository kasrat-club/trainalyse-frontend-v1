import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// CalendarButton — DUMB. A 36px pill icon-button showing the calendar glyph.
// It fires an onClick but deliberately does NOT open a calendar — the calendar
// itself is a separate component. This is only the trigger shell.

type CalendarButtonProps = {
  onClick?: () => void
  className?: string
}

function CalendarButton({ onClick, className }: CalendarButtonProps) {
  return (
    <button
      type="button"
      aria-label="Search by date"
      onClick={onClick}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border)] bg-transparent text-[var(--text-primary)] transition-colors hover:bg-[var(--surface)]",
        className,
      )}
    >
      <CalendarIcon className="size-[var(--icon-sm)]" strokeWidth={2.25} />
    </button>
  )
}

export default CalendarButton
