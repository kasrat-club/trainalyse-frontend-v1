import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

// StatRow — DUMB. One stat line inside a workout card: a muted icon + spelled-out
// label on the left, the value bold on the right. justify-between pins the value
// to the edge; the value is shrink-0 + nowrap + tabular-nums so it stays intact
// and column-aligned, while the label (min-w-0) gives way if space gets tight.

export type StatItem = {
  icon: LucideIcon
  label: string
  value: ReactNode
  title?: string
}

function StatRow({ icon: Icon, label, value, title }: StatItem) {
  return (
    <div className="flex items-center justify-between gap-[var(--space-md)]">
      <div
        className="flex min-w-0 items-center gap-[var(--space-md)]"
        style={{ color: "var(--text-muted)" }}
      >
        <Icon className="size-[var(--icon-sm)] shrink-0" />
        <span
          className="truncate"
          style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-sm)" }}
        >
          {label}
        </span>
      </div>
      <span
        title={title}
        className="shrink-0 whitespace-nowrap tabular-nums"
        style={{
          color: "var(--text-primary)",
          fontSize: "var(--text-sm)",
          lineHeight: "var(--leading-sm)",
          fontWeight: "var(--font-weight-bold)",
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default StatRow
