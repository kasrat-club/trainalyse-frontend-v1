import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Sets from "./Set"
import { exercises, type ExerciseType } from "./data/exercise"
import { Button } from "@/components/ui/button"
import { type WorkoutExercise, type WorkoutSet ,type Limb} from "./data/workouts"
import { Switch } from "@/components/ui/switch"
import { useId, useMemo, useState } from "react"
import PreviousPerformance from "@/components/PreviousPerformance"
import { tipToast } from "@/components/tip-toast"
import { warnToast } from "@/components/warn-toast"
import NumericCell from "@/components/NumericCell"
import { Textarea } from "@/components/ui/textarea"
import { user } from "./data/user"
import {
  WEIGHT_LIMITS,
  WEIGHT_FRAC_DIGITS,
  weightRangeError,
} from "@/lib/weight"
import { getExerciseInstance } from "./data/calculations"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/ui/accordion"
import { EllipsisVerticalIcon, Pencil, History, Trash2, PersonStanding, X } from "lucide-react"
import { useScrollLock } from "@/hooks/use-scroll-lock"
import { ConfirmModal } from "@/components/ConfirmModal"

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

//exercise data is like a singular workout exercise, onChange gives us the updated which is also like the
// workoutexercise and ondelete is the callback that was in the workout file
interface ExerciseProps {
  exerciseData: WorkoutExercise
  onChange: (updated: WorkoutExercise) => void
  onDelete: () => void
   onEdit: () => void
  // the workout's live bodyweight + a way to update it. Shared across every
  // exercise so the last value entered (in any bodyweight exercise's modal) wins.
  bodyWeight: number
  onBodyWeightChange: (weight: number) => void
}


