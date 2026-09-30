import type { LucideIcon } from "lucide-react"

// Footer — DUMB. The bottom navigation bar: a row of icon+label tabs. It owns no
// routing — it's handed the tabs, the active id, and onChange, and just paints
// the active tab in the brand colour and the rest muted. The parent decides what
// selecting a tab does (real navigation, or just the active state here).
//
// TOKENS: colours/spacing are new-design-system tokens. The 20px icon and the
// 64px bar height have no token yet — see [[gallery-strict-tokens]].

export type FooterTab = {
  id: string
  label: string
  icon: LucideIcon
}

type FooterProps = {
  tabs: FooterTab[]
  active: string
  onChange: (id: string) => void
}

function Footer({ tabs, active, onChange }: FooterProps) {
  return (
    <footer
      className="w-full"
      style={{
        background: "var(--surface)",
        borderTop: "var(--border-width) solid var(--border)",
      }}
    >
      <nav className="flex min-h-16 items-center justify-between px-[var(--space-lg)]">
        {tabs.map((tab) => {
          const isActive = tab.id === active
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              aria-label={`Go to ${tab.label}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-[var(--space-xs)] px-0 transition-colors"
              style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
            >
              <Icon className="size-[var(--icon-sm)]" strokeWidth={1.2} />
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  lineHeight: "var(--leading-sm)",
                }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </footer>
  )
}

export default Footer
