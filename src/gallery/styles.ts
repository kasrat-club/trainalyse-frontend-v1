import type { CSSProperties } from "react"

// Shared text styles for the gallery chrome (page header + section labels), on
// new-design-system tokens.

export const heading: CSSProperties = {
  fontSize: "var(--text-lg)",
  lineHeight: "var(--leading-lg)",
  fontWeight: "var(--font-weight-bold)",
}

export const muted: CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
}
