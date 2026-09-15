import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import StepIndicator from "@/components/ui/step-indicator"
import { useSignupForm } from "@/hooks/useSignupForm"

function Signup() {
  // the brain of this form lives in one hook now. it hands back the exact same
  // names the JSX below already used, so nothing in the markup had to change.
  const {
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
  } = useSignupForm()

  return (
    <div className="flex min-h-svh flex-col p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto my-auto w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col gap-2 text-center">
          <h1 className="text-4xl font-bold text-brand">Trainalyse</h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>

        <Card className="[--card-spacing:--spacing(6)]">
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Field data-invalid={!!errors.userName}>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  className="h-11"
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={30}
                  placeholder="Create your username"
                  value={userName}
                  onChange={handleUsername}
                  onBlur={userNameTrim.onBlur}
                  aria-invalid={!!errors.userName}
                />
                <FieldError>{errors.userName}</FieldError>
              </Field>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  className="h-11"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={254}
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmail}
                  onBlur={emailTrim.onBlur}
                  aria-invalid={!!errors.email}
                />
                <FieldError>{errors.email}</FieldError>
              </Field>

              <Field data-invalid={!!errors.password1}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInput
                  className="h-11"
                  id="password"
                  name="new-password"
                  autoComplete="new-password"
                  spellCheck={false}
                  maxLength={128}
                  placeholder="Enter your password"
                  value={password1}
                  onChange={handlePassword1}
                  aria-invalid={!!errors.password1}
                />
                <FieldError>{errors.password1}</FieldError>
              </Field>

              <Field data-invalid={!!errors.password2}>
                <FieldLabel htmlFor="confirm-password">
                  Confirm password
                </FieldLabel>
                <PasswordInput
                  className="h-11"
                  id="confirm-password"
                  name="confirm-password"
                  autoComplete="new-password"
                  spellCheck={false}
                  maxLength={128}
                  placeholder="Re-enter your password"
                  value={password2}
                  onChange={handlePassword2}
                  aria-invalid={!!errors.password2}
                />
                <FieldError>{errors.password2}</FieldError>
              </Field>
            </div>

            <Button type="submit" className="h-11 w-full">
              Sign Up
            </Button>
          </CardContent>

          <CardFooter className="justify-center gap-2 p-4">
            <span className="text-sm text-muted-foreground">
              Already have an account?
            </span>
            <Button
              className="h-auto p-0 text-brand"
              type="button"
              variant="link"
              onClick={handleLogin}
            >
              Log in
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* two-step onboarding: sign up is the first step, more info is the second */}
      <StepIndicator total={2} current={1} className="pt-8 pb-10" />
    </div>
  )
}

export default Signup
