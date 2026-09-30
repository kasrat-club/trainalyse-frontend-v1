// TimelineRail — DUMB. The left rail for one entry: the day number with its
// month below, plus a track carrying one circle (on the title's centerline) and
// the connecting line. The line hides above the first entry and below the last,
// and each half reaches into the inter-card gap so the halves read as one line.

type TimelineRailProps = {
  day: string
  month: string
  isFirst: boolean
  isLast: boolean
}

function TimelineRail({ day, month, isFirst, isLast }: TimelineRailProps) {
  // --node-y is the y of the title's centerline from the shared top: the card's
  // top padding (--space-lg) + half the title's line box (--leading-lg 24 → 12).
  // The circle sits there; the day number is centered on it; each line half
  // stops 16px short of node-y so there's a small gap either side of the dot.
  return (
    <div className="flex items-start gap-[var(--space-sm)] [--node-y:calc(var(--space-lg)+12px)]">
      <div className="flex w-9 flex-col items-start pt-[var(--space-lg)]">
        <span
          className="flex h-6 items-center"
          style={{
            color: "var(--text-primary)",
            fontSize: "var(--text-lg)",
            lineHeight: 1,
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {day}
        </span>
        <span
          className="mt-[var(--space-xs)]"
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--text-sm)",
            lineHeight: "var(--leading-sm)",
          }}
        >
          {month}
        </span>
      </div>

      <div className="relative w-3 self-stretch">
        {!isFirst && (
          <span
            className="absolute top-[-6px] bottom-[calc(100%-var(--node-y)+16px)] left-1/2 w-[3px] -translate-x-1/2 rounded-b-[var(--radius-full)]"
            style={{ background: "var(--border)" }}
          />
        )}
        {!isLast && (
          <span
            className="absolute top-[calc(var(--node-y)+16px)] bottom-[-6px] left-1/2 w-[3px] -translate-x-1/2 rounded-t-[var(--radius-full)]"
            style={{ background: "var(--border)" }}
          />
        )}
        <span
          className="absolute top-[var(--node-y)] left-1/2 size-[var(--icon-sm)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-full)]"
          style={{ background: "var(--text-primary)" }}
        />
      </div>
    </div>
  )
}

export default TimelineRail
