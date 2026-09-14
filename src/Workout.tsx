"use client" // this is a just a nextjs thing and its a dead code and does nothing
import { Input } from "@/components/ui/input"
import React, { type ChangeEvent } from "react"
import { DatePickerDemo } from "./components/DatePicker"
import { Button } from "@/components/ui/button"
import { type Workout as WorkoutData, type WorkoutExercise } from "./data/workouts"
import { user } from "./data/user"
import { format } from "date-fns"
import Timesetter from "@/components/ui/timesetter"
import { Check, Trash2Icon, X } from "lucide-react"
import { Label } from "./components/ui/label"
import ExerciseSearch from "./components/ExerciseSearch"
import Exercise from "./Exercise"
import { useLocation, Navigate, useNavigate } from "react-router-dom"
import { Field, FieldError } from "@/components/ui/field"
import { useTrimWhitespace, normalizeText } from "@/hooks/use-trim-whitespace"
import { useActiveWorkout } from "@/hooks/useActiveWorkout"
import { type WorkoutDraft } from "@/components/active-workout-provider"
import { DiscardConfirmModal } from "./components/DiscardConfirmModal"
import { useScrolled } from "@/hooks/use-scrolled"
import { cn } from "@/lib/utils"

// Same header-pill shape used by the Back / Edit pills on the read-only view
// (WorkoutView) so Discard / Save match their build exactly — matched height and
// width, centred icon + label. Each button only adds its own colour on top.
const headerPill = "h-9 min-w-[92px] justify-center gap-1.5 rounded-full border px-4 text-sm font-medium"


