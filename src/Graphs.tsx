import { exercises } from "./data/exercise"
import React from "react"
import ExerciseSearch from "./components/ExerciseSearch"
import { instanceVolume } from "./data/calculations"
import { instanceMaxWeight } from "./data/calculations"
import { instanceMaxAssistedWeight } from "./data/calculations"
import { instanceMaxExtraWeight } from "./data/calculations"
import { instanceEndurance } from "./data/calculations"
import { getExerciseInstance } from "./data/calculations"
import { type Difficulty } from "./data/workouts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltipContent,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  ComposedChart,
  Area,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  type YAxisTickContentProps,
} from "recharts"
import { ChartLine } from "lucide-react"
import { useScrolled } from "@/hooks/use-scrolled"

// a per-limb exercise leaves the total key undefined on every point (and vice
// versa), so pull out just the points this key actually has before comparing
function numericSeries(data: Array<Record<string, unknown>>, key: string) {
  return data
    .map((point) => point[key])
    .filter((value): value is number => typeof value === "number")
}

function latestValue(data: Array<Record<string, unknown>>, key: string) {
  return numericSeries(data, key).at(-1)
}

// percent change from the first logged session to the latest. undefined when
// theres nothing to compare against yet, or when the first session was 0 and
// the percentage would divide by zero
function percentFromFirst(data: Array<Record<string, unknown>>, key: string) {
  const series = numericSeries(data, key)
  if (series.length < 2) return undefined
  const first = series[0]
  if (first === 0) return undefined
  return ((series[series.length - 1] - first) / first) * 100
}

// absolute change from the first logged session to the latest, in the metrics
// own unit. same undefined-until-two-sessions rule as percentFromFirst, but a
// first session of 0 is fine here - theres no division to blow up
function deltaFromFirst(data: Array<Record<string, unknown>>, key: string) {
  const series = numericSeries(data, key)
  if (series.length < 2) return undefined
  return series[series.length - 1] - series[0]
}

// a per-limb exercise can still have days logged with the switch off, which
// means the user did the same on both sides. those days are the goal, not a
// gap, so they get folded into both lines instead of breaking them.
//
// how the fold works differs by metric, which is why totalIsSum exists: volume
// is the two limbs added together, so one limbs share is half of it. max weight
// is already one limbs number (the calc layer mirrors the left across), so it
// copies over untouched. halving a max weight would invent a lift that never
// happened.
function perLimbSeries(
  data: Array<Record<string, unknown>>,
  key: string,
  totalIsSum: boolean
) {
  const points = data.map((point) => {
    const total = point[key]
    const isTotalDay = typeof total === "number"
    const share = isTotalDay ? (totalIsSum ? total / 2 : total) : undefined
    const left = isTotalDay ? share : point[`${key}Left`]
    const right = isTotalDay ? share : point[`${key}Right`]
    return {
      label: point.label,
      left,
      right,
      // the whole point of the chart. a day with no gap between the sides gets
      // the neon marker - either the sides genuinely matched, or the switch was
      // off, which means they matched by definition
      balanced:
        typeof left === "number" && typeof right === "number" && left === right,
    }
  })
  // across a balanced stretch the two limb lines sit exactly on top of each
  // other, so whichever one draws last wins and the run comes out looking like
  // a single right-side line. this key feeds a neon line drawn over the top of
  // them, so a balanced run reads as balanced instead of as one limb.
  //
  // it only fills in where a balanced day has a balanced day next to it - a
  // segment needs both ends. a lone balanced day has nothing to join up with
  // and just keeps its neon dot.
  return points.map((point, i) => ({
    ...point,
    balancedRun:
      point.balanced && (points[i - 1]?.balanced || points[i + 1]?.balanced)
        ? (point.left as number)
        : undefined,
  }))
}

// the gap between the sides on the latest session, both ways - as a percent of
// the stronger side, and in the metrics own unit. 0 = balanced. undefined when
// theres nothing logged to compare
function latestImbalance(series: ReturnType<typeof perLimbSeries>) {
  const last = [...series]
    .reverse()
    .find((p) => typeof p.left === "number" && typeof p.right === "number")
  if (!last) return undefined
  const left = last.left as number
  const right = last.right as number
  const stronger = Math.max(left, right)
  if (stronger === 0) return undefined
  return {
    percent: (Math.abs(left - right) / stronger) * 100,
    gap: Math.abs(left - right),
    leadingSide: left === right ? "" : left > right ? "L" : "R",
  }
}

