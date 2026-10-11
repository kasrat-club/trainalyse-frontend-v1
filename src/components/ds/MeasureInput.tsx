import { cn } from "@/lib/utils"

import SegmentedToggle from "./SegmentedToggle"

// MeasureInput — DUMB. One or more numeric text fields with a SegmentedToggle
// unit picker sitting INSIDE the same pill on the right. It renders exactly the
// `fields` it's handed: one for kg / lbs / cm, two for feet + inches. Which set
// of fields to show for the chosen unit is the PARENT's call (business logic),
// not this component's — it just lays them out and reports typing + unit changes.
//
// The border + focus glow live on the container (focus-within), so the whole
// field lights up when any sub-input is focused; the inputs themselves are
// borderless and transparent. The toggle is --size-toggle tall and inset by
// --space-xs on the right, matching its 4px breathing room top and bottom.

type SubField = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel?: string
}

type MeasureInputProps = {
  fields: SubField[]
  unit: string
  onUnitChange: (unit: string) => void
  unitOptions: { value: string; label: string }[]
  unitAriaLabel: string
  error?: boolean
}

function MeasureInput({
  fields,
  unit,
  onUnitChange,
  unitOptions,
  unitAriaLabel,
  error = false,
}: MeasureInputProps) {
  return (
    <div
      className={cn(
        "flex h-[var(--control-sm)] w-full items-center gap-[var(--space-sm)] rounded-[var(--radius-full)] border bg-transparent pr-[var(--space-xs)] pl-[var(--space-lg)] transition-colors",
        error
          ? "border-[var(--danger)] shadow-[var(--shadow-focus-danger)]"
          : "border-[var(--border)] focus-within:border-[var(--border-hover)] focus-within:shadow-[var(--shadow-focus)]",
      )}
    >
      {fields.map((field) => (
        <input
          key={field.placeholder}
          type="text"
          inputMode="decimal"
          value={field.value}
          onChange={(event) => field.onChange(event.target.value)}
          placeholder={field.placeholder}
          aria-label={field.ariaLabel ?? field.placeholder}
          className="min-w-0 flex-1 bg-transparent text-[length:var(--text-md)] outline-none placeholder:text-[var(--text-muted)]"
          style={{ color: error ? "var(--danger)" : "var(--text-primary)" }}
        />
      ))}
      <SegmentedToggle
        options={unitOptions}
        value={unit}
        onChange={onUnitChange}
        ariaLabel={unitAriaLabel}
      />
    </div>
  )
}

export default MeasureInput
