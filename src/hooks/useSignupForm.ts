import React, { type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useTrimWhitespace, normalizeText } from "@/hooks/use-trim-whitespace"
import {
  emailError,
  passwordError,
  hasSpace,
  PASSWORD_SPACE_MSG,
} from "@/lib/validation"

interface SignupErrors {
  userName?: string
  email?: string
  password1?: string
  password2?: string
}

// figure out what, if anything, is wrong with each field. only the keys that
// have a problem are set, so an empty object means the form is good to go.
function validate(
  userName: string,
  email: string,
  password1: string,
  password2: string
): SignupErrors {
  const errors: SignupErrors = {}

  if (!userName.trim()) {
    errors.userName = "Please choose a username."
  }

  const emailMsg = emailError(email)
  if (emailMsg) errors.email = emailMsg

  const password1Msg = passwordError(password1, "Please enter a password.")
  if (password1Msg) errors.password1 = password1Msg

  // the confirm field checks a match rather than a length: empty, then no
  // spaces, then it has to equal the first password.
  if (!password2) {
    errors.password2 = "Please re-enter your password."
  } else if (hasSpace(password2)) {
    errors.password2 = PASSWORD_SPACE_MSG
  } else if (password1 !== password2) {
    errors.password2 = "Those passwords don't match."
  }

  return errors
}

// The "brain" of the signup form: the four fields' state, the whitespace-trim
// hooks, the per-field handlers, and the submit/validate flow. No JSX — it tracks
// the form and hands back what the screen needs; the Signup component only renders.
export function useSignupForm() {
  const navigate = useNavigate()
  const [userName, setUserName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password1, setPassword1] = React.useState("")
  const [password2, setPassword2] = React.useState("")
  // errors only appear after the first submit attempt, then clear per-field as
  // the user fixes each one so the page never nags before they've tried.
  const [errors, setErrors] = React.useState<SignupErrors>({})
  // username: trim ends + collapse internal runs to one space, on blur.
  const userNameTrim = useTrimWhitespace(userName, setUserName, {
    collapseInternal: true,
  })
  // email: trim ends only. passwords allow no spaces at all, so they get no
  // trim hook — spaces there are flagged as errors instead.
  const emailTrim = useTrimWhitespace(email, setEmail)

  function handleUsername(event: ChangeEvent<HTMLInputElement>) {
    setUserName(event.target.value)
    if (errors.userName) setErrors((prev) => ({ ...prev, userName: undefined }))
  }
  function handleEmail(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value)
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
  }
  function handlePassword1(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setPassword1(value)
    // flag spaces the instant they appear; otherwise clear the field's error
    if (hasSpace(value)) {
      setErrors((prev) => ({ ...prev, password1: PASSWORD_SPACE_MSG }))
    } else if (errors.password1) {
      setErrors((prev) => ({ ...prev, password1: undefined }))
    }
  }
  function handlePassword2(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setPassword2(value)
    if (hasSpace(value)) {
      setErrors((prev) => ({ ...prev, password2: PASSWORD_SPACE_MSG }))
    } else if (errors.password2) {
      setErrors((prev) => ({ ...prev, password2: undefined }))
    }
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // normalize whitespace before checking (covers submitting mid-timer): the
    // username collapses internal runs too; the email just trims. passwords are
    // left as-is — any space in them is flagged as an error.
    const cleanUserName = normalizeText(userName, true)
    const cleanEmail = email.trim()
    if (cleanUserName !== userName) setUserName(cleanUserName)
    if (cleanEmail !== email) setEmail(cleanEmail)
    const nextErrors = validate(
      cleanUserName,
      cleanEmail,
      password1,
      password2
    )
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    navigate("/Moreinfo")
  }
  function handleLogin() {
    navigate("/Login")
  }

  // everything the JSX reads — same names it used when this lived inside the
  // component, so the markup didn't need to change.
  return {
    userName,
    email,
    password1,
    password2,
    errors,
    userNameTrim,
    emailTrim,
    handleUsername,
    handleEmail,
    handlePassword1,
    handlePassword2,
    handleSubmit,
    handleLogin,
  }
}
