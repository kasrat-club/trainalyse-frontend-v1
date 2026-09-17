import { type ChangeEvent } from "react"
import { FormDialog } from "@/components/FormDialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EditProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: string
  onDraftChange: (event: ChangeEvent<HTMLInputElement>) => void
  canSave: boolean
  onSave: () => void
}

// Dumb edit-profile modal: a FormDialog that edits the username ONLY. The avatar
// isn't editable here on purpose — the photo comes from the user's Google account
// (changed there, not in-app), so we just say so. Logic lives in useProfileEditor;
// this only supplies the one field. Save is disabled until the name is non-empty
// and actually changed.
export function EditProfileDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  canSave,
  onSave,
}: EditProfileDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit profile"
      description="Your photo comes from your Google account, change it there and it updates here."
      canSave={canSave}
      onSave={onSave}
    >
      <div className="flex flex-col gap-[var(--space-sm)]">
        <Label htmlFor="profile-username">Username</Label>
        <Input
          id="profile-username"
          value={draft}
          onChange={onDraftChange}
          autoFocus
          autoComplete="off"
          // no focus glow/ring — keep the border steady while typing
          className="focus-visible:border-input focus-visible:ring-0"
        />
      </div>
    </FormDialog>
  )
}