function Workout() {
  const location = useLocation()// in the other file we navigate with usenavigate and then we receive data here with uselocation
  const navigate = useNavigate()
  // reveals the sticky header's bottom border only after the page scrolls
  const scrolled = useScrolled()
  // gates the Discard confirmation dialog
  const [confirmingDiscard, setConfirmingDiscard] = React.useState(false)
  const passedWorkout = location.state?.workout as WorkoutData | undefined

  // TWO modes share this page:
  // - editing a SAVED workout (opened via Edit on the read-only view): the draft
  //   is transient — it lives in local state and never touches the pipe, so
  //   leaving the page throws the edits away.
  // - a NEW workout (started from the home + button): the draft IS the shared
  //   pipe, so it survives navigation, refresh and closing the browser.
  const editingSaved = !!passedWorkout
  const { activeWorkout, setActiveWorkout } = useActiveWorkout()
  const [localDraft, setLocalDraft] = React.useState<WorkoutDraft | null>(
    passedWorkout ?? null
  )
  // the one draft this page reads/writes, plus its setter — picked by mode.
  const draft = editingSaved ? localDraft : activeWorkout
  const setDraft = editingSaved ? setLocalDraft : setActiveWorkout

  // the draft's fields, read straight off whichever source is active. every edit
  // below writes them back through setDraft immutably (spread the old draft,
  // overwrite one field), which is what keeps the pipe (and later localStorage)
  // in sync on every change. `prev` can be null, so each writer no-ops on null.
  const exercises = draft?.exercises ?? []
  const title = draft?.title ?? ""
  const pickTime = draft?.time ?? format(new Date(), "HH:mm")

  const setTitle = React.useCallback(
    (value: string) => setDraft((prev) => (prev ? { ...prev, title: value } : prev)),
    [setDraft]
  )
  const setExercises = (next: WorkoutExercise[]) =>
    setDraft((prev) => (prev ? { ...prev, exercises: next } : prev))
  const setPickTime = (value: string) =>
    setDraft((prev) => (prev ? { ...prev, time: value } : prev))

  // shown only after a Save attempt with an empty title; clears as they type
  const [titleError, setTitleError] = React.useState<string | undefined>()
  // trim the ends live-ish and collapse internal runs ("a   b" -> "a b") on blur
  const titleTrim = useTrimWhitespace(title, setTitle, { collapseInternal: true })
  //this is for the modal that will pop up when you click on add new exercise
  const [showExerciseSearch, setShowExerciseSearch] =
    React.useState<boolean>(false)
  const [editingExerciseId, setEditingExerciseId] = React.useState<number | null>(null)
  // the workout's bodyweight — one shared value for every bodyweight exercise.
  // now lives ON the draft so a mid-workout change survives navigation/refresh.
  // falls back to the user's saved weight until it's been set on this draft
  // (fresh drafts, and saved workouts being edited, carry no bodyWeight). at Save
  // it's split back out to the user's profile (deferred with the rest of Save).
  const bodyWeight = draft?.bodyWeight ?? user.weight
  const setBodyWeight = (value: number) =>
    setDraft((prev) => (prev ? { ...prev, bodyWeight: value } : prev))

  // for the title change
  function handleTitleChange(e: ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    if (titleError) setTitleError(undefined)
  }

  // a title is required to save. normalize whitespace first (trim ends + collapse
  // internal runs), write it back so the field shows the cleaned value, then block
  // the save with a message if it's empty.
  function handleSave() {
    const cleanTitle = normalizeText(title, true)
    if (cleanTitle !== title) setTitle(cleanTitle)
    if (!cleanTitle) {
      setTitleError("A title is important to save your workout.")
      return
    }
    setTitleError(undefined)
    // real persistence (the backend API call, and adding a NEW workout to the
    // timeline) is still deferred. for now Save just ends the session: clearing
    // the pipe fires the provider's effect that wipes the localStorage key, so a
    // saved workout no longer counts as "in progress". editing a saved workout
    // has no pipe entry to clear, so we only touch it for a new workout.
    if (!editingSaved) setActiveWorkout(null)
    navigate("/")
  }

  // Discard ends the workout without saving. it's gated by a confirmation dialog
  // (opened from the header button below). same clear-the-pipe path as Save, but
  // no title check — you can throw away an untitled draft.
  function handleDiscard() {
    if (!editingSaved) setActiveWorkout(null)
    navigate("/")
  }

  //this is for confirming a selectedexercise and it takes the catalog id of that exercise
  function handleConfirmExercise(exerciseId: number) {
     const base = Date.now()
     if (editingExerciseId !== null) {
       // EDITING: keep the row's own id, swap which catalog exercise it points at,
       // reset its sets to one fresh set+dropset
       setExercises(
         exercises.map((ex) =>
           ex.id === editingExerciseId
             ? { ...ex, exerciseId, sets: [{ id: base + 1, dropsets: [{ id: base + 2, left: {} }] }] }
             : ex
         )
       )
       setEditingExerciseId(null)
     } else {
       // ADDING: brand-new exercise (your existing behavior)
       const newExercise: WorkoutExercise = {
         id: base,
         exerciseId,
         sets: [{ id: base + 1, dropsets: [{ id: base + 2, left: {} }] }],
       }
       setExercises([...exercises, newExercise])
     }
   }

  // alright this argument called updatedexercise this is being detected when any onchange function is being fired.
    function handleExerciseChange(updatedExercise: WorkoutExercise) {
       setExercises(
         exercises.map((ex) => (ex.id === updatedExercise.id ? updatedExercise : ex))
       )
    }
  // this one works because the delete button has the same id as the exercise id so it will delete that exercise only
    function handleDeleteExercise(id: number) {
        setExercises(exercises.filter((ex) => ex.id !== id))
    }
  // no draft means this page was reached without a workout to edit (e.g. the URL
  // typed directly, or after Discard cleared the pipe) — bounce home rather than
  // render an editor whose edits would go nowhere.
  if (!draft) return <Navigate to="/" replace />

  return (
    <div className="flex flex-col mx-auto max-w-[430px] pb-[calc(var(--space-3xl)+env(safe-area-inset-bottom))]">
      {/* Sticky header, matching Home and View: 84px tall (pt-6 pb-4 around 44px
          controls), surface background, bottom border and safe-area top. Its
          controls are Discard (left) and Save (right). */}
      <header
        className={`sticky top-0 z-20 border-b bg-[var(--bg-page)] pt-[env(safe-area-inset-top)] transition-colors ${
          scrolled ? "border-[var(--border-cardEdge)]" : "border-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-[var(--space-23)] pt-6 pb-4">
          <Button
            className={cn(headerPill, "border-destructive bg-transparent text-destructive hover:bg-destructive/10")}
            onClick={() => setConfirmingDiscard(true)}
          >
            <Trash2Icon className="size-4" />
            Discard
          </Button>
          <Button
            className={cn(headerPill, "border-[rgb(205_242_58/40%)] bg-[rgb(205_242_58/8%)] text-[var(--color-neon)] hover:bg-[rgb(205_242_58/14%)]")}
            onClick={handleSave}
          >
            <Check className="size-4" />
            Save
          </Button>
        </div>
      </header>

      {/* Page content below the sticky header, keeping the page's 23px side
          padding and 12px vertical rhythm. */}
      <div className="flex flex-col gap-[var(--space-md)] px-[var(--space-23)] pt-[var(--space-lg)]">
      {/* Date + Time sit side by side, but flex-wrap lets Time drop to its own
          full-width row below Date when the viewport gets too narrow (< ~320px)
          for both to fit — the min-widths (Date wide enough for the full date
          text, Time for the clock) are what trigger the wrap instead of Time
          spilling past the page padding. */}
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex flex-col gap-2 flex-1 min-w-[176px]">
        <Label className="text-muted-foreground">Date</Label>
      <DatePickerDemo
        initialDate={draft?.date ?? format(new Date(), "yyyy-MM-dd")}
        onDateChange={(d) =>
          setDraft((prev) =>
            prev && d ? { ...prev, date: format(d, "yyyy-MM-dd") } : prev
          )
        }
         /></div>
        <div className="flex flex-col gap-2 flex-1 min-w-[72px]" >
        <Label className="text-muted-foreground">Time</Label>
      <Timesetter value={pickTime} onChange={setPickTime} /></div></div>
      <Field data-invalid={!!titleError}>
        {/* relative wrapper so the one-tap clear button can sit inside the input;
            pr-10 keeps the text from sliding under it */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter your title"
            className="pl-3.5 pr-10 h-10"
            maxLength={80}
            value={title}
            onChange={handleTitleChange}
            onBlur={titleTrim.onBlur}
            aria-invalid={!!titleError}
          />
          {/* shown only while there's something to erase */}
          {title && (
            <button
              type="button"
              aria-label="Clear title"
              onClick={() => {
                setTitle("")
                setTitleError(undefined)
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-primary"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
        <FieldError>{titleError}</FieldError>
      </Field>

      {/*this is the use of new array called exercises. at first the exercises array is empty but when we click on the add
       new exercise then there is a new exercise added in the exercises array as you may have seen in the function called
      handleexerciseChange and in this ondelete is a callback function which means the button is in the child component and the
     function is in the parent component and it takes the argument of the exercise id so as to delete specifically that exc. */}
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
            onChange={handleExerciseChange}
          bodyWeight={bodyWeight}
          onBodyWeightChange={setBodyWeight}
          onDelete={() => handleDeleteExercise(exercise.id)}
          onEdit={() => {
                setEditingExerciseId(exercise.id)
                setShowExerciseSearch(true)
              }}
          />
        ))}
      </div>
      )}

      {/*for the add new exercise button */}
      <Button className="bg-brand h-9" onClick={() => (setShowExerciseSearch(true))}>Add new Exercise</Button>

      {/* this is for modal which shows all the exercise list and the user can search their exercise for them to add it*/}
      {showExerciseSearch && (
         <ExerciseSearch
         onClose={() => {
             setShowExerciseSearch(false)
             setEditingExerciseId(null)
           }}
           onConfirm={handleConfirmExercise}
         />
       )}

      {/* Discard confirmation — same dialog the in-progress banner uses */}
      {confirmingDiscard && (
        <DiscardConfirmModal
          onCancel={() => setConfirmingDiscard(false)}
          onConfirm={handleDiscard}
        />
      )}
      </div>
    </div>
  )
}

export default Workout
