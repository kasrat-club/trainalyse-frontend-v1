// NoResults — DUMB. The "nothing matched" state for the home timeline: one line
// of muted text, centred. Used when a date filter or a title search returns no
// workouts — distinct from EmptyWorkouts (the zero-workouts-ever case). The
// parent decides the message ("No workouts on <date>" / "No workouts by this
// title") and hands it in.

type NoResultsProps = {
  message: string
}

function NoResults({ message }: NoResultsProps) {
  return (
    <div className="flex items-center justify-center px-[var(--space-lg)] py-[var(--space-lg)] text-center">
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "var(--text-md)",
          lineHeight: "var(--leading-md)",
        }}
      >
        {message}
      </p>
    </div>
  )
}

export default NoResults
