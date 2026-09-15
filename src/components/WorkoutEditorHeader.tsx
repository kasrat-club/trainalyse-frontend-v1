import { Button } from "@/components/ui/button"
import { Check, Trash2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

// The sticky top bar of the Workout editor: Discard on the left, Save on the
// right. A pure leaf — it holds no state and decides nothing. It just draws the
// bar and calls back up (onDiscard / onSave) when a pill is tapped; the page
// (via useWorkoutEditor) owns what those actually do.
//
// `scrolled` only changes how it LOOKS (the bottom border appears once the page
// has scrolled), so it's a plain visual input, not workout data.

// Same header-pill shape used by the Back / Edit pills on the read-only view
// (WorkoutView) so Discard / Save match their build exactly — matched height and
// width, centred icon + label. Each button only adds its own colour on top.
const headerPill =
  "h-9 min-w-[92px] justify-center gap-1.5 rounded-full border px-4 text-sm font-medium"

type WorkoutEditorHeaderProps = {
  scrolled: boolean
  onDiscard: () => void
  onSave: () => void
}

export function WorkoutEditorHeader({ scrolled, onDiscard, onSave }: WorkoutEditorHeaderProps) {
  return (
    // Sticky header, matching Home and View: 84px tall (pt-6 pb-4 around 44px
    // controls), surface background, bottom border and safe-area top.
    <header
      className={`sticky top-0 z-20 border-b bg-[var(--bg-page)] pt-[env(safe-area-inset-top)] transition-colors ${
        scrolled ? "border-[var(--border-cardEdge)]" : "border-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-[var(--space-23)] pt-6 pb-4">
        <Button
          className={cn(headerPill, "border-destructive bg-transparent text-destructive hover:bg-destructive/10")}
          onClick={onDiscard}
        >
          <Trash2Icon className="size-4" />
          Discard
        </Button>
        <Button
          className={cn(headerPill, "border-[rgb(205_242_58/40%)] bg-[rgb(205_242_58/8%)] text-[var(--color-neon)] hover:bg-[rgb(205_242_58/14%)]")}
          onClick={onSave}
        >
          <Check className="size-4" />
          Save
        </Button>
      </div>
    </header>
  )
}
