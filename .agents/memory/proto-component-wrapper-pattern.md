---
name: Reusing real proto components in the typechecked page
description: How to surface a production proto component (RingCX/@ringcx/ui) into the tsc-checked page without leaking the excluded proto tree.
---

To use a real component from the tsc-excluded `client/src/proto` tree inside a page
that IS typechecked (e.g. `pages/SupervisorAgents.tsx`), do NOT import proto source
paths directly — that pulls the whole proto tree back into tsc and breaks the build.

Instead:
1. Write a thin wrapper INSIDE the proto tree (e.g. `proto/SupervisorFilter.tsx`)
   that renders the real component and includes any required context providers
   (styled-components `ThemeProvider` with `theme` from `@ringcx/ui` + juno
   `RcThemeProvider`). Real RingCX components like `MultiSelect`/`Filter` will not
   render without those providers, and the page sits OUTSIDE AgentTablePanel's own
   providers.
2. Give the wrapper a clean, plain-typed prop interface (no @ringcx types).
3. Re-export the wrapper from the `@proto` barrel (`AgentTablePanel.tsx`, which is
   what the `@proto` vite alias resolves to).
4. Mirror the wrapper's props + component in the ambient `proto-module.d.ts` under
   `declare module "@proto"`. The page imports it from `@proto`, staying tsc-clean.

**Why:** proto is excluded from tsc and only reachable through the single ambient
`@proto` module; any other proto import path leaks the tree into typecheck.

**How to apply:** whenever a task says "use the real component" for something the
page currently fakes with local shadcn/ui, wrap+barrel+ambient-type rather than
importing proto internals.
