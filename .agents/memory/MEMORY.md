# Memory index

- [rcx-supervisor typecheck quirks](rcx-supervisor-typecheck.md) — proto tree excluded from tsc; baseline now clean; keep react/react-dom tsconfig paths pin and @types/node on catalog. importing `@/proto/...` from pages leaks it back in; baseline tsc already fails in shadcn ui files.
- [Playwright e2e setup](playwright-e2e-setup.md) — use Nix system chromium (downloaded browsers fail on NixOS), baseURL localhost:80, scope table clicks to rows, i18n labels are Title Case.
- [Spring icon phantom dependency](spring-icon-phantom-dep.md) — `@ringcentral/spring-icon` can be present in node_modules but unresolvable at build time if not declared in the artifact's own package.json.
- [E2e vs mock seed drift](e2e-mock-seed-drift.md) — re-run e2e after merges touching supervisorMock seed pools; Pending Inactive is runtime-only now.
- [Proto component wrapper pattern](proto-component-wrapper-pattern.md) — to use a real proto component in the tsc-checked page: wrap it (with theme providers) inside proto, re-export via @proto barrel, mirror type in proto-module.d.ts.
- [Monitor window toast overwrite](monitor-window-toast-overwrite.md) — completion toasts before onClose get overwritten by host's "Stopped monitoring" flash; re-emit via setTimeout.
- [Figma MCP asset extraction](figma-mcp-asset-extraction.md) — downloadAssets is single-nodeId; exported SVGs embed parent-frame clutter, extract the balanced icon `<g>` + defs.
