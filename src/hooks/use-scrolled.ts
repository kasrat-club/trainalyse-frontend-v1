import * as React from "react"

// Tracks whether the window has scrolled down from the very top. The sticky page
// headers use it to reveal their bottom border only once content scrolls under
// them — at the very top the header shares the page background and reads as one
// flat surface, and the border fades in the moment anything scrolls.
export function useScrolled() {
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll() // sync on mount (e.g. a restored scroll position)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return scrolled
}
