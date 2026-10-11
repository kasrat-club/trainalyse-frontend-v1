import { useState } from "react"
import type { CSSProperties } from "react"

import SearchBar from "@/components/ds/header/SearchBar"
import TextInput from "@/components/ds/TextInput"
import SegmentedToggle from "@/components/ds/SegmentedToggle"
import DateField from "@/components/ds/DateField"
import MeasureInput from "@/components/ds/MeasureInput"
import { heading, muted } from "../styles"

// Inputs — the app's text inputs. The login Email / Password fields (default +
// error states), and the header search bar. Each field is a small harness that
// holds its own text so it's typeable; the error ones are pre-filled so the red
// text state shows.

function Inputs() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Inputs</h2>

      <section className="flex flex-col gap-[var(--space-lg)]">
        <span style={muted}>Login fields — default and error states</span>
        <div className="flex max-w-sm flex-col gap-8">
          <Field state="Default" label="Email" placeholder="Enter your email" />
          <Field
            state="Error"
            label="Email"
            placeholder="Enter your email"
            error
            initial="ssfs"
            message="Please enter your email."
          />
          <Field state="Default" label="Password" placeholder="Enter your password" secret />
          <Field
            state="Error"
            label="Password"
            placeholder="Enter your password"
            secret
            error
            initial="ssfs"
            message="Please enter your password."
          />
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-lg)]">
        <span style={muted}>
          Sign-up fields — the same text and secret inputs, different labels
        </span>
        <div className="flex max-w-sm flex-col gap-8">
          <Field state="Default" label="Username" placeholder="Create your username" />
          <Field
            state="Default"
            label="Confirm password"
            placeholder="Re-enter your password"
            secret
          />
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>
          More-info fields — a date-of-birth trigger and weight/height with the unit toggle inside (on a --surface card, as in the app)
        </span>
        <div
          className="flex max-w-sm flex-col gap-8 p-[var(--space-lg)]"
          style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)" }}
        >
          <div className="flex flex-col gap-[var(--space-sm)]">
            <label style={fieldLabel}>Date of birth</label>
            <DateField onClick={() => {}} />
          </div>
          <MeasureShowcase
            label="Weight"
            placeholder="Enter your weight"
            initialUnit="kg"
            units={[
              { value: "kg", label: "kg" },
              { value: "lbs", label: "lbs" },
            ]}
          />
          <MeasureShowcase
            optional
            label="Height"
            placeholder="Enter your height"
            initialUnit="cm"
            splitUnit="ft"
            units={[
              { value: "cm", label: "cm" },
              { value: "ft", label: "ft" },
            ]}
          />
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>
          Segmented toggle — the unit picker on its own (sits inside the weight / height inputs; shown on a --surface chip)
        </span>
        <div className="flex flex-wrap gap-[var(--space-lg)]">
          <ToggleChip
            ariaLabel="Weight unit"
            initial="kg"
            options={[
              { value: "kg", label: "kg" },
              { value: "lbs", label: "lbs" },
            ]}
          />
          <ToggleChip
            ariaLabel="Height unit"
            initial="cm"
            options={[
              { value: "cm", label: "cm" },
              { value: "ft", label: "ft" },
            ]}
          />
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Search bar — header, filters workouts by title</span>
        <SearchShowcase />
      </section>
    </div>
  )
}

// One field: a state caption, the bold label, the input, and (on error) the red
// validation message — the full stack as it appears on the login card.
function Field({
  state,
  label,
  placeholder,
  secret = false,
  error = false,
  initial = "",
  message,
}: {
  state: string
  label: string
  placeholder: string
  secret?: boolean
  error?: boolean
  initial?: string
  message?: string
}) {
  const [value, setValue] = useState(initial)
  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      <span style={stateLabel}>{state}</span>
      <label style={fieldLabel}>{label}</label>
      <TextInput
        value={value}
        onChange={setValue}
        placeholder={placeholder}
        secret={secret}
        error={error}
      />
      {error && message && <span style={errorText}>{message}</span>}
    </div>
  )
}

// A weight/height field (label + MeasureInput) with its own value + unit state.
// When `splitUnit` is the chosen unit (ft → feet + inches), it feeds MeasureInput
// TWO fields instead of one — that "ft means feet+inches" rule lives here, not in
// the dumb MeasureInput.
function MeasureShowcase({
  label,
  optional = false,
  placeholder,
  initialUnit,
  units,
  splitUnit,
}: {
  label: string
  optional?: boolean
  placeholder: string
  initialUnit: string
  units: { value: string; label: string }[]
  splitUnit?: string
}) {
  const [unit, setUnit] = useState(initialUnit)
  const [value, setValue] = useState("")
  const [feet, setFeet] = useState("")
  const [inches, setInches] = useState("")

  const fields =
    unit === splitUnit
      ? [
          { value: feet, onChange: setFeet, placeholder: "ft", ariaLabel: `${label} (feet)` },
          { value: inches, onChange: setInches, placeholder: "in", ariaLabel: `${label} (inches)` },
        ]
      : [{ value, onChange: setValue, placeholder, ariaLabel: label }]

  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      <label style={fieldLabel}>
        {label}
        {optional && <span style={optionalHint}> (optional)</span>}
      </label>
      <MeasureInput
        fields={fields}
        unit={unit}
        onUnitChange={setUnit}
        unitOptions={units}
        unitAriaLabel={`${label} unit`}
      />
    </div>
  )
}

// A toggle on a --surface chip (the surface it sits on inside an input), with
// its own selection state so switching is live.
function ToggleChip({
  options,
  initial,
  ariaLabel,
}: {
  options: { value: string; label: string }[]
  initial: string
  ariaLabel: string
}) {
  const [value, setValue] = useState(initial)
  return (
    <div
      className="self-start p-[var(--space-sm)]"
      style={{ background: "var(--surface)", borderRadius: "var(--radius-full)" }}
    >
      <SegmentedToggle
        options={options}
        value={value}
        onChange={setValue}
        ariaLabel={ariaLabel}
      />
    </div>
  )
}

// SearchBar is controlled and flex-1, so it needs a parent that holds the value
// and gives it a width to fill.
function SearchShowcase() {
  const [search, setSearch] = useState("")
  return (
    <div className="flex">
      <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />
    </div>
  )
}

const stateLabel: CSSProperties = {
  color: "var(--text-faint)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
  fontWeight: "var(--font-weight-bold)",
}

const fieldLabel: CSSProperties = {
  color: "var(--text-primary)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
  fontWeight: "var(--font-weight-bold)",
}

const errorText: CSSProperties = {
  color: "var(--danger)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
}

// "(optional)" beside a label — the Caption style (14/400 muted), not the label's 700.
const optionalHint: CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
  fontWeight: "var(--font-weight-regular)",
}

export default Inputs
