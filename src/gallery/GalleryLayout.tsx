import { Outlet } from "react-router-dom"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import GallerySidebar from "@/components/gallery/GallerySidebar"
import { useGalleryControls } from "@/hooks/useGalleryControls"
import { heading, muted } from "./styles"

// GalleryLayout — the shell for the whole dev gallery. Registered in main.tsx
// behind import.meta.env.DEV, so it never ships. The `.ds-scope` wrapper is
// where the new-design-system tokens live, keeping the live app unaffected.
//
// The sidebar carries BOTH the page navigation and the token knobs. The knobs'
// override object (previewStyle) is spread on the <main> that wraps <Outlet/>,
// so tweaking a token ripples through EVERY page (Overview, Buttons, …) at once.

function GalleryLayout() {
  const controls = useGalleryControls()

  return (
    <div
      className="ds-scope"
      style={{
        background: "var(--background)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <SidebarProvider>
        <GallerySidebar {...controls} />

        <SidebarInset style={{ background: "var(--background)" }}>
          <header
            className="flex items-center gap-[var(--space-md)] px-6 py-5"
            style={{ borderBottom: "var(--border-width) solid var(--border)" }}
          >
            <SidebarTrigger />
            <div>
              <h1 style={heading}>Component gallery</h1>
              <p style={muted}>Dev-only · new design system · isolated preview</p>
            </div>
          </header>

          {/* previewStyle applies the knob overrides to whatever page renders */}
          {/* Mobile-only preview frame: components render at phone width (430px =
              iPhone 15/16 Pro Max) even on a desktop browser, so the gallery
              shows them the way they'll actually appear in the app. */}
          <main
            style={controls.previewStyle}
            className="mx-auto w-full max-w-[430px] px-6 py-8"
          >
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default GalleryLayout
