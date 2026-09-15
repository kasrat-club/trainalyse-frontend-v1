import Dropsets from "./Dropsets"
import { type ExerciseType } from "./data/exercise"
import { Button } from "@/components/ui/button"
import { CircleX, CircleHelp } from "lucide-react"
import { type WorkoutSet, type Dropset, type Limb } from "./data/workouts"
import { user } from "./data/user"
import React from "react"
import { Separator } from "./components/ui/separator"
import { ConfirmModal } from "@/components/ConfirmModal"


interface SetsProps {
  exerciseType: ExerciseType | ""
  isBodyweight: boolean
  // the workout's live bodyweight, threaded down to each dropset's assisted cap
  bodyWeight: number
  number : number
  headers: string[]
  setData: WorkoutSet
  activeLimb: Limb
  isOnlySet: boolean
  onChange: (updated: WorkoutSet) => void
  // called when the user adds a 4th (or later) dropset to this set — the parent
  // Exercise decides whether to actually show the "enough dropsets" nudge (it
  // only shows once per exercise). The dropset is added either way.
  onAddBeyondLimit: () => void
  // opens the Exercise-level "how difficulty works" modal (the ? next to the
  // DIFFICULTY column label). Only bodyweight exercises show that column.
  onDifficultyHelp: () => void
  // the same-positioned set from this exercise's most recent instance (or
  // undefined). Each dropset's counterpart feeds the "last time" placeholders.
  lastSet?: WorkoutSet
}


function Sets({ exerciseType, isBodyweight, bodyWeight, setData, activeLimb, onChange,number, headers, isOnlySet, onAddBeyondLimit, onDifficultyHelp, lastSet }: SetsProps) {
  // the Weights column header shows the user's chosen unit, uppercased to match
  // the other headers (WEIGHTS/REPS/TIME).
  const weightUnitLabel = user.weightUnit === "kg" ? "KGS" : "LBS"
  {/*this is for adding new dropset */}
  function handleAddDropset() {
    // 3 dropsets is the sensible cap; adding while there are already 3+ means
    // this new one is the 4th or beyond — tell the parent so it can nudge.
    const beyondLimit = setData.dropsets.length >= 3
    const newDropset: Dropset = { id: Date.now(), left: {} }
    // rebuild THIS set with the new dropset, and hand it up to Exercise
    onChange({ ...setData, dropsets: [...setData.dropsets, newDropset] })
    if (beyondLimit) onAddBeyondLimit()
  }


  // which dropset is pending deletion — null when the confirm modal is closed.
  // One piece of state does three jobs: which row to highlight, whether the
  // modal is open, and which id to delete on confirm.
  const [pendingDeleteId, setPendingDeleteId] = React.useState<number | null>(null)


  // clicking a row's delete icon opens the confirm modal for THAT dropset
  function handleRemoveModalDropset(id: number) {
    setPendingDeleteId(id)
  }
  // actually removes the dropset — called from the modal's Confirm button
  function handleRemoveDropset(id: number) {
    onChange({ ...setData, dropsets: setData.dropsets.filter((d)=>d.id!==id) })
  }

  function handleDropsetChange(updatedDropset: Dropset) {
    // one of my dropsets changed — swap it in by id and hand my new self up
    onChange({
      ...setData,
      dropsets: setData.dropsets.map((d) =>
        d.id === updatedDropset.id ? updatedDropset : d
      ),
    })
  }

  return (
    <>
      {/* Set heading — one level below the exercise name, with a neon accent bar.
          Spans all columns and sits above this set's column labels + rows. */}
      <div className="col-span-full flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-[var(--color-neon)]" />
        <h3 className="text-base font-semibold">Set {number}</h3>
      </div>
      {/* Column labels for this set's value cells (Set number is no longer a
          column). Re-uses the outer grid tracks via subgrid so they line up. */}
      <div className="col-span-full grid grid-cols-subgrid items-center text-left text-base text-xs tracking-wider">
        {headers.map((label) =>
            // the Difficulty label + a ? that opens the "how difficulty works"
            // modal; the whole label is the button, inheriting the header's
            // colour and size so the icon matches the text.
            label === "Difficulty" ? (
              <button
                key={label}
                type="button"
                aria-label="How difficulty works"
                onClick={onDifficultyHelp}
                className="flex items-center gap-1 text-left"
              >
                {label.toLocaleUpperCase()}
                <CircleHelp className="size-3.5 text-[var(--color-neon)]" />
              </button>
            ) : (
              <div
                key={label}
                className={label === "Weights" || label === "Reps" ? "text-center" : "text-left"}
              >
                {/* the Weights column is labelled with the user's chosen unit
                    (KGS / LBS) rather than the word "Weights". */}
                {label === "Weights" ? weightUnitLabel : label.toLocaleUpperCase()}
              </div>
            )
          )}
        <div />
      </div>
      {setData.dropsets.map((dropset, index) => (
          <React.Fragment key={dropset.id}>
            <div
              className={`col-span-full grid grid-cols-subgrid items-center rounded-md transition-colors ${
                dropset.id === pendingDeleteId ? "bg-input/30" : ""
              }`}
            >
              <Dropsets
                exerciseType={exerciseType}
                isBodyweight={isBodyweight}
                bodyWeight={bodyWeight}
                dropsetData={dropset}
                activeLimb={activeLimb}
                onChange={handleDropsetChange}
                lastDropset={lastSet?.dropsets[index]}
              />
              <div className="flex justify-end">
                {!(isOnlySet && setData.dropsets.length === 1) && (
                  <button
                    type="button"
                    aria-label="delete dropset"
                    onClick={() => handleRemoveModalDropset(dropset.id)}
                    className="text-white/80 transition-colors hover:text-white"
                  >
                    <CircleX className="size-5 " />
                  </button>
                )}
              </div>
            </div>

            {index !== setData.dropsets.length - 1 && (
              <Separator className="col-span-full" />
            )}
          </React.Fragment>
        ))}
      {/* + for drop sets spans the whole grid row */}
      {exerciseType && (
        <Button variant="outline" className="col-span-full h-9 w-3/4  justify-self-center" onClick={handleAddDropset}>
          Add new Drop set
        </Button>
      )}

      {/* Confirm-delete dialog. Open while a dropset is pending; the highlighted
          row shows which one. Shared ConfirmModal, so it matches every other
          confirm dialog in the app. */}
      {pendingDeleteId !== null && (
        <ConfirmModal
          title="Delete this dropset?"
          confirmLabel="Delete"
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => {
            handleRemoveDropset(pendingDeleteId)
            setPendingDeleteId(null)
          }}
        />
      )}
    </>
  )
}

export default Sets
