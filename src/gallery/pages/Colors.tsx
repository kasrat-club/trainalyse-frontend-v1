import { heading, muted } from "../styles"

// Colors — every colour token in a swatch, with the job it does. Two layers:
// the SEMANTIC roles the app actually reads (background, surface, text, brand,
// danger, border…), and the raw PALETTE primitives they point at, grouped into
// the four colour classes. Swatches are filled with the live token, so this page
// recolours itself if the tokens change.

type Swatch = { token: string; hex: string; role: string }
type PaletteGroup = { family: string; swatches: Swatch[] }

const roles: Swatch[] = [
  { token: "--background", hex: "#0A1130", role: "The page behind everything — roughly 60% of the UI." },
  { token: "--surface", hex: "#1F2743", role: "A card or box raised on the background (workout cards, calendar hover, footer bar)." },
  { token: "--surface-shadow", hex: "#6C7084", role: "Light navy tint behind a surface (the 'shadow' role — reads as an edge, not a real drop shadow)." },
  { token: "--surface-hover", hex: "#3B405A", role: "Background a neutral button (chevron, calendar) gets on hover." },
  { token: "--surface-hover-danger", hex: "#FFB3B417", role: "Background a destructive button gets on hover — #FFB3B4 at ~9% alpha." },
  { token: "--border", hex: "#9EA0AC", role: "Every edge: cards, inputs, header, footer and dividers." },
  { token: "--border-hover", hex: "#CECFD6", role: "The lighter edge a bordered control takes on hover." },
  { token: "--text-primary", hex: "#EAECF5", role: "Main reading text; card titles; stat values; the active footer tab." },
  { token: "--text-secondary", hex: "#BCBDC5", role: "Slightly dimmer text." },
  { token: "--text-muted", hex: "#BCBDC5", role: "Hints, placeholders, timestamps, stat labels, inactive tabs." },
  { token: "--text-faint", hex: "#8D8E93", role: "The dimmest readable text — e.g. days spilling in from the next month." },
  { token: "--text-hover", hex: "#EFF0F8", role: "Text/icon lightens to this on hover (non-destructive buttons)." },
  { token: "--brand", hex: "#FFBA09", role: "The accent: FAB, active footer tab, logo, today ring, links. Used sparingly (~10%)." },
  { token: "--brand-hover", hex: "#FFCC60", role: "The lighter amber for hover on brand-filled elements." },
  { token: "--on-brand", hex: "#0A1130", role: "Text / icon placed ON a brand-filled surface — the dark background navy, since brand is light." },
  { token: "--danger", hex: "#FF6468", role: "Destructive actions — the discard / delete border, icon and text." },
  { token: "--danger-hover", hex: "#FF8D8F", role: "The lighter red for hover / border on destructive controls." },
]

const palette: PaletteGroup[] = [
  {
    family: "Background (navy) — backgrounds, surfaces, borders",
    swatches: [
      { token: "--bg-100", hex: "#CECFD6", role: "Lightest — border-hover / surface tint." },
      { token: "--bg-200", hex: "#9EA0AC", role: "The default border colour." },
      { token: "--bg-300", hex: "#6C7084", role: "Surface-shadow tint." },
      { token: "--bg-350", hex: "#3B405A", role: "Neutral button hover fill." },
      { token: "--bg-400", hex: "#1F2743", role: "Card / surface." },
      { token: "--bg-500", hex: "#0A1130", role: "Darkest — page background (and on-brand)." },
    ],
  },
  {
    family: "Text (neutral) — all text and icons",
    swatches: [
      { token: "--ink-50", hex: "#EFF0F8", role: "Brighter than primary — the text/icon hover lightup." },
      { token: "--ink-100", hex: "#EAECF5", role: "Lightest — primary text." },
      { token: "--ink-200", hex: "#BCBDC5", role: "Muted / secondary text." },
      { token: "--ink-300", hex: "#8D8E93", role: "Tertiary — the dimmest readable text." },
      { token: "--ink-400", hex: "#5E5E62", role: "Extra step (role undecided) — disabled / divider." },
      { token: "--ink-500", hex: "#2F2F31", role: "Darkest extra step (role undecided)." },
    ],
  },
  {
    family: "Brand (amber) — the accent",
    swatches: [
      { token: "--brand-100", hex: "#FFDD97", role: "Lightest — subtle brand tint." },
      { token: "--brand-200", hex: "#FFCC60", role: "Light — brand hover." },
      { token: "--brand-300", hex: "#FFBA09", role: "Anchor — the brand colour itself." },
      { token: "--brand-400", hex: "#CB9723", role: "Dark — pressed / brand-on-light." },
      { token: "--brand-500", hex: "#97752D", role: "Darkest." },
    ],
  },
  {
    family: "Danger (red) — destructive only",
    swatches: [
      { token: "--red-100", hex: "#FFB3B4", role: "Lightest — solid base for the destructive hover (used at 20% alpha)." },
      { token: "--red-200", hex: "#FF8D8F", role: "Lighter — the destructive border, and the hover (icon lightens to this)." },
      { token: "--red-300", hex: "#FF6468", role: "Anchor — the main error colour (the icon)." },
      { token: "--red-400", hex: "#CB575B", role: "Darker — pressed." },
      { token: "--red-500", hex: "#803235", role: "Darkest — no role yet, reserved for future." },
    ],
  },
]

function Colors() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Colors</h2>
      <p style={muted}>
        A dark-first system built from four colour classes — a navy ramp
        (backgrounds, surfaces, borders), a neutral ramp (all text and icons), a
        reserved amber brand accent, and one destructive red. The app reads the
        semantic roles; the palette primitives are what they point at.
      </p>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Roles — what the app uses</span>
        <div className="flex flex-col gap-[var(--space-lg)]">
          {roles.map((s) => (
            <SwatchRow key={s.token} {...s} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Palette — the primitives</span>
        {palette.map((group) => (
          <div key={group.family} className="flex flex-col gap-[var(--space-md)]">
            <span
              style={{
                color: "var(--text-faint)",
                fontSize: "var(--text-sm)",
                lineHeight: "var(--leading-sm)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              {group.family}
            </span>
            <div className="flex flex-col gap-[var(--space-lg)]">
              {group.swatches.map((s) => (
                <SwatchRow key={s.token} {...s} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

// One swatch row: the live colour in a box, then its token name, hex and role.
// A faint light hairline keeps the near-background darks visible on the page.
function SwatchRow({ token, hex, role }: Swatch) {
  return (
    <div className="flex items-center gap-[var(--space-lg)]">
      <div
        className="size-12 shrink-0 rounded-[var(--radius-md)]"
        style={{
          background: `var(${token})`,
          border:
            "var(--border-width) solid color-mix(in srgb, var(--text-primary) 15%, transparent)",
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-xs)]">
        <div className="flex items-center gap-[var(--space-sm)]">
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
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--text-sm)",
              lineHeight: "var(--leading-sm)",
            }}
          >
            {hex}
          </span>
        </div>
        <span style={muted}>{role}</span>
      </div>
    </div>
  )
}

export default Colors
