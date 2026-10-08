import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import "@/styles/globals.css"
import "@/design-system.css"
import "@/new-design-system.css"
import { App } from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import Workout from "./Workout.tsx"
import WorkoutView from "./WorkoutView.tsx"
import Login from "./Login.tsx"
import Signup from "./Signup.tsx"
import Moreinfo from "./Moreinfo.tsx"
import Graphs from "./Graphs.tsx"
import Settings from "./Settings.tsx"
import Improve from "./Improve.tsx"
import More from "./More.tsx"
import Layout from "./Layout.tsx"
import GalleryLayout from "./gallery/GalleryLayout.tsx"
import Overview from "./gallery/pages/Overview.tsx"
import Buttons from "./gallery/pages/Buttons.tsx"
import Icons from "./gallery/pages/Icons.tsx"
import Cards from "./gallery/pages/Cards.tsx"
import Modals from "./gallery/pages/Modals.tsx"
import Inputs from "./gallery/pages/Inputs.tsx"
import Badges from "./gallery/pages/Badges.tsx"
import Avatar from "./gallery/pages/Avatar.tsx"
import Dropdown from "./gallery/pages/Dropdown.tsx"
import CalendarPage from "./gallery/pages/CalendarPage.tsx"
import Navigation from "./gallery/pages/Navigation.tsx"
import BannerPage from "./gallery/pages/BannerPage.tsx"
import Typography from "./gallery/pages/Typography.tsx"
import Colors from "./gallery/pages/Colors.tsx"
import { Toaster } from "@/components/ui/sonner.tsx"
import ActiveWorkoutContextProvider from "./components/active-workout-provider"
import { InterfaceKit } from "interface-kit/react"

createRoot(document.getElementById("root")!).render(
  //this only works in production side and not when the user is using the project and the job for strictmode is
  // to revoke the functions twice to see if there is any impurity in the function like is there any subscription
  // remaining to clean up and other things like that.
  <StrictMode>
    <ActiveWorkoutContextProvider>
    <ThemeProvider>
      {/*and the BrowserRouter is a component from the library that is being improted called react router dom */}
      <BrowserRouter>
        <Routes>
          <Route path="/Workout" element={<Workout />} />
          {/* read-only view of a saved workout — reached from the "View only"
              door in the tap-a-workout action sheet. Sits outside Layout (no
              footer), like the editor. */}
          <Route path="/WorkoutView" element={<WorkoutView />} />
          {/* dev-only component gallery. import.meta.env.DEV is false in a
              production build, so this Route is never mounted and /Gallery
              falls through to the "*" catch-all below (bounces home). React
              Router ignores non-element children, so the inline && is safe. */}
          {import.meta.env.DEV && (
            <Route path="/Gallery" element={<GalleryLayout />}>
              <Route index element={<Overview />} />
              <Route path="buttons" element={<Buttons />} />
              <Route path="icons" element={<Icons />} />
              <Route path="cards" element={<Cards />} />
              <Route path="modals" element={<Modals />} />
              <Route path="inputs" element={<Inputs />} />
              <Route path="badges" element={<Badges />} />
              <Route path="avatar" element={<Avatar />} />
              <Route path="dropdown" element={<Dropdown />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="navigation" element={<Navigation />} />
              <Route path="banner" element={<BannerPage />} />
              <Route path="typography" element={<Typography />} />
              <Route path="colors" element={<Colors />} />
            </Route>
          )}
          {/* unknown paths bounce to home (rendered WITH footer via Layout);
              `replace` keeps the bad URL out of history. Without this, `*`
              rendered a bare footerless <App/> — the "no footer" bug. */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Moreinfo" element={<Moreinfo />} />
          {/*now layout is like these pages will be rendered with a footer in the bottom of the screen
           and you will understand this after reading the layout file and this code basically means
          the footer and frame persist, and only the inner content changes as you navigate between them. */}
          <Route element={<Layout />}>
            <Route path="/" element={<App />} />
            <Route path="/Graphs" element={<Graphs />} />
            <Route path="/Settings" element={<Settings />} />
            <Route path="/Improve" element={<Improve />} />
            <Route path="/More" element={<More />} />
          </Route>
        </Routes>
      </BrowserRouter>
      {/* App-wide toast host: outside the router so it shows on every route (incl. Workout, which sits outside Layout). top-center avoids the mobile keyboard. */}
      <Toaster position="top-center" />
      </ThemeProvider>

      <InterfaceKit />
    </ActiveWorkoutContextProvider>

  </StrictMode>

)
