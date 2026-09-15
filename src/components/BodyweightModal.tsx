import { Button } from "@/components/ui/button"
import NumericCell from "@/components/NumericCell"
import { X } from "lucide-react"
import { WEIGHT_FRAC_DIGITS } from "@/lib/weight"
import { useScrollLock } from "@/hooks/use-scroll-lock"

// "Update your bodyweight" modal (bodyweight exercises only). The big number IS
// the input (reuses NumericCell, so the max is blocked live with a toast). Empty
// shows the last logged weight as a muted placeholder and keeps Save off; Save
// commits, the X / backdrop closes WITHOUT saving. A pure leaf: it holds no
// state, only reports back (onWeightChange / onSave / onClose). It only mounts
// while open, so it locks background scroll itself.
type BodyweightModalProps = {
  metricLabel: string
  weightDraft: number | undefined
  onWeightChange: (value: number | undefined) => void
  weightLimit: { intDigits: number; min: number; max: number }
  weightUnit: string
  bodyWeight: number
  canSave: boolean
  onSave: () => void
  onClose: () => void
}

export function BodyweightModal({
  metricLabel,
  weightDraft,
  onWeightChange,
  weightLimit,
  weightUnit,
  bodyWeight,
  canSave,
  onSave,
  onClose,
}: BodyweightModalProps) {
  useScrollLock(true)
  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative flex w-[85%] max-w-[360px] flex-col items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-[var(--border-cardEdge)] bg-white/5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>

          <p className="text-base font-medium">Update your bodyweight</p>
          <p className="text-base text-center">This is to calculate {metricLabel.toLowerCase()} for Bodyweight exercises</p>

        {/* the big number = the input; empty shows the last weight, muted.
            field-sizing:content makes the field hug the number so the "kg"
            stays next to it and the pair reads centered. */}
        <div className="flex items-baseline justify-center gap-1">
          <NumericCell
            value={weightDraft}
            onChange={onWeightChange}
            intDigits={weightLimit.intDigits}
            fracDigits={WEIGHT_FRAC_DIGITS}
            max={weightLimit.max}
            rejectMessage={`You can only enter weight between ${weightLimit.min} and ${weightLimit.max} ${weightUnit}.`}
            placeholder={String(bodyWeight)}
            className="h-auto w-auto border-0 bg-transparent p-0 text-center text-6xl font-bold text-foreground shadow-none [field-sizing:content] placeholder:text-muted-foreground focus-visible:ring-0 md:text-6xl dark:bg-transparent"
          />
          <span className="text-2xl font-semibold text-muted-foreground">{weightUnit}</span>
        </div>

        <p className="text-sm text-muted-foreground">
          Last logged Bodyweight - {bodyWeight} {weightUnit}
        </p>

        <Button className="w-full h-11" onClick={onSave} disabled={!canSave}>
          Save
        </Button>
      </div>
    </div>
  )
}
