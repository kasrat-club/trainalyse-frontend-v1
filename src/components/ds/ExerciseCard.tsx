import type { CSSProperties } from "react"

import Accordion from "./Accordion"
import Tabs from "./Tabs"
import RailBar from "./RailBar"
import WorkoutNote from "./WorkoutNote"

// ExerciseCard — DUMB. The read-only exercise block on the view page, composed
// from the atoms: a --surface card holding the Accordion (exercise name +
// chevron) whose content is the per-limb Tabs (Left / Right). Each limb shows its
// set grid — a RailBar + "Set N" (Body) heading over two centred columns of
// WEIGHTS / REPS (Caption column headers + Caption values) — and an optional
// WorkoutNote. Presentation only; the parent supplies the data.

export type SetRow = { weight: string; reps: string }
export type ExerciseLimb = {
  value: string
  label: string
  sets: SetRow[]
  note?: string
}

type ExerciseCardProps = {
  name: string
  limbs: ExerciseLimb[]
}

function ExerciseCard({ name, limbs }: ExerciseCardProps) {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius-lg)] p-[var(--space-lg)]"
      style={{
        background: "var(--surface)",
        border: "var(--border-width) solid var(--border)",
      }}
    >
      <Accordion
        defaultOpenId={name}
        items={[
          {
            id: name,
            name,
            content: (
              <Tabs
                ariaLabel="Limb"
                defaultValue={limbs[0]?.value}
                tabs={limbs.map((limb) => ({
                  value: limb.value,
                  label: limb.label,
                  content: <LimbContent sets={limb.sets} note={limb.note} />,
                }))}
              />
            ),
          },
        ]}
      />
    </div>
  )
}

// One limb's panel: its set blocks, then the note if there is one.
function LimbContent({ sets, note }: { sets: SetRow[]; note?: string }) {
  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      {sets.map((set, i) => (
        <SetBlock key={i} index={i + 1} set={set} />
      ))}
      {note && <WorkoutNote note={note} />}
    </div>
  )
}

// One set: the rail + "Set N" heading, then the WEIGHTS / REPS columns.
function SetBlock({ index, set }: { index: number; set: SetRow }) {
  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="flex items-center gap-[var(--space-md)]">
        <RailBar />
        <span style={setHeading}>Set {index}</span>
      </div>
      <div className="grid grid-cols-2 gap-[var(--space-md)]">
        <SetValue header="Weights" value={set.weight} />
        <SetValue header="Reps" value={set.reps} />
      </div>
    </div>
  )
}

// One column: an uppercase muted header over the primary value, both centred.
function SetValue({ header, value }: { header: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-[var(--space-sm)]">
      <span className="uppercase" style={columnHeader}>
        {header}
      </span>
      <span style={setValue}>{value}</span>
    </div>
  )
}

// Set heading = Body (16/400) primary.
const setHeading: CSSProperties = {
  color: "var(--text-primary)",
  fontSize: "var(--text-md)",
  lineHeight: "var(--leading-md)",
}

// Column header = Caption (14/400) muted.
const columnHeader: CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
}

// Value = Caption (14/400) primary.
const setValue: CSSProperties = {
  color: "var(--text-primary)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
}

export default ExerciseCard