function formatMetric(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 })
}

// "9 June, 2026, 9:00 AM" -> "9 Jun". only the axis is shortened - the tooltip
// still shows the full label, which is where the exact date belongs
function shortDate(label: string) {
  const [day, month] = label.split(",")[0].split(" ")
  return month ? `${day} ${month.slice(0, 3)}` : label
}

// recharts right-anchors y ticks inside the gutter, which leaves them floating
// short of the card edge. drawing at x=0 lines them up with the title and value
function renderYTick({ y, payload }: YAxisTickContentProps) {
  return (
    <text
      x={0}
      y={y}
      dy={4}
      textAnchor="start"
      fontSize={11}
      fill="var(--text-subheading)"
    >
      {Number(payload.value).toLocaleString("en-US")}
    </text>
  )
}


// zero side margins so the plot spans the full width between the cards padding
const cardChartMargin = { top: 6, right: 0, left: 0, bottom: 0 }
// dashed horizontals only - vertical rules would fight the data lines
const cardChartGrid = {
  vertical: false,
  stroke: "var(--border-cardEdge)",
  strokeDasharray: "2 4",
}
// the tick renderers position their own text, so recharts own offsets are off
const cardChartAxis = { tickLine: false, axisLine: false, tickSize: 0 }

// the latest session that actually has a number for this side
function latestLimbValue(
  series: ReturnType<typeof perLimbSeries>,
  side: "left" | "right"
) {
  const values = series
    .map((point) => point[side])
    .filter((value): value is number => typeof value === "number")
  return values.at(-1)
}

// dots on the two limb lines. a balanced day gets the neon marker instead of
// the series colour, drawn bigger and ringed in the card background so the two
// lines landing on the same spot read as one deliberate mark, not a collision
function renderLimbDot(color: string) {
  return function LimbDot({
    cx,
    cy,
    payload,
  }: {
    cx?: number
    cy?: number
    payload?: { balanced?: boolean }
  }) {
    if (cx === undefined || cy === undefined) return <g />
    if (payload?.balanced) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="var(--graph-balanced)"
          stroke="var(--bg-surface-primary)"
          strokeWidth={2}
        />
      )
    }
    return <circle cx={cx} cy={cy} r={2.5} fill={color} />
  }
}

// the single-line chart every total card draws. the gradient has to sit inside
// this charts own svg for recharts to resolve the url(), so each chart needs
// its own copy of it under its own id - hence fillId being a prop
function TotalChart({
  data,
  dataKey,
  config,
  fillId,
}: {
  data: Array<Record<string, unknown>>
  dataKey: string
  config: ChartConfig
  fillId: string
}) {
  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-[130px] w-full [&_.recharts-surface]:overflow-visible"
    >
      <ComposedChart data={data} margin={cardChartMargin}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-neon)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--color-neon)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...cardChartGrid} />
        {/* the shortening has to happen in tickFormatter, not in a custom tick -
            recharts measures the formatted string to work out how many labels
            fit, and the raw one is a full date and time */}
        <XAxis
          dataKey="label"
          {...cardChartAxis}
          axisLine={{ stroke: "var(--border-cardEdge)" }}
          tickFormatter={shortDate}
          tickMargin={12}
          interval="preserveStartEnd"
          tick={{ fill: "var(--text-subheading)", fontSize: 11 }}
        />
        {/* the width is the gutter the ticks are drawn into - the plot starts
            after it, so this is what pushes the chart off the edge */}
        <YAxis width={52} {...cardChartAxis} tick={renderYTick} interval={0} />
        <Area
          dataKey={dataKey}
          stroke="var(--color-neon)"
          strokeWidth={2.5}
          fill={`url(#${fillId})`}
          dot={{ r: 2.5, fill: "var(--color-neon)", strokeWidth: 0 }}
          activeDot={{ r: 3.5, fill: "var(--color-neon)" }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
      </ComposedChart>
    </ChartContainer>
  )
}

