import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button as ShadButton } from "@/components/ui/button"

// IconButton — the ONE circular icon button of the design system. It wraps the
// shadcn Button (so focus ring / press / a11y come for free) and paints our look
// on top. Every circular button is OUTLINE (transparent + border): the default
// is neutral (--border), `destructive` is a RED outline (--danger-hover border +
// --danger icon, for the banner discard). Always --control-sm (40px) + --icon-sm glyph.
// Used in the components AND on the gallery Buttons page — one source of truth.

const iconButtonVariants = cva(
  "size-[var(--control-sm)] shrink-0 rounded-[var(--radius-full)]",
  {
    variants: {
      variant: {
        // neutral outline: grey --border edge + primary icon. On hover the edge
        // brightens to --border-hover and the fill lifts to --surface-hover — that
        // IS the feedback; the icon stays primary (it's already the brightest, so
        // there's nowhere to brighten it to). The dark:hover is needed to beat
        // shadcn ghost's own dark:hover:bg-muted/50 (higher specificity) so
        // tailwind-merge drops shadcn's and ours wins.
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)] dark:hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)]",
        // red outline: the border is --danger-hover (a lighter red than the icon,
        // so the outline reads at the same weight as the neutral grey edge, not
        // heavier); the icon is full --danger. On hover the fill turns
        // --surface-hover-danger (#FFB3B4) and the icon lightens to --danger-hover;
        // the border stays. (dark:hover mirrors the fill — see note above.)
        destructive:
          "border border-[var(--danger-hover)] bg-transparent text-[var(--danger)] hover:bg-[var(--surface-hover-danger)] dark:hover:bg-[var(--surface-hover-danger)] hover:text-[var(--danger-hover)]",
      },
    },
    defaultVariants: { variant: "outline" },
  },
)

type IconButtonProps = Omit<
  ComponentProps<typeof ShadButton>,
  "variant" | "size" | "children"
> &
  VariantProps<typeof iconButtonVariants> & {
    icon: LucideIcon
    "aria-label": string
  }

function IconButton({
  icon: Icon,
  variant = "outline",
  className,
  ...props
}: IconButtonProps) {
  // all variants sit on shadcn's neutral ghost base (focus ring / press) and get
  // their look from the classes above — including destructive, now a red outline.
  return (
    <ShadButton
      variant="ghost"
      size="icon"
      className={cn(iconButtonVariants({ variant }), className)}
      {...props}
    >
      <Icon className="size-[var(--icon-sm)]" />
    </ShadButton>
  )
}

export default IconButton
