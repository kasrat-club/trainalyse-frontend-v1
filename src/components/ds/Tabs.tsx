import type { ReactNode } from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Tabs — DUMB. A pill-shaped segmented TAB bar that switches between content
// views (the view page's per-limb Left / Right). Wraps Radix Tabs so the tab
// a11y (tablist / tab / tabpanel) and keyboard nav come for free. It shares the
// SegmentedToggle's pill LOOK, but it's TABS (navigation between panels), not a
// form selector — so the active tab is a --brand fill with navy --on-brand text
// (hover lifts to --brand-hover), while inactive tabs are muted and brighten to
// primary on hover. Each tab's content renders below the bar.

export type TabEntry = { value: string; label: string; content: ReactNode }

type TabsProps = {
  tabs: TabEntry[]
  ariaLabel: string
  defaultValue?: string
}

function Tabs({ tabs, ariaLabel, defaultValue }: TabsProps) {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue ?? tabs[0]?.value}
      className="flex w-full flex-col gap-[var(--space-lg)]"
    >
      <TabsPrimitive.List
        aria-label={ariaLabel}
        className="flex h-[var(--control-sm)] w-full items-center rounded-[var(--radius-full)] p-[var(--space-2xs)]"
        style={{ background: "var(--background)" }}
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "h-full flex-1 rounded-[var(--radius-full)] px-[var(--space-md)] outline-none transition-colors",
              // inactive: muted text that brightens to primary on hover
              "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              // active: brand fill + navy text; the fill lifts to --brand-hover on hover
              "data-[state=active]:bg-[var(--brand)] data-[state=active]:text-[var(--on-brand)] data-[state=active]:hover:bg-[var(--brand-hover)] data-[state=active]:hover:text-[var(--on-brand)]",
            )}
            style={{
              fontSize: "var(--text-md)",
              lineHeight: "var(--leading-md)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {tabs.map((tab) => (
        <TabsPrimitive.Content key={tab.value} value={tab.value} className="outline-none">
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )
}

export default Tabs
