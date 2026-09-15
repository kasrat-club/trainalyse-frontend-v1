import React, { type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { sanitizeNumeric, stripLeadingZeros } from "@/lib/number-input"
import { type WeightUnit, WEIGHT_LIMITS, sanitizeWeight } from "@/lib/weight"
import { differenceInYears } from "date-fns"

// height bounds are kept canonically in cm; the ft/in inputs are converted to
// cm before the range check. 20cm ≈ 0'8", 400cm ≈ 13'1".
const HEIGHT_CM_MIN = 20
const HEIGHT_CM_MAX = 400
const CM_PER_INCH = 2.54

export interface MoreinfoErrors {
  dob?: string
  weight?: string
  height?: string
}

interface HeightFields {
  unit: "cm" | "ft"
  cm: string
  feet: string
  inches: string
}

// turn whatever's in the height inputs into total cm, and note whether the user
// actually typed anything (height is optional, so blank stays valid).
function heightToCm(h: HeightFields): { cm: number; entered: boolean } {
  if (h.unit === "cm") {
    return { cm: parseFloat(h.cm), entered: h.cm.trim() !== "" }
  }
  const feet = parseFloat(h.feet) || 0
  const inches = parseFloat(h.inches) || 0
  return {
    cm: (feet * 12 + inches) * CM_PER_INCH,
    entered: h.feet.trim() !== "" || h.inches.trim() !== "",
  }
}

// date of birth and weight are required; height stays optional. only the keys
// with a problem are set, so an empty object means we're good to continue.
function validate(
  dob: Date | undefined,
  weight: string,
  weightUnit: WeightUnit,
  height: HeightFields
): MoreinfoErrors {
  const errors: MoreinfoErrors = {}

  if (!dob) {
    errors.dob = "Please select your date of birth."
  }

  const trimmed = weight.trim()
  const value = parseFloat(trimmed)
  const { min, max } = WEIGHT_LIMITS[weightUnit]
  if (!trimmed || Number.isNaN(value)) {
    errors.weight =
      "We need your weight to calculate the volume of bodyweight exercises, so this one's important."
  } else if (value < min || value > max) {
    errors.weight = `Please enter a weight between ${min} and ${max} ${weightUnit}.`
  }

  // optional: only complain if they typed a height. check the inches column is
  // a real inches value (0–11) first, then the overall range.
  const { cm, entered } = heightToCm(height)
  if (entered) {
    const inches = parseFloat(height.inches) || 0
    if (height.unit === "ft" && inches >= 12) {
      errors.height = "Inches must be between 0 and 11."
    } else if (!(cm >= HEIGHT_CM_MIN && cm <= HEIGHT_CM_MAX)) {
      errors.height =
        height.unit === "cm"
          ? `Please enter a height between ${HEIGHT_CM_MIN} and ${HEIGHT_CM_MAX} cm.`
          : `Please enter a height between 0 ft 8 in and 13 ft 1 in.`
    }
  }

  return errors
}

// The "brain" of the Moreinfo onboarding form: every field's state, the input
// sanitizers/handlers, the leading-zero tidy effects, the playful age notes, and
// the submit/validate flow. No JSX — it just tracks the form and hands back what
// the screen needs. The Moreinfo component then only renders it.
export function useMoreinfoForm() {
  const navigate = useNavigate()
  const [dob, setDob] = React.useState<Date | undefined>(undefined)
  const [dobOpen, setDobOpen] = React.useState(false)
  const [weight, setWeight] = React.useState("")
  const [weightUnit, setWeightUnit] = React.useState<WeightUnit>("kg")
  const [height, setHeight] = React.useState("")
  const [heightFeet, setHeightFeet] = React.useState("")
  const [heightInches, setHeightInches] = React.useState("")
  const [heightUnit, setHeightUnit] = React.useState<"cm" | "ft">("cm")
  // errors only appear after the first Continue press, then clear per-field as
  // the user fills each one in so the page never nags before they've tried.
  const [errors, setErrors] = React.useState<MoreinfoErrors>({})

  function handleSelectDob(next: Date | undefined) {
    setDob(next)
    if (errors.dob) setErrors((prev) => ({ ...prev, dob: undefined }))
  }
  function handleWeight(event: React.ChangeEvent<HTMLInputElement>) {
    setWeight(sanitizeWeight(event.target.value, weightUnit))
    if (errors.weight) setErrors((prev) => ({ ...prev, weight: undefined }))
  }
  // switching units re-clamps the digits to the new unit and clears any stale
  // range error (its message names the old unit).
  function handleWeightUnit(unit: WeightUnit) {
    setWeightUnit(unit)
    setWeight((w) => sanitizeWeight(w, unit))
    if (errors.weight) setErrors((prev) => ({ ...prev, weight: undefined }))
  }

  function clearHeightError() {
    if (errors.height) setErrors((prev) => ({ ...prev, height: undefined }))
  }
  function handleHeightCm(event: React.ChangeEvent<HTMLInputElement>) {
    setHeight(sanitizeNumeric(event.target.value, 3, 2)) // cm: up to 400.00
    clearHeightError()
  }
  function handleHeightFeet(event: React.ChangeEvent<HTMLInputElement>) {
    setHeightFeet(sanitizeNumeric(event.target.value, 2, 0)) // whole feet
    clearHeightError()
  }
  function handleHeightInches(event: React.ChangeEvent<HTMLInputElement>) {
    setHeightInches(sanitizeNumeric(event.target.value, 2, 2)) // inches, 2dp
    clearHeightError()
  }
  // cm and ft/in are separate state, so switching units keeps each entry; just
  // clear any stale range error since its message names the old unit.
  function handleHeightUnit(unit: "cm" | "ft") {
    setHeightUnit(unit)
    clearHeightError()
  }

  // tidy leading zeros a beat after typing stops ("020" → "20"). idempotent, so
  // once it settles it won't fire again.
  React.useEffect(() => {
    if (weight === "") return
    const id = setTimeout(() => {
      setWeight((w) => stripLeadingZeros(w))
    }, 50)
    return () => clearTimeout(id)
  }, [weight])

  // same leading-zero tidy for the three height inputs.
  React.useEffect(() => {
    const id = setTimeout(() => {
      setHeight((v) => stripLeadingZeros(v))
      setHeightFeet((v) => stripLeadingZeros(v))
      setHeightInches((v) => stripLeadingZeros(v))
    }, 50)
    return () => clearTimeout(id)
  }, [height, heightFeet, heightInches])

  // easter eggs: playful neon notes at the age extremes instead of plain errors.
  // non-blocking — the user can still continue. only one can ever show at once.
  const age = dob !== undefined ? differenceInYears(new Date(), dob) : null
  const isAncient = age !== null && age > 114
  const isYoung = age !== null && age < 15

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(dob, weight, weightUnit, {
      unit: heightUnit,
      cm: height,
      feet: heightFeet,
      inches: heightInches,
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    navigate("/")
  }

  // everything the JSX reads — same names it used when this lived inside the
  // component, so the markup didn't need to change.
  return {
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
  }
}
