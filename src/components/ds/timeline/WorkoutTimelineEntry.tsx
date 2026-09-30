import TimelineRail from "./TimelineRail"
import WorkoutCard from "./WorkoutCard"
import type { StatItem } from "./StatRow"

// WorkoutTimelineEntry — DUMB composition. One row of the home timeline: the
// rail (date + circle + line) paired with its workout card. items-stretch lets
// the rail track match the card height so the line spans the whole row. Stack
// several of these in a flex-col (gap --space-md) and the rail reads as one
// continuous timeline; isFirst/isLast trim the line at the ends.

type WorkoutTimelineEntryProps = {
  day: string
  month: string
  weekday: string
  title: string
  stats: StatItem[]
  isFirst?: boolean
  isLast?: boolean
  onOpen?: () => void
}

function WorkoutTimelineEntry({
  day,
  month,
  weekday,
  title,
  stats,
  isFirst = true,
  isLast = true,
  onOpen,
}: WorkoutTimelineEntryProps) {
  return (
    <div className="flex items-stretch gap-[var(--space-lg)]">
      <TimelineRail day={day} month={month} isFirst={isFirst} isLast={isLast} />
      <div className="min-w-0 flex-1">
        <WorkoutCard title={title} weekday={weekday} stats={stats} onOpen={onOpen} />
      </div>
    </div>
  )
}

export default WorkoutTimelineEntry
