import React, { type ChangeEvent } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { dequal } from "dequal"
import { type Workout as WorkoutData, type WorkoutExercise } from "@/data/workouts"
import { user } from "@/data/user"
import { useTrimWhitespace, normalizeText } from "@/hooks/use-trim-whitespace"
import { useActiveWorkout } from "@/hooks/useActiveWorkout"
import { type WorkoutDraft } from "@/components/active-workout-provider"
import { warnToast } from "@/components/warn-toast"

// The whole "brain" of the Workout editor page: every piece of state, every
// derived value, and every handler. It has NO JSX — it only computes what the
// screen needs and hands it back. The Workout component then just renders that.
//
// Keeping it here (and UI-free) means two things: a bug in *behaviour* lives in
// this one file, and a future React Native port can reuse this hook untouched and
// only rewrite the JSX. It returns the exact names the old component used, so the
// page's markup didn't have to change when the logic moved out.
export function useWorkoutEditor() {
  const location = useLocation() // in the other file we navigate with usenavigate and then we receive data here with uselocation
  const navigate = useNavigate()
  // gates the Discard confirmation dialog (new-workout mode)
  const [confirmingDiscard, setConfirmingDiscard] = React.useState(false)
  // gates the "leave without saving?" dialog (edit-a-saved-workout mode)
  const [confirmingLeave, setConfirmingLeave] = React.useState(false)
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

  // has the user actually changed anything while editing a saved workout? we deep-
  // compare the live draft against the untouched original we were handed. deep
  // equality (not "did they touch a field") is the point: reps 12 → 14 → 12 ends
  // deeply equal to the original, so it correctly reads as NO change. only
  // meaningful in edit mode — a new workout has no original to diff against.
  const isDirty = editingSaved && !dequal(localDraft, passedWorkout)
  // Save is only gated in edit mode: nothing changed = nothing to save. a new
  // workout can always be saved. (once real persistence lands, saving an edit
  // should reset the baseline so isDirty goes false again — deferred for now.)
  const canSave = editingSaved ? isDirty : true

  // the draft's fields, read straight off whichever source is active. every edit
  // below writes them back through setDraft immutably (spread the old draft,
  // overwrite one field), which is what keeps the pipe (and later localStorage)
  // in sync on every change. `prev` can be null, so each writer no-ops on null.
  const exercises = draft?.exercises ?? []
  const title = draft?.title ?? ""
  const pickTime = draft?.time ?? format(new Date(), "HH:mm")
  // the draft's date as a plain string, with a today fallback for a fresh draft.
  const date = draft?.date ?? format(new Date(), "yyyy-MM-dd")

  const setTitle = React.useCallback(
    (value: string) => setDraft((prev) => (prev ? { ...prev, title: value } : prev)),
    [setDraft]
  )
  const setExercises = (next: WorkoutExercise[]) =>
    setDraft((prev) => (prev ? { ...prev, exercises: next } : prev))
  const setPickTime = (value: string) =>
    setDraft((prev) => (prev ? { ...prev, time: value } : prev))
  // the date picker hands back a Date object; store it as a "yyyy-MM-dd" string.
  // no-ops if there's no draft or the picker cleared the date.
  const setDate = (d: Date | undefined) =>
    setDraft((prev) => (prev && d ? { ...prev, date: format(d, "yyyy-MM-dd") } : prev))

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

  // the one-tap clear (X) inside the title input: wipe the text and any error.
  function clearTitle() {
    setTitle("")
    setTitleError(undefined)
  }

  // the header's Save pill is dimmed (not truly disabled) when there's nothing to
  // save, so a tap still reaches here. if the workout is unchanged, nudge and stop
  // — otherwise fall through to the real save.
  function attemptSave() {
    if (!canSave) {
      warnToast("Make a change first, nothing to save yet.", "no-changes")
      return
    }
    handleSave()
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

  // Back leaves the editor for the read-only view we came from. if there are
  // unsaved edits, ask first (the confirm modal below); if nothing changed, just
  // go — no need to warn about losing changes that don't exist.
  function handleBack() {
    if (isDirty) {
      setConfirmingLeave(true)
      return
    }
    navigate(-1)
  }

  // confirmed "leave without saving": drop the transient draft (edit mode never
  // touched the pipe, so there's nothing to clear) and return to the view.
  function handleLeave() {
    navigate(-1)
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

  // the exercise-search modal's open/close + the "edit this row" entry point.
  // open plain = ADD a new exercise; startEdit remembers WHICH row is being
  // swapped (handleConfirmExercise reads editingExerciseId to decide add vs edit).
  const openExerciseSearch = () => setShowExerciseSearch(true)
  const closeExerciseSearch = () => {
    setShowExerciseSearch(false)
    setEditingExerciseId(null)
  }
  const startEditExercise = (id: number) => {
    setEditingExerciseId(id)
    setShowExerciseSearch(true)
  }

  // everything the JSX reads — same names it used when this lived inside the
  // component, so the markup didn't need to change.
  return {
    draft,
    setDraft,
    editingSaved,
    canSave,
    exercises,
    title,
    setTitle,
    date,
    setDate,
    pickTime,
    setPickTime,
    bodyWeight,
    setBodyWeight,
    titleError,
    setTitleError,
    titleTrim,
    handleTitleChange,
    clearTitle,
    showExerciseSearch,
    openExerciseSearch,
    closeExerciseSearch,
    startEditExercise,
    handleConfirmExercise,
    handleExerciseChange,
    handleDeleteExercise,
    attemptSave,
    handleSave,
    handleDiscard,
    handleBack,
    handleLeave,
    confirmingDiscard,
    setConfirmingDiscard,
    confirmingLeave,
    setConfirmingLeave,
  }
}
