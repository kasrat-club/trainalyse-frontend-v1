import type { ReactNode } from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { ChevronDown } from "lucide-react"

// Accordion — DUMB. Expand/collapse sections (the workout view's exercises).
// Wraps the Radix Accordion so the open/close behaviour, keyboard a11y and the
// height animation (tw-animate-css) come for free. Each header is the exercise
// name (Subheading, 16/700) + a chevron STATE INDICATOR styled like the outline
// IconButton — same circle (--control-sm, --border), same hover — that ROTATES
// on open. It is NOT a button: the whole header row is the trigger, so the
// chevron only borrows the IconButton's look, it isn't one.

export type AccordionEntry = {
  id: string
  name: string
  content: ReactNode
}

type AccordionProps = {
  items: AccordionEntry[]
  defaultOpenId?: string
}

function Accordion({ items, defaultOpenId }: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      defaultValue={defaultOpenId}
      className="flex w-full flex-col gap-[var(--space-lg)]"
    >
      {items.map((item) => (
        <AccordionPrimitive.Item key={item.id} value={item.id}>
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-[var(--space-md)] text-left outline-none">
              <span
                className="min-w-0 truncate"
                style={{
                  color: "var(--text-primary)",
                  fontSize: "var(--text-md)",
                  lineHeight: "var(--leading-md)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                {item.name}
              </span>
              {/* chevron state indicator — IconButton outline look, rotates on open */}
              <span
                className="flex size-[var(--control-sm)] shrink-0 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border)] transition-colors group-hover:border-[var(--border-hover)] group-hover:bg-[var(--surface-hover)]"
                style={{ color: "var(--text-primary)" }}
              >
                <ChevronDown className="size-[var(--icon-sm)] transition-transform group-data-[state=open]:rotate-180" />
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="pt-[var(--space-lg)]">{item.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  )
}

export default Accordion
