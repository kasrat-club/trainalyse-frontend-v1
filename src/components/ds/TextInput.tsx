import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"

// TextInput — DUMB form text field (the login Email / Password fields). Shares
// the search bar's input language (pill shape, border, focus glow, text), but
// has no leading icon and, for a password, a trailing show/hide eye.
//
// CONTROLLED: the text lives in the parent (value + onChange). The only local
// state is `reveal` (password shown or masked) — trivial view state, so it stays
// inside. `secret` makes it a password (masked + eye); `error` switches it to the
// error look: red border, red text (and a red glow once that token lands).

type TextInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  secret?: boolean
  error?: boolean
  id?: string
  className?: string
}

function TextInput({
  value,
  onChange,
  placeholder,
  secret = false,
  error = false,
  id,
  className,
}: TextInputProps) {
  const [reveal, setReveal] = useState(false)
  const RevealIcon = reveal ? EyeOff : Eye

  return (
    <div className={cn("relative min-w-0", className)}>
      <input
        id={id}
        type={secret && !reveal ? "password" : "text"}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-[var(--control-sm)] w-full rounded-[var(--radius-full)] border bg-transparent pl-[var(--space-lg)] text-[length:var(--text-md)] outline-none placeholder:text-[var(--text-muted)]",
          secret ? "pr-[var(--input-icon-inset)]" : "pr-[var(--space-lg)]",
          error
            ? "border-[var(--danger)] shadow-[var(--shadow-focus-danger)]"
            : "border-[var(--border)] focus-visible:border-[var(--border-hover)] focus-visible:shadow-[var(--shadow-focus)]",
        )}
        style={{ color: error ? "var(--danger)" : "var(--text-primary)" }}
      />
      {secret && (
        <button
          type="button"
          aria-label={reveal ? "Hide password" : "Show password"}
          onClick={() => setReveal((shown) => !shown)}
          className="absolute top-1/2 right-[var(--input-icon-offset)] -translate-y-1/2 transition-colors hover:text-[var(--text-primary)]"
          style={{ color: error ? "var(--danger)" : "var(--text-muted)" }}
        >
          <RevealIcon className="size-[var(--icon-sm)]" />
        </button>
      )}
    </div>
  )
}

export default TextInput
