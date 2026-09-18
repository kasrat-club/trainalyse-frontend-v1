import { Button } from "@/components/ui/button"
import { workouts, type Workout } from "./data/workouts" // we imported both the workouts and the type Workout and mind you that workouts is in the shape of Workout[]
import { Separator } from "@/components/ui/separator"
import { workoutVolume, workoutEndurance } from "./data/calculations"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import React from "react"
import { Input } from "@/components/ui/input"
import { CalendarIcon } from "lucide-react"
import { SearchIcon } from "lucide-react"
import { Plus } from "lucide-react"
import { X } from "lucide-react"
import { useScrolled } from "@/hooks/use-scrolled"
import { Dumbbell, Activity, List } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useWorkoutTimeline } from "./hooks/useWorkoutTimeline"
import { WorkoutSearchCalendar } from "./components/WorkoutSearchCalendar"

// compact k/M formatting for the big kg (volume) and kg·s (endurance) totals so
// a 5–6 digit value never wraps or crowds its label: 20000 → 20K, 1250000 →
// 1.25M. exact figures aren't meaningful on a summary card; full precision is
// still one tap away via the row's title tooltip.
const compactNumber = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
})
function formatCompact(value: number) {
  return compactNumber.format(value)
}

// one stat line inside a workout card: a muted icon + spelled-out label on the
// left, the value bold on the right. the label carries the icon's colour so the
// row reads as one muted unit, and justify-between pins the value to the edge.
// the value is shrink-0 + nowrap + tabular-nums so it stays intact and column-
// aligned; the label alone (min-w-0) gives way if space ever gets tight.
function StatRow({
  icon: Icon,
  label,
  value,
  title,
}: {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  title?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-[var(--space-md)] text-[var(--text-subheading)]">
        <Icon className="size-4 shrink-0" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span
        title={title}
        className="shrink-0 text-sm font-bold whitespace-nowrap tabular-nums text-primary"
      >
        {value}
      </span>
    </div>
  )
}

// the title row + stat rows for a single workout. each stat spells out what it
// means (Volume / Endurance / Exercises). the workout-time row is held back
// until Save is wired; volume and endurance are hidden at 0, exercise count
// always shows.
function WorkoutContent({
  workout,
  showDay,
}: {
  workout: Workout
  showDay: boolean
}) {
  const volume = workoutVolume(workout)
  const endurance = workoutEndurance(workout)
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg leading-tight font-bold text-primary">
          {workout.title}
        </h3>
        {/* the day-of-week is a property of the date, so it renders once per
            card — on the top workout only, not on each workout. */}
        {showDay && (
          <span className="mt-0.5 shrink-0 text-sm font-semibold text-[var(--text-subheading)]">
            {format(parseISO(workout.date), "EEE")}
          </span>
        )}
      </div>
      <div className="mt-[var(--space-lg)] flex flex-col gap-[var(--space-md)]">
        {volume > 0 && (
          <StatRow
            icon={Dumbbell}
            label="Total work done (Volume)"
            value={formatCompact(volume)}
            title={volume.toLocaleString()}
          />
        )}
        {endurance > 0 && (
          <StatRow
            icon={Activity}
            label="Time under Load (Endurance)"
            value={formatCompact(endurance)}
            title={endurance.toLocaleString()}
          />
        )}
        <StatRow
          icon={List}
          label="Exercises Done"
          value={workout.exercises.length}
        />
      </div>
    </>
  )
}

// the left rail for one date: the day number with its month below, plus a
// track holding one circle (on the title's centerline) and the connecting line.
// the line hides above the first card and below the last so it never crosses a
// month heading, and each half reaches 6px into the 12px inter-card gap so the
// two halves meet and read as one continuous line.
function TimelineRail({
  date,
  isFirst,
  isLast,
}: {
  date: string
  isFirst: boolean
  isLast: boolean
}) {
  return (
    // --node-y is the y of the (top) title's centerline measured from the card
    // top: the card's top padding (--space-lg) plus half the title's line box
    // (text-lg 18px x leading-tight 1.25 = 22.5px). the circle sits there and the
    // day number is centered on it; each line half stops 16px short of node-y
    // (8px clear of the 8px-radius circle) with a rounded cap, so there's a small
    // gap on either side of the dot. the track alone stretches to full card
    // height (self-stretch) to carry the line.
    <div className="flex items-start gap-2 [--node-y:calc(var(--space-lg)+11.25px)]">
      <div className="flex w-9 flex-col items-start pt-[var(--space-lg)]">
        <span className="flex h-[22.5px] items-center text-xl leading-none font-bold text-primary">
          {format(parseISO(date), "d")}
        </span>
        <span className="mt-1 text-sm font-medium text-[var(--text-subheading)]">
          {format(parseISO(date), "MMM")}
        </span>
      </div>
      <div className="relative w-3 self-stretch">
        {!isFirst && (
          <span className="absolute top-[-6px] bottom-[calc(100%-var(--node-y)+16px)] left-1/2 w-[3px] -translate-x-1/2 rounded-b-full bg-[rgb(var(--white-channels)/20%)]" />
        )}
        {!isLast && (
          <span className="absolute top-[calc(var(--node-y)+16px)] bottom-[-6px] left-1/2 w-[3px] -translate-x-1/2 rounded-t-full bg-[rgb(var(--white-channels)/20%)]" />
        )}
        <span className="absolute top-[var(--node-y)] left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-white-2)]" />
      </div>
    </div>
  )
}

