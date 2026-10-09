import type { CSSProperties, ReactNode } from "react"
import { ChevronLeft, ChevronRight, ChevronUp, Trash2Icon, X } from "lucide-react"

import IconButton from "@/components/ds/IconButton"
import AddWorkoutButton from "@/components/ds/AddWorkoutButton"
import PillButton from "@/components/ds/PillButton"
import CalendarButton from "@/components/ds/header/CalendarButton"
import { heading, muted } from "../styles"

// Buttons — the real button components, grouped by CLASS (the button's shape):
// the circular IconButton, the text PillButton, and the FAB (the one floating
// exception). Within a class, the differences are VARIANTS, not new classes —
// same lesson as the type styles: shape is the class, intent / colour is a
// variant (so Cancel and Discard are one class, two variants, not two classes).

function Buttons() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Buttons</h2>

      <ButtonClass
        first
        name="Icon button"
        blurb="Round, icon only. Variants: outline (default) and destructive."
      >
        <ButtonRow label="Calendar — header, opens date search (outline)">
          <CalendarButton />
        </ButtonRow>
        <ButtonRow label="Resume — banner, up chevron (outline)">
          <IconButton variant="outline" icon={ChevronUp} aria-label="Resume workout" />
        </ButtonRow>
        <ButtonRow label="Month nav — calendar previous / next (outline)">
          <div className="flex gap-[var(--space-sm)]">
            <IconButton variant="outline" icon={ChevronLeft} aria-label="Previous month" />
            <IconButton variant="outline" icon={ChevronRight} aria-label="Next month" />
          </div>
        </ButtonRow>
        <ButtonRow label="Close — calendar, top-right (outline)">
          <IconButton variant="outline" icon={X} aria-label="Close calendar" />
        </ButtonRow>
        <ButtonRow label="Discard — banner (destructive)">
          <IconButton variant="destructive" icon={Trash2Icon} aria-label="Discard workout" />
        </ButtonRow>
      </ButtonClass>

      <ButtonClass
        name="Pill button"
        blurb="A pill with a text label. Variants: primary, brand, neutral, destructive."
      >
        <ButtonRow label="Login / Save — the main action (primary; light fill, navy text)">
          <PillButton variant="primary">Login</PillButton>
        </ButtonRow>
        <ButtonRow label="Clear Date — Home overlay while a date is searched (brand; amber fill)">
          <PillButton variant="brand">Clear Date</PillButton>
        </ButtonRow>
        <ButtonRow label="Cancel — confirm modal, dismiss (neutral; outline)">
          <PillButton variant="neutral">Cancel</PillButton>
        </ButtonRow>
        <ButtonRow label="Discard — confirm modal, confirm the danger (destructive; red outline)">
          <PillButton variant="destructive">Discard</PillButton>
        </ButtonRow>
      </ButtonClass>

      <ButtonClass
        name="FAB"
        blurb="The large floating brand circle — the app's signature 'add workout'. The one deliberate exception (60px, brand-filled)."
      >
        <ButtonRow label="Add workout — bottom-right on Home">
          <AddWorkoutButton />
        </ButtonRow>
      </ButtonClass>
    </div>
  )
}

// One button class: a name + blurb, a hairline separator above it (except the
// first), then its member rows.
function ButtonClass({
  name,
  blurb,
  first = false,
  children,
}: {
  name: string
  blurb: string
  first?: boolean
  children: ReactNode
}) {
  return (
    <section
      className="flex flex-col gap-[var(--space-lg)]"
      style={
        first
          ? undefined
          : {
              borderTop: "var(--border-width) solid var(--border)",
              paddingTop: "var(--space-lg)",
            }
      }
    >
      <div className="flex flex-col gap-[var(--space-xs)]">
        <span style={classLabel}>{name}</span>
        <span style={muted}>{blurb}</span>
      </div>
      <div className="flex flex-col gap-[var(--space-lg)]">{children}</div>
    </section>
  )
}

// One catalog row: the button(s) on the left, a muted description on the right.
function ButtonRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-[var(--space-lg)]">
      <div className="flex shrink-0 items-center">{children}</div>
      <span style={muted}>{label}</span>
    </div>
  )
}

const classLabel: CSSProperties = {
  color: "var(--text-primary)",
  fontSize: "var(--text-md)",
  lineHeight: "var(--leading-md)",
  fontWeight: "var(--font-weight-bold)",
}

export default Buttons
