import CalendarButton from "./CalendarButton"
import Logo from "./Logo"
import SearchBar from "./SearchBar"

// HomeHeader — DUMB composition. The whole home-page header as one piece:
// Logo · SearchBar · CalendarButton on a single 36px-tall row. It owns no state
// — it threads the search value and the callbacks straight down to SearchBar,
// and the calendar tap up to the parent (which decides what to open).

type HomeHeaderProps = {
  search: string
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  onCalendarClick?: () => void
}

function HomeHeader({
  search,
  onSearchChange,
  onSearchClear,
  onCalendarClick,
}: HomeHeaderProps) {
  return (
    <header
      className="sticky top-0 z-20"
      style={{
        background: "var(--background)",
        borderBottom: "var(--border-width) solid var(--border)",
      }}
    >
      <div className="flex items-center gap-[var(--space-sm)] px-[var(--space-lg)] py-[var(--space-lg)]">
        <Logo />
        <SearchBar
          value={search}
          onChange={onSearchChange}
          onClear={onSearchClear}
        />
        <CalendarButton onClick={onCalendarClick} />
      </div>
    </header>
  )
}

export default HomeHeader
