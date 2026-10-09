import { useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import { ChartLine, Home, Settings } from "lucide-react"

import Footer from "@/components/ds/Footer"
import Separator from "@/components/ds/Separator"
import StepIndicator from "@/components/ds/StepIndicator"
import { heading, muted } from "../styles"

// Navigation — the wayfinding components, grouped by CLASS with the real
// Separator between them: the Footer (bottom tab bar, how you move between app
// pages) and the Step indicator (the onboarding pager, how far you are through
// getting started). Both answer "where am I?", so they share this page.

function Navigation() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Navigation</h2>

      <NavClass
        name="Footer / tab bar"
        blurb="Bottom tab bar — the only way to move between the app's pages. Tap a tab to change the active state."
      >
        <div
          className="overflow-hidden"
          style={{
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <FooterShowcase />
        </div>
      </NavClass>

      <Separator />

      <NavClass
        name="Step indicator"
        blurb="The onboarding pager — identical pills, the current step in --brand and the rest in --surface. Shown here as step 1 of 2."
      >
        <StepIndicator total={2} current={0} />
      </NavClass>
    </div>
  )
}

// One navigation class: a name + blurb, then the component(s).
function NavClass({
  name,
  blurb,
  children,
}: {
  name: string
  blurb: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-[var(--space-lg)]">
      <div className="flex flex-col gap-[var(--space-xs)]">
        <span style={classLabel}>{name}</span>
        <span style={muted}>{blurb}</span>
      </div>
      {children}
    </section>
  )
}

// Demo harness: holds the active tab so selecting one is live.
function FooterShowcase() {
  const [active, setActive] = useState("home")
  return (
    <Footer
      active={active}
      onChange={setActive}
      tabs={[
        { id: "home", label: "Home", icon: Home },
        { id: "graphs", label: "Graphs", icon: ChartLine },
        { id: "settings", label: "Settings", icon: Settings },
      ]}
    />
  )
}

const classLabel: CSSProperties = {
  color: "var(--text-primary)",
  fontSize: "var(--text-md)",
  lineHeight: "var(--leading-md)",
  fontWeight: "var(--font-weight-bold)",
}

export default Navigation
