import DsCalendar from "./DsCalendar"

// DobCalendar — DUMB. The birthdate picker: the shared DsCalendar panel with no
// logged days and no legend, and future dates disabled (you can't be born
// tomorrow). Everything visual is inherited from DsCalendar, so it matches the
// home calendar exactly — same card, close X, amber selected circle and
// month/year dropdowns (the dropdowns matter here: picking a birth year means
// jumping back decades). Pure leaf, no state.

type DobCalendarProps = {
  month: Date
  onMonthChange: (month: Date) => void
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  onClose: () => void
}

function DobCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  onClose,
}: DobCalendarProps) {
  return (
    <DsCalendar
      month={month}
      onMonthChange={onMonthChange}
      selected={selected}
      onSelect={onSelect}
      onClose={onClose}
      disabled={{ after: new Date() }}
    />
  )
}

export default DobCalendar
