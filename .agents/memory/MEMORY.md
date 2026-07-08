# Memory index

- [rcx-supervisor typecheck quirks](rcx-supervisor-typecheck.md) — proto tree excluded from tsc; baseline now clean; keep react/react-dom tsconfig paths pin and @types/node on catalog. importing `@/proto/...` from pages leaks it back in; baseline tsc already fails in shadcn ui files.
- [Playwright e2e setup](playwright-e2e-setup.md) — use Nix system chromium (downloaded browsers fail on NixOS), baseURL localhost:80, scope table clicks to rows, i18n labels are Title Case.
