import React from "react"
import { Button } from "@/components/ui/button"
import { useScrollLock } from "@/hooks/use-scroll-lock"
import { cn } from "@/lib/utils"

// The single confirmation dialog for the whole app: full-screen scrim + centred
// card, a bold title, optional muted description, and two action buttons. Every
// place that asks "are you sure?" (discard a workout, delete an exercise, remove
// a dropset) renders THIS, so the look — especially the confirm button — is
// identical everywhere instead of drifting per page.
//
// The two buttons borrow the view-only page header's pill language so the app
// feels of one piece:
//   • Cancel  — the muted "Back" pill (transparent, grey border + text).
//   • Confirm — the same tinted-outline pill as "Edit", but in destructive red by
//     default (a discard/delete is destructive, so neon would read as positive).
//     `destructive={false}` switches it to the neon variant for a positive confirm.
// Clicking the backdrop cancels; the card swallows the click so taps inside don't.
const modalPill =
  "h-9 min-w-[92px] justify-center gap-1.5 rounded-full border px-4 text-sm font-medium"

type ConfirmModalProps = {
  title: React.ReactNode
  description?: React.ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  // false → the confirm button uses the neon (positive) look instead of red.
  destructive?: boolean
}

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmModalProps) {
  // this only mounts while the dialog is open, so locking on mount is enough — the
  // hook's shared counter handles a dialog stacked over another modal.
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
        <h2 className="text-lg font-bold text-primary">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        <div className="mt-6 flex justify-between gap-3">
          <Button
            className={cn(
              modalPill,
              "border-muted-foreground bg-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            className={cn(
              modalPill,
              destructive
                ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                : "border-[rgb(205_242_58/40%)] bg-[rgb(205_242_58/8%)] text-[var(--color-neon)] hover:bg-[rgb(205_242_58/14%)]"
            )}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
