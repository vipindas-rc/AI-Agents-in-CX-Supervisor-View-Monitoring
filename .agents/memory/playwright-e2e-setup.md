---
name: Playwright e2e setup on this workspace
description: How to run browser e2e tests here (NixOS chromium, shared proxy baseURL, selector pitfalls in the supervisor tables)
---

# Playwright e2e on this workspace

- Suite lives at `e2e/*.spec.ts` with root `playwright.config.ts`; run via `pnpm run test:e2e` (app must be up; tests hit the shared proxy at `http://localhost:80`).
- **Why system chromium:** Playwright's downloaded browser builds don't run on NixOS (missing shared libs). The config resolves the Nix `chromium` (installed as a system dependency) via `which chromium`; override with `PLAYWRIGHT_CHROMIUM_PATH`.
- `installLanguagePackages` failed for `@playwright/test`; plain `pnpm add -D -w` worked.
- **How to apply — selector pitfalls in the supervisor tables:**
  - Row action buttons (Monitor/Coach/Barge/More) exist in every row, not only on hover. A page-wide "first visible Monitor button" click hits the wrong (voice) row. Always scope inside `getByRole("row").filter({ hasText: agentName })`.
  - Vendored eag components humanize i18n keys, producing Title Case labels (e.g. menuitem "Update Agent State"). Match with case-insensitive regex, not exact sentence case.
- Full 4-test suite takes ~1 min; a plain 120s bash timeout can be too tight with retries — run in background or per-test with `--retries=0`.
- Background runs: a `nohup ... &` job dies (and its log vanishes) when the bash tool session ends. Run detached AND wait in the same command: `setsid nohup pnpm run test:e2e ... > /tmp/x.log 2>&1 < /dev/null & disown; sleep 100; cat /tmp/x.log`.
- `pnpm run test:e2e -- file.spec.ts` runs the WHOLE e2e dir (the `--` passthrough is ignored as a filter); that's fine — treat it as a full regression run.
