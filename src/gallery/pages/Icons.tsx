import type { LucideIcon } from "lucide-react"
import {
  SearchIcon,
  CalendarIcon,
  X,
  Home,
  ChartLine,
  Settings,
  Dumbbell,
  Activity,
  List,
  Plus,
  Trash2Icon,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { heading, muted } from "../styles"

// Icons — every icon in the app, grouped by where it lives (matching the hand
// audit). The system is deliberately tiny: TWO sizes only — 16px (--icon-sm)
// for every functional icon and 32px (--icon-lg) for the FAB plus — all at
// lucide's default stroke (2), which nothing overrides. The old empty-state
// dumbbell (48px / stroke 1.5) was dropped; it'll be replaced by a proper
// illustration, so it's intentionally not an icon here.

type IconSpec = { icon: LucideIcon; name: string; size: "sm" | "lg" }

const groups: { label: string; icons: IconSpec[] }[] = [
  {
    label: "Header",
    icons: [
      { icon: SearchIcon, name: "Search", size: "sm" },
      { icon: CalendarIcon, name: "Calendar", size: "sm" },
      { icon: X, name: "Clear search", size: "sm" },
    ],
  },
  {
    label: "Footer",
    icons: [
      { icon: Home, name: "Home", size: "sm" },
      { icon: ChartLine, name: "Graphs", size: "sm" },
      { icon: Settings, name: "Settings", size: "sm" },
    ],
  },
  {
    label: "Body",
    icons: [
      { icon: Dumbbell, name: "Volume (stat)", size: "sm" },
      { icon: Activity, name: "Endurance (stat)", size: "sm" },
      { icon: List, name: "Exercises (stat)", size: "sm" },
      { icon: Plus, name: "Add workout (FAB)", size: "lg" },
    ],
  },
  {
    label: "Banner",
    icons: [
      { icon: Trash2Icon, name: "Discard", size: "sm" },
      { icon: ChevronUp, name: "Resume", size: "sm" },
    ],
  },
  {
    label: "Calendar (home)",
    icons: [
      { icon: X, name: "Close", size: "sm" },
      { icon: ChevronLeft, name: "Previous month", size: "sm" },
      { icon: ChevronRight, name: "Next month", size: "sm" },
    ],
  },
]

function Icons() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Icons</h2>
      <p style={muted}>
        Two sizes only — 16px (--icon-sm) for every functional icon, 32px
        (--icon-lg) for the FAB plus — all at lucide&apos;s default stroke (2).
      </p>

      {groups.map((group) => (
        <section
          key={group.label}
          className="flex flex-col gap-[var(--space-md)]"
        >
          <span style={muted}>{group.label}</span>
          <div className="flex flex-wrap gap-[var(--space-md)]">
            {group.icons.map((spec) => (
              <IconCell key={group.label + spec.name} {...spec} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// One catalog cell: the real icon at its token size, centred in a bordered box,
// with its name and the size token it uses underneath.
function IconCell({ icon: Icon, name, size }: IconSpec) {
  return (
    <div
      className="flex w-[116px] flex-col items-center gap-[var(--space-sm)] rounded-[var(--radius-md)] border p-[var(--space-md)]"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="flex h-[var(--icon-lg)] items-center justify-center">
        <Icon
          className={
            size === "lg"
              ? "size-[var(--icon-lg)]"
              : "size-[var(--icon-sm)]"
          }
          style={{ color: "var(--text-primary)" }}
        />
      </div>
      <span className="text-center" style={muted}>
        {name}
      </span>
      <span
        style={{
          color: "var(--text-muted)",
          fontSize: "var(--text-sm)",
          lineHeight: "var(--leading-sm)",
        }}
      >
        {size === "lg" ? "32 · lg" : "16 · sm"}
      </span>
    </div>
  )
}

export default Icons
