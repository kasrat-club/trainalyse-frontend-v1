import type { ReactNode } from "react"

import PillButton from "@/components/ds/PillButton"

// ConfirmModal — DUMB. The app-wide "are you sure?" dialog: a full-screen scrim
// + a centred card with a bold title, optional muted description, and two pill
// actions. Props in, JSX out — it holds no state and does no work; Cancel /
// backdrop call onCancel, the confirm calls onConfirm, and the parent decides
// what those do (here: nothing, just close).
//
// Both actions are pills that wrap the shadcn <Button> (variant="ghost") so they
// inherit its press bounce / focus ring. Cancel is a neutral outline; the confirm
// is a RED OUTLINE (softened --danger border + red text + faint red hover),
// matching the trash button rather than a solid red fill — the palette has no
// error colour, and the outline reads at the same weight as the neutral Cancel.
// TOKENS: colours/spacing/radius/size are all new-design-system tokens; the
// scrim colour (rgb black 60%) and the 92px min-width have no token yet.

type ConfirmModalProps = {
  title: ReactNode
  description?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-[var(--space-lg)] backdrop-blur-sm"
      style={{ background: "rgb(0 0 0 / 0.6)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[360px] rounded-[var(--radius-lg)] border p-[var(--space-lg)]"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            color: "var(--text-primary)",
            fontSize: "var(--text-lg)",
            lineHeight: "var(--leading-lg)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="mt-[var(--space-sm)]"
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--text-sm)",
              lineHeight: "var(--leading-sm)",
            }}
          >
            {description}
          </p>
        )}

        <div className="mt-[var(--space-lg)] flex justify-between gap-[var(--space-md)]">
          <PillButton variant="neutral" onClick={onCancel}>
            {cancelLabel}
          </PillButton>

          <PillButton variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </PillButton>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
