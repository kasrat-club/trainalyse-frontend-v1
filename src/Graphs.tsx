import ExerciseSearch from "./components/ExerciseSearch"
import { type Difficulty } from "./data/workouts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChartLine } from "lucide-react"
import { useScrolled } from "@/hooks/use-scrolled"
import { useExerciseGraphs } from "@/hooks/useExerciseGraphs"
import {
  latestValue,
  percentFromFirst,
  deltaFromFirst,
  latestImbalance,
  latestLimbValue,
} from "@/lib/graph-data"
import {
  TotalChart,
  LimbChart,
  MetricCard,
  PerLimbCard,
  EmptyNote,
} from "@/components/GraphCards"

function Graphs() {
  // reveals the sticky header's bottom border only after the page scrolls
  const scrolled = useScrolled()
  // the brain of this page lives in one hook now. it hands back the exact same
  // names the JSX below already used, so nothing in the markup had to change.
  const {
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
  } = useExerciseGraphs()

  const difficultySelect = (
    // the label and its control are one thing, so they sit on the tight 4px gap
    // rather than the 12px the page puts between unrelated blocks
    <div className="flex flex-col gap-[var(--space-xs)]">
      <span className="text-[length:var(--size-label)] leading-[var(--lh-label)] [font-weight:var(--fw-regular)] text-[var(--text-subheading)]">
        Difficulty
      </span>
      <Select
        value={selectedExerciseDifficulty}
        onValueChange={(value) =>
          setSelectedExerciseDifficulty(value as Difficulty)
        }
      >
        {/* both bangs are load-bearing. the background one beats shadcns
            dark:bg-input/30, and the height one beats its data-[size=default]:h-8
            - that variant is an attribute selector, so it outranks a plain h-12
            on specificity and the control would silently stay 32px tall */}
        <SelectTrigger className="h-12! w-full rounded-[var(--radius-input)] border-[var(--border-inputEdge)] bg-[var(--bg-inputBox)]! px-[var(--space-md)] text-[length:var(--size-placeholder)]">
          <SelectValue placeholder="Select difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="assisted">Assisted</SelectItem>
          <SelectItem value="weighted">Weighted</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  return (
    // no mx-auto/max-w here - Layout already gives us the centered 430px column,
    // and an auto side margin would override the parents stretch and shrink this
    // to fit-content
    <div className="flex flex-col">
      {/* Sticky header, matching Home / View / Workout: 84px tall (pt-6 pb-4
          around the 44px search control), surface background, bottom border and
          safe-area top. Its control is the exercise-search trigger. */}
      <header
        className={`sticky top-0 z-20 border-b bg-[var(--bg-page)] pt-[env(safe-area-inset-top)] transition-colors ${
          scrolled ? "border-[var(--border-cardEdge)]" : "border-transparent"
        }`}
      >
        <div className="px-[var(--space-23)] pt-6 pb-4">
          {/* looks like the input it replaced, but its only a trigger - the real
              searching happens in the modal, same as the workout page */}
          <button
            type="button"
            onClick={() => setShowExerciseSearch(true)}
            className="flex h-9 w-full items-center rounded-[var(--radius-input)] border border-[var(--border-inputEdge)] bg-transparent px-[var(--space-md)] text-[length:var(--size-placeholder)] text-[var(--text-placeholder)]"
          >
            Search your exercise
          </button>
        </div>
      </header>

      {/* Page content below the sticky header */}
      <div className="flex flex-col px-[var(--space-23)] py-[var(--space-lg)] gap-[var(--space-md)]">
      {/* landing state - nothing picked yet, so the charts have nothing to draw */}
      {selectedExerciseId === null && (
        <div className="flex flex-col items-center text-center gap-[var(--space-md)] rounded-[var(--radius-card)] border border-dashed border-[var(--border-cardEdge)] px-[var(--space-2xl)] py-[var(--space-3xl)]">
          <ChartLine
            size={40}
            strokeWidth={1.4}
            className="text-[var(--text-subheading)]"
          />
          <div className="flex flex-col gap-[var(--space-xs)]">
            <span className="text-[length:var(--size-primaryText)] leading-[var(--lh-primaryText)] [font-weight:var(--fw-medium)] text-[var(--text-primary)]">
              No exercise selected
            </span>
            {/* footer pair, not the label pair - this wraps, and --lh-label has no leading */}
            <span className="text-[length:var(--size-footer)] leading-[var(--lh-footer)] [font-weight:var(--fw-regular)] text-[var(--text-subheading)]">
              Search an exercise above to see your volume, weight and endurance
              over time.
            </span>
          </div>
        </div>
      )}
      {/* baseline-aligned so the name and the count sit on the same line even
          though theyre different sizes */}
      {selectedExerciseId !== null && (
        <div className="flex items-baseline justify-between gap-[var(--space-md)]">
          <span className="text-[length:var(--size-h2)] leading-[var(--lh-h2)] [font-weight:var(--fw-bold)] text-[var(--text-primary)]">
            {selectedExerciseName}
          </span>
          <span className="text-[length:var(--size-footer)] leading-[var(--lh-footer)] [font-weight:var(--fw-regular)] text-[var(--text-subheading)]">
            {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
          </span>
        </div>
      )}
      {selectedExerciseId !== null && !hasInstances && (
        <EmptyNote>You have not done this exercise yet.</EmptyNote>
      )}
      {/* volume and endurance are the only charts that differ by exercise type.
          everything below them depends on bodyweight/difficulty instead, so the
          type check would tell us nothing and is left out. */}
      {showCharts &&
        selectedExerciseType === "weightsAndReps" &&
        selectedExercisePerLimb && (
          <PerLimbCard
            title="Volume"
            left={latestLimbValue(volumeByLimb, "left")}
            right={latestLimbValue(volumeByLimb, "right")}
            unit="kg·reps"
            imbalance={latestImbalance(volumeByLimb)}
          >
            <LimbChart data={volumeByLimb} config={chartConfigForLimbs} />
          </PerLimbCard>
        )}
      {showCharts &&
        selectedExerciseType === "weightsAndReps" &&
        !selectedExercisePerLimb && (
          <MetricCard
            title="Volume"
            value={latestValue(volumeData, "volume")}
            unit="kg·reps"
            trend={percentFromFirst(volumeData, "volume")}
          >
            {/* no axis titles on any of these - the card header already says
                what the metric is and what the unit is, so they'd only eat width */}
            <TotalChart
              data={volumeData}
              dataKey="volume"
              config={chartConfigForVolume}
              fillId="volumeFill"
            />
          </MetricCard>
        )}
      {showCharts &&
        selectedExerciseType === "duration" &&
        selectedExercisePerLimb && (
          <PerLimbCard
            title="Endurance"
            left={latestLimbValue(enduranceByLimb, "left")}
            right={latestLimbValue(enduranceByLimb, "right")}
            unit="kg·s"
            imbalance={latestImbalance(enduranceByLimb)}
          >
            <LimbChart data={enduranceByLimb} config={chartConfigForLimbs} />
          </PerLimbCard>
        )}
      {showCharts &&
        selectedExerciseType === "duration" &&
        !selectedExercisePerLimb && (
          <MetricCard
            title="Endurance"
            value={latestValue(enduranceData, "endurance")}
            unit="kg·s"
            trend={percentFromFirst(enduranceData, "endurance")}
          >
            <TotalChart
              data={enduranceData}
              dataKey="endurance"
              config={chartConfigForEndurance}
              fillId="enduranceFill"
            />
          </MetricCard>
        )}
      {showCharts && !selectedExerciseIsBodyweight && selectedExercisePerLimb && (
        <PerLimbCard
          title="Max Weight"
          left={latestLimbValue(maxWeightByLimb, "left")}
          right={latestLimbValue(maxWeightByLimb, "right")}
          unit="kg"
          imbalance={latestImbalance(maxWeightByLimb)}
          imbalanceUnit="kg"
        >
          <LimbChart data={maxWeightByLimb} config={chartConfigForLimbs} />
        </PerLimbCard>
      )}
      {showCharts && !selectedExerciseIsBodyweight && !selectedExercisePerLimb && (
        <MetricCard
          title="Max Weight"
          value={latestValue(maxWeightData, "maxWeight")}
          unit="kg"
          trend={deltaFromFirst(maxWeightData, "maxWeight")}
          trendUnit="kg"
        >
          <TotalChart
            data={maxWeightData}
            dataKey="maxWeight"
            config={chartConfigForMaxWeight}
            fillId="maxWeightFill"
          />
        </MetricCard>
      )}



      {showCharts && selectedExerciseIsBodyweight && <>{difficultySelect}</>}
      {showCharts &&
        selectedExerciseIsBodyweight &&
        selectedExerciseDifficulty === "assisted" &&
        // done the exercise, but never assisted, so this chart has nothing to draw
        (maxAssistedWeightData.length === 0 ? (
          <EmptyNote>You have not done this exercise assisted yet.</EmptyNote>
        ) : selectedExercisePerLimb ? (
          <PerLimbCard
            title="Max Assisted Weight"
            left={latestLimbValue(maxAssistedWeightByLimb, "left")}
            right={latestLimbValue(maxAssistedWeightByLimb, "right")}
            unit="kg"
            imbalance={latestImbalance(maxAssistedWeightByLimb)}
            imbalanceUnit="kg"
          >
            <LimbChart
              data={maxAssistedWeightByLimb}
              config={chartConfigForLimbs}
            />
          </PerLimbCard>
        ) : (
          // the one card on this page where down is the win - assisted weight is
          // how much help the user needed, so less of it is the whole goal
          <MetricCard
            title="Max Assisted Weight"
            value={latestValue(maxAssistedWeightData, "maxAssistedWeight")}
            unit="kg"
            trend={deltaFromFirst(maxAssistedWeightData, "maxAssistedWeight")}
            trendUnit="kg"
            lowerIsBetter
          >
            <TotalChart
              data={maxAssistedWeightData}
              dataKey="maxAssistedWeight"
              config={chartConfigForMaxAssistedWeight}
              fillId="maxAssistedWeightFill"
            />
          </MetricCard>
        ))}
      {showCharts &&
        selectedExerciseIsBodyweight &&
        selectedExerciseDifficulty === "weighted" &&
        // done the exercise, but never weighted, so this chart has nothing to draw
        (maxExtraWeightData.length === 0 ? (
          <EmptyNote>You have not done this exercise weighted yet.</EmptyNote>
        ) : selectedExercisePerLimb ? (
          <PerLimbCard
            title="Max Extra Weight"
            left={latestLimbValue(maxExtraWeightByLimb, "left")}
            right={latestLimbValue(maxExtraWeightByLimb, "right")}
            unit="kg"
            imbalance={latestImbalance(maxExtraWeightByLimb)}
            imbalanceUnit="kg"
          >
            <LimbChart
              data={maxExtraWeightByLimb}
              config={chartConfigForLimbs}
            />
          </PerLimbCard>
        ) : (
          <MetricCard
            title="Max Extra Weight"
            value={latestValue(maxExtraWeightData, "maxExtraWeight")}
            unit="kg"
            trend={deltaFromFirst(maxExtraWeightData, "maxExtraWeight")}
            trendUnit="kg"
          >
            <TotalChart
              data={maxExtraWeightData}
              dataKey="maxExtraWeight"
              config={chartConfigForMaxExtraWeight}
              fillId="maxExtraWeightFill"
            />
          </MetricCard>
        ))}
      {/* the modal itself - fixed and full-screen, so it doesnt matter that its
          last in the frame, it wont pick up the gap or sit under the charts */}
      {showExerciseSearch && (
        <ExerciseSearch
          onClose={() => setShowExerciseSearch(false)}
          onConfirm={handleConfirmExercise}
        />
      )}
      </div>
    </div>
  )
}

export default Graphs
