import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { CalendarModal } from "./CalendarModal"
import React from "react"

interface DatePickerDemoProps {
  initialDate?: string
  onDateChange?: (date: Date | undefined) => void
}

export function DatePickerDemo({
  initialDate,
  onDateChange,
}: DatePickerDemoProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    initialDate ? parseISO(initialDate) : undefined
  )
  const [open, setOpen] = React.useState<boolean>(false)

  function handleSelect(selected: Date | undefined) {
    setDate(selected)
    onDateChange?.(selected)
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {date ? format(date, "EEE, d MMM yyyy") : <span>Pick a date</span>}
      </Button>

      {open && (
        <CalendarModal
          onClose={() => setOpen(false)}
          selected={date}
          onSelect={handleSelect}
          // no logging workouts in the future
          maxDate={new Date()}
          // floor at the 1st of the month three months back (e.g. in Aug 2026 →
          // 1 May 2026; in Sep → 1 Jun): you can log/edit a workout up to three
          // months old, month-wise, and nothing older. the Date constructor
          // normalises a negative month into the previous year (Feb → Nov). this
          // is also what startMonth keys off, so the left chevron auto-hides once
          // the calendar reaches the floor month.
          minDate={new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1)}
        />
      )}
    </>
  )
}
