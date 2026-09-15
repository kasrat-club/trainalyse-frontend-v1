import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Sets from "./Set"
import { Button } from "@/components/ui/button"
import { type WorkoutExercise } from "./data/workouts"
import { Switch } from "@/components/ui/switch"
import PreviousPerformance from "@/components/PreviousPerformance"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/ui/accordion"
import { EllipsisVerticalIcon, Pencil, History, Trash2, PersonStanding } from "lucide-react"
import { ConfirmModal } from "@/components/ConfirmModal"
import { BodyweightModal } from "@/components/BodyweightModal"
import { DifficultyHelpModal } from "@/components/DifficultyHelpModal"
import { useExercise } from "@/hooks/useExercise"

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
  // the whole brain of one exercise card lives in this hook now. it hands back
  // the exact same names the JSX below already used, so nothing in the markup
  // had to change.
  const {
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
  } = useExercise(exerciseData, onChange, onBodyWeightChange)

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

    {/* "Update your bodyweight" modal (bodyweight exercises only) — its own
        self-locking component now; the hook still owns the draft + save logic. */}
    {showWeightModal && (
      <BodyweightModal
        metricLabel={metricLabel}
        weightDraft={weightDraft}
        onWeightChange={setWeightDraft}
        weightLimit={weightLimit}
        weightUnit={weightUnit}
        bodyWeight={bodyWeight}
        canSave={canSaveWeight}
        onSave={saveWeight}
        onClose={closeWeightModal}
      />
    )}

    {/* "How difficulty works" modal (the ? by the DIFFICULTY column) — its own
        self-locking component; X / backdrop / OK all just close it. */}
    {showDifficultyHelp && (
      <DifficultyHelpModal
        metricLabel={metricLabel}
        factorLabel={factorLabel}
        onClose={() => setShowDifficultyHelp(false)}
      />
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