// the two-line chart every per-limb card draws. no area fill on either side -
// two overlapping washes would muddy exactly the gap the user is meant to read
function LimbChart({
  data,
  config,
}: {
  data: ReturnType<typeof perLimbSeries>
  config: ChartConfig
}) {
  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-[130px] w-full [&_.recharts-surface]:overflow-visible"
    >
      <ComposedChart data={data} margin={cardChartMargin}>
        <CartesianGrid {...cardChartGrid} />
        <XAxis
          dataKey="label"
          {...cardChartAxis}
          axisLine={{ stroke: "var(--border-cardEdge)" }}
          tickFormatter={shortDate}
          tickMargin={12}
          interval="preserveStartEnd"
          tick={{ fill: "var(--text-subheading)", fontSize: 11 }}
        />
        <YAxis width={52} {...cardChartAxis} tick={renderYTick} interval={0} />
        <Line
          dataKey="left"
          stroke="var(--graph-left)"
          strokeWidth={2}
          dot={renderLimbDot("var(--graph-left)")}
          activeDot={{ r: 4 }}
        />
        <Line
          dataKey="right"
          stroke="var(--graph-right)"
          strokeWidth={2}
          dot={renderLimbDot("var(--graph-right)")}
          activeDot={{ r: 4 }}
        />
        {/* last, so it paints over both limb lines. slightly thicker to cover
            them completely, and kept out of the tooltip - its the same numbers
            the two sides already report, not a third measurement */}
        <Line
          dataKey="balancedRun"
          stroke="var(--graph-balanced)"
          strokeWidth={2.5}
          dot={false}
          activeDot={false}
          connectNulls={false}
          tooltipType="none"
          legendType="none"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
      </ComposedChart>
    </ChartContainer>
  )
}

// the card itself, shared by both variants below so they cant drift apart
function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[var(--space-sm)] rounded-[var(--radius-card)] border border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] p-[var(--space-lg)]">
      {children}
    </div>
  )
}

// the title row, shared too - a title on the left and a small badge on the right
function CardHeader({
  title,
  badge,
}: {
  title: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-[var(--space-md)]">
      <span className="text-[length:var(--size-label)] leading-[var(--lh-label)] [font-weight:var(--fw-medium)] text-[var(--text-primary)]">
        {title}
      </span>
      {badge}
    </div>
  )
}

// stands in for a card that has nothing to draw. dashed rather than solid so it
// reads as an empty slot, the same way the landing box does
function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-cardEdge)] px-[var(--space-lg)] py-[var(--space-2xl)] text-center text-[length:var(--size-footer)] leading-[var(--lh-footer)] text-[var(--text-subheading)]">
      {children}
    </div>
  )
}

// one metric = one card: title on top, the current value under it, then the
// chart. every chart block on the page is one of these.
function MetricCard({
  title,
  value,
  unit,
  trend,
  trendUnit = "%",
  lowerIsBetter = false,
  children,
}: {
  title: string
  value: number | undefined
  unit: string
  trend?: number
  trendUnit?: string
  lowerIsBetter?: boolean
  children: React.ReactNode
}) {
  const rose = trend !== undefined && trend >= 0
  // on nearly every metric here going up is the win, but assisted weight is how
  // much help the user needed - more of it is a step backwards. so the arrow
  // reports which way the number moved, and the colour reports whether thats
  // good news. the two come apart only on the assisted card
  const improved = lowerIsBetter ? !rose : rose
  // "%" hugs the number, a word unit like kg needs a space in front of it. and
  // a percent reads better whole, while a 2.5kg gain shouldnt round away to 3
  const trendLabel =
    trend === undefined
      ? undefined
      : trendUnit === "%"
        ? `${Math.round(Math.abs(trend))}%`
        : `${formatMetric(Math.abs(trend))} ${trendUnit}`
  return (
    <CardShell>
      <CardHeader
        title={title}
        badge={
          // only meaningful once theres a second session to compare against
          trendLabel !== undefined && (
            <span
              className={
                improved
                  ? "whitespace-nowrap text-[length:var(--size-footer)] leading-[var(--lh-footer)] text-[var(--text-accent)]"
                  : "whitespace-nowrap text-[length:var(--size-footer)] leading-[var(--lh-footer)] text-[var(--text-subheading)]"
              }
            >
              {rose ? "▲" : "▼"} {trendLabel} from first
            </span>
          )
        }
      />
      {value !== undefined && (
        <div className="flex items-baseline gap-[var(--space-xs)]">
          <span className="text-[length:var(--size-metric)] leading-[var(--lh-metric)] [font-weight:var(--fw-bold)] tabular-nums text-[var(--text-primary)]">
            {formatMetric(value)}
          </span>
          <span className="text-[length:var(--size-footer)] leading-[var(--lh-footer)] text-[var(--text-subheading)]">
            {unit}
          </span>
        </div>
      )}
      {children}
    </CardShell>
  )
}

