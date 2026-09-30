import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"

// WorkoutCalendar — DUMB. The home "search by date" calendar, rebuilt on the new
// design system and NOT a modal: it sits inline on the page at all times. It
// flags logged days, lets the user pick one, navigates months (chevrons + the
// month/year dropdowns), and shows a legend with a "jump to today" shortcut.
//
// Pure leaf, no state: handed the current month + selection + logged days, it
// reports back (onSelect / onMonthChange / onClose). Colours come from the new
// tokens; the shadcn Calendar internals adopt them via the shadcn bridge in
// new-design-system.css. The X is kept for design parity with Home (here onClose
// is whatever the parent passes).

type WorkoutCalendarProps = {
  month: Date
  onMonthChange: (month: Date) => void
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  loggedDates: Date[]
  onClose: () => void
}

// circular grey control chip — the close and month-nav buttons. Uses the border
// grey (base-375) as its fill, matching Home's solid grey circles.
const chip =
  "flex size-9 items-center justify-center rounded-[var(--radius-full)] bg-[var(--border)] p-0 text-[var(--text-primary)] transition-[filter] hover:brightness-125 select-none aria-disabled:opacity-50"

function WorkoutCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  loggedDates,
  onClose,
}: WorkoutCalendarProps) {
  return (
    <div
      className="flex w-full max-w-[400px] flex-col gap-[var(--space-lg)] p-[var(--space-lg)]"
      style={{
        background: "var(--surface)",
        border: "var(--border-width) solid var(--border)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div className="flex justify-end">
        <button type="button" aria-label="Close calendar" onClick={onClose} className={chip}>
          <X className="size-[var(--icon-sm)]" strokeWidth={2} />
        </button>
      </div>

      <Calendar
        // bg-transparent lets the card surface show through; a small cell-size
        // floor lets the 7 columns shrink to fit ~320px and grow on wider cards.
        className="w-full bg-transparent p-0 [--cell-size:--spacing(8)]"
        mode="single"
        animate
        fixedWeeks
        captionLayout="dropdown"
        startMonth={new Date(1900, 0)}
        endMonth={new Date(new Date().getFullYear(), 11)}
        month={month}
        onMonthChange={onMonthChange}
        selected={selected}
        onSelect={onSelect}
        modifiers={{ logged: loggedDates }}
        classNames={{
          root: "w-full",
          // drop the default grey "today" fill — today is a brand ring instead
          today: "",
          caption_label:
            "inline-flex items-center gap-[var(--space-xs)] font-bold text-[length:var(--text-md)] text-[var(--text-primary)] [&>svg]:size-[var(--icon-sm)] [&>svg]:text-[var(--text-muted)]",
          dropdowns: "flex h-(--cell-size) w-full items-center justify-center gap-[var(--space-sm)]",
          button_previous: chip,
          button_next: chip,
          // month-change slide/fade (keyframes live in globals.css)
          weeks_before_enter: "cal-weeks-before-enter",
          weeks_before_exit: "cal-weeks-before-exit",
          weeks_after_enter: "cal-weeks-after-enter",
          weeks_after_exit: "cal-weeks-after-exit",
          caption_before_enter: "cal-caption-before-enter",
          caption_before_exit: "cal-caption-before-exit",
          caption_after_enter: "cal-caption-after-enter",
          caption_after_exit: "cal-caption-after-exit",
        }}
        components={{
          DayButton: (dayProps) => (
            <CalendarDayButton
              {...dayProps}
              className={cn(
                dayProps.className,
                // days spilling in from the neighbouring month
                dayProps.modifiers.outside && "text-[var(--text-faint)]",
                // a logged day: a translucent brand fill inset behind the number
                // (inset-4 so back-to-back logged days don't touch)
                dayProps.modifiers.logged &&
                  "before:absolute before:inset-[4px] before:-z-10 before:rounded-[var(--cell-radius)] before:bg-[color-mix(in_srgb,var(--brand)_25%,transparent)] before:content-['']",
                // today: a brand ring only — the number keeps the normal in-month
                // text colour so it stays readable. drawn with after: so a
                // logged+today day keeps its fill too.
                dayProps.modifiers.today &&
                  "after:absolute after:inset-[4px] after:rounded-[var(--radius-full)] after:border-2 after:border-[var(--brand)] after:content-['']",
              )}
            />
          ),
        }}
      />

      {/* divider */}
      <div style={{ height: "var(--border-width)", background: "var(--border)" }} />

      {/* legend so the fills read clearly */}
      <div
        className="flex items-center justify-between"
        style={{
          color: "var(--text-muted)",
          fontSize: "var(--text-sm)",
          lineHeight: "var(--leading-sm)",
        }}
      >
        <span className="flex items-center gap-[var(--space-sm)]">
          <span
            className="size-[var(--icon-sm)]"
            style={{
              borderRadius: "var(--radius-sm)",
              background: "color-mix(in srgb, var(--brand) 25%, transparent)",
            }}
          />
          Logged Workout
        </span>
        <button
          type="button"
          onClick={() => onMonthChange(new Date())}
          className="flex items-center gap-[var(--space-sm)] outline-none transition-colors hover:text-[var(--text-primary)]"
        >
          <span className="size-[var(--icon-sm)] rounded-[var(--radius-full)] ring-2 ring-inset ring-[var(--brand)]" />
          Jump to today
        </button>
      </div>
    </div>
  )
}

export default WorkoutCalendar
