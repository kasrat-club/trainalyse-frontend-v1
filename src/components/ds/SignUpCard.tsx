import { useId } from "react"
import type { CSSProperties } from "react"

import TextInput from "./TextInput"
import PillButton from "./PillButton"
import Separator from "./Separator"

// SignUpCard — DUMB. The create-account form: four labelled TextInputs (Username,
// Email, a secret Password and a secret Confirm password), the full-width primary
// Sign Up pill, an inset Separator, and the "Log in" footer link. Controlled —
// the values + handlers live in the parent. It mirrors LoginCard's shape by hand
// for now; a shared AuthCard shell is deferred until OAuth is added to both.

type SignUpCardProps = {
  username: string
  email: string
  password: string
  confirmPassword: string
  onUsernameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSubmit?: () => void
  onLogIn?: () => void
}

function SignUpCard({
  username,
  email,
  password,
  confirmPassword,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onLogIn,
}: SignUpCardProps) {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius-lg)]"
      style={{ background: "var(--surface)" }}
    >
      {/* body */}
      <div className="flex flex-col gap-[var(--space-lg)] p-[var(--space-lg)]">
        <Field
          label="Username"
          value={username}
          onChange={onUsernameChange}
          placeholder="Create your username"
        />
        <Field
          label="Email"
          value={email}
          onChange={onEmailChange}
          placeholder="Enter your email"
        />
        <Field
          label="Password"
          value={password}
          onChange={onPasswordChange}
          placeholder="Enter your password"
          secret
        />
        <Field
          label="Confirm password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          placeholder="Re-enter your password"
          secret
        />

        <PillButton variant="primary" className="w-full" onClick={onSubmit}>
          Sign Up
        </PillButton>
      </div>

      {/* separator — inset to the content width */}
      <Separator inset />

      {/* footer */}
      <div className="flex items-center justify-center gap-[var(--space-sm)] p-[var(--space-lg)]">
        <span style={footerText}>Already have an account?</span>
        <button
          type="button"
          onClick={onLogIn}
          className="text-[var(--brand)] outline-none transition-colors hover:text-[var(--brand-hover)]"
          style={linkFont}
        >
          Log in
        </button>
      </div>
    </div>
  )
}

// One labelled field: a bold label over a controlled TextInput.
function Field({
  label,
  value,
  onChange,
  placeholder,
  secret = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  secret?: boolean
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <TextInput
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        secret={secret}
      />
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

const linkFont: CSSProperties = {
  fontSize: "var(--text-sm)",
  lineHeight: "var(--leading-sm)",
  fontWeight: "var(--font-weight-bold)",
}

export default SignUpCard
