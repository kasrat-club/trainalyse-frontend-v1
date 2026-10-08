import WorkoutCardBody from "./WorkoutCardBody"
import type { StatItem } from "./StatRow"

// WorkoutCard — DUMB. The surface that groups ONE workout: a title + weekday
// header, then the stat rows (all via WorkoutCardBody). The whole card is one
// tap target (onOpen). Sits on the page background as a raised --surface;
// borderless, like the design frame. For two workouts on the same date, use
// WorkoutDateCard, which stacks several bodies in one surface with a divider.

type WorkoutCardProps = {
  title: string
  weekday: string
  stats: StatItem[]
  onOpen?: () => void
}

function WorkoutCard({ title, weekday, stats, onOpen }: WorkoutCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full overflow-hidden p-[var(--space-lg)] text-left"
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <WorkoutCardBody title={title} weekday={weekday} stats={stats} />
    </button>
  )
}

export default WorkoutCard
