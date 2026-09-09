// Layout.tsx
// alright the imports with braces are specific imports and wihtout braces will be like the default exports the
// file is giving like a certain file can have names exports and a default export so without braces will import
// the default the export
import { Outlet } from "react-router-dom"
import Footer from "./Footer"

function Layout() {
  return (
    <>
      {/* The page is as tall as its content and the document itself scrolls — no
          inner scroll box. min-h-svh keeps the footer at the bottom on short
          pages; the header (in each page) and the Footer are sticky, so they
          stay pinned while the content scrolls underneath them. */}
      <div className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col">
        {/* flex-1 wrapper (no overflow — the document scrolls) fills the viewport
            when a page's content is short, so the sticky Footer is pushed to the
            bottom of the screen instead of ending up under short content. On tall
            pages it grows with the content and the Footer stays pinned as you
            scroll. */}
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  )
}

export default Layout
