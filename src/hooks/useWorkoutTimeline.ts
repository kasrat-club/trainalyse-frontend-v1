import React, { type ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"
import { format, parseISO } from "date-fns"
import { workouts, type Workout } from "@/data/workouts"
import { groupWorkoutsByMonth } from "@/lib/group-workouts"
import { useActiveWorkout } from "@/hooks/useActiveWorkout"

// The "brain" of the Home timeline page: the search state (by date / by title),
// the derived, grouped list the timeline renders, and the handlers behind the +
// button and tapping a workout. No JSX — it just works out what the screen needs
// and hands it back. The App component then only renders that.
//
// Same deal as useWorkoutEditor: it returns the exact names the old component
// used, so the markup didn't have to change when the logic moved out here.
export function useWorkoutTimeline() {
  // the shared "is a workout running?" slot from the pipe
  const { activeWorkout, setActiveWorkout } = useActiveWorkout()
  const navigate = useNavigate()
  const handleClick = () => {
    // a workout is already running → just reopen it, never overwrite it
    if (activeWorkout) {
      navigate("/Workout")
      return
    }
    // none running → drop a fresh, empty draft into the pipe (this is what
    // officially "starts" a workout), then open the editor. The draft carries
    // the Workout shape: a fresh id, today's date, an empty title, the current
    // time, and no exercises yet.
    setActiveWorkout({
      id: Date.now(),
      date: format(new Date(), "yyyy-MM-dd"),
      title: "",
      time: format(new Date(), "HH:mm"),
      exercises: [],
    })
    navigate("/Workout")
  }
  // this here is used so that we know what the user is searching at a time like with date or title or nothing.
  const [searchMode, setSearchMode] = React.useState<"none" | "date" | "title">(
    "none"
  )

  const [dateSearched, setDateSearched] = React.useState<Date>()
  const [titleSearched, setTitleSearched] = React.useState("")
  // the month the search calendar is showing — controlled so "Jump to today"
  // can move the view back to the current month from anywhere.
  const [calMonth, setCalMonth] = React.useState<Date>(new Date())

  // every date that has a logged workout, as Date objects, so the calendar can
  // flag those days. duplicates (two workouts on one date) are harmless here.
  const loggedDates = React.useMemo(
    () => workouts.map((workout) => parseISO(workout.date)),
    []
  )

  // this function is for the onchange of the title input , so that the ui keeps in sync with what the user is typing.
  // it also clears any active date search (the date filter otherwise wins over the title one), so typing a title
  // drops the user straight onto the title results without a stale date hiding them.
  function handleTitleTypeForSearch(e: ChangeEvent<HTMLInputElement>) {
    setTitleSearched(e.target.value)
    setDateSearched(undefined)
  }

  //this function is for setting the searchmode to date and clear the title so that the user can search with either date or tile at a time
  function handleDateSearch() {
    setSearchMode("date")
    setTitleSearched("")
    // open on the selected date's month (or today if none picked yet)
    setCalMonth(dateSearched ?? new Date())
  }

  //this function occurs when we tap a logged workout: it opens the workout read-only
  // (the View-only screen), which carries an Edit button to jump to the editor.
  function handleWorkoutOpen(workout: Workout) {
    navigate("/WorkoutView", { state: { workout } })
  }

  //this here shows the workouts but there is a catch , so if the user is searching with date it will show only those
  // workouts that are on that date and if not then if the user is searching with title it will show only those workouts
  // and if none of that then it will show all the workouts that were logged.
  const filteredWorkouts = dateSearched
    ? workouts.filter(
        (workout) => workout.date === format(dateSearched, "yyyy-MM-dd")
      )
    : titleSearched
      ? workouts.filter((workout) =>
          workout.title.toLowerCase().includes(titleSearched.toLowerCase())
        )
      : workouts

  // group the filtered workouts for the timeline: month → date → workouts,
  // newest first. the actual grouping is a pure function in lib/ — this just
  // feeds it the currently-filtered list.
  const monthGroups = groupWorkoutsByMonth(filteredWorkouts)

  // everything the JSX reads — same names it used when this lived inside the
  // component, so the markup didn't need to change.
  return {
    activeWorkout,
    handleClick,
    searchMode,
    setSearchMode,
    dateSearched,
    setDateSearched,
    titleSearched,
    setTitleSearched,
    calMonth,
    setCalMonth,
    loggedDates,
    handleTitleTypeForSearch,
    handleDateSearch,
    handleWorkoutOpen,
    filteredWorkouts,
    monthGroups,
  }
}
