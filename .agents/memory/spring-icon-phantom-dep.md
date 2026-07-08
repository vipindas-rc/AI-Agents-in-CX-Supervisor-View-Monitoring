---
name: Spring icon phantom dependency
description: Why importing from @ringcentral/spring-icon can fail to resolve in an artifact even though the package exists in node_modules.
---

In this pnpm workspace, `@ringcentral/spring-icon` can already be hoisted into `node_modules/.pnpm` (pulled in transitively by another workspace package, e.g. via `@ringcentral/spring-ui` internals or a sibling artifact) without being resolvable by Vite/esbuild in an artifact that never declared it.

**Why:** pnpm's strict node_modules linking means a package is only importable from a given workspace package if that package (or one of its declared deps) lists it. Seeing the package physically present under `.pnpm/` is not proof it is importable from every artifact — Vite will throw `Failed to resolve import` at dev-server pre-transform time even though `tsc`/the editor may not always catch it immediately.

**How to apply:** Before using a new icon/lib import in an artifact, check that artifact's own `package.json` for the dependency. If missing, run `pnpm add <pkg>@<version>` inside that artifact's directory (matching the version already used elsewhere in the repo) rather than assuming existing node_modules presence means it's usable.
