import { ConfirmModal } from "@/components/ConfirmModal"

// The "leave without saving?" preset, shown when Back is tapped on the Workout
// editor while there are unsaved edits to a saved workout. A thin wrapper over the
// shared ConfirmModal so the wording lives in one spot and the look matches every
// other confirm dialog. Cancel stays; Leave (red, destructive) throws the edits away.
type LeaveConfirmModalProps = {
  onConfirm: () => void
  onCancel: () => void
}

export function LeaveConfirmModal({ onConfirm, onCancel }: LeaveConfirmModalProps) {
  return (
    <ConfirmModal
      title="Leave without saving?"
      description="You've made changes to this workout. Leaving now won't save them."
      confirmLabel="Leave"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
