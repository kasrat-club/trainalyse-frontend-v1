import StatRow from "./StatRow"
import type { StatItem } from "./StatRow"

// WorkoutCard — DUMB. The surface that groups one workout: a title + weekday
// header, then the stat rows. The whole card is one tap target (onOpen). Sits on
// the page background as a raised --surface; borderless, like the design frame.

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
      <div className="flex items-start justify-between gap-[var(--space-md)]">
        <h3
          style={{
            color: "var(--text-primary)",
            fontSize: "var(--text-lg)",
            lineHeight: "var(--leading-lg)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {title}
        </h3>
        <span
          className="mt-0.5 shrink-0"
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--text-sm)",
            lineHeight: "var(--leading-sm)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {weekday}
        </span>
      </div>

      <div className="mt-[var(--space-lg)] flex flex-col gap-[var(--space-md)]">
        {stats.map((stat, i) => (
          <StatRow key={i} {...stat} />
        ))}
      </div>
    </button>
  )
}

export default WorkoutCard
