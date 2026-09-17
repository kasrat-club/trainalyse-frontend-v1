import { type ChangeEvent } from "react"
import { FormDialog } from "@/components/FormDialog"
import { UnitToggle } from "@/components/UnitToggle"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EditHeightDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit: "cm" | "ft"
  onUnitChange: (unit: "cm" | "ft") => void
  cmValue: string
  onCmChange: (event: ChangeEvent<HTMLInputElement>) => void
  feet: string
  onFeetChange: (event: ChangeEvent<HTMLInputElement>) => void
  inches: string
  onInchesChange: (event: ChangeEvent<HTMLInputElement>) => void
  hint: string
  canSave: boolean
  onSave: () => void
}

// Dumb height-edit modal: a cm·ft toggle plus either one cm field or a feet +
// inches pair (matching how Moreinfo enters height). The toggle just swaps which
// fields show — no conversion, since the user is typing a fresh value. Logic —
// sanitising, the inches 0–11 rule, the cm range check and the canonical-cm
// conversion — is all in useUnitSettings; this just lays out the field(s).
export function EditHeightDialog({
  open,
  onOpenChange,
  unit,
  onUnitChange,
  cmValue,
  onCmChange,
  feet,
  onFeetChange,
  inches,
  onInchesChange,
  hint,
  canSave,
  onSave,
}: EditHeightDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit height"
      description={hint}
      canSave={canSave}
      onSave={onSave}
    >
      <div className="flex flex-col gap-[var(--space-sm)]">
        <Label htmlFor={unit === "cm" ? "height-cm" : "height-feet"}>Height</Label>
        {/* input area (~62% wide) + the unit toggle level beside it, all 44px tall */}
        <div className="flex items-center gap-2">
          <div className="w-[62%]">
            {unit === "cm" ? (
              <div className="relative">
                <Input
                  id="height-cm"
                  inputMode="numeric"
                  value={cmValue}
                  onChange={onCmChange}
                  autoFocus
                  autoComplete="off"
                  // no focus glow/ring — keep the border steady while typing
                  className="h-11 pr-12 focus-visible:border-input focus-visible:ring-0"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                  cm
                </span>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="height-feet"
                    inputMode="numeric"
                    value={feet}
                    onChange={onFeetChange}
                    autoFocus
                    autoComplete="off"
                    aria-label="Feet"
                    className="h-11 pr-9 focus-visible:border-input focus-visible:ring-0"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                    ft
                  </span>
                </div>
                <div className="relative flex-1">
                  <Input
                    inputMode="numeric"
                    value={inches}
                    onChange={onInchesChange}
                    autoComplete="off"
                    aria-label="Inches"
                    className="h-11 pr-9 focus-visible:border-input focus-visible:ring-0"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                    in
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <UnitToggle
              value={unit}
              options={[
                { value: "cm", label: "cm" },
                { value: "ft", label: "ft" },
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
