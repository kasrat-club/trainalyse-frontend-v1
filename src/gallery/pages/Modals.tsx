import ConfirmModal from "@/components/ds/ConfirmModal"
import { heading, muted } from "../styles"

// Modals — the app-wide confirm dialog. ConfirmModal renders a fixed, full-
// screen overlay; the `transform` on the wrapper makes that overlay fill THIS
// box instead of the whole viewport, so it previews inline. Handlers are no-ops
// so it stays up.

function Modals() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Modals</h2>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Confirm modal — destructive confirm (e.g. discard)</span>
        <div
          className="relative overflow-hidden"
          style={{
            height: 320,
            borderRadius: "var(--radius-lg)",
            transform: "translateZ(0)",
          }}
        >
          <ConfirmModal
            title="Discard workout?"
            description="This will end your in-progress workout. This can't be undone."
            confirmLabel="Discard"
            onConfirm={() => {}}
            onCancel={() => {}}
          />
        </div>
      </section>
    </div>
  )
}

export default Modals
