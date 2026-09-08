import { format, parseISO } from "date-fns"
import { X } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { exercises } from "@/data/exercise"
import { getExerciseInstance } from "@/data/calculations"
import ReadonlyExercise from "@/components/ReadonlyExercise"

interface PreviousPerformanceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseId: number
}

// A read-only snapshot of the most recent logged instance of one exercise. The
// sets grid is rendered by ReadonlyExercise (shared with the View-only workout
// screen); this file adds the sheet chrome around it — a header with the exercise
// name and when it was last done, plus a round X to close. Slides up as a bottom
// sheet covering 70% of the screen; the top 30% is a dimmed, blurred backdrop that
// closes the sheet on tap (handled by the Sheet's overlay). Body scrolls inside;
// the page behind is scroll-locked.
function PreviousPerformance({ open, onOpenChange, exerciseId }: PreviousPerformanceProps) {
  const matched = exercises.find((e) => e.id === exerciseId)
  const instances = getExerciseInstance(exerciseId)
  // most recent = last, since getExerciseInstance sorts oldest -> newest
  const latest = instances[instances.length - 1]

  // defensive: the menu item is disabled when there's no instance, so this
  // shouldn't render open without one — but never crash if it does.
  if (!latest) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        /* h-[70vh]! — the `!` beats SheetContent's data-[side=bottom]:h-auto (an
           attribute selector = higher specificity), which otherwise lets the sheet
           grow to full content height and spill past the viewport top with no
           bounded height for the body to scroll inside. */
        className="flex h-[70vh]! flex-col gap-0 rounded-t-[var(--radius-card)] border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] p-0"
      >
        {/* Header: exercise name + when it was last done, and a round X to close */}
        <div className="flex shrink-0 items-start justify-between gap-3 px-[var(--space-23)] pt-[var(--space-lg)] pb-[var(--space-sm)]">
          <div className="flex min-w-0 flex-col gap-0.5">
            <SheetTitle className="text-lg font-bold text-foreground">{matched?.name}</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">Last done {format(parseISO(latest.date), "d MMMM, yyyy")}</SheetDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="size-9 shrink-0 rounded-full border border-[var(--border-cardEdge)] bg-white/5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-[18px]" />
          </Button>
        </div>

        {/* Scrollable read-only body; the page behind is locked by the Sheet. */}
        <div className="flex flex-1 flex-col overflow-y-auto px-[var(--space-23)] pt-[var(--space-sm)] pb-[var(--space-md)]">
          <ReadonlyExercise exercise={latest.exercise} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default PreviousPerformance
