import { Select as SelectPrimitive } from "radix-ui"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

// Select — DUMB. A set-type picker. Wraps the Radix Select (popover + keyboard
// a11y) and paints our look: a --border box with the value + a muted chevron,
// opening a --surface menu whose highlighted item lifts to --surface-hover and
// whose chosen item shows a brand check. `readOnly` (the view page) drops the
// chevron and the popover entirely — it's just the value in the same box, not
// interactive. Controlled via value / onChange.

type Option = { value: string; label: string }

type SelectProps = {
  options: Option[]
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  readOnly?: boolean
}

// shared box look so the editable trigger and the read-only display match exactly
const box =
  "inline-flex h-[var(--control-sm)] items-center gap-[var(--space-sm)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-transparent px-[var(--space-lg)]"

const boxText = {
  color: "var(--text-primary)",
  fontSize: "var(--text-md)",
  lineHeight: "var(--leading-md)",
} as const

function Select({ options, value, onChange, ariaLabel, readOnly = false }: SelectProps) {
  if (readOnly) {
    const selected = options.find((o) => o.value === value)
    return (
      <div className={box} style={boxText}>
        {selected?.label ?? value}
      </div>
    )
  }

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn(
          box,
          "justify-between outline-none transition-colors hover:border-[var(--border-hover)] focus-visible:border-[var(--border-hover)] focus-visible:shadow-[var(--shadow-focus)]",
        )}
        style={boxText}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            className="size-[var(--icon-sm)] shrink-0"
            style={{ color: "var(--text-muted)" }}
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          // `ds-scope` RE-ESTABLISHES the design-system tokens here: Radix portals
          // this menu to <body>, outside the app's .ds-scope wrapper, so without
          // this the tokens (--surface / --border / --brand …) wouldn't resolve.
          className="ds-scope z-50 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] p-[var(--space-2xs)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          style={{ background: "var(--surface)", boxShadow: "var(--shadow-lg)" }}
        >
          <SelectPrimitive.Viewport>
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className="flex cursor-pointer items-center justify-between gap-[var(--space-md)] rounded-[var(--radius-md)] px-[var(--space-md)] py-[var(--space-sm)] outline-none data-[highlighted]:bg-[var(--surface-hover)]"
                style={boxText}
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check className="size-[var(--icon-sm)]" style={{ color: "var(--brand)" }} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export default Select
