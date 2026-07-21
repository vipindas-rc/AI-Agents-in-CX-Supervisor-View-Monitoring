# RingScope (inspector + canvas) — setup runbook

> **AI coder reading this — yes, you (Replit agent included).** This README is a
> **runbook**. The user has uploaded this bundle and asked you to *follow all the
> steps*. Do the steps in the **Runbook** section below **in order**, top to
> bottom. When you finish, output the **Results report** (a Pass/Fail table
> covering every step). Don't skip ahead, and don't silently continue past a
> failed step.

**Bundle version: `3.4.0` (2026-07-20)** — see the `VERSION` file. If the project
already has an older copy installed, Step 2 handles the upgrade.

A drop-in dev/handoff inspector for React prototypes — DOM/fiber-aware element
picker, recursive Hierarchy tree, Spring-token reverse-lookup, 3D explode +
Figma-style x-ray panes, canvas-wide Spring-adherence and WCAG-AA scans, and a
zoomable design canvas to mount artboards on — with **Figma-style pages** and a
bottom-left mode/page switcher.

This folder is a vendored copy of `_shared/DesignCanvas/` **+ `_shared/CommentLayer/`**
from RingCentral's Spring UI prototype sandbox. The **comment layer is now
included** (drop-pin review threads — see "Enabling comments" below). Only two
project-internal dependencies are stubbed out — figma-bridge and the hard Spring
import — so it works in any React 18 + Vite + TypeScript app without Spring in
the dependency graph.

---

## How to run this runbook

- Do the **Runbook** steps below **in order**.
- Steps marked **🗣 ASK** need a decision from the user. Pause and ask, wait for
  the answer, then act. You may batch all 🗣 ASK questions into one message up
  front, then proceed once answered.
- Each step has a **✅ Pass when** criterion — an objective check you can verify.
- A step that genuinely doesn't apply (e.g. no heavy content to gate, or no
  prior install to upgrade) is **Skipped (N/A)**, not failed.
- When done, post the **Results report** table at the bottom. If anything is
  **❌ Fail**, call it out explicitly and stop before the steps that depend on it.

Status values for the report: **✅ Pass** · **❌ Fail** · **⏭️ Skipped (N/A)**.

---

## Runbook