// one date's card. a single workout fills the card and the whole card taps
// through to it; two workouts stack most-recent-first, split by a separator,
// and each half is its own tap target (12px of breathing room each side of the
// separator, 16px at the outer top and bottom).
function DateCard({
  group,
  onOpen,
}: {
  group: { date: string; items: Workout[] }
  onOpen: (workout: Workout) => void
}) {
  const twoUp = group.items.length > 1
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] bg-[var(--bg-surface-primary)]">
      {group.items.map((workout, i) => (
        <React.Fragment key={workout.id}>
          {i > 0 && (
            <Separator className="mx-[var(--space-md)] data-horizontal:w-auto bg-[var(--border-cardEdge)]" />
          )}
          <button
            type="button"
            onClick={() => onOpen(workout)}
            className={cn(
              // 12px side padding lives on the button so the whole area, gutters
              // included, is the tap target for its workout.
              "block w-full px-[var(--space-md)] text-left",
              !twoUp && "py-[var(--space-lg)]",
              twoUp && i === 0 && "pt-[var(--space-lg)] pb-[var(--space-md)]",
              twoUp && i > 0 && "pt-[var(--space-md)] pb-[var(--space-lg)]"
            )}
          >
            <WorkoutContent workout={workout} showDay={i === 0} />
          </button>
        </React.Fragment>
      ))}
    </div>
  )
}


