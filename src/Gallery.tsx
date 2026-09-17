import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"

// Dev-only component gallery. Registered in main.tsx behind
// import.meta.env.DEV, so it never ships to users — in a production build the
// route isn't mounted and /Gallery bounces to home via the "*" catch-all.
//
// Organized by component TIER (primitives first), not by page. To add a
// component, drop a new <Section> with rows of live instances.

function Gallery() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold">Component gallery</h1>
        <p className="text-sm text-muted-foreground">
          Dev-only. Every component in every state, grouped by tier.
        </p>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-8">
        <Tier title="Primitives">
          <Section title="Button" subtitle="variant × size × state">
            <Row label="Variants">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </Row>

            <Row label="Sizes">
              <Button size="xs">Extra small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </Row>

            <Row label="States">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button aria-invalid>Invalid</Button>
            </Row>
          </Section>
        </Tier>
      </main>
    </div>
  )
}

function Tier({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-5">
      <div className="flex items-baseline gap-2">
        <h3 className="text-base font-medium">{title}</h3>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

export default Gallery
