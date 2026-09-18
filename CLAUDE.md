# Project conventions

## Separate UI from logic

Every new page or feature keeps its logic and its markup in different files:

- **Logic (the "brain")** lives in a hook under `src/hooks/` (named `useXxx`, no
  JSX) or, when it's pure and stateless, as functions under `src/lib/`. This is
  where state, handlers, validation, formatting and conversions go.
- **Components** under `src/components/` are presentational: props in, JSX out.
  No business logic, no data fetching, no `useState` beyond trivial view state.
- **Pages** just compose — they call the hook(s) and pass the result to the dumb
  components. They shouldn't hold real behavior.

When adding anything new, follow this split by default. If a page grows tangled,
extract a `useXxx` brain hook and dumb components rather than letting logic sit
inside JSX. Example from Settings: `useUnitSettings` / `useProfileEditor` /
`useDobSetting` (logic) + `UnitsCard` / `ProfileCard` / `EditWeightDialog` (UI).

## Typecheck

Use `npx tsc -b` in this project. `tsc --noEmit` checks nothing here because of
the project-references setup.
