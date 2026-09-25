import type { CSSProperties, ReactNode } from "react"
import { Button } from "@/components/ds/button"

// Dev-only component gallery for the NEW design system. Registered in main.tsx
// behind import.meta.env.DEV, so it never ships to users.
//
// The whole page is wrapped in `.ds-scope`, which is where the new-design-
// system.css tokens live. That keeps this preview fully isolated: the live app
// (outside this wrapper) is unaffected. Components are added one tier at a time,
// primitives first.

function Gallery() {
  return (
    <div
      className="ds-scope min-h-dvh"
      style={{
        background: "var(--background)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <header
        className="px-6 py-5"
        style={{ borderBottom: "var(--border-width) solid var(--border)" }}
      >
        <h1 style={heading}>Component gallery</h1>
        <p style={muted}>Dev-only · new design system · isolated preview</p>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-8">
        <Section title="Button" subtitle="variant · size · state">
          <Row label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="default">Default</Button>
          </Row>

          <Row label="Sizes">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </Row>

          <Row label="States">
            <Button variant="primary">Normal</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </Row>

          <p style={muted}>
            Hover, focus (Tab) and pressed (click-hold) are live — try them. The
            press bounce, focus ring and disabled dimming all come straight from
            shadcn.
          </p>
        </Section>
      </main>
    </div>
  )
}

const heading: CSSProperties = {
  fontSize: "var(--text-h5)",
  lineHeight: "var(--leading-h5)",
  fontWeight: "var(--font-weight-bold)",
}

const muted: CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "var(--text-body-sm)",
  lineHeight: "var(--leading-body-sm)",
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
    <section
      className="flex flex-col gap-5 p-5"
      style={{
        border: "var(--border-width) solid var(--border)",
        borderRadius: "var(--radius-xl)",
      }}
    >
      <div className="flex items-baseline gap-2">
        <h2
          style={{
            fontSize: "var(--text-h6)",
            lineHeight: "var(--leading-h6)",
            fontWeight: "var(--font-weight-semibold)",
          }}
        >
          {title}
        </h2>
        {subtitle && <span style={muted}>{subtitle}</span>}
      </div>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span style={muted}>{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

export default Gallery
