import { cn } from "@/lib/utils"

// A small segmented control (kg·lb, cm·ft). Its own buttons handle the taps, so
// choosing a unit never bubbles up to a row/edit action beside it. Used both on
// the Settings "Your info" card (where switching converts) and inside the weight
// / height edit dialogs (where it just re-labels the value being typed).
//
// `size`: "sm" (36px tall, the card) or "lg" (44px, to sit level with a taller
// dialog input). `fill`: stretch to the parent's width with equal segments,
// instead of hugging its two fixed-width labels.
export function UnitToggle<T extends string>({
  value,
  options,
  onChange,
  size = "sm",
  fill = false,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  size?: "sm" | "lg"
  fill?: boolean
}) {
  const segHeight = size === "lg" ? "h-9" : "h-7"
  const segWidth = fill ? "flex-1" : "w-10"
  return (
    <div
      className={cn(
        "flex gap-[2px] rounded-[9px] border border-[var(--border-inputEdge)] bg-[rgb(255_255_255/5%)] p-[3px]",
        fill ? "w-full" : "flex-none"
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-[7px] text-center text-sm font-medium transition-colors",
              segHeight,
              segWidth,
              active
                ? "bg-[rgb(205_242_58/14%)] text-[var(--color-neon)]"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
