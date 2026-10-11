// RailBar — DUMB. The brand accent rail: a thin vertical --brand bar, the same
// width as the home timeline line (--size-rail-line), that stretches to fill its
// row's height. Sits beside the "Set N" and "Note" headings on the view page.

function RailBar() {
  return (
    <div
      className="w-[var(--size-rail-line)] shrink-0 self-stretch rounded-[var(--radius-full)]"
      style={{ background: "var(--brand)" }}
    />
  )
}

export default RailBar