// one swatch + one word. the marker carries the colour so the text can stay in
// normal ink - a coloured label would be unreadable at this size
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-[var(--space-xs)]">
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[length:var(--size-footer)] leading-[var(--lh-footer)] text-[var(--text-subheading)]">
        {label}
      </span>
    </span>
  )
}

// the per-limb version of the card. theres no single total to headline, so the
// two sides sit next to each other, and the badge reports the gap between them
// instead of growth over time - closing that gap is the thing were nudging at
function PerLimbCard({
  title,
  left,
  right,
  unit,
  imbalance,
  imbalanceUnit = "%",
  children,
}: {
  title: string
  left: number | undefined
  right: number | undefined
  unit: string
  imbalance: ReturnType<typeof latestImbalance>
  imbalanceUnit?: string
  children: React.ReactNode
}) {
  // rounded first, so a gap too small to show as a number reads as balanced
  // rather than as "0 kg ahead". a percent reads better whole, a weight keeps
  // its decimal - half a kilo between the sides is a real gap on a dumbbell
  const gap =
    imbalance === undefined
      ? undefined
      : imbalanceUnit === "%"
        ? Math.round(imbalance.percent)
        : Math.round(imbalance.gap * 10) / 10
  const gapLabel =
    gap === undefined
      ? undefined
      : imbalanceUnit === "%"
        ? `${gap}%`
        : `${formatMetric(gap)} ${imbalanceUnit}`
  return (
    <CardShell>
      <CardHeader
        title={title}
        badge={
          gap !== undefined && (
            <span
              className={
                gap === 0
                  ? "whitespace-nowrap text-[length:var(--size-footer)] leading-[var(--lh-footer)] text-[var(--text-accent)]"
                  : "whitespace-nowrap text-[length:var(--size-footer)] leading-[var(--lh-footer)] text-[var(--text-subheading)]"
              }
            >
              {gap === 0
                ? "Balanced"
                : `${imbalance?.leadingSide} ${gapLabel} ahead`}
            </span>
          )
        }
      />
      <div className="flex items-baseline gap-[var(--space-md)]">
        {left !== undefined && (
          <span className="flex items-baseline gap-[var(--space-xs)]">
            <span className="text-[length:var(--size-footer)] leading-[var(--lh-footer)] text-[var(--text-subheading)]">
              L
            </span>
            <span className="text-[length:var(--size-metric)] leading-[var(--lh-metric)] [font-weight:var(--fw-bold)] tabular-nums text-[var(--text-primary)]">
              {formatMetric(left)}
            </span>
          </span>
        )}
        {right !== undefined && (
          <span className="flex items-baseline gap-[var(--space-xs)]">
            <span className="text-[length:var(--size-footer)] leading-[var(--lh-footer)] text-[var(--text-subheading)]">
              R
            </span>
            <span className="text-[length:var(--size-metric)] leading-[var(--lh-metric)] [font-weight:var(--fw-bold)] tabular-nums text-[var(--text-primary)]">
              {formatMetric(right)}
            </span>
          </span>
        )}
        <span className="text-[length:var(--size-footer)] leading-[var(--lh-footer)] text-[var(--text-subheading)]">
          {unit}
        </span>
      </div>
      {/* two series means a legend is not optional, and the neon marker needs a
          word next to it or its just an unexplained bright dot */}
      <div className="flex flex-wrap items-center gap-x-[var(--space-md)] gap-y-[var(--space-xs)]">
        <LegendItem color="var(--graph-left)" label="Left" />
        <LegendItem color="var(--graph-right)" label="Right" />
        <LegendItem color="var(--graph-balanced)" label="Balanced" />
      </div>
      {children}
    </CardShell>
  )
}

function Graphs() {
  // reveals the sticky header's bottom border only after the page scrolls
  const scrolled = useScrolled()
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
  // the modal hands back the catalog id, which is all this page needs to hold -
  // everything the charts branch on is derived from it above
  function handleConfirmExercise(exerciseId: number) {
    setSelectedExerciseId(exerciseId)
    // without this the difficulty carries over from the last exercise
    setSelectedExerciseDifficulty("")
  }

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
