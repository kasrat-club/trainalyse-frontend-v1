import type { CSSProperties } from "react"

import { heading, muted } from "../styles"

// Typography — the type system, in two layers (same idea as the Colors page).
// First the SCALE: the raw primitives (three sizes, each paired with its line
// height, and two weights). Then the STYLES: the named roles the UI composes
// from those primitives — a style is only a SHAPE (size + weight + line height).
// Colour is NOT baked into a style; it's applied separately from the colour
// tokens, so the same style can wear different colours in different places.

type SizeStep = { token: string; leadingToken: string; px: string; leading: string }
type WeightStep = { token: string; value: string; label: string }

const sizes: SizeStep[] = [
  { token: "--text-lg", leadingToken: "--leading-lg", px: "20px", leading: "24px" },
  { token: "--text-md", leadingToken: "--leading-md", px: "16px", leading: "24px" },
  { token: "--text-sm", leadingToken: "--leading-sm", px: "14px", leading: "21px" },
]

const weights: WeightStep[] = [
  { token: "--font-weight-regular", value: "400", label: "Regular" },
  { token: "--font-weight-bold", value: "700", label: "Bold" },
]

type TypeStyle = {
  name: string
  sample: string
  sizeToken: string
  sizePx: string
  leadingToken: string
  leadingPx: string
  weightToken: string
  weightLabel: string
  colorToken: string
  usage: string
  // An optional second sample in a DIFFERENT colour — same shape, reworn — to
  // show that colour is applied separately (e.g. a Caption as a danger error).
  altSample?: string
  altColorToken?: string
  altNote?: string
  // An optional second sample in the SAME colour — a different text that uses the
  // same style, to show one style covers both screens (login + sign-up).
  alsoSample?: string
  alsoNote?: string
}

const styles: TypeStyle[] = [
  {
    name: "Wordmark",
    sample: "Kasrat",
    sizeToken: "--text-lg",
    sizePx: "20px",
    leadingToken: "--leading-lg",
    leadingPx: "24px",
    weightToken: "--font-weight-bold",
    weightLabel: "700",
    colorToken: "--brand",
    usage:
      "The Kasrat logo. Same shape as a heading, but always brand-coloured — kept as its own style because it's the app's signature.",
  },
  {
    name: "Body",
    sample: "Welcome back!",
    sizeToken: "--text-md",
    sizePx: "16px",
    leadingToken: "--leading-md",
    leadingPx: "24px",
    weightToken: "--font-weight-regular",
    weightLabel: "400",
    colorToken: "--text-muted",
    usage:
      "Default reading text — subtitles, input placeholders, button labels. Colour changes with context (muted here, navy on the Login button).",
    alsoSample: "Create your account",
    alsoNote: "same style — the sign-up subtitle",
  },
  {
    name: "Label",
    sample: "Email",
    sizeToken: "--text-sm",
    sizePx: "14px",
    leadingToken: "--leading-sm",
    leadingPx: "21px",
    weightToken: "--font-weight-bold",
    weightLabel: "700",
    colorToken: "--text-primary",
    usage: "The bold text that labels a field above its input — Email, Password.",
  },
  {
    name: "Caption",
    sample: "Don't have an account?",
    sizeToken: "--text-sm",
    sizePx: "14px",
    leadingToken: "--leading-sm",
    leadingPx: "21px",
    weightToken: "--font-weight-regular",
    weightLabel: "400",
    colorToken: "--text-muted",
    usage:
      "The smallest text — footnotes and small links (brand-coloured when it's a link, like 'Sign up'). The same shape, reworn in the danger colour, is the validation-error message below a field.",
    altSample: "Please enter your email.",
    altColorToken: "--danger",
    altNote: "same shape, danger colour — the field error",
  },
]

