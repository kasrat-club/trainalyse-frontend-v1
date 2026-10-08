import StatRow from "./StatRow"
import type { StatItem } from "./StatRow"

// WorkoutCardBody — DUMB. The INNER content of a workout: the title + weekday
// header, then the stat rows. It carries no surface, padding or tap target, so
// it can sit inside a single WorkoutCard OR be stacked (with dividers) inside a
// WorkoutDateCard when two workouts share one date. `showWeekday` hides the day
// label on stacked entries after the first, since same-date workouts repeat it.

type WorkoutCardBodyProps = {
  title: string
  weekday: string
  stats: StatItem[]
  showWeekday?: boolean
}

function WorkoutCardBody({
  title,
  weekday,
  stats,
  showWeekday = true,
}: WorkoutCardBodyProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-[var(--space-md)]">
        <h3
          style={{
            color: "var(--text-primary)",
            fontSize: "var(--text-md)",
            lineHeight: "var(--leading-md)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {title}
        </h3>
        {showWeekday && (
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
        )}
      </div>

      <div className="mt-[var(--space-lg)] flex flex-col gap-[var(--space-md)]">
        {stats.map((stat, i) => (
          <StatRow key={i} {...stat} />
        ))}
      </div>
    </>
  )
}

export default WorkoutCardBody
