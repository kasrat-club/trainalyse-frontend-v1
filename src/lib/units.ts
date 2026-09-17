// Pure unit conversion + formatting for the Settings units card. Weight is kept
// canonically in kg and height in cm; these helpers convert to/from the unit the
// user is currently viewing so a display toggle never mutates the stored value.
import { type WeightUnit } from "@/lib/weight"

const LBS_PER_KG = 2.2046226218
const CM_PER_INCH = 2.54

// plausible human height bounds, canonical in cm (mirrors Moreinfo: 20cm ≈ 0'8",
// 400cm ≈ 13'1"). kept here so the units card and its edit dialog share them.
export const HEIGHT_CM_MIN = 20
export const HEIGHT_CM_MAX = 400

export function kgToLbs(kg: number): number {
  return kg * LBS_PER_KG
}
export function lbsToKg(lbs: number): number {
  return lbs / LBS_PER_KG
}

// canonical kg shown in the chosen unit, rounded to 1dp (JS drops a trailing .0,
// so 79kg → 79 and 79kg → 174.2lbs).
export function weightInUnit(kg: number, unit: WeightUnit): number {
  const value = unit === "kg" ? kg : kgToLbs(kg)
  return Math.round(value * 10) / 10
}
// a value typed in the chosen unit, back to canonical kg.
export function weightToKg(value: number, unit: WeightUnit): number {
  return unit === "kg" ? value : lbsToKg(value)
}
export function formatWeight(kg: number, unit: WeightUnit): string {
  return `${weightInUnit(kg, unit)} ${unit}`
}

// canonical cm as whole feet + inches, rolling 12" up to the next foot so we
// never show "5 ft 12 in".
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / CM_PER_INCH
  let feet = Math.floor(totalInches / 12)
  let inches = Math.round(totalInches - feet * 12)
  if (inches === 12) {
    feet += 1
    inches = 0
  }
  return { feet, inches }
}
export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * CM_PER_INCH
}
export function formatHeight(cm: number, unit: "cm" | "ft"): string {
  if (unit === "cm") return `${Math.round(cm)} cm`
  const { feet, inches } = cmToFeetInches(cm)
  return `${feet} ft ${inches} in`
}
