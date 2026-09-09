import { Fragment, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { exercises, type ExerciseType } from "@/data/exercise"
import {
  type Difficulty,
  type LimbValues,
  type Limb,
  type WorkoutExercise,
} from "@/data/workouts"

// Short forms shown in the read-only difficulty pill, same as the live editor.
const difficultyShortLabels: Record<Difficulty, string> = {
  normal: "Norm.",
  assisted: "Asst.",
  weighted: "Wtd.",
}

// Column templates mirror the live editor's getGridConfig, MINUS the trailing
// delete column — this is read-only, so there are no per-row delete icons.
// Headers must stay in lockstep with the template's column count (a mismatch
// makes the subgrid flow diagonally), so both come from one place.
function getReadonlyGridConfig(
  exerciseType: ExerciseType | "",
  isBodyweight: boolean
) {
  if (exerciseType === "duration") {
    return isBodyweight
      ? { template: "grid-cols-[min-content_minmax(min-content,1fr)_minmax(8ch,1fr)]", headers: ["Difficulty", "Weights", "Time"] }
      : { template: "grid-cols-[minmax(min-content,1fr)_minmax(8ch,1fr)]", headers: ["Weights", "Time"] }
  }
  return isBodyweight
    ? { template: "grid-cols-[min-content_minmax(min-content,1fr)_minmax(min-content,1fr)]", headers: ["Difficulty", "Weights", "Reps"] }
    : { template: "grid-cols-[minmax(min-content,1fr)_minmax(min-content,1fr)]", headers: ["Weights", "Reps"] }
}

// HH:MM:SS once there are hours, otherwise MM:SS — matches TimeInput's display.
function formatTime(hours = 0, minutes = 0, seconds = 0) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`
}

interface ReadonlyExerciseProps {
  exercise: WorkoutExercise
}

// The read-only rendering of ONE logged exercise: its sets grid with every value
// as static text (no inputs, no delete icons, no add-set/add-dropset buttons),
// plus read-only Left/Right tabs when the exercise was logged per-limb. It renders
// NO name or notes header — each caller wraps its own header around this (the
// Previous-performance sheet shows "Last done …"; the View-only screen shows a
// card title + note). Shared so the grid config and cell shapes live in one place.
function ReadonlyExercise({ exercise }: ReadonlyExerciseProps) {
  // which limb is being read — only ever flips when the instance was logged
  // per-limb (Left/Right tabs); otherwise everything lives under "left".
  const [activeLimb, setActiveLimb] = useState<Limb>("left")

  const matched = exercises.find((e) => e.id === exercise.exerciseId)
  const exerciseType: ExerciseType | "" = matched?.type ?? ""
  const isBodyweight = matched?.isBodyweight ?? false
  const perLimbEnabled = exercise.perLimbEnabled ?? false

  const grid = getReadonlyGridConfig(exerciseType, isBodyweight)

  // one read-only value cell — mirrors the live Dropsets branch logic
  function renderCells(limb: LimbValues) {
    const difficulty: Difficulty = limb.difficulty ?? "normal"

    const difficultyPill = (
      <div className="flex h-9 w-full items-center justify-center rounded-md border border-input bg-transparent px-1.5 text-sm">
        {difficultyShortLabels[difficulty]}
      </div>
    )

    // bodyweight weight cell: Normal adds no weight (muted NA); Assisted/Weighted
    // show the assist/extra weight typed for that dropset.
    const bodyweightWeight =
      difficulty === "normal" ? (
        <span className="block w-full text-center text-muted-foreground">NA</span>
      ) : (
        <span className="block w-full text-center">
          {(difficulty === "assisted" ? limb.assistedWeights : limb.extraWeights) ?? (
            <span className="text-muted-foreground">-</span>
          )}
        </span>
      )

    const plainWeight = (
      <span className="block w-full text-center">
        {limb.weights ?? <span className="text-muted-foreground">-</span>}
      </span>
    )

    const reps = (
      <span className="block w-full text-center">
        {limb.reps ?? <span className="text-muted-foreground">-</span>}
      </span>
    )

    const isTimeEmpty = !limb.hours && !limb.minutes && !limb.seconds
    const time = (
      <span className={`block text-sm tabular-nums ${isTimeEmpty ? "text-muted-foreground" : ""}`}>
        {formatTime(limb.hours, limb.minutes, limb.seconds)}
      </span>
    )

    if (exerciseType === "weightsAndReps" && !isBodyweight) {
      return (<><div>{plainWeight}</div><div>{reps}</div></>)
    }
    if (exerciseType === "weightsAndReps" && isBodyweight) {
      return (<><div>{difficultyPill}</div><div>{bodyweightWeight}</div><div>{reps}</div></>)
    }
    if (exerciseType === "duration" && !isBodyweight) {
      return (<><div>{plainWeight}</div><div>{time}</div></>)
    }
    // duration + bodyweight (plank)
    return (<><div>{difficultyPill}</div><div>{bodyweightWeight}</div><div>{time}</div></>)
  }

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      {/* Only when this instance was logged per-limb: read-only Left/Right tabs
          to switch between each side. The "Log separate for each limb" toggle is
          intentionally NOT shown — a non-interactive switch read as confusing.
          No per-limb data = nothing here at all. */}
      {perLimbEnabled && (
        <Tabs value={activeLimb} onValueChange={(v) => setActiveLimb(v as Limb)}>
          <TabsList className="w-full">
            <TabsTrigger
              value="left"
              className="text-base font-normal text-[var(--color-white-1)] data-active:text-[var(--color-neon)] dark:data-active:text-[var(--color-neon)]"
            >
              Left
            </TabsTrigger>
            <TabsTrigger
              value="right"
              className="text-base font-normal text-[var(--color-white-1)] data-active:text-[var(--color-neon)] dark:data-active:text-[var(--color-neon)]"
            >
              Right
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Same narrow-width horizontal scroll guard the live editor uses. Structure
          matches Set.tsx: every row is a direct child of the grid (fragments only),
          so grid-cols-subgrid inherits the outer tracks. */}
      <div className="overflow-x-auto">
        <div className={`grid ${grid.template} min-w-[240px] items-center gap-x-[var(--space-sm)] gap-y-[var(--space-md)]`}>
          {exercise.sets.map((set, setIndex) => (
            <Fragment key={set.id}>
              {/* Set heading with the neon accent bar */}
              <div className="col-span-full flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-[var(--color-neon)]" />
                <h3 className="text-base font-semibold">Set {setIndex + 1}</h3>
              </div>
              {/* Column labels, aligned to the outer tracks via subgrid */}
              <div className="col-span-full grid grid-cols-subgrid items-center text-left text-xs tracking-wider text-muted-foreground">
                {grid.headers.map((label) => (
                  <div key={label} className={label === "Weights" || label === "Reps" ? "text-center" : "text-left"}>
                    {label.toLocaleUpperCase()}
                  </div>
                ))}
              </div>
              {set.dropsets.map((dropset, dropIndex) => (
                <Fragment key={dropset.id}>
                  <div className="col-span-full grid grid-cols-subgrid items-center">
                    {renderCells(dropset[activeLimb] ?? {})}
                  </div>
                  {dropIndex !== set.dropsets.length - 1 && (
                    <Separator className="col-span-full" />
                  )}
                </Fragment>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReadonlyExercise
