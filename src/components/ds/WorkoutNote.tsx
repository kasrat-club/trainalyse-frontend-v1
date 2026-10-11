import type { CSSProperties } from "react"

import RailBar from "./RailBar"

// WorkoutNote — DUMB. The read-only note shown on a workout (view page): a brand
// accent RailBar running down the left, beside a Body "Note" heading (primary,
// regular) and the note's Caption body text (muted). Presentation only.

type WorkoutNoteProps = {
  note: string
}

function WorkoutNote({ note }: WorkoutNoteProps) {
  return (
    <div className="flex gap-[var(--space-md)]">
      <RailBar />
      <div className="flex min-w-0 flex-col gap-[var(--space-sm)]">
        <span style={noteHeading}>Note</span>
        <span style={noteBody}>{note}</span>
      </div>
    </div>
  )
}

// Body (16/400, primary) — the heading; Caption (14/400, muted) — the body text.
const noteHeading: CSSProperties = {
  color: "var(--text-primary)",
  fontSize: "var(--text-md)",
  lineHeight: "var(--leading-md)",
}

const noteBody: CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
}

export default WorkoutNote
