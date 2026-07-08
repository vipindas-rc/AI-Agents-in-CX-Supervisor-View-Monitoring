---
name: E2e vs mock seed drift
description: Why the Playwright suite breaks after task merges that touch supervisorMock seed data
---
Rule: after any merged task that edits `supervisorMock.ts` seed pools (HUMAN_STATES/AIR_STATES), re-run `pnpm run test:e2e` — the spec hardcodes seeded agent states by index.
**Why:** a merge silently removed "Pending Inactive" from the AirPro seed pool (it is now runtime-only, ~3s drain after switching an engaged AirPro agent off), which broke 2 of 4 e2e tests that assumed an agent seeds in that state.
**How to apply:** disabled-Take-over coverage cannot be asserted e2e without a drain-duration test seam; keep e2e on stable seed invariants only. Also: run playwright with output redirected to a file — bare runs in the sandbox can exit -1 with no output.
