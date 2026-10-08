import { CalendarIcon } from "lucide-react"

import IconButton from "@/components/ds/IconButton"

// CalendarButton — DUMB. The header's date-search button: the outline IconButton
// with the calendar glyph. It fires onClick but opens nothing — the calendar is
// a separate component. A thin, named wrapper over the shared IconButton so the
// header reads clearly and the look stays identical everywhere.

type CalendarButtonProps = {
  onClick?: () => void
  className?: string
}

function CalendarButton({ onClick, className }: CalendarButtonProps) {
  return (
    <IconButton
      variant="outline"
      icon={CalendarIcon}
      aria-label="Search by date"
      onClick={onClick}
      className={className}
    />
  )
}

export default CalendarButton
