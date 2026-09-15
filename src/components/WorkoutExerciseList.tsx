import { Button } from "@/components/ui/button"
import Exercise from "@/Exercise"
import { type WorkoutExercise } from "@/data/workouts"

// The list of exercise cards plus the "Add new Exercise" button. A pure leaf —
// it maps the exercises it's given into cards and reports back what the user did
// (changed a card, deleted one, tapped edit, tapped add). All the real work —
// updating the array, opening the search modal — lives in useWorkoutEditor.
type WorkoutExerciseListProps = {
  exercises: WorkoutExercise[]
  bodyWeight: number
  onExerciseChange: (updated: WorkoutExercise) => void
  onBodyWeightChange: (value: number) => void
  onDeleteExercise: (id: number) => void
  onEditExercise: (id: number) => void
  onAddExercise: () => void
}

export function WorkoutExerciseList({
  exercises,
  bodyWeight,
  onExerciseChange,
  onBodyWeightChange,
  onDeleteExercise,
  onEditExercise,
  onAddExercise,
}: WorkoutExerciseListProps) {
  return (
    <>
      {/* own flex column at --space-lg (16px) so the gap BETWEEN exercise cards
          is 16px, independent of the page's 12px (--space-md) gap that still
          spaces this block from the title above and the Add button below. Only
          rendered when there ARE exercises, so an empty wrapper can't add a
          stray gap between the title and the Add button. */}
      {exercises.length > 0 && (
        <div className="flex flex-col gap-[var(--space-lg)]">
          {exercises.map((exercise) => (
            <Exercise
              key={exercise.id}
              exerciseData={exercise}
              onChange={onExerciseChange}
              bodyWeight={bodyWeight}
              onBodyWeightChange={onBodyWeightChange}
              onDelete={() => onDeleteExercise(exercise.id)}
              onEdit={() => onEditExercise(exercise.id)}
            />
          ))}
        </div>
      )}

      {/*for the add new exercise button */}
      <Button className="bg-brand h-9" onClick={onAddExercise}>
        Add new Exercise
      </Button>
    </>
  )
}
