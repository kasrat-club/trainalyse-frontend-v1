import { Button } from "@/components/ui/button"
import { useNavigate, useLocation } from "react-router-dom"
import { Home, ChartLine, Settings } from "lucide-react"
import { Label } from "@/components/ui/label"

function Footer() {
  //uselocation is for the component to know that on which url the user is at like where is the current location of the
  // user like if the user is on home page or not or is the user on graphs page , the reason is that whatvere page the
  // user is on that icon is neon color and other are dull so thats why we need the user's current location in the footer.
  const location = useLocation()

  // this is for the user to get them a function which will take them to different pages like navigate is a function which
  // enables for the user to navigate between different pages.
  const navigate = useNavigate()
  const handleHome = () => {
    navigate("/")
  }
  function handleGraphs() {
    navigate("/Graphs")
  }
  const handleSettings = () => {
    navigate("/Settings")
  }
  return (
    <>
      {/* sticky bottom-0 pins the footer to the viewport bottom while the document
          scrolls; shrink-0 keeps it from being squashed as a flex child. */}
      <footer className="sticky bottom-0 z-20 shrink-0 border-t border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <nav className="flex min-h-16 items-center justify-between px-[var(--space-23)]">
          <Button
            variant="ghost"
            aria-label="Go to Home"
            onClick={() => {
              handleHome()
            }}
            className={`flex h-auto flex-col px-0 ${
              location.pathname === "/" ? "text-brand" : "text-muted-foreground"
            }`}
          >
            <Home className="size-5" strokeWidth={1.2} />
            <Label>Home</Label>
          </Button>
          <Button
            variant="ghost"
            aria-label="Go to Graphs"
            onClick={() => {
              handleGraphs()
            }}
            className={`flex h-auto flex-col items-center px-0 ${
              location.pathname === "/Graphs"
                ? "text-brand"
                : "text-muted-foreground"
            }`}
          >
            <ChartLine className="size-5" strokeWidth={1.2} />{" "}
            <Label>Graphs</Label>
          </Button>
          <Button
            variant="ghost"
            aria-label="Go to Settings"
            onClick={() => {
              handleSettings()
            }}
            className={`flex h-auto flex-col items-center px-0 ${
              location.pathname === "/Settings"
                ? "text-brand"
                : "text-muted-foreground"
            }`}
          >
            <Settings className="size-5" strokeWidth={1.2} />
            <Label>Settings</Label>
          </Button>
        </nav>
      </footer>
    </>
  )
}

export default Footer
