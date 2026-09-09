import { useLocation, useNavigate, Navigate } from "react-router-dom"
import { format, parse, parseISO, isValid } from "date-fns"
import { ChevronLeft, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exercises as catalog } from "./data/exercise"
import { type Workout as WorkoutData } from "./data/workouts"
import ReadonlyExercise from "@/components/ReadonlyExercise"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

// Shared sizing for the two header pills (Back / Edit) so they're guaranteed the
// same shape, height AND width — the min-w floors both to the wider label's width
// (Back), so the shorter "Edit" centres its content to match instead of hugging
// tighter. Each button only adds its own colour on top.
const headerPill = "h-11 min-w-[92px] justify-center gap-1.5 rounded-full border px-4 text-sm font-medium"

// The read-only view of a saved workout, reached from the "View only" door in the
// tap-a-workout action sheet. It shows exactly what was logged with NO interactive
// UI — no inputs, add buttons, kebab menus, per-limb toggle, or Save. Just the
// title, when it was done, and every exercise's sets rendered by ReadonlyExercise
// (the same read-only grid the Previous-performance sheet uses), with each note
// shown as plain text. Editing lives on the separate /Workout route.
function WorkoutView() {
  const location = useLocation()
  const navigate = useNavigate()
  const workout = location.state?.workout as WorkoutData | undefined

  // Opened without a workout in route state (e.g. a hard refresh on this URL):
  // there's nothing to show, so bounce home rather than render an empty shell.
  if (!workout) return <Navigate to="/" replace />

  // Normalise the optional time to "10:30 PM" for display. Two formats exist in
  // the data: the editor saves "HH:mm" ("22:30"), while the seed/list data uses
  // "h:mm a" ("8:30 AM"). Try both, and fall back to the raw string rather than
  // let an Invalid Date throw during render (which blanked this whole page).
  let prettyTime: string | null = null
  if (workout.time) {
    const parsed = [
      parse(workout.time, "h:mm a", new Date()),
      parse(workout.time, "HH:mm", new Date()),
    ].find(isValid)
    prettyTime = parsed ? format(parsed, "h:mm a") : workout.time
  }

  return (
    <div className="mx-auto flex max-w-[430px] flex-col">
      {/* Sticky header, styled exactly like the Home header — same height (pt-6
          pb-4), bottom border, surface background and safe-area top — but its
          controls are Back (returns to the list) and Edit (opens the editor for
          this same workout). sticky top-0 keeps it visible as the page scrolls. */}
      <header className="sticky top-0 z-20 border-b border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-[var(--space-23)] pt-6 pb-4">
          <Button
            className={cn(headerPill, "border-muted-foreground bg-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground")}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>
          <Button
            className={cn(headerPill, "border-[rgb(205_242_58/40%)] bg-[rgb(205_242_58/8%)] text-[var(--color-neon)] hover:bg-[rgb(205_242_58/14%)]")}
            onClick={() => navigate("/Workout", { state: { workout } })}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
        </div>
      </header>

      {/* Page content sits below the sticky header, keeping the page's 23px side
          padding and 16px vertical rhythm. */}
      <div className="flex flex-col gap-[var(--space-lg)] px-[var(--space-23)] pt-[var(--space-lg)] pb-[var(--space-2xl)]">
      {/* Title + when it was done */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary">{workout.title}</h1>
        <p className="text-sm text-muted-foreground">
          {format(parseISO(workout.date), "EEEE, d MMMM yyyy")}
          {prettyTime && ` · ${prettyTime}`}
        </p>
      </div>

      {/* One read-only card per exercise: its name, its sets grid, and its note
          if there is one. 16px between cards, matching the editor's spacing. */}
      {workout.exercises.length > 0 ? (
        <div className="flex flex-col gap-[var(--space-lg)]">
          {workout.exercises.map((exercise) => {
            const matched = catalog.find((e) => e.id === exercise.exerciseId)
            const note = exercise.notes?.trim()
            return (
              <div
                key={exercise.id}
                className="rounded-[var(--radius-card)] border border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] p-[var(--space-lg)]"
              >
                {/* Same accordion the editor card uses: exercises start expanded
                    (defaultValue) and the circular chevron floats to the card's
                    top-right via the trigger's ml-auto, so tapping it collapses
                    this exercise down to just its title. */}
                <Accordion type="single" collapsible defaultValue="exercise">
                  <AccordionItem value="exercise">
                    <AccordionTrigger className="py-0">
                      <h2 className="text-lg font-bold text-foreground">{matched?.name}</h2>
                    </AccordionTrigger>
                    <AccordionContent className="h-auto pb-0">
                      <div className="flex flex-col gap-[var(--space-md)] pt-[var(--space-md)]">
                        <ReadonlyExercise exercise={exercise} />
                        {/* Note reads as one more entry, so it borrows the same neon
                            bar the Set headings use — a full-height bar, a bold "Note"
                            label, then the note itself muted below. Absent/blank note
                            = nothing renders (guarded), so the card just ends on the
                            last set. */}
                        {note && (
                          <div className="flex gap-3">
                            <span className="w-1 shrink-0 rounded-full bg-[var(--color-neon)]" />
                            <div className="flex min-w-0 flex-col gap-1.5">
                              <h3 className="text-base font-semibold text-foreground">Note</h3>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                                {note}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">This workout has no exercises.</p>
      )}
      </div>
    </div>
  )
}

export default WorkoutView
