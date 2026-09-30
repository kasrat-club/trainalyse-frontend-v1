import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

// AddWorkoutButton — DUMB. The floating "+" action button that lives in the
// bottom-right on Home. A brand-filled circle with a light "+" on top. Purely
// presentational: it takes an onClick but does nothing on its own.
//
// TOKENS: colour, corner and the icon size are new-design-system tokens
// (--brand, --on-brand, --radius-full, --icon-lg). The 60px control size and the
// drop shadow have NO token yet — see [[gallery-strict-tokens]] (deferred).

type AddWorkoutButtonProps = {
  onClick?: () => void
  className?: string
}

function AddWorkoutButton({ onClick, className }: AddWorkoutButtonProps) {
  return (
    <button
      type="button"
      aria-label="Add workout"
      onClick={onClick}
      className={cn(
        "flex size-[60px] items-center justify-center shadow-lg transition-opacity hover:opacity-90",
        className,
      )}
      style={{
        background: "var(--brand)",
        color: "var(--on-brand)",
        borderRadius: "var(--radius-full)",
      }}
    >
      <Plus className="size-[var(--icon-lg)]" strokeWidth={2.5} />
    </button>
  )
}

export default AddWorkoutButton
