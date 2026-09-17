import { type ReactNode } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// The app's shared dialog-button language (borrowed from ConfirmModal): one pill
// shape, a muted Cancel, a neon Save for the positive action.
const pill =
  "h-9 min-w-[92px] justify-center gap-1.5 rounded-full border px-4 text-sm font-medium"

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  // the fields for this particular form — the only part that differs per dialog.
  children: ReactNode
  canSave: boolean
  onSave: () => void
  saveLabel?: string
  cancelLabel?: string
}

// A reusable shadcn-Dialog shell for the app's little edit forms (profile,
// weight, height…): the surface, title + description, the caller's fields, and a
// Cancel/Save footer in the app's pill language. Each form only supplies its own
// inputs, so the chrome and button styling live in exactly one place. Cancel and
// the backdrop close it; Save is disabled until `canSave`.
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  canSave,
  onSave,
  saveLabel = "Save",
  cancelLabel = "Cancel",
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-[var(--space-lg)] rounded-2xl border border-[var(--border-cardEdge)] bg-[var(--bg-surface-primary)] p-[var(--space-lg)]"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-primary">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children}

        <div className="flex justify-between gap-3">
          <DialogClose asChild>
            <Button
              className={cn(
                pill,
                "border-muted-foreground bg-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            onClick={onSave}
            disabled={!canSave}
            className={cn(
              pill,
              "border-[rgb(205_242_58/40%)] bg-[rgb(205_242_58/8%)] text-[var(--color-neon)] hover:bg-[rgb(205_242_58/14%)]"
            )}
          >
            {saveLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
