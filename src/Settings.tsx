import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrolled } from "@/hooks/use-scrolled"
import { useProfileEditor } from "@/hooks/useProfileEditor"
import { useUnitSettings } from "@/hooks/useUnitSettings"
import { useDobSetting } from "@/hooks/useDobSetting"
import { ProfileCard } from "@/components/ProfileCard"
import { EditProfileDialog } from "@/components/EditProfileDialog"
import { UnitsCard } from "@/components/UnitsCard"
import { EditWeightDialog } from "@/components/EditWeightDialog"
import { EditHeightDialog } from "@/components/EditHeightDialog"
import { CalendarModal } from "@/components/CalendarModal"

// Settings is a primary footer tab, so its header uses the same shell as every
// other page (Home / Graphs / View / Workout): sticky, the shared 84px height
// (pt-6 pb-4), the page-surface background, safe-area top, and a bottom border
// that stays transparent until the page scrolls. No back control — Settings is
// reached from the footer that's present on every tab, so there's nothing to
// return to; just the centred "Settings" title.
function Settings() {
  const navigate = useNavigate()
  // reveals the sticky header's bottom border only after the page scrolls
  const scrolled = useScrolled()
  // profile block state (name, email, edit-dialog) lives in the hook; this page
  // only wires it to the two dumb components.
  const profile = useProfileEditor()
  // units block: display prefs, canonical weight/height, and the two value dialogs.
  const units = useUnitSettings()
  // date-of-birth row: committed DOB + the calendar-modal open state.
  const dobField = useDobSetting()

  return (
    <div className="flex flex-col">
      <header
        className={`sticky top-0 z-20 border-b bg-[var(--bg-page)] pt-[env(safe-area-inset-top)] transition-colors ${
          scrolled ? "border-[var(--border-cardEdge)]" : "border-transparent"
        }`}
      >
        <div className="flex items-center justify-center px-[var(--space-23)] pt-6 pb-4">
          <span className="text-[17px] font-semibold text-primary">Settings</span>
        </div>
      </header>

      {/* Page content below the sticky header. */}
      <div className="flex flex-col gap-[var(--space-lg)] px-[var(--space-23)] py-[var(--space-lg)]">
        <ProfileCard
          name={profile.name}
          email={profile.email}
          initials={profile.initials}
          onEdit={() => profile.handleOpenChange(true)}
        />

        <UnitsCard
          weightUnit={units.weightUnit}
          heightUnit={units.heightUnit}
          weightLabel={units.weightLabel}
          heightLabel={units.heightLabel}
          dobLabel={dobField.dobLabel}
          onWeightUnit={units.chooseWeightUnit}
          onHeightUnit={units.chooseHeightUnit}
          onEditWeight={units.openWeightEdit}
          onEditHeight={units.openHeightEdit}
          onEditDob={dobField.openCalendar}
        />

        {/* Log out — a full-width button (not a list row, so it's hard to hit by
            accident while scrolling), in the app's destructive red. Frontend-only
            for now: there's no real session yet, so it just returns to the login
            screen. Clearing a real token / active session lands here when auth is
            built. */}
        <Button
          onClick={() => navigate("/Login")}
          className="h-[46px] w-full gap-2 rounded-xl border border-destructive/40 bg-destructive/10 text-[15px] font-medium text-destructive hover:bg-destructive/20"
        >
          <LogOut className="size-[17px]" />
          Log out
        </Button>
      </div>

      <EditProfileDialog
        open={profile.open}
        onOpenChange={profile.handleOpenChange}
        draft={profile.draft}
        onDraftChange={profile.handleDraftChange}
        canSave={profile.canSave}
        onSave={profile.handleSave}
      />

      <EditWeightDialog
        open={units.editing === "weight"}
        onOpenChange={(open) => !open && units.closeEdit()}
        unit={units.weightDraftUnit}
        onUnitChange={units.handleWeightDraftUnit}
        value={units.weightDraft}
        onChange={units.handleWeightDraft}
        hint={units.weightHint}
        canSave={units.weightCanSave}
        onSave={units.handleSaveWeight}
      />

      <EditHeightDialog
        open={units.editing === "height"}
        onOpenChange={(open) => !open && units.closeEdit()}
        unit={units.heightDraftUnit}
        onUnitChange={units.handleHeightDraftUnit}
        cmValue={units.cmDraft}
        onCmChange={units.handleCmDraft}
        feet={units.feetDraft}
        onFeetChange={units.handleFeetDraft}
        inches={units.inchesDraft}
        onInchesChange={units.handleInchesDraft}
        hint={units.heightHint}
        canSave={units.heightCanSave}
        onSave={units.handleSaveHeight}
      />

      {/* DOB picker — the same shared modal (and maxDate age-gate) as Moreinfo.
          mounted only while open so it starts on the selected date. picking a day
          commits it and closes; there's no separate Save. */}
      {dobField.calendarOpen && (
        <CalendarModal
          onClose={dobField.closeCalendar}
          selected={dobField.dob}
          onSelect={dobField.handleSelectDob}
          maxDate={new Date(2022, 11, 31)}
        />
      )}
    </div>
  )
}

export default Settings
