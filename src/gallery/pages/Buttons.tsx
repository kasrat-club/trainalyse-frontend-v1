import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight, ChevronUp, Trash2Icon, X } from "lucide-react"

import IconButton from "@/components/ds/IconButton"
import AddWorkoutButton from "@/components/ds/AddWorkoutButton"
import CalendarButton from "@/components/ds/header/CalendarButton"
import { Button } from "@/components/ui/button"
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

        {/* Text buttons, rendered AS THEY CURRENTLY APPEAR in the app so we can
            see the inconsistency before unifying them: Clear Date is a solid
            brand button with a soft corner, while the modal's Cancel / Discard
            are full pills (outline + solid red). These are faithful snapshots of
            the live markup, not a shared component yet.

            Each wraps the shadcn <Button> (variant="ghost") so it inherits the
            real shadcn BEHAVIOUR — the press bounce (active:translate-y), the
            focus ring and the transition — while we paint each distinct look on
            top. They stay DUMB (no onClick). Because the fills are inline styles,
            ghost's hover background can't show, so the solid ones get an opacity
            hover instead (the design system's hover convention). */}
        <ButtonRow label="Clear Date — Home, centred overlay while a date is searched (solid brand, soft corners)">
          <Button
            variant="ghost"
            className="h-[var(--control-sm)] rounded-[var(--radius-md)] px-[var(--space-lg)] hover:opacity-90 active:opacity-80"
            style={{
              background: "var(--brand)",
              color: "var(--on-brand)",
              fontSize: "var(--text-sm)",
              lineHeight: "var(--leading-sm)",
            }}
          >
            Clear Date
          </Button>
        </ButtonRow>

        <ButtonRow label="Cancel — confirm modal, left action (outline pill)">
          <Button
            variant="ghost"
            className="h-[var(--control-sm)] min-w-[92px] rounded-[var(--radius-full)] border px-[var(--space-lg)] hover:bg-[var(--background)]"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-primary)",
              fontSize: "var(--text-sm)",
              lineHeight: "var(--leading-sm)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            Cancel
          </Button>
        </ButtonRow>

        <ButtonRow label="Discard — confirm modal, right action (red outline pill, matches the trash button)">
          <Button
            variant="ghost"
            className="h-[var(--control-sm)] min-w-[92px] rounded-[var(--radius-full)] border border-[color-mix(in_srgb,var(--danger)_45%,transparent)] bg-transparent px-[var(--space-lg)] text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] hover:text-[var(--danger)]"
            style={{
              fontSize: "var(--text-sm)",
              lineHeight: "var(--leading-sm)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            Discard
          </Button>
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
