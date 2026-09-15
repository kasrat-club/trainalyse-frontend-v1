import { type ChangeEvent } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldError } from "@/components/ui/field"
import { DatePickerDemo } from "./DatePicker"
import Timesetter from "@/components/ui/timesetter"
import { X } from "lucide-react"

// The top fields of the Workout editor: Date, Time, and the workout Title. A pure
// leaf — it holds no state and computes nothing. It's handed the current values
// and a callback per field, and just draws the inputs and calls back up when the
// user changes something. All the real work (writing to the draft, clearing the
// error) lives in useWorkoutEditor.
type WorkoutDetailsFieldsProps = {
  date: string
  onDateChange: (d: Date | undefined) => void
  time: string
  onTimeChange: (value: string) => void
  title: string
  onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void
  onTitleBlur: () => void
  onTitleClear: () => void
  titleError?: string
}

export function WorkoutDetailsFields({
  date,
  onDateChange,
  time,
  onTimeChange,
  title,
  onTitleChange,
  onTitleBlur,
  onTitleClear,
  titleError,
}: WorkoutDetailsFieldsProps) {
  return (
    <>
      {/* Date + Time sit side by side, but flex-wrap lets Time drop to its own
          full-width row below Date when the viewport gets too narrow (< ~320px)
          for both to fit — the min-widths (Date wide enough for the full date
          text, Time for the clock) are what trigger the wrap instead of Time
          spilling past the page padding. */}
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex flex-col gap-2 flex-1 min-w-[176px]">
          <Label className="text-muted-foreground">Date</Label>
          <DatePickerDemo initialDate={date} onDateChange={onDateChange} />
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-[72px]">
          <Label className="text-muted-foreground">Time</Label>
          <Timesetter value={time} onChange={onTimeChange} />
        </div>
      </div>
      <Field data-invalid={!!titleError}>
        {/* relative wrapper so the one-tap clear button can sit inside the input;
            pr-10 keeps the text from sliding under it */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter your title"
            className="pl-3.5 pr-10 h-10"
            maxLength={80}
            value={title}
            onChange={onTitleChange}
            onBlur={onTitleBlur}
            aria-invalid={!!titleError}
          />
          {/* shown only while there's something to erase */}
          {title && (
            <button
              type="button"
              aria-label="Clear title"
              onClick={onTitleClear}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-primary"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
        <FieldError>{titleError}</FieldError>
      </Field>
    </>
  )
}
