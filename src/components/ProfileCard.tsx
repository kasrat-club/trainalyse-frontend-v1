import { Button } from "@/components/ui/button"

type ProfileCardProps = {
  name: string
  email: string
  initials: string
  // Once Google OAuth is wired, the account photo url slots in here; until then
  // it's undefined and we fall back to the initials monogram.
  photoUrl?: string
  onEdit: () => void
}

// Dumb profile bar for the Settings page (design 2a): avatar, name + email, and
// an Edit button. All state lives in useProfileEditor — this only renders.
export function ProfileCard({ name, email, initials, photoUrl, onEdit }: ProfileCardProps) {
  return (
    <div className="flex items-center gap-[var(--space-md)] rounded-[var(--radius-card)] border border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] p-[var(--space-lg)]">
      {/* Avatar: the Google account photo when we have one, otherwise a neon-tinted
          initials monogram (the same coloured circle you see in Gmail). */}
      {photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="size-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[rgb(205_242_58/32%)] bg-[rgb(205_242_58/14%)] text-xl font-bold text-[var(--color-neon)]">
          {initials}
        </span>
      )}

      {/* Name + the email it's logged in with, both clipped so a long address
          can't push the Edit button off the card. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-base font-semibold text-primary">{name}</span>
        <span className="truncate text-sm font-semibold text-muted-foreground">{email}</span>
      </div>

      <Button
        variant="outline"
        onClick={onEdit}
        className="h-9 shrink-0 rounded-full px-4 text-sm font-semibold"
      >
        Edit
      </Button>
    </div>
  )
}
