import React, { type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useTrimWhitespace } from "@/hooks/use-trim-whitespace"
import {
  emailError,
  passwordError,
  hasSpace,
  PASSWORD_SPACE_MSG,
} from "@/lib/validation"

interface LoginErrors {
  email?: string
  password?: string
}

// figure out what, if anything, is wrong with each field. only the keys that
// have a problem are set, so an empty object means the form is good to go.
function validate(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {}

  const emailMsg = emailError(email)
  if (emailMsg) errors.email = emailMsg

  const passwordMsg = passwordError(password, "Please enter your password.")
  if (passwordMsg) errors.password = passwordMsg

  return errors
}

// The "brain" of the login form: the two fields' state, the email trim hook, the
// per-field handlers, and the submit/validate flow. No JSX — it tracks the form
// and hands back what the screen needs; the Login component only renders.
export function useLoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  // errors only appear after the first submit attempt, then clear per-field as
  // the user fixes each one so the page never nags before they've tried.
  const [errors, setErrors] = React.useState<LoginErrors>({})
  // strip edge whitespace on the email: leading as they type, trailing on blur.
  const emailTrim = useTrimWhitespace(email, setEmail)

  function handleEmail(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value)
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
  }
  function handlePassword(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setPassword(value)
    // flag spaces the instant they appear; otherwise clear the field's error
    if (hasSpace(value)) {
      setErrors((prev) => ({ ...prev, password: PASSWORD_SPACE_MSG }))
    } else if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }))
    }
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // normalize the email's edge whitespace before checking (covers submitting
    // mid-timer). the password is left as-is — any space in it is an error.
    const cleanEmail = email.trim()
    if (cleanEmail !== email) setEmail(cleanEmail)
    const nextErrors = validate(cleanEmail, password)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    navigate("/")
  }
  function handleSignUp() {
    navigate("/Signup")
  }

  // everything the JSX reads — same names it used when this lived inside the
  // component, so the markup didn't need to change.
  return {
    email,
    password,
    errors,
    emailTrim,
    handleEmail,
    handlePassword,
    handleSubmit,
    handleSignUp,
  }
}
