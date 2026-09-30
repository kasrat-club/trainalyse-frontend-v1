import { cn } from "@/lib/utils"

// Logo — DUMB. The home-page brand mark: a neon-ringed circle holding the "K"
// wordmark initial. Purely presentational, no behaviour. 36px to match the
// other header controls. Neon (brand) is reserved for the wordmark, so the ring
// and the letter both read as --brand.

type LogoProps = { className?: string }

function Logo({ className }: LogoProps) {
  return (
    <div
      className={cn("flex size-9 shrink-0 items-center justify-center", className)}
      style={{
        borderRadius: "var(--radius-full)",
        border: "var(--border-width) solid var(--brand)",
      }}
    >
      <span
        style={{
          color: "var(--brand)",
          fontWeight: "var(--font-weight-bold)",
          fontSize: "var(--text-md)",
          lineHeight: 1,
        }}
      >
        K
      </span>
    </div>
  )
}

export default Logo
