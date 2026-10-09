import { useId } from "react"
import type { CSSProperties } from "react"

import TextInput from "./TextInput"
import PillButton from "./PillButton"
import Separator from "./Separator"

// LoginCard — DUMB. Composes the login form from the design-system atoms: two
// labelled TextInputs (Email + a secret Password), the full-width primary Login
// pill, a full-width divider, and the "Sign up" footer link. Controlled: the
// field values + handlers live in the parent (a useLoginForm hook later).
// Presentation only — no validation here. The divider spans edge to edge, so the
// body and footer carry their own padding and the card itself clips the corners.

type LoginCardProps = {
  email: string
  password: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit?: () => void
  onSignUp?: () => void
}

function LoginCard({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onSignUp,
}: LoginCardProps) {
  const emailId = useId()
  const passwordId = useId()

  return (
    <div
      className="overflow-hidden rounded-[var(--radius-lg)]"
      style={{ background: "var(--surface)" }}
    >
      {/* body */}
      <div className="flex flex-col gap-[var(--space-lg)] p-[var(--space-lg)]">
        <div className="flex flex-col gap-[var(--space-sm)]">
          <label htmlFor={emailId} style={labelStyle}>
            Email
          </label>
          <TextInput
            id={emailId}
            value={email}
            onChange={onEmailChange}
            placeholder="Enter your email"
          />
        </div>

        <div className="flex flex-col gap-[var(--space-sm)]">
          <label htmlFor={passwordId} style={labelStyle}>
            Password
          </label>
          <TextInput
            id={passwordId}
            value={password}
            onChange={onPasswordChange}
            placeholder="Enter your password"
            secret
          />
        </div>

        <PillButton variant="primary" className="w-full" onClick={onSubmit}>
          Login
        </PillButton>
      </div>

      {/* separator — inset to the content width, like the workout card's */}
      <Separator inset />

      {/* footer */}
      <div className="flex items-center justify-center gap-[var(--space-sm)] p-[var(--space-lg)]">
        <span style={footerText}>Don't have an account?</span>
        <button
          type="button"
          onClick={onSignUp}
          className="text-[var(--brand)] outline-none transition-colors hover:text-[var(--brand-hover)]"
          style={signUpFont}
        >
          Sign up
        </button>
      </div>
    </div>
  )
}

const labelStyle: CSSProperties = {
  color: "var(--text-primary)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
  fontWeight: "var(--font-weight-bold)",
}

const footerText: CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
}

const signUpFont: CSSProperties = {
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
  fontWeight: "var(--font-weight-bold)",
}

export default LoginCard
