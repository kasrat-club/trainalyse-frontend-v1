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
  // Optional samples in DIFFERENT colours — same shape, reworn — to show colour
  // is applied separately (e.g. the heading shape as brand / primary / muted, or
  // a Caption as a danger error).
  altSamples?: { text: string; colorToken: string; note: string }[]
  // Optional further samples in the SAME colour — different texts that use the
  // same style, to show one style covers every screen (login / sign-up / more-info).
  alsoSamples?: { text: string; note: string }[]
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
      "The Kasrat logo. One shape (20/700) worn in three colours: brand = the app's signature logo; primary = a page title or the home month heading; muted = the month's workout count.",
    altSamples: [
      { text: "Some more info", colorToken: "--text-primary", note: "primary — a page heading" },
      { text: "June 2026", colorToken: "--text-primary", note: "primary — the home month heading" },
      { text: "22", colorToken: "--text-primary", note: "primary — the home rail day number (tight line-height for stacking)" },
      { text: "Discard this workout?", colorToken: "--text-primary", note: "primary — a modal title" },
      { text: "Per-Limb Arm Day", colorToken: "--text-primary", note: "primary — the view-page workout title (the same name is Subheading on the home card)" },
      { text: "11 Workouts", colorToken: "--text-muted", note: "muted — the home month count" },
    ],
  },
  {
    name: "Subheading",
    sample: "Per-Limb Arm Day",
    sizeToken: "--text-md",
    sizePx: "16px",
    leadingToken: "--leading-md",
    leadingPx: "24px",
    weightToken: "--font-weight-bold",
    weightLabel: "700",
    colorToken: "--text-primary",
    usage:
      "A medium bold title, one step below the heading — the workout card's title and the active-workout banner's message. Primary for the title/message; muted for the card's weekday beside it.",
    altSamples: [
      { text: "Mon", colorToken: "--text-muted", note: "muted — the card's weekday" },
    ],
    alsoSamples: [
      { text: "One workout is still going on", note: "primary — the active-workout banner message" },
    ],
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
      "Default reading text — subtitles, input placeholders, button labels, and the 'Set N' headings in the workout grid. Colour changes with context: muted for subtitles, navy on the Login button, primary for the set headings.",
    altSamples: [
      { text: "Set 1", colorToken: "--text-primary", note: "primary — a workout set heading (16/400, regular — not Subheading's 700)" },
      { text: "Note", colorToken: "--text-primary", note: "primary — a workout-note heading (same regular Body as the set heading)" },
    ],
    alsoSamples: [
      { text: "Create your account", note: "same style — the sign-up subtitle" },
      {
        text: "A few details to personalize your log",
        note: "same style — the more-info subtitle",
      },
      {
        text: "The workout in progress will be removed for good.",
        note: "same style — a modal description",
      },
    ],
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
    usage:
      "The bold 14px text used on every form-field label, the home rail month, the workout-card stat rows, and the banner's uppercased status. Muted for labels + rail month; primary for a stat value; brand (uppercased) for the 'IN PROGRESS' status.",
    altSamples: [
      { text: "Jun", colorToken: "--text-muted", note: "muted — the home rail month" },
      { text: "Volume", colorToken: "--text-muted", note: "muted — a workout-card stat label" },
      { text: "IN PROGRESS", colorToken: "--brand", note: "brand, uppercased — the active-workout banner status" },
    ],
    alsoSamples: [
      { text: "Password", note: "login / sign-up" },
      { text: "Username", note: "sign-up" },
      { text: "Confirm password", note: "sign-up" },
      { text: "Date of birth", note: "more-info" },
      { text: "Weight", note: "more-info" },
      { text: "Height", note: "more-info" },
      { text: "12,450 kg", note: "primary — a workout-card stat value" },
    ],
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
      "The smallest text — footnotes, the muted '(optional)' hint, small links (brand, like 'Sign up'), and the footer tab labels. Those tabs show the shape's three states: muted inactive, primary on hover, brand when active. Reworn in danger it's the field-error message.",
    alsoSamples: [
      {
        text: "(optional)",
        note: "same shape, muted — the hint beside the Height label (14 / 400, not the label's 700)",
      },
      {
        text: "Monday, 22 Jun 2026 · 10:00 AM",
        note: "muted — the view-page workout date and time",
      },
      {
        text: "WEIGHTS",
        note: "muted, uppercased — a set-grid column header (14/400 regular, NOT the bold 14/700 Label)",
      },
      {
        text: "Felt strong today — went up 2 kg on the second set.",
        note: "muted — a workout note's body text",
      },
    ],
    altSamples: [
      { text: "Graphs", colorToken: "--text-muted", note: "muted — footer tab, inactive" },
      { text: "Graphs", colorToken: "--text-primary", note: "primary — footer tab, on hover" },
      { text: "Graphs", colorToken: "--brand", note: "brand — footer tab, active (current page)" },
      { text: "14", colorToken: "--text-primary", note: "primary — a set-grid input value (14/400 regular)" },
      {
        text: "Please enter your email.",
        colorToken: "--danger",
        note: "same shape, danger colour — the field error",
      },
    ],
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
      {s.alsoSamples?.map((a) => (
        <div
          key={a.text}
          className="flex flex-wrap items-baseline gap-[var(--space-sm)]"
        >
          <span
            style={{
              color: `var(${s.colorToken})`,
              fontSize: `var(${s.sizeToken})`,
              lineHeight: `var(${s.leadingToken})`,
              fontWeight: `var(${s.weightToken})`,
            }}
          >
            {a.text}
          </span>
          <span style={meta}>{a.note}</span>
        </div>
      ))}
      {s.altSamples?.map((a) => (
        <div
          key={`${a.text}-${a.colorToken}`}
          className="flex flex-wrap items-baseline gap-[var(--space-sm)]"
        >
          <span
            style={{
              color: `var(${a.colorToken})`,
              fontSize: `var(${s.sizeToken})`,
              lineHeight: `var(${s.leadingToken})`,
              fontWeight: `var(${s.weightToken})`,
            }}
          >
            {a.text}
          </span>
          <span style={meta}>{a.note}</span>
        </div>
      ))}
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
