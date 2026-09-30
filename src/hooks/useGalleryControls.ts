import { useMemo, useState } from "react"
import type { CSSProperties } from "react"

// useGalleryControls — the BRAIN for the dev component gallery / token playground.
//
// The gallery renders every component inside a `.ds-scope` wrapper, where all
// the new-design-system.css tokens live as CSS custom properties. Because those
// are plain CSS variables, we can OVERRIDE them inline on that wrapper and the
// whole subtree recomputes instantly — no rebuild, no per-component props. This
// hook holds the knob state and turns it into that inline override object.
//
// Keeping with the repo convention: all state / derivation lives here (no JSX);
// the sidebar and preview are dumb components that just render what this returns.
//
// EVERY option below is a value that EXISTS in new-design-system.css — the knobs
// only ever let you land on a real token, never an in-between value.

// Any CSS-variable override. React's CSSProperties doesn't type custom props, so
// we describe them explicitly and cast once where we spread onto an element.
type CssVars = Record<`--${string}`, string>

// -- RADIUS -----------------------------------------------------------------
// The real radius tokens (--radius-sm/md/lg). One choice sets the previewed
// corner; --radius-full (pills) is reserved and not offered.
const RADIUS_OPTIONS = [
  { value: 8, label: "Small — 8px" },
  { value: 10, label: "Medium — 10px" },
  { value: 12, label: "Large — 12px" },
] as const
export type RadiusValue = (typeof RADIUS_OPTIONS)[number]["value"]

// -- FONT SIZE --------------------------------------------------------------
// The three defined sizes, each PAIRED with its own line-height (never mixed).
// Selecting a size brings its matching leading automatically.
const FONT_SIZE_OPTIONS = [
  { value: "sm", label: "Small — 14px", size: "var(--text-sm)", leading: "var(--leading-sm)" },
  { value: "md", label: "Medium — 16px", size: "var(--text-md)", leading: "var(--leading-md)" },
  { value: "lg", label: "Large — 20px", size: "var(--text-lg)", leading: "var(--leading-lg)" },
] as const
export type FontSizeKey = (typeof FONT_SIZE_OPTIONS)[number]["value"]

// -- FONT WEIGHT ------------------------------------------------------------
// The two defined weights.
const FONT_WEIGHT_OPTIONS = [
  { value: "regular", label: "Regular (400)", weight: "var(--font-weight-regular)" },
  { value: "bold", label: "Bold (700)", weight: "var(--font-weight-bold)" },
] as const
export type FontWeightKey = (typeof FONT_WEIGHT_OPTIONS)[number]["value"]

export function useGalleryControls() {
  const [radius, setRadius] = useState<RadiusValue>(8)
  const [fontSize, setFontSize] = useState<FontSizeKey>("md")
  const [fontWeight, setFontWeight] = useState<FontWeightKey>("regular")

  // The inline override object spread onto the preview's `.ds-scope` wrapper.
  // Radius flattens the scale to the chosen value; the type controls feed a set
  // of `--specimen-*` vars that the type specimen reads (defaults still point at
  // real tokens). Only what we change appears here; everything else falls
  // through to new-design-system.css.
  const previewStyle = useMemo<CSSProperties>(() => {
    const size = FONT_SIZE_OPTIONS.find((o) => o.value === fontSize) ?? FONT_SIZE_OPTIONS[1]
    const weight = FONT_WEIGHT_OPTIONS.find((o) => o.value === fontWeight) ?? FONT_WEIGHT_OPTIONS[0]
    const vars: CssVars = {
      "--radius-sm": `${radius}px`,
      "--radius-md": `${radius}px`,
      "--radius-lg": `${radius}px`,
      "--specimen-size": size.size,
      "--specimen-leading": size.leading,
      "--specimen-weight": weight.weight,
    }
    return vars as CSSProperties
  }, [radius, fontSize, fontWeight])

  return {
    // radius knob
    radius,
    setRadius,
    radiusOptions: RADIUS_OPTIONS,
    // font-size knob
    fontSize,
    setFontSize,
    fontSizeOptions: FONT_SIZE_OPTIONS,
    // font-weight knob
    fontWeight,
    setFontWeight,
    fontWeightOptions: FONT_WEIGHT_OPTIONS,
    // the override object for the preview wrapper
    previewStyle,
  }
}

export type GalleryControls = ReturnType<typeof useGalleryControls>
