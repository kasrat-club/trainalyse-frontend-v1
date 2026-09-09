import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { X, SearchIcon } from "lucide-react"
import { exercises } from "@/data/exercise"
import React, { type ChangeEvent } from "react"
import { cn } from "@/lib/utils"
import { useScrollLock } from "@/hooks/use-scroll-lock"

// this interface is used for the functions that are like properties of this component like onclose it should go to void
// and onconfirm it should pass the id of the exercise which was confirmed and should go to void
interface ExerciseSearchProps {
  onClose: () => void
  onConfirm: (exerciseId: number) => void
}

// the equipment subtitle, pulled from the trailing "(...)" in the name (e.g.
// "Bench Press (Barbell)" -> "Barbell"). undefined when the name has none.
function equipmentOf(name: string) {
  return name.match(/\(([^)]+)\)/)?.[1]
}

function ExerciseSearch({ onClose, onConfirm }: ExerciseSearchProps) {
  // freeze the page behind the modal so it can't scroll (only mounts while open)
  useScrollLock(true)

  // this if for the exercise that is being searched by the user
  const [exerciseSearch, setExerciseSearch] = React.useState("")
  // the selection is held by id, not by name - the name is only ever display
  // text, so everything that has to survive a rename keys off this instead
  const [selectedExerciseId, setSelectedExerciseId] = React.useState<
    number | null
  >(null)
  const selectedExercise =
    exercises.find((e) => e.id === selectedExerciseId)?.name ?? ""
  // this function is for setting the onchange on the input for the search and also unselecting the selected exercise
  function handleExerciseTypeForSearch(e: ChangeEvent<HTMLInputElement>) {
    setExerciseSearch(e.target.value)
    setSelectedExerciseId(null)
  }
  // this lowers down the list of exercises after the user enters their search letters
  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  )

  return (
    // full-screen modal: it covers the whole page but is still just an overlay
    // rendered over the workout page (which stays mounted behind it), not a route
    <div className="fixed inset-0 z-40 flex flex-col bg-[var(--bg-surface-primary)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* header: search input + close */}
      <div className="flex items-center gap-[var(--space-md)] p-[var(--space-lg)]">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 w-full pl-10"
            placeholder="Search your exercise"
            // show the selected exercise in the bar when there is one, otherwise
            // whatever the user has typed
            value={selectedExercise ? selectedExercise : exerciseSearch}
            onChange={handleExerciseTypeForSearch}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close"
          className="shrink-0 text-[var(--text-primary)]"
          onClick={onClose}
        >
          <X className="size-6" />
        </Button>
      </div>

      {/* the exercise list. tapping the selected one clears it, tapping any other
          replaces it. the selected row is tinted, bold and carries a neon radio. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--space-lg)]">
        {filteredExercises.map((exercise) => {
          const isSelected = selectedExerciseId === exercise.id
          const equipment = equipmentOf(exercise.name)
          return (
            <button
              key={exercise.id}
              type="button"
              onClick={() =>
                setSelectedExerciseId(isSelected ? null : exercise.id)
              }
              className={cn(
                "flex w-full items-center justify-between gap-[var(--space-md)] rounded-[var(--radius-card)] px-[var(--space-md)] py-[var(--space-md)] text-left",
                isSelected && "bg-[var(--bg-exerciseSelected)]"
              )}
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-lg text-[var(--text-primary)]",
                    isSelected ? "font-bold" : "font-normal"
                  )}
                >
                  {exercise.name}
                </p>
                {equipment && (
                  <p className="text-sm text-[var(--text-subheading)]">
                    {equipment}
                  </p>
                )}
              </div>

            </button>
          )
        })}
      </div>

      {/* bottom action bar: a disabled prompt until something is selected, then
          it turns into the neon Confirm button */}
      <div className="p-[var(--space-lg)]">
        {selectedExerciseId !== null ? (
          <Button
            className="h-12 w-full bg-brand text-base  text-[var(--text-on-button)]"
            onClick={() => {
              onConfirm(selectedExerciseId)
              onClose()
            }}
          >
            Confirm
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled
            className="h-12 w-full text-base text-[var(--text-subheading)]"
          >
            Select an exercise to continue
          </Button>
        )}
      </div>
    </div>
  )
}

export default ExerciseSearch
