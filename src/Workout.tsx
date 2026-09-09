"use client" // this is a just a nextjs thing and its a dead code and does nothing
import { Input } from "@/components/ui/input"
import React, { type ChangeEvent } from "react"
import { DatePickerDemo } from "./components/DatePicker"
import { Button } from "@/components/ui/button"
import { type Workout as WorkoutData, type WorkoutExercise } from "./data/workouts"
import { user } from "./data/user"
import { format } from "date-fns"
import Timesetter from "@/components/ui/timesetter"
import { Trash2Icon, X } from "lucide-react"
import { Label } from "./components/ui/label"
import ExerciseSearch from "./components/ExerciseSearch"
import Exercise from "./Exercise"
import { useLocation } from "react-router-dom"
import { Field, FieldError } from "@/components/ui/field"
import { useTrimWhitespace, normalizeText } from "@/hooks/use-trim-whitespace"
import { useScrolled } from "@/hooks/use-scrolled"


function Workout() {
  const location = useLocation()// in the other file we navigate with usenavigate and then we receive data here with uselocation
  // reveals the sticky header's bottom border only after the page scrolls
  const scrolled = useScrolled()
  const passedWorkout = location.state?.workout as WorkoutData | undefined
  // we are creating a new variable called passedWorkout and we pluck the data from the state by using the key which was
  // workout and we give the shape to it as Workoutdata from the json file
  // this is not same as workoutdata, this is just another name for the type Workout and it is Workoutdata
  const [exercises, setExercises] = React.useState<WorkoutExercise[]>(
      passedWorkout?.exercises ?? []
  )
  //this is the making of a new array which will be the exercise array which will have exercises from the saved
  // workouts if saved otherwise it would start out empty
  const [title, setTitle] = React.useState(passedWorkout?.title || "") // this is for title
  // shown only after a Save attempt with an empty title; clears as they type
  const [titleError, setTitleError] = React.useState<string | undefined>()
  // trim the ends live-ish and collapse internal runs ("a   b" -> "a b") on blur
  const titleTrim = useTrimWhitespace(title, setTitle, { collapseInternal: true })
  const [pickTime, setPickTime] = React.useState(
    passedWorkout?.time ?? format(new Date(), "HH:mm")
  )
  //this is for the modal that will pop up when you click on add new exercise
  const [showExerciseSearch, setShowExerciseSearch] =
    React.useState<boolean>(false)
  const[editingExerciseId, setEditingExerciseId] = React.useState<number | null>(null)
  // the workout's bodyweight — one shared value for every bodyweight exercise,
  // seeded from the user's saved weight. Editing it in any exercise's modal
  // updates it here, so the last value entered wins and every bodyweight
  // exercise recalculates from it. Persisted to the user's profile at Save
  // (backend wiring is deferred with the rest of Save).
  const [bodyWeight, setBodyWeight] = React.useState<number>(user.weight)

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
    // persistence isn't wired yet — validation only for now
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
          <Button className="h-9 pl-0 text-base text-destructive" variant="ghost">
            <Trash2Icon className="size-5" />
            Discard
          </Button>
          <Button className="h-9 bg-brand px-4 text-base" onClick={handleSave}>Save</Button>
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
        initialDate={passedWorkout?.date ?? format(new Date(), "yyyy-MM-dd")}
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
      </div>
    </div>
  )
}

export default Workout
