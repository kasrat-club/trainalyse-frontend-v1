import React from "react"
import { type Workout } from "../data/workouts"

// an in-progress workout is a saved Workout PLUS a little extra that only matters
// while it's being logged. bodyWeight is the live bodyweight used by bodyweight
// exercises; it's kept on the draft so a mid-workout change survives a refresh,
// but at Save it's split back out to the user's profile (not stored on the saved
// workout record). optional because a fresh draft may not have one set yet.
export type WorkoutDraft = Workout & {
  bodyWeight?: number
}

// the shape of what flows through the pipe: the ongoing workout draft (or null
// when none is running) plus the setter that swaps it in and out.
type ActiveWorkoutContextValue = {
  activeWorkout: WorkoutDraft | null
  setActiveWorkout: React.Dispatch<React.SetStateAction<WorkoutDraft | null>>
}

export const ActiveWorkoutContext =
  React.createContext<ActiveWorkoutContextValue | null>(null)

// the single key we store the in-progress workout under in localStorage. one
// constant so the load (7a) and the save (7b) can never disagree on the name.
const STORAGE_KEY = "activeWorkout"

function ActiveWorkoutContextProvider({ children }: { children: React.ReactNode }) {
  // load on startup: instead of always starting at null, look in localStorage
  // for a workout left running from a previous visit (survives refresh + closing
  // the browser). the function form runs this read ONCE, on first mount, not on
  // every render. localStorage only holds strings, so a saved workout was stored
  // as JSON text — JSON.parse turns it back into the object. wrapped in try/catch
  // because localStorage can throw (private mode, disabled) or hold broken JSON;
  // either way we fall back to "nothing running" (null).
  const [activeWorkout, setActiveWorkout] = React.useState<WorkoutDraft | null>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        return saved ? (JSON.parse(saved) as WorkoutDraft) : null
      } catch {
        return null
      }
    }
  )

  // save on change: this runs every time activeWorkout changes (a title tweak, a
  // new exercise, a bodyweight edit...). no workout running → clear the key and
  // stop; otherwise → store the draft as JSON text (localStorage only holds
  // strings, so JSON.stringify is the mirror of the JSON.parse used on load).
  React.useEffect(() => {
    if (activeWorkout === null) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeWorkout))
  }, [activeWorkout])

  return (
    <ActiveWorkoutContext.Provider value={{activeWorkout,setActiveWorkout}}>
      {children}
    </ActiveWorkoutContext.Provider>
  )
}

export default ActiveWorkoutContextProvider
