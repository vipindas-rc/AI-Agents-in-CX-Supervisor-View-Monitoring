---
name: rcx-supervisor typecheck quirks
description: How typechecking works (and pre-fails) in the rcx-supervisor artifact and root workspace.
---

# rcx-supervisor typecheck quirks

**Rule:** Never import from `@/proto/...` in pages/components outside the proto tree. The artifact's `tsconfig.json` excludes `client/src/proto`, but any import drags those files (and their unresolvable `@ringcx/*` deps) back into the `tsc` program. Cross the boundary only via the ambient `@proto` module declared in `client/src/proto-module.d.ts` — add new props there when extending the panel — or duplicate small types locally.

**Why:** The proto tree is vendored RingCX code that references `@ringcx/ui` / `@ringcx/shared`, which are not installed as typed packages; it only compiles through Vite, not tsc.

**How to apply:** After wiring anything between pages and proto code, run `pnpm --filter @workspace/rcx-supervisor run check` (script is `check`, not `typecheck`) and confirm no errors mention files you touched.

**Baseline is now clean (July 2026):** both `pnpm --filter @workspace/rcx-supervisor run check` and root `pnpm run typecheck` exit 0. Any new error is a real regression.

**Duplicate-@types lesson:** rcx-supervisor is the only React 18 artifact in a React 19 workspace, so two `@types/react` versions must coexist. pnpm hoists an arbitrary one into `.pnpm/node_modules`, which lucide-react's d.ts resolves — fixed by tsconfig `paths` pinning `react`/`react-dom` to the artifact's local `node_modules/@types`. Keep that pin; removing it re-breaks ~110 ui/* files. Also keep `@types/node` on `catalog:` everywhere — a mismatched pin splits vite into two typed instances and breaks vite.config plugin types.

- rcx-supervisor is skipped by root typecheck entirely (no `typecheck` script, only `check`).