### Step 1 — Preflight: confirm the bundle is intact
**Do:** Verify this bundle arrived complete. It should contain the bundled source files
(`DesignCanvas.jsx`, `DesignCanvas.d.ts`, `Inspector.tsx`, `ModeBar.tsx`,
`HoverOverlay.tsx`, `ExplodedView.tsx`, `XRayView.tsx`, `getAncestorScale.ts`),
this `README.md`, a `VERSION` file, and the skill folder
`design-canvas-screens/SKILL.md`. Read the new bundle's version from `VERSION`.
**✅ Pass when:** all of those files are present and you've noted the incoming
version. (Fail → ask the user to re-upload the zip; don't recreate missing files.)

### Step 2 — Detect & update any existing install
**Do:** The project may already have an older copy. **Clean replace is the safe
update path** — the vendored files here are pure library code; the user's own
integration (their `CanvasView.tsx`, the `?canvas` route, any `data-name`
attributes, the `keepNames` build config) lives *outside* this folder and must be
preserved.
1. **Find any existing install:**
   - vendored source: search `src/` for a folder containing `DesignCanvas.jsx`
     + `Inspector.tsx` (commonly `src/devtools/inspector-canvas/`).
   - the skill: `.local/secondary_skills/design-canvas-screens/`.
2. **Version-check:** if an existing `VERSION` file is present, compare it to the
   incoming version (Step 1). If it's the **same or newer**, tell the user it's
   already current and you may skip the replace (mark this step Skipped and jump
   to Step 6 to (re)author screens). If it's **older or absent**, upgrade:
3. **Remove the old library files + old skill** (NOT the user's integration):
   ```bash
   rm -rf src/devtools/inspector-canvas        # or wherever the old vendored folder is
   rm -rf .local/secondary_skills/design-canvas-screens
   ```
   Do **not** delete `CanvasView.tsx`, route wiring, `data-name` edits, or
   `vite.config.ts` — those stay.
4. ⚠️ **Note for later:** replacing the files resets the Spring-stub flip inside
   `Inspector.tsx`. The Spring step (Step 6) re-applies it, so it'll be handled.
**✅ Pass when:** no old vendored files or old skill folder remain (ready for a
clean drop-in) — **or** ⏭️ Skipped (N/A) if there was no prior install, or it was
already the same/newer version.

### Step 3 — Install the bundled skill
**Do:** Move the `design-canvas-screens/` skill folder into the project's
secondary-skills directory so you can load it as a skill:
```bash
mkdir -p .local/secondary_skills
mv design-canvas-screens .local/secondary_skills/
# result: .local/secondary_skills/design-canvas-screens/SKILL.md
```
(Run from wherever you unpacked the bundle; adjust the source path.) This skill
is the detailed recipe for authoring the canvas (Steps 7–12) — load/consult it
when you get there.
**✅ Pass when:** `.local/secondary_skills/design-canvas-screens/SKILL.md` exists
and the skill folder no longer sits inside the bundle directory.

### Step 4 — Place the source files
**Do:** Put the bundled source files (and the `VERSION` file) into a dev-tools folder,
e.g. `src/devtools/inspector-canvas/` (use the same path the old install used, if
any). Note the path — you'll import from `'<that-path>/DesignCanvas'`.
**✅ Pass when:** the 8 files + `VERSION` live in one folder under `src/` and
you've recorded the import path. (Imports between them are relative +
self-contained — nothing else is needed.)

### Step 5 — Build config: preserve component names
**Do:** Ensure the bundler doesn't mangle `function.name`, or the Hierarchy tree
shows gibberish (`RAe`/`SO`) instead of `Button`/`Card`. For Vite, add to
`vite.config.ts`:
```ts
export default defineConfig({
  plugins: [react()],
  esbuild: { keepNames: true },
});
```
(Non-Vite: find the equivalent "preserve function/class names" option.)
**✅ Pass when:** `esbuild: { keepNames: true }` (or the bundler equivalent) is
set in the build config. (Often already present on an upgrade — that's a Pass.)

### Step 6 — 🗣 ASK: Spring UI hookup
**Do:** Check whether Spring is in the project: `grep -l "@ringcentral/spring"
package.json` and look for `@ringcentral/spring-*` imports in `src/`.
- **If Spring IS present:** flip the stub at the top of `Inspector.tsx` — delete
  the two `const SpringUI/SpringIcon = {}` lines and uncomment the two
  `import * as Spring…` lines just below them. (This also re-applies the flip
  that a Step 2 upgrade reset.)
- **If Spring is NOT present:** ask the user **"Want me to install + wire Spring
  UI so the inspector can tag Spring components and icon tokens? Or leave it out
  (the inspector still works, components just show as generic React)?"** Act on
  their answer; declining is a Pass, not a Fail.
**✅ Pass when:** the Spring stub is flipped (Spring present/desired) **or**
deliberately left stubbed (user declined / no Spring). Record which.

### Step 7 — 🗣 ASK: which screens, and how to group them?
**Do:** Load the `design-canvas-screens` skill. Ask the user **"Which screens or
states do you want on the canvas?"** and **"One canvas surface, or multiple
switchable pages (e.g. one per feature/platform/flow)?"** Group related screens
into **sections**; wrap groups in **pages** (`DCPage`) if they chose multiple.
Pick a width×height per screen (mobile 375×812, desktop 1440×900, iPad 1024×768,
etc.). ⚠️ Tell them the page tradeoff: switching pages unmounts the old page, so
interactive state on it resets.
**✅ Pass when:** you have a confirmed list of screens, their sizes, and a
section/page grouping plan agreed with the user.

### Step 8 — 🗣 ASK: frozen or interactive?
**Do:** Ask the user **verbatim**: *"Should each artboard be a frozen snapshot of
one state, or interactive (clickable/navigable like the real app)?"*
- **Frozen:** drive the screen from `initial*` props so each artboard pins a
  state (lift state into props).
- **Interactive:** mount the component raw (`<App />`); leave its state alone.
- **Mixed** is fine — choose per artboard.
See the skill for the exact code recipes.
**✅ Pass when:** the frozen/interactive choice is captured for each
section/artboard.

### Step 9 — Author `CanvasView.tsx`
**Do:** Write `CanvasView.tsx` mounting the screens as artboards, following the
skill and the grouping/behavior decided in Steps 7–8. Use `<DesignCanvas
inspector>` → (optional `<DCPage>`) → `<DCSection>` → `<DCArtboard>`. Only direct
children at each level are walked. Make each screen fill its artboard (use
`100%`, not `100vw`/`100vh`). Give every `id`/page-`id` a stable, unique value.
(On an upgrade, an existing `CanvasView.tsx` usually still works as-is — review
it against any API notes and only edit if needed.)
**✅ Pass when:** `CanvasView.tsx` exists, type-checks/compiles, and mounts every
screen from Step 7 as a `DCArtboard`.

### Step 10 — Route to the canvas
**Do:** Gate the canvas behind `?canvas` at the app root (lightest option):
```tsx
const isCanvasMode = new URLSearchParams(window.location.search).has('canvas');
return isCanvasMode ? <CanvasView /> : <App />;
```
(Or a dedicated `/canvas` route if the project already has a router.) To review
on the **published** deployment, open `https://<your-app>/?canvas` and share that
link — reviewers land on the canvas and (comments on) can drop pins.
**✅ Pass when:** opening the app with `?canvas` renders `CanvasView` instead of
the normal app. (Already wired on an upgrade → Pass.)

### Step 11 — Gate heavy content (conditional)
**Do:** If any screen autoplays video, runs a canvas/WebGL/particles, a Lottie,
or a polling loop, gate it on `useArtboardActive()` so it pauses when offscreen
or zoomed out. Add `data-dc-allow-scroll` to any inner scroll area that must keep
its own scroll.
**✅ Pass when:** all heavy content is gated on `useArtboardActive()` — **or**
⏭️ Skipped (N/A) if there's no heavy content.

### Step 12 — 🗣 ASK / OFFER: annotate with `data-name`
**Do:** The Hierarchy tree reads `data-name` (fallback `data-layer`/`data-label`)
on host elements and shows it next to the tag, so a bare `<div>` reads as
`<div> Hero header`. Offer: **"Want me to add `data-name` attributes to your
structural elements so they show up as readable layer names in the inspector?"**
If yes, annotate structural wrappers (`div`/`section`/`main`/`aside`/`header`/
`nav`) with short 1–3 word labels; **skip** already-named components (Button,
Card…). Then summarize the diff for review. (On an upgrade, existing `data-name`
attributes are untouched — extend them, don't redo them.)
**✅ Pass when:** `data-name` labels added to structural wrappers and reviewed —
**or** ⏭️ Skipped (N/A) if the user declined.

### Step 13 — Verify it runs
**Do:** Start the dev server, open the app with `?canvas`. Confirm: artboards
render; the bottom-left bar appears (page switcher if paged); clicking **Dev**
opens the RingScope panel and clicking an element inside an artboard inspects it.
Check the browser console for errors.
**✅ Pass when:** the canvas renders all artboards, the inspector opens and
inspects an element, and there are no console errors from the bundle.

### Step 14 — Results report
**Do:** Post a table covering every step:

```
| #  | Step                          | Status        | Notes |
|----|-------------------------------|---------------|-------|
| 1  | Preflight                     | ✅ Pass       | 11 files present, incoming v2.0.0 |
| 2  | Detect & update old install   | ⏭️ Skipped    | no prior install (or: replaced v1.x) |
| 3  | Install skill                 | ✅ Pass       | .local/secondary_skills/design-canvas-screens/ |
| 4  | Place source files            | ✅ Pass       | src/devtools/inspector-canvas/ |
| 5  | Build config (keepNames)      | ✅ Pass       | added to vite.config.ts |
| 6  | Spring hookup                 | ✅ Pass       | stub flipped — Spring present |
| 7  | Screens + grouping            | ✅ Pass       | 5 screens, 2 pages |
| 8  | Frozen vs interactive         | ✅ Pass       | frozen |
| 9  | CanvasView.tsx                | ✅ Pass       | compiles |
| 10 | ?canvas route                 | ✅ Pass       | wired at App root |
| 11 | Heavy-content gating          | ⏭️ Skipped    | none present |
| 12 | data-name annotation          | ✅ Pass       | 12 wrappers labeled |
| 13 | Verify runs                   | ✅ Pass       | canvas + inspector OK, no errors |
```
Then give the user a one-line overall verdict and flag any ❌ Fail with what's
blocking it.
**✅ Pass when:** the report is posted with a status + note for all 13 prior
steps.

---

## Reference

Everything below is reference detail for the steps above. The
`design-canvas-screens` skill (installed in Step 3) is the fuller authoring
guide; this is the quick lookup.

### Components (from the bundle's `DesignCanvas` entry)

```
DesignCanvas   — the surface; pass `inspector` to mount RingScope + the Dev toggle
DCPage         — (optional) a switchable page grouping sections
DCSection      — a titled horizontal row of artboards
DCArtboard     — one fixed-size mounted screen
DCPostIt       — (optional) a floating sticky note
useArtboardActive() — hook; pause heavy content when an artboard is offscreen
```

Nesting rule: only **direct** `DCPage > DCSection > DCArtboard` (or `DCSection >
DCArtboard` when unpaged) children are walked. Don't wrap these markers in other
elements at the top level; put your own wrappers *inside* the `DCArtboard`.

### `<DesignCanvas inspector?>` `<DCPage>` `<DCSection>` `<DCArtboard>`

```tsx
<DesignCanvas
  inspector              // mounts RingScope + the Dev mode toggle. Drop for canvas-only.
  comments={{ canvasId: 'team:my-proto:main' }}  // review comments — ON by default; drop for inspector-only
  minScale={0.1}         // default 0.1
  maxScale={4}           // default 4
  minActiveScale={0.35}  // see useArtboardActive
>
  <DCPage id="page-id" title="Page title">    {/* optional — omit for a single surface */}
    <DCSection title="Title" subtitle="Optional subtitle" gap={48}>
      <DCArtboard id="unique-id" label="Artboard label" width={375} height={812}>
        {/* artboard content — make it fill 100% × 100% */}
      </DCArtboard>
    </DCSection>
  </DCPage>
</DesignCanvas>
```

- `id` values must be **stable + unique** — order persistence, page deep-links
  (`?page=<id>`), and the inspector's pan-to-element targeting all use them.
- A canvas with **no** `<DCPage>` children is "unpaged" (single surface, no page
  switcher). A `<DCPage>` with no sections renders a "Nothing here yet"
  placeholder.
- Section titles are inline-editable (one-session only, not persisted).
  Artboards drag-reorder within a section via the grip on their label row.

### Frozen vs interactive (Step 8 detail)

```tsx
// FROZEN — lift state into props so each artboard pins a state:
function Dashboard({ initialView = 'home' }) {
  const [view, setView] = useState(initialView);  // starts pinned per artboard
  // …
}
<DCArtboard id="empty" label="Empty"  width={375} height={812}><Dashboard initialView="empty"  /></DCArtboard>
<DCArtboard id="full"  label="Loaded" width={375} height={812}><Dashboard initialView="loaded" /></DCArtboard>

// INTERACTIVE — mount raw, leave state alone:
<DCArtboard id="flow" label="Live flow" width={375} height={812}><App /></DCArtboard>
```

### `useArtboardActive()` (Step 11)

Returns `true` when the enclosing artboard is on-screen AND zoom is above
`minActiveScale`; `true` outside a DesignCanvas (so it's safe anywhere).

```tsx
import { useArtboardActive } from './inspector-canvas/DesignCanvas';
function HeroVideo() {
  const active = useArtboardActive();
  return <video autoPlay={active} src="…" />;
}
```

### `<DCPostIt>`

Floating sticky note on the canvas background. Props: `top`/`left`/`right`/
`bottom` (number or CSS string), `width` (default 180), `rotate` (default -2°).

### `data-dc-allow-scroll`

Put on any element inside an artboard whose own scroll you want to keep
(long lists, modal bodies) — otherwise the canvas eats the wheel event.

### The bottom-left bar (ModeBar)

Mounts when `inspector` is set, or whenever the canvas is paged. Shows: the
**page switcher** (inert chip with one page; dropdown with several; updates
`?page=`), **Cursor** (play with prototypes, pan/zoom), and **Dev** (inspect —
only when `inspector` is set).

### What the inspector does (so you can demo it in Step 13)

Click **Dev**, then click any element inside an artboard:
- **Preview** — scaled clone with **explode** (3D) and **x-ray** (wireframe) panes.
- **Hierarchy** — recursive layers from the artboard root to the selection;
  `data-name`/`data-layer`/`data-label` shows next to the tag.
- **Box model** — padding/border/margin, Tok/Px toggle (Spring spacing tokens vs px).
- **Styles** — color/bg/border/shadow/typography, Tok/Hex/Var toggle.
- **Accessibility** — contrast ratio composited onto the *effective* background;
  AA/AAA badges.
- **Web dev** — source `vscode://` link, generated JSX, className, props.
- **Agent handoff** ("Copy for agent") — serializes the selection into a
  paste-able spec for another AI coder: component chain, resolved styles,
  Spring-token mapping, off-token flags, embedded SVG geometry, forced
  pseudo-states, and any authored `data-interaction` behavior notes. A text
  export (a Figma-MCP analogue for cross-stack handoff), not an image.
- **Spring adherence scan** — flags computed values that don't map to a Spring
  token (most useful with Spring wired in). Click an occurrence to pan/zoom to it.
- **Accessibility scan** — flags text/bg pairs failing WCAG AA.

Esc exits inspect mode; ⊗ closes the panel.

### `data-interaction` — behavior notes for the agent handoff

The handoff serializes *rendered truth* (structure, tokens, forced pseudo-states,
CSS motion) but not *behavior* — scroll-linked heights, snap points, gesture
handoff, "tab follows scroll", decorative-in-prototype fields all live in JS and
app state. Author those as `data-interaction` on the element that implements them
(the behavioral sibling of `data-name`); React passes the attribute through, and
the serializer emits it in place as `<!-- ⚡ interaction: … -->`, adding a
reading-notes bullet that tells the receiving agent the notes ARE the spec. Use
sparingly and precisely. See the `design-canvas-screens` skill (§7) for the recipe
and a reference implementation.

```tsx
<div data-name="Reactions sheet"
     data-interaction="Starts at 75% height; drag up past the status row snaps to 100%; drag below 75% dismisses.">
```

### Files

Everything lands in one flat folder. Canvas/inspector core:
```
DesignCanvas.jsx     — canvas: pages, sections, artboards, post-its, focus, ModeBar
DesignCanvas.d.ts    — TS types for DesignCanvas (jsx → tsx consumers)
Inspector.tsx        — the inspector panel + overlays (a.k.a. RingScope)
ModeBar.tsx          — bottom-left zoom + page switcher + Cursor/Comment/Dev toggle
HoverOverlay.tsx     — shared hover-highlight overlay (used by inspect mode)
ExplodedView.tsx     — 3D-explode sibling pane
XRayView.tsx         — Figma-style wireframe x-ray sibling pane
getAncestorScale.ts  — undoes the canvas transform when reading getBoundingClientRect
muteClonedMedia.ts   — mutes cloned <video>/<audio> in the inspector clones
```
Comment layer (drop-pin review threads — used when you pass the `comments` prop):
```
CommentLayer.tsx     — orchestrator: comment mode, drop-to-pin, draft/thread state
CommentsSidebar.tsx  — right-hand list of threads (newest-first, unread badges)
PinLayer.tsx         — pins ride the canvas transform (rAF, no per-frame React)
Thread.tsx / Composer.tsx / MentionTextarea.tsx / mentions.tsx / ui.tsx — thread UI
useComments.ts       — list + poll + optimistic merge + read state
mockClient.ts        — in-memory store (devMode: true) — zero backend, fully usable
networkClient.ts     — hosted comments-service client (devMode off / omitted)
selector.ts / pinAnchor.ts / pan.ts — durable element anchoring + pan-to-pin
types.ts             — Comment/Thread/CommentsClient/CommentsConfig + isThreadUnread
capturePreview.ts / PreviewImage.tsx — dormant snapshot preview (imported by nothing)
index.ts             — barrel
```
Plus the bundle-only files:
```
VERSION              — bundle version marker (used by the Step 2 upgrade check)
README.md            — this runbook
design-canvas-screens/SKILL.md — canvas-authoring skill → move to .local/secondary_skills/ (Step 3)
```

### Comments (on by default)

The skill wires drop-pin review comments into `CanvasView` by default via the
`comments` prop on `<DesignCanvas>`. Keep them on unless the user wants an
inspector-only canvas (drop the prop → no Comment tab; the ModeBar shows just
Cursor / Dev).

```tsx
<DesignCanvas inspector comments={{ canvasId: 'team:my-proto:main' }}>
  …pages / sections / artboards…
</DesignCanvas>
```

The default hosted service + RC sign-in are built in (set `serviceUrl` only to
override). The hosted client scopes comments by the page's **public hostname at
runtime**, so each *published* deployment automatically gets its own comment
space; in local dev / preview it falls back to the explicit `canvasId` — a
separate throwaway canvas from prod. **Net: the comments a team actually shares
live on the published URL** (opened with `?canvas`); dev is a separate canvas.

Pick a **stable** `canvasId` — it's a permanent comment anchor, so changing it
later silently orphans every thread on it. For a zero-backend local demo, swap to
`comments={{ canvasId, devMode: true }}` (in-memory mock — fully clickable but
ephemeral, lost on reload).

### Gotchas

1. **Portals into the canvas**: if a popover/tooltip portals into a container
   *inside* an artboard, the inspector handles it via the `reachedParent` guard
   in `getChildSummary` — **don't remove that guard** if editing `Inspector.tsx`.
2. **Mangled names** (`RAe`/`SO` in the tree): set `esbuild.keepNames: true`
   (the Build-config step).
3. **`inspector` prop required** for RingScope + the Dev toggle. (The page
   switcher still shows if the canvas is paged.)
4. **React 18 only** (tested). React 19 may need tweaks to the `__reactFiber$…`
   introspection.
5. **Heavy content** with 10+ artboards: gate on `useArtboardActive()` (the
   heavy-content step) or the canvas gets sluggish at low zoom.
6. **Page state resets on switch**: inactive pages are fully unmounted —
   deliberate (cheap idle pages), but interactive state on a page you leave is lost.
7. **Upgrades reset the Spring flip**: clean-replacing the files (Step 2) reverts
   `Inspector.tsx` to the stub. The Spring step re-applies it — don't forget it.

### Not included

- The `figma-bridge` capture — stubbed; the "Figma capture" panel section is
  disabled.
- A demo app — wire `<DesignCanvas>` into your own routing.
- Tests — they live in the source repo.

— Generated from the canonical source on demand. If the inspector seems out of
date, ask whoever sent this to regenerate the zip.
