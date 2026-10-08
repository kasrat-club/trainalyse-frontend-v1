// EmptyWorkouts — DUMB. The first-run / empty-array state for the home timeline:
// a "No workouts yet" heading and a line of copy, centred. Pure on-token text —
// no icon or CTA (the FAB is the start affordance once a workout exists).

function EmptyWorkouts() {
  return (
    <div className="flex flex-col items-center justify-center px-[var(--space-lg)] py-[var(--space-lg)] text-center">
      <h2
        style={{
          color: "var(--text-primary)",
          fontSize: "var(--text-lg)",
          lineHeight: "var(--leading-lg)",
          fontWeight: "var(--font-weight-bold)",
        }}
      >
        No workouts yet
      </h2>
      <p
        className="mt-[var(--space-sm)]"
        style={{
          maxWidth: "300px",
          color: "var(--text-muted)",
          fontSize: "var(--text-md)",
          lineHeight: "var(--leading-md)",
        }}
      >
        Log your first session and it&apos;ll show up here, newest first.
      </p>
    </div>
  )
}

export default EmptyWorkouts
