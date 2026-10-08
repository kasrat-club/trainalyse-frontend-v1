import { muted } from "../styles"

// PagePlaceholder — the empty state for a not-yet-built gallery page. Each type
// page (Buttons, Cards, …) exists and routes, but its components are added later
// (the user decides which go where). This just names the page and says so.

function PagePlaceholder({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      <h2
        style={{
          color: "var(--text-primary)",
          fontSize: "var(--text-lg)",
          lineHeight: "var(--leading-lg)",
          fontWeight: "var(--font-weight-bold)",
        }}
      >
        {name}
      </h2>
      <p style={muted}>Empty for now — components get added to this page later.</p>
    </div>
  )
}

export default PagePlaceholder
