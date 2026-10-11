import { useState } from "react"

import Select from "@/components/ds/Select"
import { heading, muted } from "../styles"

// Dropdown — the Select (a pick-one-from-a-list control). Shown in both modes:
// editable (the edit page — opens a popover menu) and read-only (the view page —
// just the value in the same box, no chevron). Set-type labels are placeholders
// until the real list is set.

const SET_TYPES = [
  { value: "norm", label: "Norm." },
  { value: "warm", label: "Warm." },
  { value: "drop", label: "Drop." },
]

function Dropdown() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Dropdown</h2>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>
          Set-type select — editable (edit page, opens a menu) and read-only (view page, no chevron). Options are placeholders.
        </span>
        <div className="flex flex-wrap items-center gap-[var(--space-lg)]">
          <SelectShowcase />
          <Select
            readOnly
            ariaLabel="Set type (read-only)"
            value="norm"
            onChange={() => {}}
            options={SET_TYPES}
          />
        </div>
      </section>
    </div>
  )
}

// Editable select needs a parent to hold the chosen value.
function SelectShowcase() {
  const [value, setValue] = useState("norm")
  return (
    <Select ariaLabel="Set type" value={value} onChange={setValue} options={SET_TYPES} />
  )
}

export default Dropdown
