import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import type { GalleryControls } from "@/hooks/useGalleryControls"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"

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
          Controls
        </span>
        <span
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--text-sm)",
            lineHeight: "var(--leading-sm)",
          }}
        >
          Live token knobs
        </span>
      </SidebarHeader>

      <SidebarContent className="px-[var(--space-sm)]">
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
