import { useId, useMemo, useState } from "react"
import { exercises, type ExerciseType } from "@/data/exercise"
import {
  type WorkoutExercise,
  type WorkoutSet,
  type Limb,
} from "@/data/workouts"
import { user } from "@/data/user"
import { WEIGHT_LIMITS, weightRangeError } from "@/lib/weight"
import { getExerciseInstance } from "@/data/calculations"
import { tipToast } from "@/components/tip-toast"
import { warnToast } from "@/components/warn-toast"

// Per-exercise-type column config: the grid-cols template AND the header labels
// come from ONE place so the header count can never drift from the column count
// (a mismatch makes the grid auto-flow shift diagonally). The Set number is no
// longer a column — it's a per-set heading above the rows — so `headers` lists
// the value cells and the template adds only the trailing Delete column.
//
// Responsive sizing, from left to right:
//   • Difficulty — min-content: a fixed dropdown, pinned to its label width at
//     every screen size (it shouldn't balloon on wide screens).
//   • Weights / Reps — minmax(min-content, 1fr): at their header width when
//     there's no room (320px), and they breathe as the screen widens.
//   • Time — minmax(8ch, 1fr): same, but with a floor of ~8 characters
//     (HH:MM:SS) so the widest value can never clip even while sharing space.
//   • Delete — auto: hugs the icon.
// So at 320px everything sits at its minimum (fits), and every extra pixel is
// split between the value columns — no column hoards the slack.
// NOTE: `grid-cols-[…]` strings must be written as full literals so Tailwind can
// see and generate them — don't build them by concatenation.
function getGridConfig(exerciseType: ExerciseType | "", isBodyweight: boolean) {
  if (exerciseType === "duration") {
    return isBodyweight
      ? { template: "grid-cols-[min-content_minmax(min-content,1fr)_minmax(8ch,1fr)_auto]", headers: ["Difficulty", "Weights", "Time"] }
      : { template: "grid-cols-[minmax(min-content,1fr)_minmax(8ch,1fr)_auto]", headers: ["Weights", "Time"] }
  }
  // weightsAndReps (and the "" no-exercise fallback)
  return isBodyweight
    ? { template: "grid-cols-[min-content_minmax(min-content,1fr)_minmax(min-content,1fr)_auto]", headers: ["Difficulty", "Weights", "Reps"] }
    : { template: "grid-cols-[minmax(min-content,1fr)_minmax(min-content,1fr)_auto]", headers: ["Weights", "Reps"] }
}

