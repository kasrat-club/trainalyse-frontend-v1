import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Check, ChevronDown } from "lucide-react"

import type { GalleryControls } from "@/hooks/useGalleryControls"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// The gallery's pages. The sidebar navigates between them; the routes live in
// main.tsx. Overview is the "all components on one page" view; the rest segregate
// by component type.
const PAGES = [
  { to: "/Gallery", label: "Overview" },
  { to: "/Gallery/buttons", label: "Buttons" },
  { to: "/Gallery/icons", label: "Icons" },
  { to: "/Gallery/cards", label: "Cards" },
  { to: "/Gallery/modals", label: "Modals" },
  { to: "/Gallery/inputs", label: "Inputs" },
  { to: "/Gallery/badges", label: "Badges" },
  { to: "/Gallery/avatar", label: "Avatar" },
  { to: "/Gallery/dropdown", label: "Dropdown" },
  { to: "/Gallery/calendar", label: "Calendar" },
  { to: "/Gallery/navigation", label: "Navigation" },
  { to: "/Gallery/banner", label: "Banner" },
  { to: "/Gallery/typography", label: "Typography" },
  { to: "/Gallery/colors", label: "Colors" },
]

// GallerySidebar — DUMB. The control panel for the token playground, built on
// the shadcn <Sidebar>. Props in (knob values + setters), JSX out. All state
// and derivation lives in useGalleryControls; this file only renders it.
//
// Each knob is a Dropdown listing ONLY the tokens defined in the design system,
// so a selection can only ever land on a real token. Picking one instantly
// re-themes the preview (the hook turns the choice into CSS-var overrides).

function GallerySidebar({
  radius,
  setRadius,
  radiusOptions,
  fontSize,
  setFontSize,
  fontSizeOptions,
  fontWeight,
  setFontWeight,
  fontWeightOptions,
}: GalleryControls) {
  const { pathname } = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="px-[var(--space-lg)] py-[var(--space-lg)]">
        <span
          style={{
            fontSize: "var(--text-md)",
            lineHeight: "var(--leading-md)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          Design system
        </span>
        <span
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--text-sm)",
            lineHeight: "var(--leading-sm)",
          }}
        >
          Pages &amp; token knobs
        </span>
      </SidebarHeader>

      <SidebarContent className="px-[var(--space-sm)]">
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PAGES.map((page) => (
                <SidebarMenuItem key={page.to}>
                  <SidebarMenuButton asChild isActive={pathname === page.to}>
                    <Link to={page.to}>{page.label}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Radius</SidebarGroupLabel>
          <SidebarGroupContent>
            <Dropdown value={radius} options={radiusOptions} onChange={setRadius} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Font size</SidebarGroupLabel>
          <SidebarGroupContent>
            <Dropdown value={fontSize} options={fontSizeOptions} onChange={setFontSize} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Font weight</SidebarGroupLabel>
          <SidebarGroupContent>
            <Dropdown value={fontWeight} options={fontWeightOptions} onChange={setFontWeight} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

// A generic dropdown: a bordered trigger showing the current option, and a menu
// of the available options. Rendered inline (NOT portaled) so it stays inside
// `.ds-scope` and every token resolves. Reused by every knob.
function Dropdown<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (next: T) => void
}) {
  const [open, setOpen] = useState(false)
  const current = options.find((option) => option.value === value)

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-[var(--space-sm)] border px-[var(--space-md)] py-[var(--space-sm)]"
        style={{
          borderColor: "var(--border)",
          borderRadius: "var(--radius-md)",
          background: "var(--surface)",
          color: "var(--text-primary)",
          fontSize: "var(--text-sm)",
          lineHeight: "var(--leading-sm)",
        }}
      >
        <span>{current?.label}</span>
        <ChevronDown className="size-[var(--icon-sm)] shrink-0" style={{ color: "var(--text-muted)" }} />
      </button>

      {open && (
        <>
          {/* click-away layer — closes the menu without a portal */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <ul
            role="listbox"
            className="absolute top-full right-0 left-0 z-20 mt-[var(--space-xs)] overflow-hidden border py-[var(--space-xs)]"
            style={{
              borderColor: "var(--border)",
              borderRadius: "var(--radius-md)",
              background: "var(--background)",
            }}
          >
            {options.map((option) => {
              const selected = option.value === value
              return (
                <li key={String(option.value)} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className="flex w-full items-center justify-between gap-[var(--space-sm)] px-[var(--space-md)] py-1.5 text-left transition-colors hover:bg-[var(--surface)]"
                    style={{
                      color: "var(--text-primary)",
                      fontSize: "var(--text-sm)",
                      lineHeight: "var(--leading-sm)",
                    }}
                  >
                    <span>{option.label}</span>
                    {selected && (
                      <Check className="size-[var(--icon-sm)] shrink-0" style={{ color: "var(--brand)" }} />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

export default GallerySidebar
