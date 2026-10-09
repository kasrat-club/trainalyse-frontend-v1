import { SearchIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"

// SearchBar — DUMB but functional. A pill text input with a leading search
// glyph and a trailing clear (X) that appears only while there's text.
//
// CONTROLLED: the text lives in the parent (value + onChange), which is how the
// real header drives it from its search state. That keeps this component logic-
// free — it just renders what it's given and reports typing/clear back up.

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
}

function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search by title",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-[var(--input-icon-offset)] size-[var(--icon-sm)] -translate-y-1/2"
        style={{ color: "var(--text-muted)" }}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[var(--control-sm)] w-full rounded-[var(--radius-full)] border border-[var(--border)] bg-transparent pr-[var(--input-icon-inset)] pl-[var(--input-icon-inset)] text-[length:var(--text-sm)] outline-none placeholder:text-[var(--text-muted)] focus-visible:border-[var(--border-hover)] focus-visible:shadow-[var(--shadow-focus)]"
        style={{ color: "var(--text-primary)" }}
      />
      {value && onClear && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="absolute top-1/2 right-[var(--input-icon-offset)] -translate-y-1/2 transition-colors hover:text-[var(--text-primary)]"
          style={{ color: "var(--text-muted)" }}
        >
          <X className="size-[var(--icon-sm)]" />
        </button>
      )}
    </div>
  )
}

export default SearchBar
