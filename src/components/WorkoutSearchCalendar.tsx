import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { X } from "lucide-react"
import { useScrollLock } from "@/hooks/use-scroll-lock"
import { cn } from "@/lib/utils"

// The "search by date" modal on Home: a full-screen scrim + a calendar card that
// flags logged days and lets the user pick one. A pure leaf — it holds no state.
// It's handed the current month + selection + the logged days, and reports back
// (onSelect / onMonthChange / onClose); the page (via useWorkoutTimeline) owns
// what those do. It only mounts while open, so it locks background scroll itself.
type WorkoutSearchCalendarProps = {
  month: Date
  onMonthChange: (month: Date) => void
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  loggedDates: Date[]
  onClose: () => void
}

export function WorkoutSearchCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  loggedDates,
  onClose,
}: WorkoutSearchCalendarProps) {
  // freeze the page behind while the modal is open so it can't scroll
  useScrollLock(true)
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-[var(--space-lg)] backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 16px padding on every side, dark surface. stopPropagation so taps
          inside the card don't bubble up and close the modal */}
      <Card
        className="w-full max-w-[400px] gap-[var(--space-lg)] rounded-[var(--radius-card)] border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] p-[var(--space-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close calendar"
            onClick={onClose}
            className="size-9 rounded-full bg-[var(--bg-surface-secondary)] text-[var(--text-primary)]"
          >
            <X className="size-5" strokeWidth={2} />
          </Button>
        </div>

        <Calendar
          // bg-transparent lets the card surface show through (the base
          // Calendar ships bg-background); a small cell-size floor lets the
          // 7 columns shrink to fit 320px and grow to fill wider screens.
          className="w-full bg-transparent p-0 [--cell-size:--spacing(8)]"
          mode="single" // allows only one date selection and not a range
          // slide the weeks left/right when the user changes month
          animate
          // always render 6 week rows so the calendar's height stays constant
          // across months - otherwise a 5-week month is shorter and the
          // vertically-centered modal jumps up or down when you change month
          fixedWeeks
          // month + year dropdowns in the caption, so the user can jump
          // straight to any month/year instead of stepping the chevrons.
          // the range bounds the year dropdown.
          captionLayout="dropdown"
          startMonth={new Date(1900, 0)}
          endMonth={new Date(new Date().getFullYear(), 11)}
          month={month}
          onMonthChange={onMonthChange}
          selected={selected}
          onSelect={onSelect}
          // days carrying a logged workout, so the DayButton can fill them
          modifiers={{ logged: loggedDates }}
          classNames={{
            root: "w-full",
            // drop the default grey "today" fill — today is a neon ring instead
            today: "",
            // dropdown labels ("Aug ˅" / "1998 ˅"): keep them bold, and lay
            // the text out inline with a small muted chevron beside it
            caption_label:
              "inline-flex items-center gap-1 text-lg font-bold text-[var(--text-primary)] [&>svg]:size-4 [&>svg]:text-[var(--text-subheading)]",
            // a little more breathing room between the month and year dropdowns
            dropdowns:
              "flex h-(--cell-size) w-full items-center justify-center gap-2",
            // circular grey nav buttons, matching the close button
            button_previous:
              "flex size-9 items-center justify-center rounded-full bg-[var(--bg-surface-secondary)] p-0 text-[var(--text-primary)] select-none aria-disabled:opacity-50",
            button_next:
              "flex size-9 items-center justify-center rounded-full bg-[var(--bg-surface-secondary)] p-0 text-[var(--text-primary)] select-none aria-disabled:opacity-50",
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
                  dayProps.modifiers.outside &&
                    "text-[var(--text-dateOutside)]",
                  // a logged day: neon-25 fill as an inset layer behind the
                  // number (inset-4 leaves a gap so back-to-back logged days
                  // don't touch), with the number kept full-size on top
                  dayProps.modifiers.logged &&
                    "before:absolute before:inset-[4px] before:-z-10 before:rounded-(--cell-radius) before:bg-[var(--bg-dateLogged)] before:content-['']",
                  // today: neon number plus a neon ring inset to match the
                  // logged box's size. drawn with after: (not before:) so a
                  // day that is both today and logged keeps its fill too.
                  // last so its neon text wins even on an outside-month today
                  dayProps.modifiers.today &&
                    "text-[var(--text-accent)] after:absolute after:inset-[4px] after:rounded-full after:border-2 after:border-[var(--text-accent)] after:content-['']"
                )}
              />
            ),
          }}
        />

        <Separator className="bg-[var(--border-cardEdge)]" />

        {/* legend so the fills read clearly */}
        <div className="flex items-center justify-between text-sm font-medium text-[var(--text-subheading)]">
          <span className="flex items-center gap-[var(--space-sm)]">
            <span className="size-4 rounded-[6px] bg-[var(--bg-dateLogged)]" />
            Logged Workout
          </span>
          <button
            type="button"
            onClick={() => onMonthChange(new Date())}
            className="flex items-center gap-[var(--space-sm)] rounded-md outline-none transition-colors hover:text-[var(--text-primary)]"
          >
            <span className="size-4 rounded-full ring-2 ring-[var(--text-accent)] ring-inset" />
            Jump to today
          </button>
        </div>
      </Card>
    </div>
  )
}
