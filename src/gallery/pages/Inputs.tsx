import { useState } from "react"

import SearchBar from "@/components/ds/header/SearchBar"
import { heading, muted } from "../styles"

// Inputs — the app's text inputs. For now: the header search bar (the real
// controlled SearchBar). A small harness holds the text so it's typeable and
// the trailing clear (X) appears once there's a value.

function Inputs() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Inputs</h2>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Search bar — header, filters workouts by title</span>
        <SearchShowcase />
      </section>
    </div>
  )
}

// SearchBar is controlled and flex-1, so it needs a parent that holds the value
// and gives it a width to fill.
function SearchShowcase() {
  const [search, setSearch] = useState("")
  return (
    <div className="flex">
      <SearchBar
        value={search}
        onChange={setSearch}
        onClear={() => setSearch("")}
      />
    </div>
  )
}

export default Inputs
