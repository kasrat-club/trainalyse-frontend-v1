import React, { type ChangeEvent } from "react"
import { user } from "@/data/user"
import {
  type WeightUnit,
  WEIGHT_LIMITS,
  sanitizeWeight,
  weightRangeError,
} from "@/lib/weight"
import { sanitizeNumeric } from "@/lib/number-input"
import {
  weightInUnit,
  weightToKg,
  formatWeight,
  cmToFeetInches,
  feetInchesToCm,
  formatHeight,
  HEIGHT_CM_MIN,
  HEIGHT_CM_MAX,
} from "@/lib/units"

type HeightUnit = "cm" | "ft"

// Seed the canonical kg/cm from the stored user regardless of the unit it was
// saved in, so a display toggle never has to guess and never loses precision.
function seedKg(): number {
  return user.weightUnit === "lbs" ? weightToKg(user.weight, "lbs") : user.weight
}
function seedCm(): number {
  if (user.heightUnit === "cm") return user.height
  // defensive: if height was ever stored as decimal feet, unpack it to ft/in.
  const feet = Math.floor(user.height)
  const inches = Math.round((user.height - feet) * 12)
  return feetInchesToCm(feet, inches)
}

// The "brain" of the Settings units card: the display unit prefs, the canonical
// weight/height, and the two value-edit dialogs. Toggling a unit only changes how
// the canonical value is shown (it converts live); editing a value in a dialog is
// the only thing that changes the stored number. Frontend-only for now — save
// commits to local state; the backend PATCH slots in at handleSaveWeight/Height.
export function useUnitSettings() {
  // canonical values — kg and cm — the single source of truth.
  const [weightKg, setWeightKg] = React.useState(seedKg())
  const [heightCm, setHeightCm] = React.useState(seedCm())
  // which unit each row is displayed in. changing these converts, never edits.
  const [weightUnit, setWeightUnit] = React.useState<WeightUnit>(user.weightUnit)
  const [heightUnit, setHeightUnit] = React.useState<HeightUnit>(user.heightUnit)
  // the unit being used INSIDE the open dialog. it starts from the card's unit
  // but the in-dialog toggle changes only this (no conversion — the user is
  // typing a fresh value); Save then promotes it to the card's display unit,
  // Cancel discards it. kept separate so a scrapped edit never flips the card.
  const [weightDraftUnit, setWeightDraftUnit] = React.useState<WeightUnit>(user.weightUnit)
  const [heightDraftUnit, setHeightDraftUnit] = React.useState<HeightUnit>(user.heightUnit)
  // which value dialog is open, if any.
  const [editing, setEditing] = React.useState<null | "weight" | "height">(null)
  // in-progress edits, seeded (in the current unit) when a dialog opens.
  const [weightDraft, setWeightDraft] = React.useState("")
  const [cmDraft, setCmDraft] = React.useState("")
  const [feetDraft, setFeetDraft] = React.useState("")
  const [inchesDraft, setInchesDraft] = React.useState("")

  // unit toggles: display-only. the value re-derives from the canonical figure.
  function chooseWeightUnit(unit: WeightUnit) {
    setWeightUnit(unit)
  }
  function chooseHeightUnit(unit: HeightUnit) {
    setHeightUnit(unit)
  }

  // open the weight dialog, seeding the draft unit + value from the card.
  function openWeightEdit() {
    setWeightDraftUnit(weightUnit)
    setWeightDraft(String(weightInUnit(weightKg, weightUnit)))
    setEditing("weight")
  }
  // open the height dialog, seeding cm OR feet+inches depending on the unit.
  function openHeightEdit() {
    setHeightDraftUnit(heightUnit)
    // seed only the active unit's field(s); clear the other unit's so that
    // toggling to it in the dialog starts empty (a fresh entry, not a stale one).
    if (heightUnit === "cm") {
      setCmDraft(String(Math.round(heightCm)))
      setFeetDraft("")
      setInchesDraft("")
    } else {
      const { feet, inches } = cmToFeetInches(heightCm)
      setFeetDraft(String(feet))
      setInchesDraft(String(inches))
      setCmDraft("")
    }
    setEditing("height")
  }
  // closing (Cancel, backdrop, or a successful Save) just drops the flag; drafts
  // are re-seeded on the next open.
  function closeEdit() {
    setEditing(null)
  }

  // keep every keystroke in shape for its unit (integer caps + decimals).
  function handleWeightDraft(event: ChangeEvent<HTMLInputElement>) {
    setWeightDraft(sanitizeWeight(event.target.value, weightDraftUnit))
  }
  // in-dialog unit toggles: switch the unit WITHOUT converting the typed value.
  // weight re-clamps the same digits to the new unit's caps (kg allows 3 int
  // digits, lbs 4); height keeps its separate cm / ft-in fields, so it just
  // swaps which one is shown.
  function handleWeightDraftUnit(unit: WeightUnit) {
    setWeightDraftUnit(unit)
    setWeightDraft((w) => sanitizeWeight(w, unit))
  }
  function handleHeightDraftUnit(unit: HeightUnit) {
    setHeightDraftUnit(unit)
  }
  function handleCmDraft(event: ChangeEvent<HTMLInputElement>) {
    setCmDraft(sanitizeNumeric(event.target.value, 3, 0)) // whole cm, up to 400
  }
  function handleFeetDraft(event: ChangeEvent<HTMLInputElement>) {
    setFeetDraft(sanitizeNumeric(event.target.value, 2, 0)) // whole feet
  }
  function handleInchesDraft(event: ChangeEvent<HTMLInputElement>) {
    setInchesDraft(sanitizeNumeric(event.target.value, 2, 0)) // whole inches
  }

  // weight is valid when it's a real number inside the DRAFT unit's range.
  const weightValue = parseFloat(weightDraft)
  const weightCanSave =
    weightDraft.trim() !== "" &&
    !weightRangeError(Number.isNaN(weightValue) ? undefined : weightValue, weightDraftUnit)

  // height validity: cm range for cm, or a real ft/in pair (inches 0–11) that
  // lands inside the cm range — judged by the DRAFT unit.
  let heightCmValue: number
  let heightCanSave: boolean
  if (heightDraftUnit === "cm") {
    heightCmValue = parseFloat(cmDraft)
    heightCanSave =
      cmDraft.trim() !== "" &&
      heightCmValue >= HEIGHT_CM_MIN &&
      heightCmValue <= HEIGHT_CM_MAX
  } else {
    const feet = parseFloat(feetDraft) || 0
    const inches = parseFloat(inchesDraft) || 0
    heightCmValue = feetInchesToCm(feet, inches)
    heightCanSave =
      (feetDraft.trim() !== "" || inchesDraft.trim() !== "") &&
      inches < 12 &&
      heightCmValue >= HEIGHT_CM_MIN &&
      heightCmValue <= HEIGHT_CM_MAX
  }

  // Save commits the value in the draft unit AND promotes that unit to the card's
  // display unit, so what the user typed in is what the card then shows.
  function handleSaveWeight() {
    if (!weightCanSave) return
    setWeightKg(weightToKg(weightValue, weightDraftUnit))
    setWeightUnit(weightDraftUnit)
    setEditing(null)
  }
  function handleSaveHeight() {
    if (!heightCanSave) return
    setHeightCm(heightCmValue)
    setHeightUnit(heightDraftUnit)
    setEditing(null)
  }

  return {
    // display prefs + handlers for the toggles
    weightUnit,
    heightUnit,
    chooseWeightUnit,
    chooseHeightUnit,
    // the labels shown on the card ("79 kg", "5 ft 10 in")
    weightLabel: formatWeight(weightKg, weightUnit),
    heightLabel: formatHeight(heightCm, heightUnit),
    openWeightEdit,
    openHeightEdit,
    // which dialog is open
    editing,
    closeEdit,
    // weight dialog — its own unit toggle (weightDraftUnit) lives here too
    weightDraft,
    handleWeightDraft,
    weightDraftUnit,
    handleWeightDraftUnit,
    weightCanSave,
    handleSaveWeight,
    weightHint: `Between ${WEIGHT_LIMITS[weightDraftUnit].min} and ${WEIGHT_LIMITS[weightDraftUnit].max} ${weightDraftUnit}`,
    // height dialog
    cmDraft,
    handleCmDraft,
    feetDraft,
    handleFeetDraft,
    inchesDraft,
    handleInchesDraft,
    heightDraftUnit,
    handleHeightDraftUnit,
    heightCanSave,
    handleSaveHeight,
    heightHint:
      heightDraftUnit === "cm"
        ? `Between ${HEIGHT_CM_MIN} and ${HEIGHT_CM_MAX} cm`
        : "Feet, with inches from 0 to 11",
  }
}
