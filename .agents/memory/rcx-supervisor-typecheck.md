---
name: rcx-supervisor typecheck quirks
description: How typechecking works (and pre-fails) in the rcx-supervisor artifact and root workspace.
---

# rcx-supervisor typecheck quirks

**Rule:** Never import from `@/proto/...` in pages/components outside the proto tree. The artifact's `tsconfig.json` excludes `client/src/proto`, but any import drags those files (and their unresolvable `@ringcx/*` deps) back into the `tsc` program. Cross the boundary only via the ambient `@proto` module declared in `client/src/proto-module.d.ts` — add new props there when extending the panel — or duplicate small types locally.

**Why:** The proto tree is vendored RingCX code that references `@ringcx/ui` / `@ringcx/shared`, which are not installed as typed packages; it only compiles through Vite, not tsc.

**How to apply:** After wiring anything between pages and proto code, run `pnpm --filter @workspace/rcx-supervisor run check` (script is `check`, not `typecheck`) and confirm no errors mention files you touched.

**Baseline failures (pre-existing, not yours):**
- `client/src/components/ui/*` (~110 errors): duplicate `@types/react` versions make lucide-react icons invalid JSX components.
- Root `pnpm run typecheck` fails in `artifacts/mockup-sandbox` from duplicate vite/@types/node instances.
- rcx-supervisor is skipped by root typecheck entirely (no `typecheck` script, only `check`).
