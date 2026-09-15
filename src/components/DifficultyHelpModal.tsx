import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useScrollLock } from "@/hooks/use-scroll-lock"

// "How difficulty works" modal (the ? by the DIFFICULTY column). X or backdrop or
// OK all just close it. Formulas mirror the calc layer: volume × reps for
// weights-and-reps, endurance × time for duration. A pure leaf — it's handed the
// metric/factor labels and only reports onClose. It only mounts while open, so it
// locks background scroll itself.
type DifficultyHelpModalProps = {
  metricLabel: string
  factorLabel: string
  onClose: () => void
}

export function DifficultyHelpModal({
  metricLabel,
  factorLabel,
  onClose,
}: DifficultyHelpModalProps) {
  useScrollLock(true)
  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative flex w-[85%] max-w-[360px] flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] p-5 pt-6"
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

        <div className="flex flex-col gap-1 pr-8">
          <p className="text-base font-semibold">How difficulty works</p>
          <p className="text-sm text-muted-foreground">
            Difficulty changes how this exercise's {metricLabel.toLowerCase()} is
            calculated.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { name: "Normal", formula: `${metricLabel} = bodyweight × ${factorLabel}` },
            { name: "Assisted", formula: `${metricLabel} = (bodyweight − assisted weight) × ${factorLabel}` },
            { name: "Weighted", formula: `${metricLabel} = (bodyweight + extra weight) × ${factorLabel}` },
          ].map((row) => (
            <div key={row.name} className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{row.name}</span>
              <span className="text-sm text-muted-foreground">{row.formula}</span>
            </div>
          ))}
        </div>

        <Button className="h-11 w-full" onClick={onClose}>
          OK
        </Button>
      </div>
    </div>
  )
}
