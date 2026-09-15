import { ConfirmModal } from "@/components/ConfirmModal"

// The "discard this workout?" preset, shared by the two places a workout can be
// discarded: the in-progress banner's trash icon and the Workout editor's Discard
// button. It's a thin wrapper over the shared ConfirmModal so the wording lives in
// one spot and the look stays identical to every other confirm dialog.
type DiscardConfirmModalProps = {
  onConfirm: () => void
  onCancel: () => void
}

export function DiscardConfirmModal({ onConfirm, onCancel }: DiscardConfirmModalProps) {
  return (
    <ConfirmModal
      title="Discard this workout?"
      description="The workout in progress will be removed for good. This can't be undone."
      confirmLabel="Discard"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
