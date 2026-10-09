import { useState } from "react"
import type { CSSProperties } from "react"

import SearchBar from "@/components/ds/header/SearchBar"
import TextInput from "@/components/ds/TextInput"
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

export default Inputs
