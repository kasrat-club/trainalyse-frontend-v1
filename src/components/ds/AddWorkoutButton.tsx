import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

// AddWorkoutButton — DUMB. The floating "+" action button that lives in the
// bottom-right on Home. A brand-filled circle with a light "+" on top. Purely
// presentational: it takes an onClick but does nothing on its own.
//
// TOKENS: all new-design-system tokens — --brand (+ --brand-hover on hover),
// --on-brand, --radius-full,
// --icon-lg, --shadow-lg, and --control-lg for the 60px footprint (the FAB is
// the one deliberate exception to the standard --control-sm button size).

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
        "flex size-[var(--control-lg)] items-center justify-center bg-[var(--brand)] transition-colors hover:bg-[var(--brand-hover)]",
        className,
      )}
      style={{
        color: "var(--on-brand)",
        borderRadius: "var(--radius-full)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <Plus className="size-[var(--icon-lg)]" />
    </button>
  )
}

export default AddWorkoutButton
