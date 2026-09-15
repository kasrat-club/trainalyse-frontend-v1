import React from "react"
import { exercises } from "@/data/exercise"
import {
  instanceVolume,
  instanceMaxWeight,
  instanceMaxAssistedWeight,
  instanceMaxExtraWeight,
  instanceEndurance,
  getExerciseInstance,
} from "@/data/calculations"
import { type Difficulty } from "@/data/workouts"
import { perLimbSeries } from "@/lib/graph-data"
import { type ChartConfig } from "@/components/ui/chart"

// The "brain" of the Graphs page: which exercise (and difficulty) is picked, and
// every dataset, per-limb series and chart config derived from it. No JSX — it
// just works out what the charts need from the one id it holds, and hands it
// back. The Graphs component then only chooses which cards to render.
export function useExerciseGraphs() {
  // the search lives in the same modal the workout page uses, so this is just
  // whether its open - the typing and filtering are all its own state
  const [showExerciseSearch, setShowExerciseSearch] = React.useState(false)
  // the id is the only thing held in state. the name, the type, whether its
  // bodyweight and whether it can be split all come straight off the catalog
  // entry, so they cant drift out of step with each other - and a rename in
  // exercise.json flows through here without breaking the lookup
  const [selectedExerciseId, setSelectedExerciseId] = React.useState<
    number | null
  >(null)
  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId)
  const selectedExerciseName = selectedExercise?.name ?? ""
  const selectedExerciseType = selectedExercise?.type ?? ""
  const selectedExerciseIsBodyweight = selectedExercise?.isBodyweight ?? false
  // says whether this exercise CAN be split, which is what decides the card
  // style. a dumbbell curl stays a per-limb card even on a day the user left
  // the switch off
  const selectedExercisePerLimb = selectedExercise?.perLimb ?? false
  // starts empty so the dropdown shows its placeholder - "normal" is no longer
  // an option in the list, so it cant be the default anymore
  const [selectedExerciseDifficulty, setSelectedExerciseDifficulty] =
    React.useState<Difficulty | "">("")
  // -1 matches nothing in the catalog, so with no exercise picked every one of
  // these comes back empty rather than needing a guard at each call
  const lookupId = selectedExerciseId ?? -1
  // the three max-* datasets are shared by both exercise types - the duration
  // charts below reuse them instead of having their own endurance copies
  const volumeData = instanceVolume(lookupId)
  const maxWeightData = instanceMaxWeight(lookupId)
  const maxAssistedWeightData = instanceMaxAssistedWeight(lookupId)
  const maxExtraWeightData = instanceMaxExtraWeight(lookupId)
  const enduranceData = instanceEndurance(lookupId)
  // no logged workouts for this exercise = show a message instead of empty charts
  const sessionCount = getExerciseInstance(lookupId).length
  const hasInstances = sessionCount > 0
  const showCharts = selectedExerciseId !== null && hasInstances
  // volume is the two limbs added together so a total day halves into the sides,
  // max weight is already one limbs number so it copies across untouched
  const volumeByLimb = perLimbSeries(volumeData, "volume", true)
  const maxWeightByLimb = perLimbSeries(maxWeightData, "maxWeight", false)
  // both of these are weights like maxWeight is, so they copy across too
  const maxAssistedWeightByLimb = perLimbSeries(
    maxAssistedWeightData,
    "maxAssistedWeight",
    false
  )
  const maxExtraWeightByLimb = perLimbSeries(
    maxExtraWeightData,
    "maxExtraWeight",
    false
  )
  // endurance adds the two sides together the same way volume does, so a
  // switch-off day halves into the limbs rather than copying across
  const enduranceByLimb = perLimbSeries(enduranceData, "endurance", true)

  // these two only ever draw a total now - anything per-limb goes through
  // PerLimbCard and chartConfigForLimbs instead
  const chartConfigForVolume = {
    volume: { label: "Total", color: "var(--chart-1)" },
  } satisfies ChartConfig
  const chartConfigForMaxWeight = {
    maxWeight: { label: "Max Weight", color: "var(--chart-1)" },
  } satisfies ChartConfig
  const chartConfigForMaxAssistedWeight = {
    maxAssistedWeight: { label: "Max Assisted Weight", color: "var(--chart-1)" },
  } satisfies ChartConfig
  const chartConfigForMaxExtraWeight = {
    maxExtraWeight: { label: "Max Extra Weight", color: "var(--chart-1)" },
  } satisfies ChartConfig
  const chartConfigForEndurance = {
    endurance: { label: "Endurance", color: "var(--chart-1)" },
  } satisfies ChartConfig
  // the per-limb charts all reshape to the same two keys, so one config covers
  // every one of them - its what the tooltip reads its names and colours from
  const chartConfigForLimbs = {
    left: { label: "Left", color: "var(--graph-left)" },
    right: { label: "Right", color: "var(--graph-right)" },
  } satisfies ChartConfig

  // the modal hands back the catalog id, which is all this page needs to hold -
  // everything the charts branch on is derived from it above
  function handleConfirmExercise(exerciseId: number) {
    setSelectedExerciseId(exerciseId)
    // without this the difficulty carries over from the last exercise
    setSelectedExerciseDifficulty("")
  }

  // everything the JSX reads — same names it used when this lived inside the
  // component, so the markup didn't need to change.
  return {
    showExerciseSearch,
    setShowExerciseSearch,
    selectedExerciseId,
    selectedExerciseName,
    selectedExerciseType,
    selectedExerciseIsBodyweight,
    selectedExercisePerLimb,
    selectedExerciseDifficulty,
    setSelectedExerciseDifficulty,
    sessionCount,
    hasInstances,
    showCharts,
    volumeData,
    maxWeightData,
    maxAssistedWeightData,
    maxExtraWeightData,
    enduranceData,
    volumeByLimb,
    maxWeightByLimb,
    maxAssistedWeightByLimb,
    maxExtraWeightByLimb,
    enduranceByLimb,
    chartConfigForVolume,
    chartConfigForMaxWeight,
    chartConfigForMaxAssistedWeight,
    chartConfigForMaxExtraWeight,
    chartConfigForEndurance,
    chartConfigForLimbs,
    handleConfirmExercise,
  }
}
