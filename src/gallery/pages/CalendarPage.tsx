import { useState } from "react"

import WorkoutCalendar from "@/components/ds/calendar/WorkoutCalendar"
import { heading, muted } from "../styles"

// Calendar — the home "search by date" calendar. The REAL ds WorkoutCalendar,
// already built on the new atoms: the outline IconButton close, the month-nav
// chips (identical to that IconButton, but rendered by react-day-picker so they
// can't literally be it), brand-ring today, translucent-brand logged days and
// the --icon-sm legend. A harness holds month + selection so it's fully live.

function CalendarPage() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Calendar</h2>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Home search-by-date calendar (navigate months, pick a day)</span>
        <CalendarShowcase />
      </section>
    </div>
  )
}

// Demo harness: current month + picked date + sample logged days. Selecting and
// navigating are live; the X is a no-op here (it's a modal action on Home).
function CalendarShowcase() {
  const today = new Date()
  const [month, setMonth] = useState(today)
  const [selected, setSelected] = useState<Date | undefined>(undefined)

  const loggedDates = [3, 8, 9, 17, 22].map(
    (d) => new Date(today.getFullYear(), today.getMonth(), d),
  )

  return (
    <WorkoutCalendar
      month={month}
      onMonthChange={setMonth}
      selected={selected}
      onSelect={setSelected}
      loggedDates={loggedDates}
      onClose={() => {}}
    />
  )
}

export default CalendarPage
