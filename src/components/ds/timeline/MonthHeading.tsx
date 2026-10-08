// MonthHeading — DUMB. The month divider on the home timeline: the month + year
// on the left, and the count of workouts that month on the right. Purely
// presentational — it's handed the label and the count and lays them out on one
// baseline-aligned row. Sits directly on the page background (no surface).

type MonthHeadingProps = {
  /** The month label, e.g. "June 2026". */
  month: string
  /** How many workouts were logged that month. */
  workoutCount: number
}

function MonthHeading({ month, workoutCount }: MonthHeadingProps) {
  return (
    <div className="flex items-baseline justify-between gap-[var(--space-md)]">
      <h2
        style={{
          color: "var(--text-primary)",
          fontSize: "var(--text-lg)",
          lineHeight: "var(--leading-lg)",
          fontWeight: "var(--font-weight-bold)",
        }}
      >
        {month}
      </h2>
      <span
        className="shrink-0"
        style={{
          color: "var(--text-muted)",
          fontSize: "var(--text-md)",
          lineHeight: "var(--leading-md)",
          fontWeight: "var(--font-weight-bold)",
        }}
      >
        {workoutCount} {workoutCount === 1 ? "Workout" : "Workouts"}
      </span>
    </div>
  )
}

export default MonthHeading
