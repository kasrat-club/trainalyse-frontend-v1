import DsCalendar from "./DsCalendar"
import Separator from "@/components/ds/Separator"

// WorkoutCalendar — DUMB. The home "search by date" calendar: the shared
// DsCalendar panel plus the two workout-specific extras — logged days (the gold
// fills) and the legend ("Logged Workout" + "Jump to today"). Everything visual
// (card shell, close X, day cells, amber selected circle, month/year dropdowns)
// lives in DsCalendar so this and the birthdate picker can't drift apart.
//
// Pure leaf, no state: handed the current month + selection + logged days, it
// reports back (onSelect / onMonthChange / onClose).

type WorkoutCalendarProps = {
  month: Date
  onMonthChange: (month: Date) => void
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  loggedDates: Date[]
  onClose: () => void
}

function WorkoutCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  loggedDates,
  onClose,
}: WorkoutCalendarProps) {
  return (
    <DsCalendar
      month={month}
      onMonthChange={onMonthChange}
      selected={selected}
      onSelect={onSelect}
      onClose={onClose}
      modifiers={{ logged: loggedDates }}
      footer={
        <>
          <Separator />

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
                  borderRadius: "var(--radius-full)",
                  background: "var(--brand-500)",
                }}
              />
              Logged Workout
            </span>
            <button
              type="button"
              onClick={() => onMonthChange(new Date())}
              // this text rests at --text-muted (inherited from the legend), so on
              // hover it brightens UP to --text-primary; the brand ring glows to the
              // lightest brand (--brand-100).
              className="group flex items-center gap-[var(--space-sm)] outline-none transition-colors hover:text-[var(--text-primary)]"
            >
              <span className="size-[var(--icon-sm)] rounded-[var(--radius-full)] ring-2 ring-inset ring-[var(--brand)] transition-shadow group-hover:ring-[var(--brand-100)]" />
              Jump to today
            </button>
          </div>
        </>
      }
    />
  )
}

export default WorkoutCalendar
