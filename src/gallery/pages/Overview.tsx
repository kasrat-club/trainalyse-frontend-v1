import { useState } from "react"
import { ChartLine, Clock, Dumbbell, Home, List, Settings } from "lucide-react"

import TypeSpecimen from "@/components/gallery/TypeSpecimen"
import HomeHeader from "@/components/ds/header/HomeHeader"
import WorkoutCalendar from "@/components/ds/calendar/WorkoutCalendar"
import MonthHeading from "@/components/ds/timeline/MonthHeading"
import WorkoutDateCard, {
  type WorkoutEntry,
} from "@/components/ds/timeline/WorkoutDateCard"
import TimelineRail from "@/components/ds/timeline/TimelineRail"
import AddWorkoutButton from "@/components/ds/AddWorkoutButton"
import Footer from "@/components/ds/Footer"
import WorkoutBanner from "@/components/ds/WorkoutBanner"
import ConfirmModal from "@/components/ds/ConfirmModal"
import ClearDateButton from "@/components/ds/ClearDateButton"
import EmptyWorkouts from "@/components/ds/EmptyWorkouts"
import NoResults from "@/components/ds/NoResults"
import { muted } from "../styles"

// Overview — every component on one page. This is the "all in one place" view;
// the other pages (Buttons, Cards, …) segregate by type. Each block below shows
// one component with a small demo harness where it needs state.

const pushDay: WorkoutEntry = {
  title: "Push Day",
  weekday: "Mon",
  stats: [
    { icon: Dumbbell, label: "Volume", value: "12,450 kg" },
    { icon: List, label: "Exercises", value: 6 },
    { icon: Clock, label: "Duration", value: "1h 12m" },
  ],
}

const legDay: WorkoutEntry = {
  title: "Leg Day",
  weekday: "Sat",
  stats: [
    { icon: Dumbbell, label: "Volume", value: "15,200 kg" },
    { icon: List, label: "Exercises", value: 5 },
    { icon: Clock, label: "Duration", value: "58m" },
  ],
}

function Overview() {
  return (
    <div
      className="flex flex-col gap-10"
      style={{ maxWidth: "var(--container-app)" }}
    >
      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Home header</span>
        <div
          className="overflow-hidden"
          style={{
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <HeaderShowcase />
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Month heading</span>
        <div
          style={{
            background: "var(--background)",
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-lg)",
          }}
        >
          <MonthHeading month="June 2026" workoutCount={11} />
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Workout card — one workout</span>
        <div className="flex items-stretch gap-[var(--space-lg)]">
          <TimelineRail day="22" month="Jun" isFirst isLast={false} />
          <div className="min-w-0 flex-1">
            <WorkoutDateCard items={[pushDay]} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Workout card — two workouts (one separator)</span>
        <div className="flex items-stretch gap-[var(--space-lg)]">
          <TimelineRail day="20" month="Jun" isFirst isLast={false} />
          <div className="min-w-0 flex-1">
            <WorkoutDateCard items={[pushDay, legDay]} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>New workout button (FAB)</span>
        <div
          className="relative h-40"
          style={{
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div className="absolute right-[var(--space-lg)] bottom-[var(--space-lg)]">
            <AddWorkoutButton />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Footer navigation</span>
        <div
          className="overflow-hidden"
          style={{
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <FooterShowcase />
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>In-progress banner</span>
        <WorkoutBanner />
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Confirm modal</span>
        {/* the `transform` makes the modal's fixed overlay fill THIS box instead
            of the whole viewport, so it shows inline like the other components.
            Handlers are no-ops so it stays up (dumb). */}
        <div
          className="relative overflow-hidden"
          style={{
            height: 320,
            borderRadius: "var(--radius-lg)",
            transform: "translateZ(0)",
          }}
        >
          <ConfirmModal
            title="Discard workout?"
            description="This will end your in-progress workout. This can't be undone."
            confirmLabel="Discard"
            onConfirm={() => {}}
            onCancel={() => {}}
          />
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Home calendar</span>
        <CalendarShowcase />
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Clear Date button</span>
        <div className="flex">
          <ClearDateButton />
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Empty state — no workouts yet</span>
        <div
          style={{
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <EmptyWorkouts />
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>No results — date / title filter empty</span>
        <div
          style={{
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <NoResults message="No workouts on Thursday, 8th October, 2026" />
          <NoResults message="No workouts by this title" />
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Typography</span>
        <div
          style={{
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-lg)",
          }}
        >
          <TypeSpecimen />
        </div>
      </section>
    </div>
  )
}

// Demo harness: the header is controlled, so this holds the search text just so
// it's typeable. The calendar tap is a no-op here (separate component).
function HeaderShowcase() {
  const [search, setSearch] = useState("")
  return (
    <HomeHeader
      search={search}
      onSearchChange={setSearch}
      onSearchClear={() => setSearch("")}
    />
  )
}

// Demo harness for the calendar: current month + picked date + sample logged
// days. Selecting and navigating are live; the X is a no-op (not a modal here).
function CalendarShowcase() {
  const today = new Date()
  const [month, setMonth] = useState(today)
  const [selected, setSelected] = useState<Date | undefined>(undefined)

  const loggedDates = [3, 8, 9, 17, 22].map(
    (d) => new Date(today.getFullYear(), today.getMonth(), d),
  )

  return (
    <WorkoutCalendar
      month={month}
      onMonthChange={setMonth}
      selected={selected}
      onSelect={setSelected}
      loggedDates={loggedDates}
      onClose={() => {}}
    />
  )
}

// Demo harness for the footer: holds the active tab so clicking shows the active
// state without real navigation.
function FooterShowcase() {
  const [active, setActive] = useState("home")
  return (
    <Footer
      active={active}
      onChange={setActive}
      tabs={[
        { id: "home", label: "Home", icon: Home },
        { id: "graphs", label: "Graphs", icon: ChartLine },
        { id: "settings", label: "Settings", icon: Settings },
      ]}
    />
  )
}

export default Overview
