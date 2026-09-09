import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { workouts, type Workout } from "./data/workouts" // we imported both the workouts and the type Workout and mind you that workouts is in the shape of Workout[]
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { workoutVolume, workoutEndurance } from "./data/calculations"
import { cn } from "@/lib/utils"
import { format, parse, parseISO } from "date-fns"
import React, { type ChangeEvent } from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { CalendarIcon } from "lucide-react"
import { SearchIcon } from "lucide-react"
import { Plus } from "lucide-react"
import { X } from "lucide-react"
import { useScrollLock } from "@/hooks/use-scroll-lock"
import { Dumbbell, Activity, List } from "lucide-react"
import type { LucideIcon } from "lucide-react"

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
    // (text-lg 18px x leading-tight 1.25 = 22.5px). the circle sits there, the
    // day number is centered on it, and the two line halves meet there. the
    // track alone stretches to full card height (self-stretch) to carry the line.
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
          <span className="absolute top-[-6px] bottom-[calc(100%-var(--node-y))] left-1/2 w-[3px] -translate-x-1/2 bg-[rgb(var(--white-channels)/20%)]" />
        )}
        {!isLast && (
          <span className="absolute top-[var(--node-y)] bottom-[-6px] left-1/2 w-[3px] -translate-x-1/2 bg-[rgb(var(--white-channels)/20%)]" />
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
  const navigate = useNavigate()
  const handleClick = () => {
    const time = new Date().toLocaleString()
    navigate("/Workout", { state: { time } })// here we are navigating to workout page when we click on + button and state is a way so that we can transfer a data while navigating
  }
  // this here is used so that we know what the user is searching at a time like with date or title or nothing.
  const [searchMode, setSearchMode] = React.useState<"none" | "date" | "title">(
    "none"
  )

  // freeze the page behind while the date-picker modal is open so it can't scroll
  useScrollLock(searchMode === "date")

  const [dateSearched, setDateSearched] = React.useState<Date>()
  const [titleSearched, setTitleSearched] = React.useState("")
  // the month the search calendar is showing — controlled so "Jump to today"
  // can move the view back to the current month from anywhere.
  const [calMonth, setCalMonth] = React.useState<Date>(new Date())

  // every date that has a logged workout, as Date objects, so the calendar can
  // flag those days. duplicates (two workouts on one date) are harmless here.
  const loggedDates = React.useMemo(
    () => workouts.map((workout) => parseISO(workout.date)),
    []
  )

  // this function is for the onchange of the title input , so that the ui keeps in sync with what the user is typing.
  // it also clears any active date search (the date filter otherwise wins over the title one), so typing a title
  // drops the user straight onto the title results without a stale date hiding them.
  function handleTitleTypeForSearch(e: ChangeEvent<HTMLInputElement>) {
    setTitleSearched(e.target.value)
    setDateSearched(undefined)
  }

  //this function is for setting the searchmode to date and clear the title so that the user can search with either date or tile at a time
  function handleDateSearch() {
    setSearchMode("date")
    setTitleSearched("")
    // open on the selected date's month (or today if none picked yet)
    setCalMonth(dateSearched ?? new Date())
  }

  //this function occurs when we tap a logged workout: it opens the workout read-only
  // (the View-only screen), which carries an Edit button to jump to the editor.
  function handleWorkoutOpen(workout: Workout) {
    navigate("/WorkoutView", { state: { workout } })
  }

  //this here shows the workouts but there is a catch , so if the user is searching with date it will show only those
  // workouts that are on that date and if not then if the user is searching with title it will show only those workouts
  // and if none of that then it will show all the workouts that were logged.
  const filteredWorkouts = dateSearched
    ? workouts.filter(
        (workout) => workout.date === format(dateSearched, "yyyy-MM-dd")
      )
    : titleSearched
      ? workouts.filter((workout) =>
          workout.title.toLowerCase().includes(titleSearched.toLowerCase())
        )
      : workouts

  // group the filtered workouts for the timeline: newest date first, then
  // workouts sharing a date collapse into one card (most recent time on top),
  // and finally those date-cards are grouped under their month heading so a
  // heading only renders once per month that has a hit.
  const sortedWorkouts = [...filteredWorkouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const dateGroups: { date: string; items: Workout[] }[] = []
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
  const monthGroups: { label: string; groups: typeof dateGroups }[] = []
  for (const group of dateGroups) {
    const label = format(parseISO(group.date), "MMMM yyyy")
    const last = monthGroups[monthGroups.length - 1]
    if (last && last.label === label) last.groups.push(group)
    else monthGroups.push({ label, groups: [group] })
  }

  return (
    <>
      {searchMode === "date" && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-[var(--space-lg)] backdrop-blur-sm"
          onClick={() => setSearchMode("none")}
        >
          {/* 16px padding on every side, dark surface. stopPropagation so taps
              inside the card don't bubble up and close the modal */}
          <Card
            className="w-full max-w-[400px] gap-[var(--space-lg)] rounded-[var(--radius-card)] border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] p-[var(--space-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close calendar"
                onClick={() => setSearchMode("none")}
                className="size-9 rounded-full bg-[var(--bg-surface-secondary)] text-[var(--text-primary)]"
              >
                <X className="size-5" strokeWidth={2} />
              </Button>
            </div>

            <Calendar
              // bg-transparent lets the card surface show through (the base
              // Calendar ships bg-background); a small cell-size floor lets the
              // 7 columns shrink to fit 320px and grow to fill wider screens.
              className="w-full bg-transparent p-0 [--cell-size:--spacing(8)]"
              mode="single" // allows only one date selection and not a range
              // slide the weeks left/right when the user changes month
              animate
              // always render 6 week rows so the calendar's height stays constant
              // across months - otherwise a 5-week month is shorter and the
              // vertically-centered modal jumps up or down when you change month
              fixedWeeks
              // month + year dropdowns in the caption, so the user can jump
              // straight to any month/year instead of stepping the chevrons.
              // the range bounds the year dropdown.
              captionLayout="dropdown"
              startMonth={new Date(1900, 0)}
              endMonth={new Date(new Date().getFullYear(), 11)}
              month={calMonth}
              onMonthChange={setCalMonth}
              selected={dateSearched}
              onSelect={(date) => {
                setDateSearched(date)
                setSearchMode("none")
              }}
              // days carrying a logged workout, so the DayButton can fill them
              modifiers={{ logged: loggedDates }}
              classNames={{
                root: "w-full",
                // drop the default grey "today" fill — today is a neon ring instead
                today: "",
                // dropdown labels ("Aug ˅" / "1998 ˅"): keep them bold, and lay
                // the text out inline with a small muted chevron beside it
                caption_label:
                  "inline-flex items-center gap-1 text-lg font-bold text-[var(--text-primary)] [&>svg]:size-4 [&>svg]:text-[var(--text-subheading)]",
                // a little more breathing room between the month and year dropdowns
                dropdowns:
                  "flex h-(--cell-size) w-full items-center justify-center gap-2",
                // circular grey nav buttons, matching the close button
                button_previous:
                  "flex size-9 items-center justify-center rounded-full bg-[var(--bg-surface-secondary)] p-0 text-[var(--text-primary)] select-none aria-disabled:opacity-50",
                button_next:
                  "flex size-9 items-center justify-center rounded-full bg-[var(--bg-surface-secondary)] p-0 text-[var(--text-primary)] select-none aria-disabled:opacity-50",
                // month-change slide/fade (keyframes live in globals.css)
                weeks_before_enter: "cal-weeks-before-enter",
                weeks_before_exit: "cal-weeks-before-exit",
                weeks_after_enter: "cal-weeks-after-enter",
                weeks_after_exit: "cal-weeks-after-exit",
                caption_before_enter: "cal-caption-before-enter",
                caption_before_exit: "cal-caption-before-exit",
                caption_after_enter: "cal-caption-after-enter",
                caption_after_exit: "cal-caption-after-exit",
              }}
              components={{
                DayButton: (dayProps) => (
                  <CalendarDayButton
                    {...dayProps}
                    className={cn(
                      dayProps.className,
                      // days spilling in from the neighbouring month
                      dayProps.modifiers.outside &&
                        "text-[var(--text-dateOutside)]",
                      // a logged day: neon-25 fill as an inset layer behind the
                      // number (inset-4 leaves a gap so back-to-back logged days
                      // don't touch), with the number kept full-size on top
                      dayProps.modifiers.logged &&
                        "before:absolute before:inset-[4px] before:-z-10 before:rounded-(--cell-radius) before:bg-[var(--bg-dateLogged)] before:content-['']",
                      // today: neon number plus a neon ring inset to match the
                      // logged box's size. drawn with after: (not before:) so a
                      // day that is both today and logged keeps its fill too.
                      // last so its neon text wins even on an outside-month today
                      dayProps.modifiers.today &&
                        "text-[var(--text-accent)] after:absolute after:inset-[4px] after:rounded-full after:border-2 after:border-[var(--text-accent)] after:content-['']"
                    )}
                  />
                ),
              }}
            />

            <Separator className="bg-[var(--border-cardEdge)]" />

            {/* legend so the fills read clearly */}
            <div className="flex items-center justify-between text-sm font-medium text-[var(--text-subheading)]">
              <span className="flex items-center gap-[var(--space-sm)]">
                <span className="size-4 rounded-[6px] bg-[var(--bg-dateLogged)]" />
                Logged Workout
              </span>
              <button
                type="button"
                onClick={() => setCalMonth(new Date())}
                className="flex items-center gap-[var(--space-sm)] rounded-md outline-none transition-colors hover:text-[var(--text-primary)]"
              >
                <span className="size-4 rounded-full ring-2 ring-[var(--text-accent)] ring-inset" />
                Jump to today
              </button>
            </div>
          </Card>
        </div>
      )}
      <main className="relative flex flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] pt-[env(safe-area-inset-top)]">
          {/* Single row (design 1a): Kasrat avatar, always-open search, calendar.
              All three are 36px tall and centre-aligned so their heights match. */}
          <div className="flex items-center gap-[var(--space-sm)] px-[var(--space-23)] pt-6 pb-4">
            {/* Placeholder brand avatar — an outlined neon ring, not a filled
                button, so it reads as an icon rather than a tappable control. */}
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-neon)]">
              <span className="text-base font-bold tracking-tight text-[var(--color-neon)]">K</span>
            </div>

            {/* Persistent title search — the leading icon is decorative, the Input drives titleSearched */}
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 rounded-full pr-10 pl-10"
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
              className="size-9 shrink-0 rounded-full text-primary"
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
              <Button
                onClick={handleClick}
                className="mt-8 h-14 gap-2 rounded-2xl bg-brand px-8 text-base font-bold text-[var(--bg-surface-primary)] hover:bg-brand/90"
              >
                <Plus className="size-5" strokeWidth={2.75} />
                Log a workout
              </Button>
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
                    <h2 className="text-2xl font-bold text-primary">
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

      {/* Floating actions live in a fixed, column-width overlay pinned above the
          sticky footer, so they keep floating as the document scrolls instead of
          riding the bottom of the (now content-height) page. The overlay ignores
          pointer events; only the buttons themselves take taps. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[430px] flex-col items-end gap-3 px-[var(--space-23)] pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        {/*this is for the button which clears the date so that all the workouts are shown normally */}
        {dateSearched && (
          <Button
            className="pointer-events-auto self-center bg-brand"
            onClick={() => setDateSearched(undefined)}
          >
            Clear Date
          </Button>
        )}

        {/* the floating + button — only once at least one workout exists; before
            that, the centered "Log a workout" button in the empty state stands in */}
        {workouts.length > 0 && (
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
