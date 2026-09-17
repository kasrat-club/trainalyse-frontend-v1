import { type ChangeEvent } from "react"
import { FormDialog } from "@/components/FormDialog"
import { UnitToggle } from "@/components/UnitToggle"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type WeightUnit } from "@/lib/weight"

type EditWeightDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit: WeightUnit
  onUnitChange: (unit: WeightUnit) => void
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  hint: string
  canSave: boolean
  onSave: () => void
}

// Dumb weight-edit modal: a numeric field plus a kg·lb toggle. The toggle only
// re-labels what's being typed (no conversion — the user is entering a fresh
// value); Save then commits in that unit. Logic (sanitising, range check, kg
// conversion) lives in useUnitSettings.
export function EditWeightDialog({
  open,
  onOpenChange,
  unit,
  onUnitChange,
  value,
  onChange,
  hint,
  canSave,
  onSave,
}: EditWeightDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit weight"
      description={hint}
      canSave={canSave}
      onSave={onSave}
    >
      <div className="flex flex-col gap-[var(--space-sm)]">
        <Label htmlFor="weight-value">Weight</Label>
        {/* input (~62% wide) + the unit toggle level beside it, both 44px tall */}
        <div className="flex items-center gap-2">
          <div className="relative w-[62%]">
            <Input
              id="weight-value"
              inputMode="decimal"
              value={value}
              onChange={onChange}
              autoFocus
              autoComplete="off"
              // no focus glow/ring — keep the border steady while typing
              className="h-11 pr-12 focus-visible:border-input focus-visible:ring-0"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
              {unit}
            </span>
          </div>
          <div className="flex-1">
            <UnitToggle
              value={unit}
              options={[
                { value: "kg", label: "kg" },
                { value: "lbs", label: "lb" },
              ]}
              onChange={onUnitChange}
              size="lg"
              fill
            />
          </div>
        </div>
      </div>
    </FormDialog>
  )
}
