import { Fragment } from "react"

import { cn } from "@/lib/utils"
import Separator from "../Separator"
import WorkoutCardBody from "./WorkoutCardBody"
import type { StatItem } from "./StatRow"

// WorkoutDateCard — DUMB. One surface for ALL workouts logged on a single date.
// Usually that's one workout; when there are two (or more), they stack inside the
// same card with a thin divider between them, and only the first shows the
// weekday (they share the date). Each workout is its own tap target (onOpen).
//
// The vertical rhythm tightens around the divider: a single workout gets even
// --space-lg top/bottom, while stacked ones use --space-lg on the outer edges
// and --space-md next to the divider, so the two read as one grouped card. The
// first workout keeps --space-lg on top so its title lines up with the rail node.

export type WorkoutEntry = {
  id?: string | number
  title: string
  weekday: string
  stats: StatItem[]
  onOpen?: () => void
}

type WorkoutDateCardProps = {
  items: WorkoutEntry[]
}

function WorkoutDateCard({ items }: WorkoutDateCardProps) {
  const twoUp = items.length > 1
  return (
    <div
      className="overflow-hidden"
      style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)" }}
    >
      {items.map((item, i) => (
        <Fragment key={item.id ?? i}>
          {i > 0 && <Separator inset />}
          <button
            type="button"
            onClick={item.onOpen}
            className={cn(
              "block w-full px-[var(--space-lg)] text-left",
              !twoUp && "py-[var(--space-lg)]",
              twoUp && i === 0 && "pt-[var(--space-lg)] pb-[var(--space-md)]",
              twoUp && i > 0 && "pt-[var(--space-md)] pb-[var(--space-lg)]",
            )}
          >
            <WorkoutCardBody
              title={item.title}
              weekday={item.weekday}
              stats={item.stats}
              showWeekday={i === 0}
            />
          </button>
        </Fragment>
      ))}
    </div>
  )
}

export default WorkoutDateCard
