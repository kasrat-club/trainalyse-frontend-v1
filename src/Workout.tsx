"use client" // this is a just a nextjs thing and its a dead code and does nothing
import ExerciseSearch from "./components/ExerciseSearch"
import { Navigate } from "react-router-dom"
import { useWorkoutEditor } from "@/hooks/useWorkoutEditor"
import { WorkoutEditorHeader } from "./components/WorkoutEditorHeader"
import { WorkoutDetailsFields } from "./components/WorkoutDetailsFields"
import { WorkoutExerciseList } from "./components/WorkoutExerciseList"
import { DiscardConfirmModal } from "./components/DiscardConfirmModal"
import { LeaveConfirmModal } from "./components/LeaveConfirmModal"
import { useScrolled } from "@/hooks/use-scrolled"

function Workout() {
  // reveals the sticky header's bottom border only after the page scrolls. this
  // stays here because it's purely about how the header LOOKS, not workout data.
  const scrolled = useScrolled()

  // the whole brain of this page lives in one hook now. it hands back the exact
  // same names the JSX below already used, so nothing in the markup had to change.
  const {
    draft,
    editingSaved,
    canSave,
    exercises,
    title,
    date,
    setDate,
    pickTime,
    setPickTime,
    bodyWeight,
    setBodyWeight,
    titleError,
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
    handleDiscard,
    handleBack,
    handleLeave,
    confirmingDiscard,
    setConfirmingDiscard,
    confirmingLeave,
    setConfirmingLeave,
  } = useWorkoutEditor()

  // no draft means this page was reached without a workout to edit (e.g. the URL
  // typed directly, or after Discard cleared the pipe) — bounce home rather than
  // render an editor whose edits would go nowhere.
  if (!draft) return <Navigate to="/" replace />

  return (
    <div className="flex flex-col mx-auto max-w-[430px] pb-[calc(var(--space-3xl)+env(safe-area-inset-bottom))]">
      <WorkoutEditorHeader
        scrolled={scrolled}
        editingSaved={editingSaved}
        canSave={canSave}
        onBack={handleBack}
        onDiscard={() => setConfirmingDiscard(true)}
        onSave={attemptSave}
      />

      {/* Page content below the sticky header, keeping the page's 23px side
          padding and 12px vertical rhythm. */}
      <div className="flex flex-col gap-[var(--space-md)] px-[var(--space-23)] pt-[var(--space-lg)]">
      <WorkoutDetailsFields
        date={date}
        onDateChange={setDate}
        time={pickTime}
        onTimeChange={setPickTime}
        title={title}
        onTitleChange={handleTitleChange}
        onTitleBlur={titleTrim.onBlur}
        onTitleClear={clearTitle}
        titleError={titleError}
      />

      {/* the exercise cards + the Add button. tapping Add (or a card's edit)
          opens the search modal below; the list itself only reports what the
          user did — the hook owns the array and the modal state. */}
      <WorkoutExerciseList
        exercises={exercises}
        bodyWeight={bodyWeight}
        onExerciseChange={handleExerciseChange}
        onBodyWeightChange={setBodyWeight}
        onDeleteExercise={handleDeleteExercise}
        onEditExercise={startEditExercise}
        onAddExercise={openExerciseSearch}
      />

      {/* this is for modal which shows all the exercise list and the user can search their exercise for them to add it*/}
      {showExerciseSearch && (
         <ExerciseSearch
         onClose={closeExerciseSearch}
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

      {/* Leave-without-saving confirmation — only reached from Back in edit mode
          when there are unsaved changes */}
      {confirmingLeave && (
        <LeaveConfirmModal
          onCancel={() => setConfirmingLeave(false)}
          onConfirm={handleLeave}
        />
      )}
      </div>
    </div>
  )
}

export default Workout
