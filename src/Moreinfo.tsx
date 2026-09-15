import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Field, FieldError } from "@/components/ui/field"
import { Card, CardContent } from "@/components/ui/card"
import StepIndicator from "@/components/ui/step-indicator"
import { CalendarModal } from "@/components/CalendarModal"
import { cn } from "@/lib/utils"
import { useMoreinfoForm } from "@/hooks/useMoreinfoForm"
import { format } from "date-fns"
import { Calendar } from "lucide-react"

// small segmented control used for the kg/lbs and cm/ft unit choices. sits
// next to its input and matches the h-11 input height.
interface UnitToggleProps<T extends string> {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
}

function UnitToggle<T extends string>({
  options,
  value,
  onChange,
}: UnitToggleProps<T>) {
  return (
    <div className="flex h-11 items-center rounded-lg border border-border bg-background p-0.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            // fixed width so kg/lbs and cm/ft toggles are the same total width,
            // keeping their left edges aligned across both fields
            "h-full w-12 rounded-md text-center text-sm font-medium transition-colors",
            value === option
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

// the value + unit toggle share one bordered field. the number sits borderless
// and large on the left, the toggle on the right.
const fieldBox =
  "flex items-center gap-2 rounded-xl border border-[var(--border-inputEdge)] bg-[var(--bg-inputBox)] py-1 pr-2 pl-3"
const bigInput =
  "min-w-0 flex-1 bg-transparent text-base font-semibold text-foreground outline-none placeholder:text-base placeholder:font-normal placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

function Moreinfo() {
  // the brain of this form lives in one hook now. it hands back the exact same
  // names the JSX below already used, so nothing in the markup had to change.
  const {
    dob,
    dobOpen,
    setDobOpen,
    handleSelectDob,
    weight,
    handleWeight,
    weightUnit,
    handleWeightUnit,
    height,
    handleHeightCm,
    heightFeet,
    handleHeightFeet,
    heightInches,
    handleHeightInches,
    heightUnit,
    handleHeightUnit,
    isAncient,
    isYoung,
    errors,
    handleSubmit,
  } = useMoreinfoForm()

  return (
    <div className="flex min-h-svh flex-col p-4">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm pt-12">
        <div className="mb-8 flex flex-col gap-2 text-center">
          <h1 className="text-4xl font-bold">Some more info</h1>
          <p className="text-muted-foreground">
            A few details to personalize your log
          </p>
        </div>

        <Card className="[--card-spacing:--spacing(6)]">
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Field data-invalid={!!errors.dob}>
                <Label>Date of birth</Label>
                <button
                  type="button"
                  onClick={() => setDobOpen(true)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-xl border bg-[var(--bg-inputBox)] py-1 pr-4 pl-3 text-left transition-colors outline-none",
                    errors.dob
                      ? "border-destructive"
                      : "border-[var(--border-inputEdge)]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-11 items-center",
                      dob
                        ? "text-base font-semibold text-foreground"
                        : "text-base text-muted-foreground"
                    )}
                  >
                    {dob ? format(dob, "d MMM yyyy") : "Select your date of birth"}
                  </span>
                  <Calendar className="size-5 shrink-0 text-[var(--text-subheading)]" />
                </button>
                <FieldError>{errors.dob}</FieldError>
                {isAncient && (
                  <p className="text-sm font-medium text-[var(--color-neon)]">
                    Damn, you survived all the wars!! you're already built
                    different.
                  </p>
                )}
                {isYoung && (
                  <p className="text-sm font-medium text-[var(--color-neon)]">
                    Damn, you're starting this early!! please be gentle when you
                    grow up.
                  </p>
                )}
              </Field>

              <Field data-invalid={!!errors.weight}>
                <Label htmlFor="weight">Weight</Label>
                <div
                  className={cn(
                    fieldBox,
                    errors.weight && "border-destructive"
                  )}
                >
                  <input
                    className={bigInput}
                    id="weight"
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter your weight"
                    value={weight}
                    onChange={handleWeight}
                    aria-invalid={!!errors.weight}
                  />
                  <UnitToggle
                    options={["kg", "lbs"] as const}
                    value={weightUnit}
                    onChange={handleWeightUnit}
                  />
                </div>
                <FieldError>{errors.weight}</FieldError>
              </Field>

              <Field data-invalid={!!errors.height}>
                <Label htmlFor="height">
                  Height{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <div
                  className={cn(fieldBox, errors.height && "border-destructive")}
                >
                  {heightUnit === "cm" ? (
                    <input
                      className={bigInput}
                      id="height"
                      type="text"
                      inputMode="decimal"
                      placeholder="Enter your height"
                      value={height}
                      onChange={handleHeightCm}
                      aria-invalid={!!errors.height}
                    />
                  ) : (
                    <div className="flex min-w-0 flex-1 gap-3">
                      <input
                        className={bigInput}
                        id="height"
                        type="text"
                        inputMode="decimal"
                        placeholder="ft"
                        value={heightFeet}
                        onChange={handleHeightFeet}
                        aria-invalid={!!errors.height}
                      />
                      <input
                        className={bigInput}
                        type="text"
                        inputMode="decimal"
                        placeholder="in"
                        value={heightInches}
                        onChange={handleHeightInches}
                        aria-invalid={!!errors.height}
                      />
                    </div>
                  )}
                  <UnitToggle
                    options={["cm", "ft"] as const}
                    value={heightUnit}
                    onChange={handleHeightUnit}
                  />
                </div>
                <FieldError>{errors.height}</FieldError>
              </Field>
            </div>

            <Button type="submit" className="h-11 w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* onboarding progress — this is the second (last) step, pinned to the
          bottom of the screen */}
      <StepIndicator total={2} current={2} className="mt-auto pt-8 pb-10" />

      {dobOpen && (
        <CalendarModal
          onClose={() => setDobOpen(false)}
          selected={dob}
          onSelect={handleSelectDob}
          // birthdates only up to the end of 2022
          maxDate={new Date(2022, 11, 31)}
        />
      )}
    </div>
  )
}

export default Moreinfo
