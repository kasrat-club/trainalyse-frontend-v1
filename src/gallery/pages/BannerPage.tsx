import WorkoutBanner from "@/components/ds/WorkoutBanner"
import { heading, muted } from "../styles"

// Banner — the "a workout is still going on" pill that floats above the footer
// while a workout is active. The REAL ds WorkoutBanner, built from the new
// atoms: the destructive IconButton (red-outline Trash2) for discard and the
// outline IconButton (ChevronUp) for resume. Handlers are no-ops in the catalog.

function BannerPage() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Banner</h2>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>In-progress workout — discard (left) · resume (right, tap body to resume)</span>
        <WorkoutBanner />
      </section>
    </div>
  )
}

export default BannerPage