export function App() {
  // the brain of this page lives in one hook now. it hands back the exact same
  // names the JSX below already used, so nothing in the markup had to change.
  const {
    activeWorkout,
    handleClick,
    searchMode,
    setSearchMode,
    dateSearched,
    setDateSearched,
    titleSearched,
    setTitleSearched,
    calMonth,
    setCalMonth,
    loggedDates,
    handleTitleTypeForSearch,
    handleDateSearch,
    handleWorkoutOpen,
    filteredWorkouts,
    monthGroups,
  } = useWorkoutTimeline()

  // the header shares the page background and only reveals its bottom border once
  // the page has scrolled a little — at the very top it reads as one flat surface
  // with the content, and the border appears the moment anything scrolls under it.
  const scrolled = useScrolled()

  return (
    <>

      {searchMode === "date" && (
        <WorkoutSearchCalendar
          month={calMonth}
          onMonthChange={setCalMonth}
          selected={dateSearched}
          onSelect={(date) => {
            setDateSearched(date)
            setSearchMode("none")
          }}
          loggedDates={loggedDates}
          onClose={() => setSearchMode("none")}
        />
      )}
      <main className="relative flex flex-1 flex-col">
        <header
          className={`sticky top-0 z-20 border-b bg-[var(--bg-page)] pt-[env(safe-area-inset-top)] transition-colors ${
            scrolled ? "border-[var(--border-cardEdge)]" : "border-transparent"
          }`}
        >
          {/* Single row (design 1a): Kasrat avatar, always-open search, calendar.
              All three are 36px tall and centre-aligned so their heights match. */}
          <div className="flex items-center gap-[var(--space-sm)] px-[var(--space-23)] pt-6 pb-4">
            {/* Placeholder brand avatar — an outlined neon ring, not a filled
                button, so it reads as an icon rather than a tappable control. */}
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-neon)]">
              <span className="text-base font-bold tracking-tight text-[var(--color-neon)]">K</span>
            </div>

            {/* Persistent title search — the leading icon is decorative, the Input drives titleSearched */}
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 rounded-full bg-transparent pr-10 pl-10"
                type="text"
                placeholder="Search by title"
                value={titleSearched}
                onChange={handleTitleTypeForSearch}
              />
              {/* one-tap clear for the whole title, shown only while there's text to erase */}
              {titleSearched && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setTitleSearched("")}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>

            {/* Calendar opens date search */}
            <Button
              variant="outline"
              size="icon"
              aria-label="Search by date"
              onClick={handleDateSearch}
              className="size-9 shrink-0 rounded-full bg-transparent text-primary"
            >
              <CalendarIcon className="size-5" strokeWidth={2.25} />
            </Button>
          </div>
        </header>

        {/*in this section we handle all the 4 cases that the workouts can be displayed like, that are
         1. all the workouts that are saved are shown
        2. there are no workouts saved so show a text for the user to start logging the workouts
       3. the user is searching with date for the workouts so those workouts only which are on that date
      4.  the user is searching with title for the workouts so those workouts only which are with that title */}
        <section className="flex-1 pt-[var(--space-md)]">
          {workouts.length === 0 ? (
            // first-run empty state: an inviting icon + a prominent neon call to
            // action, since there's no floating + button until the first workout
            // exists. the big button and the + do the same thing (handleClick).
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <div className="flex size-30 items-center justify-center rounded-full border border-[var(--border-cardEdge)] bg-[var(--bg-surface-secondary)]">
                <Dumbbell
                  className="size-12 text-[var(--text-subheading)]"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-primary">
                No workouts yet
              </h2>
              <p className="mt-2 max-w-[300px] text-muted-foreground">
                Log your first session and it&apos;ll show up here, newest
                first.
              </p>
              {/* hidden while a workout is active — the in-progress banner is the
                  only start/resume affordance then */}
              {!activeWorkout && (
                <Button
                  onClick={handleClick}
                  className="mt-8 h-14 gap-2 rounded-2xl bg-brand px-8 text-base font-bold text-[var(--bg-surface-primary)] hover:bg-brand/90"
                >
                  <Plus className="size-5" strokeWidth={2.75} />
                  Log a workout
                </Button>
              )}
            </div>
          ) : filteredWorkouts.length > 0 ? (
            // 23px side gutters, 16px top, and 16px between month blocks (last
            // card of one month to the next heading). the bottom pad clears the
            // floating + button (bottom-6 24px + its 60px height + 16px breathing
            // room) so the last card can always scroll out from under it.
            <div className="flex flex-col gap-[var(--space-lg)] px-[var(--space-23)] pt-[var(--space-lg)] pb-[calc(24px+60px+var(--space-lg))]">
              {monthGroups.map((month) => (
                // 16px between the heading and its first card.
                <div key={month.label} className="flex flex-col gap-[var(--space-lg)]">
                  {/* heading + a count of the workouts currently shown for this
                      month — it follows the filter, so a search narrows it to
                      the matching workouts, not the month's true total. */}
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-primary">
                      {month.label}
                    </h2>
                    {(() => {
                      const count = month.groups.reduce(
                        (sum, group) => sum + group.items.length,
                        0
                      )
                      return (
                        <span className="shrink-0 text-base  font-semibold text-[var(--text-subheading)]">
                          {count} {count === 1 ? "Workout" : "Workouts"}
                        </span>
                      )
                    })()}
                  </div>
                  {/* 12px between date-cards within the same month. each row
                      pairs the timeline rail with its card. */}
                  <div className="flex flex-col gap-[var(--space-md)] ">
                    {month.groups.map((group, i) => (
                      <div
                        key={group.date}
                        className="flex items-stretch gap-4 "
                      >
                        <TimelineRail
                          date={group.date}
                          isFirst={i === 0}
                          isLast={i === month.groups.length - 1}
                        />
                        <div className="min-w-0 flex-1">
                          <DateCard group={group} onOpen={handleWorkoutOpen} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center text-muted-foreground">
              <p>
                {dateSearched
                  ? `No workouts on ${format(dateSearched, "EEEE, do MMMM, yyyy")}`
                  : "No workouts by this title"}
              </p>
            </div>
          )}
        </section>

      </main>

      {/* Clear Date sits in the CENTRE of the screen, not the bottom band — the
          in-progress banner lives above the footer and would otherwise hide it.
          full-screen overlay that ignores taps; only the button itself takes them. */}
      {dateSearched && (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-[var(--space-23)]">
          <Button
            className="pointer-events-auto bg-brand"
            onClick={() => setDateSearched(undefined)}
          >
            Clear Date
          </Button>
        </div>
      )}

      {/* Floating actions live in a fixed, column-width overlay pinned above the
          sticky footer, so they keep floating as the document scrolls instead of
          riding the bottom of the (now content-height) page. The overlay ignores
          pointer events; only the buttons themselves take taps. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[430px] flex-col items-end gap-3 px-[var(--space-23)] pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        {/* the floating + button — only once at least one workout exists; before
            that, the centered "Log a workout" button in the empty state stands in.
            hidden while a workout is active — the in-progress banner takes its
            place, and you resume through that instead of starting another. */}
        {workouts.length > 0 && !activeWorkout && (
          <Button
            aria-label="Add workout"
            size="icon"
            className="pointer-events-auto size-[60px] rounded-full bg-brand text-[var(--bg-surface-primary)] shadow-lg hover:bg-brand/90"
            onClick={handleClick}
          >
            <Plus className="size-8" strokeWidth={2.5} />
          </Button>
        )}
        </div>

    </>
  )
}
