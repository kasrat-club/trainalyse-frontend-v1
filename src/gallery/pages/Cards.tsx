import { Activity, Dumbbell, List } from "lucide-react"

import TimelineRail from "@/components/ds/timeline/TimelineRail"
import WorkoutDateCard, {
  type WorkoutEntry,
} from "@/components/ds/timeline/WorkoutDateCard"
import { heading, muted } from "../styles"

// Cards — the workout card in its two real states: one workout on a date, and
// two workouts logged on the same date (stacked in one card with a divider).
// Both are the REAL WorkoutDateCard paired with the timeline rail, exactly as
// the home timeline composes them.

function Cards() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Cards</h2>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Workout card — one workout on a date</span>
        <CardRow
          day="22"
          month="Jun"
          items={[
            {
              title: "Per-Limb Arm Day",
              weekday: "Mon",
              stats: [
                { icon: Dumbbell, label: "Total work done (Volume)", value: "552" },
                { icon: Activity, label: "Endurance", value: "48 min" },
                { icon: List, label: "Exercises Done", value: 4 },
              ],
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Workout card — two workouts on the same date</span>
        <CardRow
          day="20"
          month="Jun"
          items={[
            {
              title: "Morning Push",
              weekday: "Sat",
              stats: [
                { icon: Dumbbell, label: "Total work done (Volume)", value: "612" },
                { icon: List, label: "Exercises Done", value: 5 },
              ],
            },
            {
              title: "Evening Pull",
              weekday: "Sat",
              stats: [
                { icon: Dumbbell, label: "Total work done (Volume)", value: "488" },
                { icon: List, label: "Exercises Done", value: 4 },
              ],
            },
          ]}
        />
      </section>
    </div>
  )
}

// One timeline row: the rail (date + node) beside its date card. isFirst+isLast
// trim the connecting line to just the node, so each specimen stands alone.
function CardRow({
  day,
  month,
  items,
}: {
  day: string
  month: string
  items: WorkoutEntry[]
}) {
  return (
    <div className="flex items-stretch gap-[var(--space-lg)]">
      <TimelineRail day={day} month={month} isFirst isLast />
      <div className="min-w-0 flex-1">
        <WorkoutDateCard items={items} />
      </div>
    </div>
  )
}

export default Cards
