import { useState } from "react"
import { Activity, Dumbbell, List } from "lucide-react"

import TimelineRail from "@/components/ds/timeline/TimelineRail"
import WorkoutDateCard, {
  type WorkoutEntry,
} from "@/components/ds/timeline/WorkoutDateCard"
import LoginCard from "@/components/ds/LoginCard"
import SignUpCard from "@/components/ds/SignUpCard"
import { heading, muted } from "../styles"

// Cards — the workout card in its two real states: one workout on a date, and
// two workouts logged on the same date (stacked in one card with a divider).
// Both are the REAL WorkoutDateCard paired with the timeline rail, exactly as
// the home timeline composes them.

function Cards() {
  return (
    <div className="flex flex-col gap-10">
      <h2 style={heading}>Cards</h2>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Workout card — one workout on a date</span>
        <CardRow
          day="22"
          month="Jun"
          items={[
            {
              title: "Per-Limb Arm Day",
              weekday: "Mon",
              stats: [
                { icon: Dumbbell, label: "Total work done (Volume)", value: "552" },
                { icon: Activity, label: "Endurance", value: "48 min" },
                { icon: List, label: "Exercises Done", value: 4 },
              ],
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Workout card — two workouts on the same date</span>
        <CardRow
          day="20"
          month="Jun"
          items={[
            {
              title: "Morning Push",
              weekday: "Sat",
              stats: [
                { icon: Dumbbell, label: "Total work done (Volume)", value: "612" },
                { icon: List, label: "Exercises Done", value: 5 },
              ],
            },
            {
              title: "Evening Pull",
              weekday: "Sat",
              stats: [
                { icon: Dumbbell, label: "Total work done (Volume)", value: "488" },
                { icon: List, label: "Exercises Done", value: 4 },
              ],
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Login card — the whole login form composed from the atoms</span>
        <div className="max-w-sm">
          <LoginShowcase />
        </div>
      </section>

      <section className="flex flex-col gap-[var(--space-md)]">
        <span style={muted}>Sign-up card — the create-account form composed from the atoms</span>
        <div className="max-w-sm">
          <SignUpShowcase />
        </div>
      </section>
    </div>
  )
}

// LoginCard is controlled, so it needs a parent holding the field values.
function LoginShowcase() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  return (
    <LoginCard
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
    />
  )
}

// SignUpCard is controlled too — one bit of state per field.
function SignUpShowcase() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  return (
    <SignUpCard
      username={username}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      onUsernameChange={setUsername}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
    />
  )
}

// One timeline row: the rail (date + node) beside its date card. isFirst+isLast
// trim the connecting line to just the node, so each specimen stands alone.
function CardRow({
  day,
  month,
  items,
}: {
  day: string
  month: string
  items: WorkoutEntry[]
}) {
  return (
    <div className="flex items-stretch gap-[var(--space-lg)]">
      <TimelineRail day={day} month={month} isFirst isLast />
      <div className="min-w-0 flex-1">
        <WorkoutDateCard items={items} />
      </div>
    </div>
  )
}

export default Cards
