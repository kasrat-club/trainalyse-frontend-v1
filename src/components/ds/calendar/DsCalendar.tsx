import type { ComponentProps, ReactNode } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import IconButton from "@/components/ds/IconButton"

// DsCalendar — the shared styled calendar panel behind BOTH the workout (home)
// date search and the birthdate picker, so they stay visually identical and one
// change to day styling moves them together. It owns the card shell + close X,
// the month/year dropdowns, the chevron chips, and ALL the day-cell styling: the
// amber (--brand) selected circle, the plain hover, and the outside / today /
// logged / disabled treatments. Callers pass only what differs — the workout one
// adds a `logged` modifier + a `footer` legend; the birthdate one disables future
// dates. Pure leaf, no state.

// outline control chip for the month-nav buttons (rendered by react-day-picker
// via classNames, so they can't be our IconButton). Kept visually identical to
// the outline IconButton (close button) — same border, size and hover.
const chip =
  "flex size-[var(--control-sm)] items-center justify-center rounded-[var(--radius-full)] border border-[var(--border)] bg-transparent p-0 text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] select-none aria-disabled:opacity-50"

type DsCalendarProps = {
  month: Date
  onMonthChange: (month: Date) => void
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  onClose: () => void
  modifiers?: ComponentProps<typeof Calendar>["modifiers"]
  disabled?: ComponentProps<typeof Calendar>["disabled"]
  startMonth?: Date
  endMonth?: Date
  footer?: ReactNode
}

function DsCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  onClose,
  modifiers,
  disabled,
  startMonth = new Date(1900, 0),
  endMonth = new Date(new Date().getFullYear(), 11),
  footer,
}: DsCalendarProps) {
  return (
    <div
      className="flex w-full max-w-[var(--width-calendar)] flex-col gap-[var(--space-lg)] p-[var(--space-lg)]"
      style={{
        background: "var(--surface)",
        border: "var(--border-width) solid var(--border)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div className="flex justify-end">
        <IconButton variant="outline" icon={X} aria-label="Close calendar" onClick={onClose} />
      </div>

      <Calendar
        // bg-transparent lets the card surface show through; a small cell-size
        // floor lets the 7 columns shrink to fit ~320px and grow on wider cards.
        className="w-full bg-transparent p-0 [--cell-size:--spacing(8)]"
        mode="single"
        animate
        fixedWeeks
        captionLayout="dropdown"
        startMonth={startMonth}
        endMonth={endMonth}
        month={month}
        onMonthChange={onMonthChange}
        selected={selected}
        onSelect={onSelect}
        modifiers={modifiers}
        disabled={disabled}
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
          // override shadcn's chevron (a hard size-4) so the nav + dropdown
          // glyphs use our --icon-sm token instead of a literal pixel size.
          Chevron: ({ className, orientation, ...props }) => {
            const Icon =
              orientation === "left"
                ? ChevronLeft
                : orientation === "right"
                  ? ChevronRight
                  : ChevronDown
            return <Icon className={cn("size-[var(--icon-sm)]", className)} {...props} />
          },
          DayButton: (dayProps) => (
            <CalendarDayButton
              {...dayProps}
              className={cn(
                dayProps.className,
                // Every day indicator is a CIRCLE and every fill lives in one inset
                // ::before pseudo, so selected / logged are the exact same size.
                // Neutralise shadcn's full-cell selected bg AND the ghost full-cell
                // hover box so this component fully controls fill + hover.
                // rounded-full is !important to beat the parent cell's leftover
                // range rounding (rounded-l/r-(--cell-radius)) that shadcn forces on
                // the FIRST/LAST column's selected button — otherwise the focus ring
                // follows a mixed radius and renders as a "bell" on edge days.
                "rounded-[var(--radius-full)]! data-[selected-single=true]:bg-transparent hover:bg-transparent dark:hover:bg-transparent before:absolute before:inset-[var(--space-xs)] before:-z-10 before:rounded-[var(--radius-full)] before:content-['']",
                // SELECTED: bright-amber (--brand) fill; on hover it brightens to
                // --brand-hover and the navy number stays navy.
                "data-[selected-single=true]:before:bg-[var(--brand)] data-[selected-single=true]:hover:before:bg-[var(--brand-hover)] data-[selected-single=true]:hover:text-[var(--on-brand)] dark:data-[selected-single=true]:hover:text-[var(--on-brand)]",
                // PLAIN day hover: a faint --surface-hover circle appears behind
                // the number; the number stays primary (the circle is the feedback).
                "hover:before:bg-[var(--surface-hover)]",
                // DISABLED days (e.g. future dates on the birthdate picker): faint
                // and non-interactive. Inert on calendars that disable nothing.
                "disabled:pointer-events-none disabled:text-[var(--text-faint)]",
                // days spilling in from the neighbouring month
                dayProps.modifiers.outside && "text-[var(--text-faint)]",
                // LOGGED: dark-gold (--brand-500) fill + navy number; on hover the
                // gold brightens one step to --brand-400 and the number stays navy.
                dayProps.modifiers.logged &&
                  "text-[var(--on-brand)] before:bg-[var(--brand-500)] hover:before:bg-[var(--brand-400)] hover:text-[var(--on-brand)] dark:hover:text-[var(--on-brand)]",
                // TODAY: a brand ring (never a fill) that brightens to the lightest
                // brand (--brand-100) on hover. after: so logged+today keeps its fill.
                dayProps.modifiers.today &&
                  "after:absolute after:inset-[var(--space-xs)] after:rounded-[var(--radius-full)] after:border-[length:var(--border-width-thick)] after:border-[var(--brand)] after:content-[''] hover:after:border-[var(--brand-100)]",
              )}
            />
          ),
        }}
      />

      {footer}
    </div>
  )
}

export default DsCalendar
