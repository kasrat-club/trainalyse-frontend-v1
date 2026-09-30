import { useState } from "react"
import type { CSSProperties } from "react"
import { ChartLine, Dumbbell, Home, List, Settings } from "lucide-react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import GallerySidebar from "@/components/gallery/GallerySidebar"
import TypeSpecimen from "@/components/gallery/TypeSpecimen"
import HomeHeader from "@/components/ds/header/HomeHeader"
import WorkoutCalendar from "@/components/ds/calendar/WorkoutCalendar"
import WorkoutTimelineEntry from "@/components/ds/timeline/WorkoutTimelineEntry"
import AddWorkoutButton from "@/components/ds/AddWorkoutButton"
import Footer from "@/components/ds/Footer"
import { useGalleryControls } from "@/hooks/useGalleryControls"

// Dev-only component gallery for the NEW design system. Registered in main.tsx
// behind import.meta.env.DEV, so it never ships to users.
//
// The whole page is wrapped in `.ds-scope`, which is where the new-design-
// system.css tokens live. That keeps this preview fully isolated: the live app
// (outside this wrapper) is unaffected.
//
// The preview area below is intentionally EMPTY — we rebuild the showcased
// components here from scratch, one at a time, each reading the real tokens so
// the sidebar knobs actually drive them.

function Gallery() {
  const controls = useGalleryControls()

  return (
    <div
      className="ds-scope"
      style={{
        background: "var(--background)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <SidebarProvider>
        <GallerySidebar {...controls} />

        <SidebarInset style={{ background: "var(--background)" }}>
          <header
            className="flex items-center gap-[var(--space-md)] px-6 py-5"
            style={{ borderBottom: "var(--border-width) solid var(--border)" }}
          >
            <SidebarTrigger />
            <div>
              <h1 style={heading}>Component gallery</h1>
              <p style={muted}>Dev-only · new design system · isolated preview</p>
            </div>
          </header>

          {/* previewStyle spreads the knob overrides (radius, …) ONLY here, so
              the showcased components react to the sidebar while the panel and
              header keep the base tokens. Components get added inside this main. */}
          <main
            style={controls.previewStyle}
            className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-8"
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

            <section className="flex flex-col gap-[var(--space-md)]">
              <span style={muted}>Home calendar</span>
              <CalendarShowcase />
            </section>

            <section className="flex flex-col gap-[var(--space-md)]">
              <span style={muted}>Workout card (timeline entry)</span>
              <div className="flex flex-col gap-[var(--space-md)]">
                <WorkoutTimelineEntry
                  day="22"
                  month="Jun"
                  weekday="Mon"
                  title="Per-Limb Arm Day"
                  isFirst
                  isLast={false}
                  stats={[
                    { icon: Dumbbell, label: "Total work done (Volume)", value: "552" },
                    { icon: List, label: "Exercises Done", value: 1 },
                  ]}
                />
                <WorkoutTimelineEntry
                  day="20"
                  month="Jun"
                  weekday="Sat"
                  title="Push Day"
                  isFirst={false}
                  isLast
                  stats={[
                    { icon: Dumbbell, label: "Total work done (Volume)", value: "1.2K" },
                    { icon: List, label: "Exercises Done", value: 5 },
                  ]}
                />
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
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

const heading: CSSProperties = {
  fontSize: "var(--text-lg)",
  lineHeight: "var(--leading-lg)",
  fontWeight: "var(--font-weight-bold)",
}

const muted: CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
}

// Demo harness: the header is controlled, so this holds the search text just so
// it's typeable in the preview. Trivial view state for the showcase only — the
// real page will wire these to its own search hook. The calendar tap is a no-op
// here on purpose (the calendar is a separate component).
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

// Demo harness for the calendar: holds the current month + the picked date, and
// a few sample logged days in the current month so the fills show. Selecting a
// date and navigating months are live; the X is a no-op here since the calendar
// is always on screen (not a modal).
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

// Demo harness for the footer: holds the active tab so clicking a tab shows its
// active state without any real navigation.
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

export default Gallery
