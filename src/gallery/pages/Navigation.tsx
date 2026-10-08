import { useState } from "react"
import { ChartLine, Home, Settings } from "lucide-react"

import Footer from "@/components/ds/Footer"
import { heading, muted } from "../styles"

// Navigation — the footer is the only way to move between the app's pages, so
// it's the whole page here. This is the REAL ds Footer, built from the new
// atoms: --icon-sm lucide icons and --text-sm labels, the active tab in
// --text-primary and the rest muted. Selecting a tab just moves the active
// state here (no routing in the catalog).

function Navigation() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Navigation</h2>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Footer — bottom tab bar (tap a tab to change the active state)</span>
        <div
          className="overflow-hidden"
          style={{
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <FooterShowcase />
        </div>
      </section>
    </div>
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

export default Navigation