function Typography() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Typography</h2>
      <p style={muted}>
        One family (Geist), a three-step size scale and two weights. A style is a
        SHAPE — size + weight + line height — and nothing more. Colour is applied
        separately from the colour tokens, so the same style can wear different
        colours in different places (that's why the four styles below cover the
        whole login screen).
      </p>

      {/* SCALE — the raw primitives the styles are composed from. */}
      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Scale — the primitives</span>

        <div className="flex flex-col gap-[var(--space-md)]">
          <span style={subLabel}>Sizes — each paired with its line height</span>
          <div className="flex flex-col gap-[var(--space-lg)]">
            {sizes.map((s) => (
              <div
                key={s.token}
                className="flex items-baseline gap-[var(--space-lg)]"
              >
                <span
                  style={{
                    fontSize: `var(${s.token})`,
                    lineHeight: `var(${s.leadingToken})`,
                  }}
                >
                  Ag
                </span>
                <TokenMeta token={s.token} meta={`${s.px} / ${s.leading} line`} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[var(--space-md)]">
          <span style={subLabel}>Weights</span>
          <div className="flex flex-col gap-[var(--space-lg)]">
            {weights.map((w) => (
              <div
                key={w.token}
                className="flex items-baseline gap-[var(--space-lg)]"
              >
                <span
                  style={{
                    fontSize: "var(--text-lg)",
                    lineHeight: "var(--leading-lg)",
                    fontWeight: `var(${w.token})`,
                  }}
                >
                  {w.label}
                </span>
                <TokenMeta token={w.token} meta={w.value} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STYLES — the named roles, shown in the colour they usually wear. */}
      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Styles — what the UI uses</span>
        <div className="flex flex-col gap-[var(--space-lg)]">
          {styles.map((s, i) => (
            <StyleRow key={s.name} divider={i > 0} {...s} />
          ))}
        </div>
      </section>
    </div>
  )
}

// One named style: the live sample in the colour it typically wears, then its
// name, its shape (size / weight / line height) and its default colour listed
// separately — to keep "shape" and "colour" visibly distinct — and its usage.
function StyleRow(s: TypeStyle & { divider?: boolean }) {
  return (
    <div
      className="flex flex-col gap-[var(--space-sm)]"
      style={
        s.divider
          ? {
              borderTop: "var(--border-width) solid var(--border)",
              paddingTop: "var(--space-lg)",
            }
          : undefined
      }
    >
      <span
        style={{
          color: `var(${s.colorToken})`,
          fontSize: `var(${s.sizeToken})`,
          lineHeight: `var(${s.leadingToken})`,
          fontWeight: `var(${s.weightToken})`,
        }}
      >
        {s.sample}
      </span>
      {s.alsoSample && (
        <div className="flex flex-wrap items-baseline gap-[var(--space-sm)]">
          <span
            style={{
              color: `var(${s.colorToken})`,
              fontSize: `var(${s.sizeToken})`,
              lineHeight: `var(${s.leadingToken})`,
              fontWeight: `var(${s.weightToken})`,
            }}
          >
            {s.alsoSample}
          </span>
          <span style={meta}>{s.alsoNote}</span>
        </div>
      )}
      {s.altSample && s.altColorToken && (
        <div className="flex flex-wrap items-baseline gap-[var(--space-sm)]">
          <span
            style={{
              color: `var(${s.altColorToken})`,
              fontSize: `var(${s.sizeToken})`,
              lineHeight: `var(${s.leadingToken})`,
              fontWeight: `var(${s.weightToken})`,
            }}
          >
            {s.altSample}
          </span>
          <span style={meta}>{s.altNote}</span>
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-[var(--space-xs)]">
        <div className="flex flex-wrap items-center gap-[var(--space-sm)]">
          <span
            style={{
              color: "var(--text-primary)",
              fontSize: "var(--text-sm)",
              lineHeight: "var(--leading-sm)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            {s.name}
          </span>
          <span style={meta}>
            {s.sizePx} / {s.weightLabel} / {s.leadingPx} line
          </span>
          <span style={meta}>colour {s.colorToken}</span>
        </div>
        <span style={muted}>{s.usage}</span>
      </div>
    </div>
  )
}

// A token name + its value, in the muted meta treatment, for the scale rows.
function TokenMeta({ token, meta: value }: { token: string; meta: string }) {
  return (
    <div className="flex flex-wrap items-center gap-[var(--space-sm)]">
      <span
        style={{
          color: "var(--text-primary)",
          fontSize: "var(--text-sm)",
          lineHeight: "var(--leading-sm)",
          fontWeight: "var(--font-weight-bold)",
        }}
      >
        {token}
      </span>
      <span style={meta}>{value}</span>
    </div>
  )
}

const subLabel: CSSProperties = {
  color: "var(--text-faint)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
  fontWeight: "var(--font-weight-bold)",
}

const meta: CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
}

export default Typography
