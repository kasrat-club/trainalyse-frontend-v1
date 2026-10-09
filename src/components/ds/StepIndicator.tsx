// StepIndicator — DUMB. The onboarding pager: a row of identical pills showing
// how far along the getting-started flow the user is. Every pill is the same
// size (--size-step-width × --size-step-height); only colour marks progress —
// the current step is --brand, the rest are --surface. Shared across the flow
// screens (login / signup / more-info); each one passes its own `current`.

type StepIndicatorProps = {
  total: number
  current: number // 0-based index of the active step
}

function StepIndicator({ total, current }: StepIndicatorProps) {
  return (
    <div
      className="flex items-center gap-[var(--space-sm)]"
      role="group"
      aria-label={`Step ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-current={i === current ? "step" : undefined}
          className="h-[var(--size-step-height)] w-[var(--size-step-width)] shrink-0 rounded-[var(--radius-full)]"
          style={{ background: i === current ? "var(--brand)" : "var(--surface)" }}
        />
      ))}
    </div>
  )
}

export default StepIndicator
