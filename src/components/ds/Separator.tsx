import type { ComponentProps } from "react"

import { Separator as ShadSeparator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Separator — the design system's ONE divider line. Wraps the shadcn (Radix)
// Separator so orientation / role / a11y come for free, and restyles it to our
// tokens: the colour is --border (#9EA0AC) and the thickness is --border-width,
// so changing EITHER token moves every separator in the project at once — no
// divider is drawn by hand anywhere else.
//
// `inset` pulls the line in by --space-lg on each side so it matches the padded
// content width (the divider inside a card). Without it the line spans its full
// container edge to edge.

type SeparatorProps = ComponentProps<typeof ShadSeparator> & {
  inset?: boolean
}

function Separator({ inset = false, className, ...props }: SeparatorProps) {
  return (
    <ShadSeparator
      className={cn(
        "bg-[var(--border)] data-horizontal:h-[var(--border-width)] data-vertical:w-[var(--border-width)]",
        inset &&
          "data-horizontal:w-auto data-horizontal:mx-[var(--space-lg)] data-vertical:h-auto data-vertical:my-[var(--space-lg)]",
        className,
      )}
      {...props}
    />
  )
}

export default Separator
