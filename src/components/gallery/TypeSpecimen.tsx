import type { CSSProperties } from "react"

// TypeSpecimen — DUMB. A block of real text so the Font-size / Font-weight knobs
// have something to visibly change. The heading is fixed (the --text-heading
// role); the body paragraphs read the `--specimen-*` vars the sidebar drives, so
// picking a size/weight in the sidebar re-renders them instantly. It reads CSS
// vars off its wrapper — no props needed.

const bodyText: CSSProperties = {
  color: "var(--text-primary)",
  fontSize: "var(--specimen-size)",
  lineHeight: "var(--specimen-leading)",
  fontWeight: "var(--specimen-weight)",
}

function TypeSpecimen() {
  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <h3
        style={{
          color: "var(--text-primary)",
          fontSize: "var(--text-heading)",
          lineHeight: "var(--leading-heading)",
          fontWeight: "var(--weight-heading)",
        }}
      >
        Building your workout
      </h3>

      <p style={bodyText}>
        Log every set as you go — reps, load, and rest — and Kasrat keeps the
        running totals for you. Your volume, streak, and personal bests update the
        moment you save, so the whole session stays in one place without any
        spreadsheet juggling.
      </p>

      <p style={bodyText}>
        Change the size and weight in the sidebar to see this paragraph respond.
        Each option is a real token from the design system, and the line-height
        rides along with the size it's paired to.
      </p>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "var(--specimen-size)",
          lineHeight: "var(--specimen-leading)",
          fontWeight: "var(--specimen-weight)",
        }}
      >
        Muted note — the dimmer text tier, at the same size and weight.
      </p>
    </div>
  )
}

export default TypeSpecimen
