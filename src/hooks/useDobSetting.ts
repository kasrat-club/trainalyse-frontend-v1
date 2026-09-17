import React from "react"
import { format, parseISO } from "date-fns"
import { user } from "@/data/user"

// The "brain" of the Settings "Date of birth" row: the committed DOB and the
// calendar-modal open state. Picking a day in CalendarModal commits it and the
// modal closes itself (onSelect then onClose), so there's no separate Save step —
// same flow as the Moreinfo DOB field. Frontend-only for now: it just holds local
// state; the backend write slots in at handleSelectDob when auth lands.
export function useDobSetting() {
  const [dob, setDob] = React.useState<Date | undefined>(() =>
    user.dob ? parseISO(user.dob) : undefined
  )
  const [calendarOpen, setCalendarOpen] = React.useState(false)

  function openCalendar() {
    setCalendarOpen(true)
  }
  function closeCalendar() {
    setCalendarOpen(false)
  }
  // CalendarModal calls this the moment a day is picked, then closes itself.
  function handleSelectDob(next: Date | undefined) {
    setDob(next)
  }

  return {
    dob,
    dobLabel: dob ? format(dob, "d MMM yyyy") : "Not set",
    calendarOpen,
    openCalendar,
    closeCalendar,
    handleSelectDob,
  }
}