// The "brain" of one exercise card: the catalog-derived facts (type, bodyweight,
// per-limb), every piece of card state (active limb, the three modals, the
// dropset nudge), the last logged instance, and all the handlers. No JSX — it
// just tracks the card and hands back what it needs; the Exercise component only
// renders. It takes the row plus the callbacks its handlers write through.
export function useExercise(
  exerciseData: WorkoutExercise,
  onChange: (updated: WorkoutExercise) => void,
  onBodyWeightChange: (weight: number) => void
) {
  // The exercise is already chosen (via the popup), so just look up its
  // type/bodyweight from the catalog by id — no local state needed. the name
  // comes from here too now, rather than being stored on the workout row
  const matchedExercise = exercises.find(
    (e) => e.id === exerciseData.exerciseId
  )
  //this below lines means that there is a new variable called exerciseType and it will be like ExerciseType or
  // empty like "" and it will be equal to the exercise that the user has selected to add and it wil be equal to its
  // type otherwise it is empty
  const exerciseType: ExerciseType | "" = matchedExercise?.type ?? ""
  // isBodyweight a new variable which is a property of the exercise and not a specific type
  const isBodyweight = matchedExercise?.isBodyweight ?? false
  // again same , it is a property
  const perLimb = matchedExercise?.perLimb ?? false
  //this is for the limb that is currently being filled and by default it is left and we have imported the Limb
  const [activeLimb, setActiveLimb] = useState<Limb>("left")

  // whether the "delete this whole exercise" confirm modal is open. deleting an
  // exercise is more destructive than a dropset, so it goes through a confirm
  // step (mirrors the dropset delete modal in Set.tsx) instead of firing instantly.
  const [confirmDelete, setConfirmDelete] = useState(false)

  // whether the read-only "previous performance" sheet is open, and whether
  // there's any past logged instance to show — the menu item is disabled and
  // muted when this exercise has never been performed.
  const [showPrevious, setShowPrevious] = useState(false)
  // the most recent logged instance of this exercise (or null). Drives BOTH the
  // "previous performance" menu enable state AND the per-cell "last time" muted
  // placeholders (matched positionally: current set i / dropset j -> this
  // instance's sets[i].dropsets[j]).
  const lastInstance = useMemo(() => {
    const instances = getExerciseInstance(exerciseData.exerciseId)
    return instances.length ? instances[instances.length - 1].exercise : null
  }, [exerciseData.exerciseId])
  const hasPrevious = lastInstance !== null

  // "enough dropsets" nudge — shown the first time the user adds a 4th dropset to
  // ANY set of THIS exercise. `dropsetWarned` makes it fire once per exercise:
  // once it's true, further 4th+ adds (this set or any other) are left alone.
  const [dropsetWarned, setDropsetWarned] = useState(false)
  // stable id so the tip refreshes ONE toast instead of stacking
  const dropsetTipId = useId()

  function handleDropsetBeyondLimit() {
    if (dropsetWarned) return
    setDropsetWarned(true)
    tipToast(
      "2 dropsets are enough to tire your muscles, going to 3rd dropset is not needed",
      dropsetTipId
    )
  }

  // "update your bodyweight" modal — reachable only on bodyweight exercises (the
  // header person icon). The value it edits lives on the Workout (shared across
  // every exercise), so the last weight SAVED anywhere wins. The draft starts
  // empty so the big number shows the last logged weight as a muted placeholder
  // and Save stays disabled until a fresh, in-range value is typed.
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [weightDraft, setWeightDraft] = useState<number | undefined>(undefined)
  const weightToastId = useId()
  const weightUnit = user.weightUnit
  const weightLimit = WEIGHT_LIMITS[weightUnit]
  // Save is enabled only when a value has been typed AND it's in range. The max
  // is already blocked live by NumericCell; this also catches a below-min entry
  // (which CAN be typed, since "50" passes through "5") by keeping Save off.
  const canSaveWeight = weightRangeError(weightDraft, weightUnit) === undefined

  function openWeightModal() {
    setWeightDraft(undefined) // empty → placeholder shows last weight, Save off
    setShowWeightModal(true)
  }

  // Save commits the new weight up (becomes the shared bodyweight) and closes.
  // Guarded, though the button is disabled unless canSaveWeight anyway.
  function saveWeight() {
    if (!canSaveWeight) return
    onBodyWeightChange(weightDraft as number)
    setShowWeightModal(false)
  }

  // The X / backdrop just closes WITHOUT saving. If the user had typed something,
  // warn that it wasn't kept (so a dismissed edit isn't silently lost); if they
  // never typed, close quietly.
  function closeWeightModal() {
    if (weightDraft !== undefined) {
      warnToast(
        "You didn't press Save, so your bodyweight wasn't updated.",
        weightToastId
      )
    }
    setShowWeightModal(false)
  }

  // "how difficulty works" modal (the ? by the DIFFICULTY column). The metric is
  // volume (bodyweight × reps) for weights-and-reps exercises and endurance
  // (bodyweight × time) for duration ones — matching the calc layer.
  const [showDifficultyHelp, setShowDifficultyHelp] = useState(false)
  const isDuration = exerciseType === "duration"
  const metricLabel = isDuration ? "Endurance" : "Volume"
  const factorLabel = isDuration ? "total seconds" : "reps"

  // grid template + header labels for THIS exercise type (see getGridConfig above)
  const gridConfig = getGridConfig(exerciseType, isBodyweight)

  // this is the function where we are adding a new set to the exercise which has already 1 set by default
  function handleAddSet() {
    const base = Date.now()
    const newSet: WorkoutSet = { id: base, dropsets: [{ id: base + 1, left: {} }] }
    onChange({ ...exerciseData, sets: [...exerciseData.sets, newSet] })
  }

  // this is the section that handles logic that if a set has no dropset left so it will  be deleted and
  // if any dropset is updated then it is changed in the ui and kept in sync with the ui by the onchange
  function handleSetChange(updatedSet: WorkoutSet) {
    if (updatedSet.dropsets.length === 0) {
      onChange({
        ...exerciseData, sets: exerciseData.sets.filter((s) => s.id !== updatedSet.id),
      })
    } else {
      onChange({
        ...exerciseData, sets: exerciseData.sets.map((s) => s.id === updatedSet.id ? updatedSet : s),
      })
    }
  }

  // this is for toggle or switch that the user can turn on or off that they want to log for different limbs
  function handleTogglePerLimb(value: boolean) {
    onChange({ ...exerciseData, perLimbEnabled: value })
  }

  // everything the JSX reads — same names it used when this lived inside the
  // component, so the markup didn't need to change.
  return {
    matchedExercise,
    exerciseType,
    isBodyweight,
    perLimb,
    activeLimb,
    setActiveLimb,
    confirmDelete,
    setConfirmDelete,
    showPrevious,
    setShowPrevious,
    lastInstance,
    hasPrevious,
    handleDropsetBeyondLimit,
    showWeightModal,
    openWeightModal,
    closeWeightModal,
    saveWeight,
    canSaveWeight,
    weightDraft,
    setWeightDraft,
    weightUnit,
    weightLimit,
    showDifficultyHelp,
    setShowDifficultyHelp,
    metricLabel,
    factorLabel,
    gridConfig,
    handleAddSet,
    handleSetChange,
    handleTogglePerLimb,
  }
}
