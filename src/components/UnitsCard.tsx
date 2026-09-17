import { type WeightUnit } from "@/lib/weight"
import { cn } from "@/lib/utils"
import { UnitToggle } from "@/components/UnitToggle"

// One row of the units card: a big left tap-target (label + current value) that
// opens the value-edit dialog, and the unit toggle pinned to the right. Tapping
// anywhere on the left opens the dialog; the toggle stays independent.
function UnitRow({
  label,
  value,
  onEdit,
  topBorder,
  children,
}: {
  label: string
  value: string
  // tapping the label/value opens the edit flow. omitted when the row's only
  // affordance is a control on the right (e.g. the DOB row's Edit button), so
  // the label area itself isn't clickable.
  onEdit?: () => void
  topBorder?: boolean
  // the right-hand control (a unit toggle or an Edit button).
  children?: React.ReactNode
}) {
  const base =
    "flex flex-1 flex-col items-start gap-px py-[11px] pr-[var(--space-sm)] pl-[var(--space-md)] text-left"
  const content = (
    <>
      <span className="text-[14.5px] text-primary">{label}</span>
      <span className="text-xs tabular-nums text-muted-foreground">{value}</span>
    </>
  )
  return (
    <div className={cn("flex items-center", topBorder && "border-t border-white/[0.06]")}>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className={cn(base, "transition-colors hover:bg-white/[0.03]")}
        >
          {content}
        </button>
      ) : (
        <div className={base}>{content}</div>
      )}
      {children && <div className="pr-[var(--space-md)] pl-[var(--space-sm)]">{children}</div>}
    </div>
  )
}

type UnitsCardProps = {
  weightUnit: WeightUnit
  heightUnit: "cm" | "ft"
  weightLabel: string
  heightLabel: string
  dobLabel: string
  onWeightUnit: (unit: WeightUnit) => void
  onHeightUnit: (unit: "cm" | "ft") => void
  onEditWeight: () => void
  onEditHeight: () => void
  onEditDob: () => void
}

// Dumb "Your info" section (design 2a): weight and height rows each pair a unit
// toggle with a tappable label/value that opens its edit dialog, plus a date-of-
// birth row that opens the calendar modal (no toggle, so a chevron marks it as a
// door). All state lives in useUnitSettings / useDobSetting.
export function UnitsCard({
  weightUnit,
  heightUnit,
  weightLabel,
  heightLabel,
  dobLabel,
  onWeightUnit,
  onHeightUnit,
  onEditWeight,
  onEditHeight,
  onEditDob,
}: UnitsCardProps) {
  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      <span className="pl-1 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        Your info
      </span>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)]">
        <UnitRow label="Weight" value={weightLabel} onEdit={onEditWeight}>
          <UnitToggle
            value={weightUnit}
            options={[
              { value: "kg", label: "kg" },
              { value: "lbs", label: "lb" },
            ]}
            onChange={onWeightUnit}
          />
        </UnitRow>
        <UnitRow label="Height" value={heightLabel} onEdit={onEditHeight} topBorder>
          <UnitToggle
            value={heightUnit}
            options={[
              { value: "cm", label: "cm" },
              { value: "ft", label: "ft" },
            ]}
            onChange={onHeightUnit}
          />
        </UnitRow>
        <UnitRow label="Date of birth" value={dobLabel} topBorder>
          {/* An Edit button standing in for a unit toggle. w-[90px] matches the
              toggle's rendered width (two w-10 segments + its padding/gap/border)
              so the right column lines up across all three rows. */}
          <button
            type="button"
            onClick={onEditDob}
            className="h-9 w-[90px] rounded-[9px] border border-[var(--border-inputEdge)] bg-[rgb(255_255_255/5%)] text-sm font-medium text-primary transition-colors hover:bg-[rgb(255_255_255/8%)]"
          >
            Edit
          </button>
        </UnitRow>
      </div>
    </div>
  )
}
