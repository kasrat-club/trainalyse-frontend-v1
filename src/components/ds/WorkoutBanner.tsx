import { ChevronUp, Trash2Icon } from "lucide-react"

import IconButton from "@/components/ds/IconButton"

// WorkoutBanner — DUMB. The "a workout is still going on" pill. Tapping the body
// resumes (onOpen); the delete button discards (onDelete). Both are just
// callbacks — no confirm modal here, that's the parent's job.
//
// Delete is the destructive IconButton (a red outline, --danger); resume is the
// outline IconButton with an UP chevron. Colours, size and shadow are all
// new-design-system tokens.

type WorkoutBannerProps = {
  title?: string
  onOpen?: () => void
  onDelete?: () => void
}

function WorkoutBanner({
  title = "One workout is still going on",
  onOpen,
  onDelete,
}: WorkoutBannerProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen?.()
      }}
      className="flex w-full cursor-pointer items-center gap-[var(--space-md)] rounded-[var(--radius-full)] border p-[var(--space-sm)]"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* delete — destructive IconButton, dumb (no confirm modal) */}
      <IconButton
        variant="destructive"
        icon={Trash2Icon}
        aria-label="Discard workout"
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.()
        }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-[var(--space-sm)]">
          <span
            className="size-[var(--size-dot)] rounded-[var(--radius-full)]"
            style={{ background: "var(--brand)" }}
          />
          <span
            className="uppercase"
            style={{
              color: "var(--text-primary)",
              fontSize: "var(--text-sm)",
              lineHeight: "var(--leading-sm)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            In progress
          </span>
        </div>
        <p
          className="truncate"
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--text-md)",
            lineHeight: "var(--leading-md)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {title}
        </p>
      </div>

      {/* resume — up chevron (outline) */}
      <IconButton
        variant="outline"
        icon={ChevronUp}
        aria-label="Resume workout"
        onClick={(e) => {
          e.stopPropagation()
          onOpen?.()
        }}
      />
    </div>
  )
}

export default WorkoutBanner
