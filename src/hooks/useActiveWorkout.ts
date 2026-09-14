import { useContext } from "react"
import { ActiveWorkoutContext } from "@/components/active-workout-provider"

// one clean, safe line for any page to reach the ongoing workout: it hands back
// { activeWorkout, setActiveWorkout }, and shouts if used outside the provider.
export function useActiveWorkout() {
  const context = useContext(ActiveWorkoutContext)
  if (context === null) {
    throw new Error(
      "useActiveWorkout must be used inside an ActiveWorkoutContextProvider"
    )
  }
  return context
}
