import { format, parse, parseISO } from "date-fns"
import { type Workout } from "@/data/workouts"

// one date's worth of workouts: the date string plus the workouts logged that
// day (most recent time first).
export type DateGroup = { date: string; items: Workout[] }
// one month's worth of date-groups, under a "MMMM yyyy" heading.
export type MonthGroup = { label: string; groups: DateGroup[] }

// Pure grouping for the Home timeline: turn a flat list of workouts into
// month → date → workouts, newest first. No React, no state — same input always
// gives the same output, so it's trivially testable and carries over unchanged to
// a React Native port. useWorkoutTimeline just calls this on the filtered list.
//
// Steps: sort all workouts newest date first; collapse workouts sharing a date
// into one group (most recent time on top); then group those date-groups under
// their month heading so a heading renders once per month that has a hit.
export function groupWorkoutsByMonth(workouts: Workout[]): MonthGroup[] {
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const dateGroups: DateGroup[] = []
  for (const workout of sortedWorkouts) {
    const last = dateGroups[dateGroups.length - 1]
    if (last && last.date === workout.date) last.items.push(workout)
    else dateGroups.push({ date: workout.date, items: [workout] })
  }
  for (const group of dateGroups) {
    group.items.sort(
      (a, b) =>
        parse(b.time ?? "12:00 AM", "h:mm a", new Date()).getTime() -
        parse(a.time ?? "12:00 AM", "h:mm a", new Date()).getTime()
    )
  }
  const monthGroups: MonthGroup[] = []
  for (const group of dateGroups) {
    const label = format(parseISO(group.date), "MMMM yyyy")
    const last = monthGroups[monthGroups.length - 1]
    if (last && last.label === label) last.groups.push(group)
    else monthGroups.push({ label, groups: [group] })
  }
  return monthGroups
}
