// Pure data helpers for the Graphs page: reshaping and summarising the logged
// chart points. No React, no JSX, no recharts — data in, numbers out — so they're
// trivially testable and carry over unchanged to a React Native port. The Graphs
// page (and its chart/card components) import these; the rendering lives there.

// a per-limb exercise leaves the total key undefined on every point (and vice
// versa), so pull out just the points this key actually has before comparing
export function numericSeries(data: Array<Record<string, unknown>>, key: string) {
  return data
    .map((point) => point[key])
    .filter((value): value is number => typeof value === "number")
}

export function latestValue(data: Array<Record<string, unknown>>, key: string) {
  return numericSeries(data, key).at(-1)
}

// percent change from the first logged session to the latest. undefined when
// theres nothing to compare against yet, or when the first session was 0 and
// the percentage would divide by zero
export function percentFromFirst(data: Array<Record<string, unknown>>, key: string) {
  const series = numericSeries(data, key)
  if (series.length < 2) return undefined
  const first = series[0]
  if (first === 0) return undefined
  return ((series[series.length - 1] - first) / first) * 100
}

// absolute change from the first logged session to the latest, in the metrics
// own unit. same undefined-until-two-sessions rule as percentFromFirst, but a
// first session of 0 is fine here - theres no division to blow up
export function deltaFromFirst(data: Array<Record<string, unknown>>, key: string) {
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
export function perLimbSeries(
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
export function latestImbalance(series: ReturnType<typeof perLimbSeries>) {
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

export function formatMetric(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 })
}

// "9 June, 2026, 9:00 AM" -> "9 Jun". only the axis is shortened - the tooltip
// still shows the full label, which is where the exact date belongs
export function shortDate(label: string) {
  const [day, month] = label.split(",")[0].split(" ")
  return month ? `${day} ${month.slice(0, 3)}` : label
}

// the latest session that actually has a number for this side
export function latestLimbValue(
  series: ReturnType<typeof perLimbSeries>,
  side: "left" | "right"
) {
  const values = series
    .map((point) => point[side])
    .filter((value): value is number => typeof value === "number")
  return values.at(-1)
}