function Exercise({ exerciseData, onChange, onDelete, onEdit, bodyWeight, onBodyWeightChange }: ExerciseProps) {
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
  useScrollLock(showWeightModal)
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
  useScrollLock(showDifficultyHelp)
  const isDuration = exerciseType === "duration"
  const metricLabel = isDuration ? "Endurance" : "Volume"
  const factorLabel = isDuration ? "total seconds" : "reps"

  // grid template + header labels for THIS exercise type (see getGridConfig above)
  const gridConfig = getGridConfig(exerciseType, isBodyweight)

  // this is the function where we are adding a new set to the exercise which has already 1 set by default
  function handleAddSet() {
      const base = Date.now()
      const newSet: WorkoutSet = { id: base, dropsets: [{ id: base + 1 ,left:{}}] }
      onChange({ ...exerciseData, sets: [...exerciseData.sets, newSet] })
  }

  // this is the section that handles logic that if a set has no dropset left so it will  be deleted and
  // if any dropset is updated then it is changed in the ui and kept in sync with the ui by the onchange
  function handleSetChange(updatedSet: WorkoutSet) {
    if (updatedSet.dropsets.length === 0) {
      onChange({
        ...exerciseData,sets : exerciseData.sets.filter( (s)=>s.id!== updatedSet.id),
      })
    } else {
      onChange({
        ...exerciseData,sets : exerciseData.sets.map((s)=>s.id===updatedSet.id?updatedSet:s),
      })
    }
  }

  // this is for toggle or switch that the user can turn on or off that they want to log for different limbs
  function handleTogglePerLimb(value: boolean) {
     onChange({ ...exerciseData, perLimbEnabled: value })
  }


  return (
    <>
    <Card>
      <Accordion type="single" collapsible defaultValue="exercise">
        <AccordionItem value="exercise">
          <CardHeader className="pl-3.5 pr-4 items-center">
            <AccordionTrigger className="py-0">
              <CardTitle className="text-lg font-bold">{matchedExercise?.name}</CardTitle>
            </AccordionTrigger>
            {/* All three controls are bare, evenly-spaced glyphs: the person +
                chevron are matching 22px circles, the kebab is a padding-free icon
                nudged right (translate-x-2) so its centered dots land on the same
                right line as Save / the inputs. That 8px shift widens the visual
                person↔kebab gap to ~20px (gap-3 + translate), so chevron↔person is
                matched with ml-4 (16px) + the grid's own gap-1 (4px) = 20px. */}
            <CardAction className="self-center row-span-1 ml-4 flex items-center gap-3">
              {/* bodyweight exercises only: tap to update the workout's bodyweight.
                  Circle mirrors the accordion chevron; neon dot marks it as the
                  "your weight" affordance. */}
              {isBodyweight && (
                <button
                  type="button"
                  aria-label="Update your bodyweight"
                  onClick={openWeightModal}
                  className="relative flex size-[22px] shrink-0 items-center justify-center rounded-full border border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] text-[var(--color-white-1)] transition-colors hover:text-[var(--color-neon)]"
                >
                  <PersonStanding className="size-4" />
                  <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border border-[var(--bg-surface-primary)] bg-[var(--color-neon)]" />
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="size-6 translate-x-2 p-0">
                    <EllipsisVerticalIcon className="size-6" />
                  </Button>
                </DropdownMenuTrigger>
                {/* align="end" anchors the menu's right edge to the (right-side)
                    kebab and lets it grow leftward OVER the card; w-max sizes it
                    to the widest item so labels stay on one line, capped at the
                    collision-available width so it wraps only when it must; and
                    collisionPadding keeps it 23px off the viewport edges — the
                    same 23px the page frame uses — so it never leaks out. */}
                {/* flex column with gap-3 (12px) gives even breathing room
                    between the three options; p-2 keeps the same room at the
                    top/bottom edges. No separator before Delete — kept simple. */}
                <DropdownMenuContent
                  align="end"
                  collisionPadding={23}
                  className="flex w-max max-w-[var(--radix-dropdown-menu-content-available-width)] flex-col gap-3 p-2"
                >
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil />
                    Edit Exercise
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!hasPrevious}
                    onClick={() => setShowPrevious(true)}
                  >
                    <History />
                    Previous performance
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}>
                    <Trash2 />
                    Delete Exercise
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>

          <AccordionContent className="h-auto pb-0">
            <CardContent className="pl-3.5 pr-4 flex flex-col gap-[var(--space-md)]">
              {/*ok so the below sections logic is that if the perlimb is true so either dumbbell or cable(nnot barbell) so thats
               when the switch wil be provided and when the user clicks on the switch the flip happens in the component internally
              and we dont see it right here in the code and then handletoggleperlimb function you see before return
             is just for saving the value that is being sent by the switch component. */}
              {perLimb && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={exerciseData.perLimbEnabled ?? false}
                    onCheckedChange={handleTogglePerLimb}
                  />
                  <span>Log separate for each limb</span>
                </div>
              )}

              {/* so if the perlimb is true that is it can be done with one limb, and it is enabled that means the user
               does wants to record separately for each limb then there will left and right tabs appearing . */}

              {perLimb && exerciseData.perLimbEnabled && (

                <Tabs value={activeLimb} onValueChange={(v) => setActiveLimb(v as "left" | "right")}>
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

              {/* Horizontal scroll for pathologically narrow widths (< ~320px,
                  e.g. the Galaxy Fold cover screen at 280px). The grid floors at
                  ~240px — roughly its width inside the card at a 320px viewport —
                  so every column including the trailing delete stays usable, and
                  overflow-x-auto lets the row scroll sideways instead of the card
                  clipping the delete off-screen. At >=320px it fills, no scroll. */}
              <div className="overflow-x-auto">
              <div className={`grid ${gridConfig.template} items-center gap-x-[var(--space-sm)] gap-y-[var(--space-md)] min-w-[240px]`}>
              {exerciseData.sets.map((set,index) => (
                <Sets
                  key={set.id}
                  number = {index+1}
                  exerciseType={exerciseType}
                  isBodyweight={isBodyweight}
                  bodyWeight={bodyWeight}
                  headers={gridConfig.headers}
                  setData={set}
                  activeLimb={activeLimb}
                  isOnlySet={exerciseData.sets.length === 1}
                  onChange={handleSetChange}
                  onAddBeyondLimit={handleDropsetBeyondLimit}
                  onDifficultyHelp={() => setShowDifficultyHelp(true)}
                  lastSet={lastInstance?.sets[index]}
                />
              ))}</div>
              </div>
              <Button className="h-9 w-full " onClick={handleAddSet}>Add new Set</Button>

              {/* Optional note about how the exercise felt. Never required — an
                  empty box just stays empty. The muted uppercase label matches
                  the KGS/REPS column headers; gap-1 (4px) sits it above the box. */}
              <div className="flex flex-col gap-1">
                <span className="text-sm uppercase tracking-wider text-muted-foreground">
                  Notes
                  </span>
                <Textarea
                  value={exerciseData.notes ?? ""}
                  onChange={(e) => onChange({ ...exerciseData, notes: e.target.value })}
                  placeholder="how did this exercise feel? e.g. tired today, fewer reps than last time (optional)"
                />
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>

    {/* Confirm-delete dialog for the whole exercise. Shared ConfirmModal, so it
        matches every other confirm dialog. Names the exercise so it's clear which
        one is going. */}
    {confirmDelete && (
      <ConfirmModal
        title={
          <>
            Delete <span className="text-foreground">{matchedExercise?.name}</span>?
          </>
        }
        description="This exercise and all its sets will be removed from the workout."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          onDelete()
          setConfirmDelete(false)
        }}
      />
    )}

    {/* "Update your bodyweight" modal (bodyweight exercises only). The big number
        IS the input (reuses NumericCell, so the max is blocked live with a toast).
        Empty shows the last logged weight as a muted placeholder and keeps Save
        off; Save commits, the X / backdrop closes WITHOUT saving. */}
    {showWeightModal && (
      <div
        className="fixed inset-0 z-10 flex items-center justify-center bg-black/40"
        onClick={closeWeightModal}
      >
        <div
          className="relative flex w-[85%] max-w-[360px] flex-col items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={closeWeightModal}
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-[var(--border-cardEdge)] bg-white/5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>

            <p className="text-base font-medium">Update your bodyweight</p>
            <p className="text-base text-center">This is to calculate {metricLabel.toLowerCase()} for Bodyweight exercises</p>

          {/* the big number = the input; empty shows the last weight, muted.
              field-sizing:content makes the field hug the number so the "kg"
              stays next to it and the pair reads centered. */}
          <div className="flex items-baseline justify-center gap-1">
            <NumericCell
              value={weightDraft}
              onChange={setWeightDraft}
              intDigits={weightLimit.intDigits}
              fracDigits={WEIGHT_FRAC_DIGITS}
              max={weightLimit.max}
              rejectMessage={`You can only enter weight between ${weightLimit.min} and ${weightLimit.max} ${weightUnit}.`}
              placeholder={String(bodyWeight)}
              className="h-auto w-auto border-0 bg-transparent p-0 text-center text-6xl font-bold text-foreground shadow-none [field-sizing:content] placeholder:text-muted-foreground focus-visible:ring-0 md:text-6xl dark:bg-transparent"
            />
            <span className="text-2xl font-semibold text-muted-foreground">{weightUnit}</span>
          </div>

          <p className="text-sm text-muted-foreground">
            Last logged Bodyweight - {bodyWeight} {weightUnit}
          </p>

          <Button className="w-full h-11" onClick={saveWeight} disabled={!canSaveWeight}>
            Save
          </Button>
        </div>
      </div>
    )}

    {/* "How difficulty works" modal (the ? by the DIFFICULTY column). X or
        backdrop or OK all just close it. Formulas mirror the calc layer:
        volume × reps for weights-and-reps, endurance × time for duration. */}
    {showDifficultyHelp && (
      <div
        className="fixed inset-0 z-10 flex items-center justify-center bg-black/40"
        onClick={() => setShowDifficultyHelp(false)}
      >
        <div
          className="relative flex w-[85%] max-w-[360px] flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] p-5 pt-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowDifficultyHelp(false)}
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-[var(--border-cardEdge)] bg-white/5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          <div className="flex flex-col gap-1 pr-8">
            <p className="text-base font-semibold">How difficulty works</p>
            <p className="text-sm text-muted-foreground">
              Difficulty changes how this exercise's {metricLabel.toLowerCase()} is
              calculated.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { name: "Normal", formula: `${metricLabel} = bodyweight × ${factorLabel}` },
              { name: "Assisted", formula: `${metricLabel} = (bodyweight − assisted weight) × ${factorLabel}` },
              { name: "Weighted", formula: `${metricLabel} = (bodyweight + extra weight) × ${factorLabel}` },
            ].map((row) => (
              <div key={row.name} className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{row.name}</span>
                <span className="text-sm text-muted-foreground">{row.formula}</span>
              </div>
            ))}
          </div>

          <Button className="h-11 w-full" onClick={() => setShowDifficultyHelp(false)}>
            OK
          </Button>
        </div>
      </div>
    )}

    {/* Read-only snapshot of the most recent logged instance of this exercise.
        Bottom sheet, 70% height, dimmed/blurred backdrop, X or backdrop tap to
        close. Only reachable when hasPrevious, so it never opens empty. */}
    <PreviousPerformance
      open={showPrevious}
      onOpenChange={setShowPrevious}
      exerciseId={exerciseData.exerciseId}
    />
    </>
  )
}

export default Exercise
