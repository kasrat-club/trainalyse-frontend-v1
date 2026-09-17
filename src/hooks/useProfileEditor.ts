import React, { type ChangeEvent } from "react"
import { user } from "@/data/user"

// Turn a display name into an avatar monogram: two initials for a full name
// ("Kabir Dubey" → "KD"), one for a single word ("hrijumana" → "H"), and a
// neutral "?" if somehow blank. Kept next to the profile logic so the card and
// dialog stay purely presentational.
export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// The "brain" of the Settings profile block: the committed display name, the
// email (read-only — it comes from the Google account, not something we edit
// here), and the edit-dialog state. Save is frontend-only for now — it commits
// the draft to local state so the card updates; when the backend lands this is
// where the PATCH would go. No JSX — Settings renders, this tracks.
export function useProfileEditor() {
  // the name shown on the card. seeded from the static user for now.
  const [name, setName] = React.useState(user.username)
  // dialog visibility + the in-progress edit, re-seeded each time it opens.
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState(user.username)

  // opening seeds the draft from the current name; closing (Cancel, backdrop, or
  // a successful Save) just flips the flag — the draft is re-seeded on next open.
  function handleOpenChange(next: boolean) {
    if (next) setDraft(name)
    setOpen(next)
  }
  function handleDraftChange(event: ChangeEvent<HTMLInputElement>) {
    setDraft(event.target.value)
  }
  // only allow Save with a real, changed name — no blank names, no no-op saves.
  const canSave = draft.trim().length > 0 && draft.trim() !== name
  function handleSave() {
    if (!canSave) return
    setName(draft.trim())
    setOpen(false)
  }

  // everything the JSX reads. `initials` re-derives whenever the name changes,
  // so the monogram fallback updates the moment a new username is saved.
  return {
    name,
    email: user.email,
    initials: initialsFrom(name),
    open,
    draft,
    canSave,
    handleOpenChange,
    handleDraftChange,
    handleSave,
  }
}
