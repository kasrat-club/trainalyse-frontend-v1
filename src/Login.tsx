import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import StepIndicator from "@/components/ui/step-indicator"
import { useLoginForm } from "@/hooks/useLoginForm"

function Login() {
  // the brain of this form lives in one hook now. it hands back the exact same
  // names the JSX below already used, so nothing in the markup had to change.
  const {
    email,
    password,
    errors,
    emailTrim,
    handleEmail,
    handlePassword,
    handleSubmit,
    handleSignUp,
  } = useLoginForm()

  return (
    <>
    <div className="flex min-h-svh flex-col p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto my-auto w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col gap-2 text-center">
          <h1 className="text-4xl font-bold text-brand">Trainalyse</h1>
          <p className="text-muted-foreground">Welcome back!</p>
        </div>

        <Card className="[--card-spacing:--spacing(6)]">
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
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

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInput
                  className="h-11"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  spellCheck={false}
                  maxLength={128}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePassword}
                  aria-invalid={!!errors.password}
                />
                <FieldError>{errors.password}</FieldError>
              </Field>
            </div>

            <Button type="submit" className="h-11 w-full">
              Login
            </Button>
          </CardContent>

          <CardFooter className="justify-center gap-2 p-4">
            <span className="text-sm text-muted-foreground">
              Don&apos;t have an account?
            </span>
            <Button
              className="h-auto p-0 text-brand"
              type="button"
              variant="link"
              onClick={handleSignUp}
            >
              Sign up
            </Button>
          </CardFooter>
        </Card>
      </form>
      {/* two-step onboarding: login is the first (and only) step before the app */}
      <StepIndicator total={2} current={1} className="pt-8 pb-10" />
      </div>

    </>
  )
}

export default Login
