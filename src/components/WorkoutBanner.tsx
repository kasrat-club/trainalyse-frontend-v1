import React from "react"
import { useNavigate } from "react-router-dom"
import { Trash2Icon, ChevronRight } from "lucide-react"
import { useActiveWorkout } from "@/hooks/useActiveWorkout"
import { DiscardConfirmModal } from "./DiscardConfirmModal"

// the "a workout is still going on" pill. rendered by Layout, so it shows on
// every footer page (Home, Graphs, Settings, ...) but NOT on the Workout editor
// itself (that page sits outside Layout). only appears while a workout is active.
// tapping the body reopens the workout; the trash icon discards it (via confirm).
// it sits in the same band the home + button uses, but full width and centred.
//
// `standalone` is for pages that render the banner WITHOUT a footer beneath it
// (the view-only page): the normal offset clears the sticky footer's height, but
// with no footer that would leave a big empty gap, so we drop to a small offset
// that pins the pill near the bottom instead.
export function WorkoutBanner({ standalone = false }: { standalone?: boolean }) {
  const { activeWorkout, setActiveWorkout } = useActiveWorkout()
  const navigate = useNavigate()
  const [confirming, setConfirming] = React.useState(false)

  // nothing running → no banner
  if (!activeWorkout) return null

  return (
    <>
      {/* fixed, column-width overlay pinned just above the sticky footer. the
          overlay ignores pointer events; only the pill takes taps. */}
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] px-[var(--space-23)] ${
          standalone
            ? "pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
            : "pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
        }`}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate("/Workout")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/Workout")
          }}
          className="pointer-events-auto flex w-full cursor-pointer items-center gap-3 rounded-full border border-[var(--border-cardEdge)] bg-[var(--bg-surface-secondary)] p-2 pr-4 shadow-lg"
        >
          {/* trash — stopPropagation so it discards instead of reopening */}
          <button
            type="button"
            aria-label="Discard workout"
            onClick={(e) => {
              e.stopPropagation()
              setConfirming(true)
            }}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive"
          >
            <Trash2Icon className="size-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--color-neon)]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neon)]">
                In progress
              </span>
            </div>
            <p className="truncate text-base font-bold text-primary">
              One workout is still going on
            </p>
          </div>

          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </div>
      </div>

      {confirming && (
        <DiscardConfirmModal
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            // clearing the pipe fires the provider's save effect, which wipes the
            // localStorage key too — the only way (besides Save) to end a workout.
            setActiveWorkout(null)
            setConfirming(false)
          }}
        />
      )}
    </>
  )
}
