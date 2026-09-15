import React from "react"
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
import {
  perLimbSeries,
  latestImbalance,
  formatMetric,
  shortDate,
} from "@/lib/graph-data"

// The presentational layer of the Graphs page: the two chart types (single-line
// total, two-line per-limb) and the cards that wrap them. Pure rendering — every
// number they show is handed in as a prop; the maths lives in lib/graph-data and
// the data-picking in the Graphs page. Only the five pieces the page places
// directly are exported; the rest are shared internals so the two card variants
// (and the two charts) can't drift apart.

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
export function TotalChart({
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
export function LimbChart({
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
export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-cardEdge)] px-[var(--space-lg)] py-[var(--space-2xl)] text-center text-[length:var(--size-footer)] leading-[var(--lh-footer)] text-[var(--text-subheading)]">
      {children}
    </div>
  )
}

// one metric = one card: title on top, the current value under it, then the
// chart. every chart block on the page is one of these.
export function MetricCard({
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
export function PerLimbCard({
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
