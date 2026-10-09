import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight, ChevronUp, Trash2Icon, X } from "lucide-react"

import IconButton from "@/components/ds/IconButton"
import AddWorkoutButton from "@/components/ds/AddWorkoutButton"
import ClearDateButton from "@/components/ds/ClearDateButton"
import PillButton from "@/components/ds/PillButton"
import CalendarButton from "@/components/ds/header/CalendarButton"
import { heading, muted } from "../styles"

// Buttons — every button used in the project, in one place. These are the REAL
// components (the header calendar button and the shared IconButton in its
// variants), so what shows here is exactly what ships. Icons are decorative; the
// handlers are omitted (nothing to do in the catalog).

function Buttons() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Buttons</h2>

      <div className="flex flex-col gap-[var(--space-lg)]">
        <ButtonRow label="Calendar — header, opens date search (outline)">
          <CalendarButton />
        </ButtonRow>

        <ButtonRow label="Discard — banner (destructive)">
          <IconButton
            variant="destructive"
            icon={Trash2Icon}
            aria-label="Discard workout"
          />
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

        <ButtonRow label="Add workout — the main FAB, bottom-right on Home (60px, brand-filled)">
          <AddWorkoutButton />
        </ButtonRow>

        {/* Text buttons — the REAL shared components (no more inline snapshots, so
            this catalogue and the live app can't drift): Clear Date is
            ClearDateButton (solid brand → --brand-hover), and the modal's
            Cancel / Discard are PillButton's neutral / destructive variants. */}
        <ButtonRow label="Clear Date — Home, centred overlay while a date is searched (solid brand, lightens to --brand-hover)">
          <ClearDateButton />
        </ButtonRow>

        <ButtonRow label="Cancel — confirm modal, left action (neutral pill)">
          <PillButton variant="neutral">Cancel</PillButton>
        </ButtonRow>

        <ButtonRow label="Discard — confirm modal, right action (destructive pill, matches the trash button)">
          <PillButton variant="destructive">Discard</PillButton>
        </ButtonRow>
      </div>
    </div>
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

export default Buttons
