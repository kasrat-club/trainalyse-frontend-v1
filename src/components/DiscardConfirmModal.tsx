import { Button } from "@/components/ui/button"
import { useScrollLock } from "@/hooks/use-scroll-lock"

// small confirmation dialog shared by the two places a workout can be discarded:
// the in-progress banner's trash icon and the Workout editor's Discard button.
// full-screen scrim + centred card, matching the app's other modals. clicking
// the backdrop cancels; the card swallows the click so taps inside don't.
type DiscardConfirmModalProps = {
  onConfirm: () => void
  onCancel: () => void
}

export function DiscardConfirmModal({ onConfirm, onCancel }: DiscardConfirmModalProps) {
  useScrollLock(true)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-[var(--space-lg)] backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[360px] rounded-2xl border border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] p-[var(--space-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-primary">Discard this workout?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The workout in progress will be removed for good. This can&apos;t be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" className="h-9" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="h-9 bg-destructive text-white hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Discard
          </Button>
        </div>
      </div>
    </div>
  )
}
