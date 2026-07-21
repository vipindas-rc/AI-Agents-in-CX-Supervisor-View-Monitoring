// Inspector.tsx — click-to-inspect overlay for DesignCanvas artboards.
//
// While the Inspect toggle is on:
//   • hover an element inside an artboard → blue outline
//   • click → captures the host DOM node you clicked and opens the side panel
//   • the panel shows ONE selected node at a time. The Hierarchy tree is the
//     primary navigation — click any row to re-select that fiber. The kind of
//     thing you've selected (Element / Spring / Component / Artboard) drives
//     which body sections render (Element shows tag + text + attrs; Component
//     and Spring show JSX + props + source + Figma capture).
//   • "↑ parent" walks one row up the Hierarchy tree.
//
// Implementation note: we walk React's internal Fiber tree via the
// `__reactFiber$…` property React attaches to DOM nodes in dev. This is
// unofficial API (React DevTools uses the same trick) and only works in
// development builds — production strips component names. Spring instances are
// detected by *object identity* against the spring-ui module exports, not by
// component name, so a local <Button> won't be misclassified as Spring's Button.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
// ── Spring UI hookup ──────────────────────────────────────────────
// Stubbed by default so this bundle compiles in any React app without
// @ringcentral/spring-* in the dependency graph. If the host project HAS
// Spring installed, delete the two stub lines and uncomment the imports
// below — the Hierarchy tree will then tag Spring components and the
// inspector will reverse-look-up Spring icon tokens. See the README's
// "Setup interview → Spring UI" step.
import * as SpringUI from '@ringcentral/spring-ui';
import * as SpringIcon from '@ringcentral/spring-icon';

// figma-bridge capture is not shipped in this bundle. The "Figma capture"
// panel section is disabled (rendered behind `false`), so these are just
// placeholders to keep the file type-checking.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CaptureResult = any;
const captureForFigma = (_fiber: unknown): CaptureResult => {
  throw new Error('figma-bridge capture is not included in this bundle');
};
import { ExplodedView } from './ExplodedView';
import { XRayView } from './XRayView';
import { getAncestorScale } from './getAncestorScale';
import { muteClonedMedia } from './muteClonedMedia';
import { setForcedStates as applyForcedStates, type PseudoState } from './forceState';
import {
  serializeSelection,
  auditStyleCoverage,
  type HandoffResolvers,
  type ComponentChainEntry,
} from './agentHandoff';
import { HoverOverlay } from './HoverOverlay';
import type { CanvasMode } from './ModeBar';

type Fiber = {
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  type: any;
  memoizedProps: Record<string, any> | null;
  stateNode: any;
  _debugSource?: { fileName: string; lineNumber: number; columnNumber?: number };
  // Dev-only: the fiber whose JSX authored this element. Set by the
  // `_jsxDEV` runtime; null for fibers whose elements came from compiled
  // library code that uses the production `jsx()` runtime (e.g. Spring's
  // internal renders). Used by `rendersOwnDom` to find the boundary between
  // a component's own render output and the children prop it received.
  _debugOwner?: Fiber | null;
};

const HOST_TAGS = new Set([
  'div', 'span', 'p', 'a', 'button', 'input', 'textarea', 'select',
  'ul', 'ol', 'li', 'section', 'article', 'header', 'footer', 'nav',
  'main', 'aside', 'img', 'svg', 'path', 'circle', 'rect', 'g', 'h1',
  'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'form', 'pre', 'code',
]);

// Spring identity set. Built once at module load: every exported value from
// `@ringcentral/spring-ui` is registered as a "Spring type" reference. We
// later compare `fiber.type` against this set by identity (`has`), so a local
// component named `Button` won't shadow Spring's `Button`.
const SPRING_TYPES = new WeakSet<object>();
for (const v of Object.values(SpringUI as Record<string, unknown>)) {
  if (v && (typeof v === 'function' || typeof v === 'object')) {
    try {
      SPRING_TYPES.add(v as object);
    } catch {
      // primitives / frozen exotic values — ignore
    }
  }
}

// Spring component name map: ref → exported name. Spring components are
// `memo(forwardRef(fn))` exports that ship no `displayName`, so
// `getComponentName` returns null (or minified garbage in prod). The module
// export KEY is the public API and is preserved by bundlers, so this gives a
// stable name back from the type reference. Built the same way as
// SPRING_TYPES; used to label Spring rows in the Hierarchy tree.
const SPRING_NAMES = new WeakMap<object, string>();
for (const [name, v] of Object.entries(SpringUI as Record<string, unknown>)) {
  if (v && (typeof v === 'function' || typeof v === 'object')) {
    try {
      SPRING_NAMES.set(v as object, name);
    } catch {
      // primitives / frozen exotic values — ignore
    }
  }
}

// Spring-icon identity map: ref → exported name. Built the same way as
// SPRING_TYPES but we need the name back too (the import token IS the
// handoff value for icons), so this is a Map keyed by component reference.
const SPRING_ICON_NAMES = new WeakMap<object, string>();
for (const [name, v] of Object.entries(SpringIcon as Record<string, unknown>)) {
  if (v && (typeof v === 'function' || typeof v === 'object')) {
    try {
      SPRING_ICON_NAMES.set(v as object, name);
    } catch {
      // ignore frozen primitives
    }
  }
}

function getFiberFromDom(el: Element): Fiber | null {
  const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
  return key ? ((el as unknown) as Record<string, Fiber>)[key] : null;
}

// Alternate-aware fiber identity. React keeps TWO alternating fiber objects
// per node (current ↔ workInProgress) and flips between them on every real
// re-render, while the `__reactFiber$` pointer stamped on a DOM element is set
// once at mount and never re-stamped. Any exact `===` comparison between
// fibers captured at different times can therefore miss by one generation —
// see [feedback_spring_multi_fiber_host]. Every fiber-identity check in this
// file must go through this helper.
function fiberMatch(
  a: Fiber | null | undefined,
  b: Fiber | null | undefined,
): boolean {
  if (!a || !b) return false;
  return a === b || a === b.alternate || a.alternate === b;
}

// Inherited standard properties a detached clone must carry to render
// faithfully: icon glyphs paint `fill: currentColor` (→ `color`), text runs
// inherit their font. Inlining the source's COMPUTED values is exact — the
// original inherited precisely these.
const CLONE_INHERITED_PROPS = [
  'color',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
] as const;

// Copy the source element's COMPUTED CSS custom properties (`--*`) plus the
// key inherited properties above onto a clone as inline styles. Clones
// rendered outside their original ancestor chain (preview thumbnail, exploded
// scene — both portaled to body) lose anything supplied by ancestors: var()
// definitions (e.g. Spring Squircle's `--sui-squircle-bg-color` set inline on
// the button root — the cloned shape's fill falls back to dark) AND inherited
// values (a grey icon renders panel-white because `currentColor` re-resolves).
// (Chromium enumerates custom properties in computed style; on engines that
// don't, the var pass is a harmless no-op.)
export function inlineCustomProperties(
  source: Element,
  target: HTMLElement | SVGElement,
): void {
  let cs: CSSStyleDeclaration;
  try {
    cs = getComputedStyle(source);
  } catch {
    return;
  }
  for (let i = 0; i < cs.length; i++) {
    const prop = cs.item(i);
    if (prop.startsWith('--')) {
      target.style.setProperty(prop, cs.getPropertyValue(prop));
    }
  }
  for (const prop of CLONE_INHERITED_PROPS) {
    target.style.setProperty(prop, cs.getPropertyValue(prop));
  }
}

// Stable per-Element id — used to key ladder-rung expansion state, where the
// row has no DOM element of its own (several component rungs share one host).
let ELEMENT_ID_SEQ = 1;
const ELEMENT_IDS = new WeakMap<Element, number>();
function elementKey(el: Element): number {
  let id = ELEMENT_IDS.get(el);
  if (!id) {
    id = ELEMENT_ID_SEQ++;
    ELEMENT_IDS.set(el, id);
  }
  return id;
}

function getComponentName(type: any): string | null {
  if (!type) return null;
  if (typeof type === 'string') return null;
  if (typeof type === 'function') return type.displayName || type.name || null;
  // forwardRef
  if (type.$$typeof && type.render) {
    return (
      type.displayName ||
      type.render.displayName ||
      type.render.name ||
      null
    );
  }
  // memo
  if (type.$$typeof && type.type) {
    return type.displayName || getComponentName(type.type);
  }
  return null;
}

function isInterestingName(name: string | null): boolean {
  if (!name) return false;
  if (!/^[A-Z]/.test(name)) return false;
  // Plumbing / passthrough wrappers — filtered by NAME (not by `_debugOwner`)
  // so production builds get the same clean Hierarchy tree as dev. In
  // production React strips `_debugOwner`, so `rendersOwnDom` defaults to
  // true for every fiber → every Spring/MUI context provider, every
  // MotionConfig, every ScopedThemeProvider becomes a row, and the tree
  // explodes for deep components (e.g. KioskShell on the rooms canvas →
  // tab hangs hard enough that Chrome kills it).
  //
  // Suffix-matching catches everything by convention (`ThemeProvider`,
  // `SuiModeProvider`, `RouterContext`, `*Consumer`); the exact-match list
  // is for built-ins and named wrappers that don't follow the suffix
  // convention.
  if (
    name.endsWith('Provider') ||
    name.endsWith('Context') ||
    name.endsWith('Consumer')
  ) {
    return false;
  }
  if (
    name === 'Fragment' ||
    name === 'ForwardRef' ||
    name === 'Memo' ||
    name === 'StrictMode' ||
    name === 'Suspense' ||
    name === 'Profiler' ||
    name === 'MotionConfig' ||
    name === 'LazyMotion' ||
    name === 'AnimatePresence' ||
    name === 'Reorder' ||
    name === 'DCViewport' ||
    name === 'DCArtboardFrame' ||
    name === 'DCEditable' ||
    name === 'DesignCanvas' ||
    name === 'DCSection' ||
    name === 'Inspector' ||
    name === 'InspectorPanel'
  ) {
    return false;
  }
  return true;
}

function isSpringType(type: any): boolean {
  if (!type) return false;
  if (typeof type !== 'function' && typeof type !== 'object') return false;
  return SPRING_TYPES.has(type as object);
}

// First host (DOM) element rendered by a component fiber. Used when the user
// walks up to a parent component — we re-bind the "selection root" to that
// component's outermost rendered DOM node so styles/tokens read from the right
// place.
// Accepts SVG hosts too (icons, vectors) — SVGElement isn't HTMLElement, but
// SVG hosts are valid selection targets and every downstream consumer only
// calls APIs that exist on both (see buildSelectedFromHost). Cast to keep the
// rest of the inspector's typing simple, matching that convention.
function findFirstHostElement(fiber: Fiber | null): HTMLElement | null {
  if (!fiber) return null;
  if (fiber.stateNode instanceof Element) return fiber.stateNode as HTMLElement;
  let child: Fiber | null = fiber.child;
  while (child) {
    const found = findFirstHostElement(child);
    if (found) return found;
    child = child.sibling;
  }
  return null;
}

// Does this fiber's component render any DOM of its own — or is it a pure
// context wrapper that just passes children through?
//
// Why we need this: components like `<ThemeProvider>`, `<SuiModeProvider>`,
// `<MotionConfig>`, any custom Provider that just returns `{children}`, all
// produce zero DOM. If the inspector treats them as selectable rows, the
// box-model / preview / styles end up reading from whichever inner element
// `findFirstHostElement` happens to land on — totally misleading.
//
// How: walk the fiber subtree along children authored by the component itself
// (or by compiled-library code one level inside it). The moment we cross into
// a fiber authored by EXTERNAL code (i.e., the `children` prop), we've left
// the component's own render output. Track this via `_debugOwner`:
//   • `null`            → compiled jsx() call. Treat as part of our chain
//                          (Spring's internal renders end up here).
//   • `=== ourFiber`    → directly authored by our component. Definitely ours.
//   • `descendant of ourFiber via _debugOwner chain` → authored by something
//                          OUR component rendered. Still ours.
//   • anything else     → authored by the caller (children prop). Stop.
//
// Dev-only (production strips `_debugOwner`). The Inspector itself is dev-
// only, so this is fine; if `_debugOwner` is missing across the board we
// fall back to "renders DOM = true" so nothing gets filtered incorrectly.
const RENDERS_OWN_DOM_CACHE = new WeakMap<Fiber, boolean>();
function rendersOwnDom(fiber: Fiber): boolean {
  const cached = RENDERS_OWN_DOM_CACHE.get(fiber);
  if (cached !== undefined) return cached;

  // Host fibers always render their own DOM (they ARE DOM).
  if (fiber.stateNode instanceof Element) {
    RENDERS_OWN_DOM_CACHE.set(fiber, true);
    return true;
  }

  const result = walkForOwnDom(fiber);
  RENDERS_OWN_DOM_CACHE.set(fiber, result);
  return result;
}

function walkForOwnDom(rootFiber: Fiber): boolean {
  const stack: Fiber[] = [];
  if (rootFiber.child) stack.push(rootFiber.child);
  let crossedBoundary = false;
  let visited = 0;

  while (stack.length && visited < 200) {
    const f = stack.pop()!;
    visited++;

    const ownedByUs = isOwnedTransitively(f, rootFiber);

    // Sibling at the same level continues whether or not THIS branch is ours
    // — push it before deciding to descend.
    if (f.sibling) stack.push(f.sibling);

    if (!ownedByUs) {
      crossedBoundary = true;
      continue; // don't descend into the children prop
    }
    if (f.stateNode instanceof Element) return true;
    if (f.child) stack.push(f.child);
  }

  // If we never crossed into the children-prop boundary AND never saw any
  // host, we're probably in production (no _debugOwner anywhere) or the tree
  // is degenerate. Be conservative: assume it renders DOM so we don't hide
  // legitimate components.
  return crossedBoundary ? false : true;
}

function isOwnedTransitively(f: Fiber, root: Fiber): boolean {
  // `null` _debugOwner usually means compiled-library jsx() — treat as ours.
  // This covers Spring's internal ContextProvider/ModeProvider/MotionConfig
  // chain inside <ThemeProvider>.
  const owner = f._debugOwner;
  if (owner == null) return true;
  if (fiberMatch(owner, root)) return true;
  // Anything our root authored, anything THAT authored, etc. — walk the
  // ownership chain back to root. Identity via fiberMatch: the owner chain can
  // reference either generation of an alternate pair.
  let cur: Fiber | null | undefined = owner;
  let hops = 0;
  while (cur && hops < 12) {
    if (fiberMatch(cur, root)) return true;
    cur = cur._debugOwner;
    hops++;
  }
  return false;
}

// Ancestry — used by the hierarchy diagram. Walks the fiber tree up from a
// selected host element, collecting each user component + Spring instance
// along the way, and stops at the DesignCanvas artboard boundary so we never
// surface the canvas chrome itself.

type AncestryKind = 'element' | 'spring' | 'user' | 'artboard';
type AncestryNode = {
  // Optional: DOM nodes React didn't author (no `__reactFiber$`) still get a
  // row, identified purely by `dom`. Present for buildAncestry chain nodes and
  // most getChildSummary rows; absent only for fiber-less DOM wrappers.
  fiber?: Fiber;
  name: string;
  kind: AncestryKind;
  // The authoritative DOM host for this row, when known. getChildSummary walks
  // the real DOM, so it can stamp the exact element here — more reliable than
  // re-deriving via findFirstHostElement, which returns null for SVG
  // (SVGElement isn't HTMLElement) and the wrong host for multi-host wrappers
  // like framer-motion. It is also the row's IDENTITY for expand/select state
  // (fiber is the wrong key: one host can back several fibers, and several
  // sibling hosts can share one component fiber). hostFor() prefers this.
  dom?: Element;
  // Component "ladder" above this element, outermost first — every interesting
  // component fiber between this host and its parent boundary. These are
  // components that share this exact DOM host (they render no DOM of their
  // own), e.g. StatusTile → Button → <button>. The tree renders each as a
  // collapsible rung above the element row.
  chain?: { fiber: Fiber; name: string; kind: AncestryKind }[];
};

const ANCESTRY_STOP_NAMES = new Set(['DCArtboardFrame', 'DCSection']);
const ANCESTRY_MAX_DEPTH = 12;

function inferKind(fiber: Fiber): AncestryKind {
  if (typeof fiber.type === 'string') return 'element';
  const name = getComponentName(fiber.type);
  if (name && ANCESTRY_STOP_NAMES.has(name)) return 'artboard';
  if (isSpringType(fiber.type)) return 'spring';
  return 'user';
}

// The authored layer label on a host element — `data-name` (and a couple of
// common alternates) so structural divs can self-identify in the layers list.
function layerLabel(node: Element | null): string | null {
  if (!node) return null;
  return (
    node.getAttribute('data-name') ||
    node.getAttribute('data-layer') ||
    node.getAttribute('data-label')
  );
}

// Component name that survives Spring's nameless memo(forwardRef) exports and
// production minification: prefer the authoritative export-name map for Spring
// types, fall back to React's name resolution for everyone else. This is what
// lets the Hierarchy tree classify Spring components by identity even though
// `getComponentName` can't read a name off them.
function springAwareName(type: any): string | null {
  if (isSpringType(type)) return SPRING_NAMES.get(type) ?? getComponentName(type);
  return getComponentName(type);
}

// Hierarchy row label for a host element. "<div> hero" is way more useful than
// five unlabeled <div> rows in a row.
function formatHostName(node: Element | null, tag: string): string {
  const label = layerLabel(node);
  return label ? `<${tag}> ${label}` : `<${tag}>`;
}

// Append a host's authored layer label to a component row name, so a Spring or
// user-component row keeps the naming convention too: "Alert · CRC alert".
// Suppressed when the label just echoes the component name (a common pattern
// where `data-name` mirrors the component) so we don't render "Foo · Foo".
function appendLayerLabel(baseName: string, host: Element | null): string {
  const label = layerLabel(host);
  return label && label !== baseName ? `${baseName} · ${label}` : baseName;
}

function nodeNameFor(fiber: Fiber, kind: AncestryKind): string {
  if (kind === 'element') {
    const tag = typeof fiber.type === 'string' ? fiber.type : 'node';
    const node = fiber.stateNode instanceof HTMLElement ? fiber.stateNode : null;
    return formatHostName(node, tag);
  }
  if (kind === 'artboard') return 'Artboard';
  return springAwareName(fiber.type) ?? 'unknown';
}

function buildAncestry(startFiber: Fiber): AncestryNode[] {
  const out: AncestryNode[] = [];
  const startKind = inferKind(startFiber);
  out.push({
    fiber: startFiber,
    name: nodeNameFor(startFiber, startKind),
    kind: startKind,
  });

  // If we started at the artboard there's nowhere to go.
  if (startKind === 'artboard') return out;

  let cur: Fiber | null = startFiber.return;
  let added = 0;
  while (cur && added < ANCESTRY_MAX_DEPTH) {
    // Stop-name check uses the raw React name — DCArtboardFrame / DCSection are
    // our own components, whose names are always present.
    const rawName = getComponentName(cur.type);
    if (rawName && ANCESTRY_STOP_NAMES.has(rawName)) {
      out.push({ fiber: cur, name: 'Artboard', kind: 'artboard' });
      break;
    }
    const name = springAwareName(cur.type);
    if (isInterestingName(name) && rendersOwnDom(cur)) {
      const kind: AncestryKind = isSpringType(cur.type) ? 'spring' : 'user';
      out.push({ fiber: cur, name: name!, kind });
      added++;
    }
    cur = cur.return;
  }
  return out;
}

function formatPropValue(value: any): string {
  if (value === undefined) return '{undefined}';
  if (value === null) return '{null}';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') return `{${value}}`;
  if (typeof value === 'boolean') return value ? '' : '{false}';
  if (typeof value === 'function') return '{() => …}';
  if (Array.isArray(value)) return '{[…]}';
  if (typeof value === 'object') {
    if (value.$$typeof) return '{<…/>}';
    return '{…}';
  }
  return `{${String(value)}}`;
}

// Render a component's `children` prop as JSX body text. We can faithfully
// inline primitives (a button's "Get started" label, a number) and arrays of
// them; for nested element children we can't reconstruct the subtree here, so
// we return null and the caller drops in a copy-safe `{/* … */}` placeholder.
// (The full subtree is browsable in the Hierarchy tree.)
function formatChildren(children: any): string | null {
  if (children == null || children === false || children === true) return null;
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    const parts: string[] = [];
    for (const c of children) {
      if (c == null || c === false || c === true) continue;
      if (typeof c === 'string') parts.push(c);
      else if (typeof c === 'number') parts.push(String(c));
      else return null; // a non-primitive in the mix — bail to placeholder
    }
    const joined = parts.join('');
    return joined.length > 0 ? joined : null;
  }
  return null; // a single React element / object
}

function formatJSX(name: string, props: Record<string, any>): string {
  const skip = new Set(['children', 'key', 'ref']);
  const entries = Object.entries(props).filter(([k]) => !skip.has(k));

  const formatted = entries.map(([k, v]) => {
    const val = formatPropValue(v);
    return val === '' ? k : `${k}=${val}`;
  });

  const hasChildren =
    props.children !== undefined &&
    props.children !== null &&
    props.children !== false;
  // Real text when we can render it; otherwise a copy-safe placeholder so the
  // snippet pastes without a syntax error (a bare `…` does not).
  const body = hasChildren ? formatChildren(props.children) ?? '{/* … */}' : '';
  const bodyInline = !body.includes('\n') && body.length <= 40;

  // No attrs.
  if (formatted.length === 0) {
    if (!hasChildren) return `<${name} />`;
    return bodyInline
      ? `<${name}>${body}</${name}>`
      : `<${name}>\n  ${body}\n</${name}>`;
  }

  // Attrs fit on one line.
  const inline = formatted.join(' ');
  if (inline.length <= 60) {
    if (!hasChildren) return `<${name} ${inline} />`;
    return bodyInline && inline.length + body.length <= 56
      ? `<${name} ${inline}>${body}</${name}>`
      : `<${name} ${inline}>\n  ${body}\n</${name}>`;
  }

  // Attrs wrap one per line.
  return [
    `<${name}`,
    ...formatted.map((p) => `  ${p}`),
    hasChildren ? `>` : `/>`,
    ...(hasChildren ? [`  ${body}`, `</${name}>`] : []),
  ].join('\n');
}

function shortenPath(p: string): string {
  const i = p.indexOf('/projects/');
  return i >= 0 ? p.slice(i + 1) : p;
}

// Tailwind utilities under `text-*` and `border-*` that are NOT color tokens.
// Used to filter token candidates so we don't show `text-center` as a color.
const NON_COLOR_TEXT_SUFFIXES = new Set([
  'left', 'center', 'right', 'justify', 'start', 'end',
  'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl',
  'wrap', 'nowrap', 'balance', 'pretty',
  'ellipsis', 'clip',
  'opacity', 'shadow',
]);
const NON_COLOR_BORDER_FIRSTSEG = new Set([
  '0', '1', '2', '4', '8',
  't', 'r', 'b', 'l', 'x', 'y',
  'solid', 'dashed', 'dotted', 'double', 'hidden', 'none',
  'separate', 'collapse',
]);

type StyleTokens = {
  typography: string[];
  textColor: string[];
  bgColor: string[];
  borderColor: string[];
};

type ResolvedStyles = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  // True if any side has a non-zero border-width. Used to suppress the Border
  // row when Tailwind `border-*` color classes are set without an actual
  // `border` (or `border-N`) width class — the color exists in computed style
  // but no border is rendered.
  hasBorderWidth: boolean;
  // True if the element has direct text nodes with non-whitespace content.
  // Used to suppress the Color row on wrapper divs whose `color` is just
  // inherited from the theme and paints nothing visible on this element.
  hasDirectText: boolean;
  // Reverse-lookup of computed font signature → Spring `typography-*` token.
  // Set only for text-leaf elements (matches the Color/Scan gates). Lets the
  // Typography row surface a token name for elements that paint text via
  // component-internal CSS rules (not a `typography-*` utility class) — the
  // class-collected path in `collectStyleTokens` only catches the class form.
  typographyAutoToken: string | null;
  // Reverse-lookups of the computed color / background / border colors to
  // Spring tokens, resolved in the element's OWN theme scope so a scoped (e.g.
  // dark) subtree matches its dark token values instead of false "off-token".
  colorToken: string | null;
  backgroundToken: string | null;
  borderToken: string | null;
  // SVG paint (selected node is an <svg>/path/circle/…): computed fill/stroke
  // with `currentColor` resolved via the element's computed `color`, plus the
  // same Spring-token reverse-lookups. All null for non-SVG elements and for
  // paints set to 'none'.
  fill: string | null;
  stroke: string | null;
  strokeWidth: string | null;
  fillToken: string | null;
  strokeToken: string | null;
  // The Spring theme active at this element (scope id + inferred light/dark).
  theme: ThemeInfo;
};

function isLikelyTextColor(cls: string): boolean {
  const rest = cls.slice('text-'.length);
  const first = rest.split('-')[0];
  return !NON_COLOR_TEXT_SUFFIXES.has(first);
}

function isLikelyBorderColor(cls: string): boolean {
  const rest = cls.slice('border-'.length);
  if (rest.length === 0) return false; // bare `border`
  const first = rest.split('-')[0];
  return !NON_COLOR_BORDER_FIRSTSEG.has(first);
}

// Walk the DOM up from the clicked element (up to MAX_DEPTH levels) and
// collect tokens that look like Spring typography/color utilities. We
// scan ancestors too because typography/colors often live on inner spans
// while the clicked element might be a wrapper (or vice versa).
const SCAN_DEPTH = 6;
function collectStyleTokens(node: HTMLElement): StyleTokens {
  const out: StyleTokens = {
    typography: [],
    textColor: [],
    bgColor: [],
    borderColor: [],
  };
  const seen = {
    typography: new Set<string>(),
    textColor: new Set<string>(),
    bgColor: new Set<string>(),
    borderColor: new Set<string>(),
  };
  let cur: HTMLElement | null = node;
  for (let i = 0; cur && i < SCAN_DEPTH; i++, cur = cur.parentElement) {
    const cls = typeof cur.className === 'string' ? cur.className : '';
    if (!cls) continue;
    for (const c of cls.split(/\s+/).filter(Boolean)) {
      const clean = c.replace(/^!/, ''); // strip Tailwind's `!` important prefix
      if (clean.startsWith('typography-')) {
        if (!seen.typography.has(clean)) {
          seen.typography.add(clean);
          out.typography.push(clean);
        }
      } else if (clean.startsWith('text-') && isLikelyTextColor(clean)) {
        if (!seen.textColor.has(clean)) {
          seen.textColor.add(clean);
          out.textColor.push(clean);
        }
      } else if (clean.startsWith('bg-')) {
        if (!seen.bgColor.has(clean)) {
          seen.bgColor.add(clean);
          out.bgColor.push(clean);
        }
      } else if (clean.startsWith('border-') && isLikelyBorderColor(clean)) {
        if (!seen.borderColor.has(clean)) {
          seen.borderColor.add(clean);
          out.borderColor.push(clean);
        }
      }
    }
  }
  return out;
}

function readResolvedStyles(node: HTMLElement): ResolvedStyles {
  const s = getComputedStyle(node);
  // Resolve tokens in the element's own theme scope (dark subtrees etc.).
  const host = themeScopeHostOf(node);
  const bw = (k: string) => parseFloat(s.getPropertyValue(k)) || 0;
  const hasBorderWidth =
    bw('border-top-width') > 0 ||
    bw('border-right-width') > 0 ||
    bw('border-bottom-width') > 0 ||
    bw('border-left-width') > 0;
  let hasDirectText = false;
  for (const c of Array.from(node.childNodes)) {
    if (c.nodeType === Node.TEXT_NODE && (c.textContent ?? '').trim().length > 0) {
      hasDirectText = true;
      break;
    }
  }
  // SVG paint. Container elements (<svg>, <g>) don't paint fill themselves —
  // their computed `fill` is CSS's INITIAL value (black), which is misleading
  // (a Squircle shape-svg whose path is white would report neutral-b0). Read
  // the paint off the first actual shape instead; its computed value resolves
  // var()/inheritance against the real ancestor chain. `currentColor` can
  // survive into computed values on some engines, so resolve it through the
  // paint source's computed `color` (which IS resolved).
  let fill: string | null = null;
  let stroke: string | null = null;
  let strokeWidth: string | null = null;
  if (node instanceof SVGElement) {
    const SVG_SHAPES = 'path, circle, rect, ellipse, polygon, polyline, line, text';
    const shape = node.matches(SVG_SHAPES) ? node : node.querySelector(SVG_SHAPES);
    const ps = shape && shape !== node ? getComputedStyle(shape) : s;
    const paint = (v: string): string | null => {
      const t = v.trim();
      if (!t || t === 'none') return null;
      return t.toLowerCase() === 'currentcolor' ? ps.color : t;
    };
    fill = paint(ps.fill);
    stroke = paint(ps.stroke);
    // A zero-width stroke paints nothing — treat as no stroke (same rule as
    // the transparent-outline gate in Effects).
    if (stroke && !(parseFloat(ps.strokeWidth) > 0)) stroke = null;
    if (stroke) strokeWidth = ps.strokeWidth || null;
  }
  return {
    fontFamily: s.fontFamily,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing,
    color: s.color,
    backgroundColor: s.backgroundColor,
    borderColor: s.borderTopColor,
    hasBorderWidth,
    hasDirectText,
    typographyAutoToken: hasDirectText ? lookupTypographyToken(s) : null,
    colorToken: lookupColorToken(s.color, host),
    backgroundToken: lookupColorToken(s.backgroundColor, host),
    borderToken: lookupColorToken(s.borderTopColor, host),
    fill,
    stroke,
    strokeWidth,
    fillToken: fill ? lookupColorToken(fill, host) : null,
    strokeToken: stroke ? lookupColorToken(stroke, host) : null,
    theme: readThemeInfo(node),
  };
}

// ───────── element-scope helpers ─────────

// Direct text content of a node (excludes text inside descendant elements).
// Falls back to innerText if there's no direct text but the rendered text is
// reasonably short.
// Strict: only direct text-node children count. A wrapper <div> whose only
// content is nested <p>s does NOT have direct text, even though innerText
// would happily return the descendants' content. This is the same rule the
// X-ray uses (XRayView.getDirectText) and matches `hasDirectText` in
// readResolvedStyles, so the Text band, the X-ray text-leaf detection, and
// the Styles "Color" row gate all agree on what counts as "this element
// authors text".
function getDirectText(node: HTMLElement): string | null {
  let text = '';
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent ?? '';
    }
  }
  text = text.trim();
  return text.length > 0 ? text : null;
}

const INTERESTING_ATTR_NAMES = new Set([
  'id', 'role', 'title', 'alt', 'href', 'type', 'name', 'value',
  'placeholder', 'tabindex', 'src', 'for',
]);

function getInterestingAttrs(node: HTMLElement): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (let i = 0; i < node.attributes.length; i++) {
    const attr = node.attributes[i];
    const n = attr.name;
    if (n === 'class' || n === 'style') continue; // shown elsewhere
    if (
      n.startsWith('data-') ||
      n.startsWith('aria-') ||
      INTERESTING_ATTR_NAMES.has(n)
    ) {
      out.push([n, attr.value]);
    }
  }
  return out;
}

// ───────── asset detection ─────────
//
// "Asset" = something with a downloadable / serializable payload (img / video /
// audio src, or a vector SVG), OR a Spring icon (which is code-imported, so
// the "asset" is really the import token).
//
// Spring icon detection: walk UP the fiber chain from the SVG element and find
// the first fiber whose `type` matches an exported value from
// `@ringcentral/spring-icon`. Identity check (not name) — same trick as the
// SPRING_TYPES set, so a local component named `AceMd` would not be mistaken
// for Spring's AceMd. We also walk one level further in case the icon is
// wrapped by Spring's `Icon` (symbol-prop case) and read the `size` prop.

type AssetInfo =
  | {
      kind: 'image';
      src: string;
      alt: string | null;
      naturalWidth: number;
      naturalHeight: number;
      displayedWidth: number;
      displayedHeight: number;
      format: string | null;
    }
  | {
      kind: 'video';
      src: string | null;
      poster: string | null;
      naturalWidth: number;
      naturalHeight: number;
      displayedWidth: number;
      displayedHeight: number;
      duration: number | null;
      format: string | null;
    }
  | {
      kind: 'audio';
      src: string | null;
      duration: number | null;
      format: string | null;
    }
  | {
      kind: 'svg';
      svgEl: SVGSVGElement;
      viewBox: string | null;
      displayedWidth: number;
      displayedHeight: number;
    }
  | {
      kind: 'spring-icon';
      iconName: string;
      springSize: string | null; // Icon `size` prop if wrapped in <Icon>
      svgEl: SVGSVGElement;
      viewBox: string | null;
      displayedWidth: number;
      displayedHeight: number;
      // Painted colour (fill/currentColor resolved) + Spring token lookup.
      color: string | null;
      colorToken: string | null;
    };

function ownerSvg(node: Element): SVGSVGElement | null {
  if (node instanceof SVGSVGElement) return node;
  const owner = (node as SVGElement).ownerSVGElement;
  return owner instanceof SVGSVGElement ? owner : null;
}

// From the SVG host's fiber, walk up looking for a Spring icon component
// (identity match against the spring-icon exports). Returns the icon name
// (e.g. 'AceMd') if found.
function findSpringIconFromFiber(startFiber: Fiber | null): {
  name: string;
  iconFiber: Fiber;
} | null {
  let cur: Fiber | null = startFiber;
  let depth = 0;
  while (cur && depth < 8) {
    const t = cur.type;
    if (t && (typeof t === 'function' || typeof t === 'object')) {
      const name = SPRING_ICON_NAMES.get(t as object);
      if (name) return { name, iconFiber: cur };
    }
    cur = cur.return;
    depth++;
  }
  return null;
}

// From a Spring icon fiber, walk one more step up to see if it's wrapped in
// a Spring <Icon> — if so, return its `size` prop. Used purely for displaying
// the size choice in the inspector, not required for token detection.
function findSpringIconSize(iconFiber: Fiber): string | null {
  let cur: Fiber | null = iconFiber.return;
  let depth = 0;
  while (cur && depth < 4) {
    const t = cur.type;
    if (t && typeof t === 'object' && (t as any).render) {
      // Spring's Icon is a forwardRef with displayName='SuiIcon'
      const name = getComponentName(t) ?? '';
      if (name === 'SuiIcon' || name === 'Icon') {
        const size = cur.memoizedProps?.size;
        return typeof size === 'string' ? size : null;
      }
    }
    cur = cur.return;
    depth++;
  }
  return null;
}

function extOf(url: string): string | null {
  try {
    const u = new URL(url, 'http://x/');
    const m = u.pathname.match(/\.([a-z0-9]+)(?:$|\?)/i);
    return m ? m[1].toLowerCase() : null;
  } catch {
    const m = url.match(/\.([a-z0-9]+)(?:$|\?|#)/i);
    return m ? m[1].toLowerCase() : null;
  }
}

function getAssetInfo(node: HTMLElement | SVGElement): AssetInfo | null {
  const tag = (node.tagName || '').toLowerCase();

  // Click landed inside an SVG (path/g/etc.) — treat the owner SVG as the
  // asset target so users never have to re-click the root svg manually.
  let svgRoot: SVGSVGElement | null = null;
  if (node instanceof SVGElement) svgRoot = ownerSvg(node);

  if (tag === 'img') {
    const img = node as HTMLImageElement;
    const r = img.getBoundingClientRect();
    const scale = getAncestorScale(img);
    return {
      kind: 'image',
      src: img.currentSrc || img.src || '',
      alt: img.alt || null,
      naturalWidth: img.naturalWidth || 0,
      naturalHeight: img.naturalHeight || 0,
      displayedWidth: Math.round(r.width / scale),
      displayedHeight: Math.round(r.height / scale),
      format: extOf(img.currentSrc || img.src || ''),
    };
  }

  if (tag === 'video') {
    const v = node as HTMLVideoElement;
    const r = v.getBoundingClientRect();
    const scale = getAncestorScale(v);
    return {
      kind: 'video',
      src: v.currentSrc || v.src || null,
      poster: v.poster || null,
      naturalWidth: v.videoWidth || 0,
      naturalHeight: v.videoHeight || 0,
      displayedWidth: Math.round(r.width / scale),
      displayedHeight: Math.round(r.height / scale),
      duration: Number.isFinite(v.duration) ? v.duration : null,
      format: extOf(v.currentSrc || v.src || ''),
    };
  }

  if (tag === 'audio') {
    const a = node as HTMLAudioElement;
    return {
      kind: 'audio',
      src: a.currentSrc || a.src || null,
      duration: Number.isFinite(a.duration) ? a.duration : null,
      format: extOf(a.currentSrc || a.src || ''),
    };
  }

  if (svgRoot) {
    const r = svgRoot.getBoundingClientRect();
    const scale = getAncestorScale(svgRoot);
    const vb = svgRoot.getAttribute('viewBox');
    const startFiber = getFiberFromDom(svgRoot);
    const springHit = findSpringIconFromFiber(startFiber);
    if (springHit) {
      const size = findSpringIconSize(springHit.iconFiber);
      // Painted colour: Spring icons fill with `currentColor` — resolve the
      // computed paint, falling back through `color` when fill is unset/none.
      let color: string | null = null;
      try {
        const cs = getComputedStyle(svgRoot);
        let c = (cs.fill || '').trim();
        if (!c || c === 'none' || c.toLowerCase() === 'currentcolor') c = cs.color;
        color = c || null;
      } catch {
        // detached node — skip
      }
      return {
        kind: 'spring-icon',
        iconName: springHit.name,
        springSize: size,
        svgEl: svgRoot,
        viewBox: vb,
        displayedWidth: Math.round(r.width / scale),
        displayedHeight: Math.round(r.height / scale),
        color,
        colorToken: color ? lookupColorToken(color, themeScopeHostOf(svgRoot)) : null,
      };
    }
    return {
      kind: 'svg',
      svgEl: svgRoot,
      viewBox: vb,
      displayedWidth: Math.round(r.width / scale),
      displayedHeight: Math.round(r.height / scale),
    };
  }

  return null;
}

// ───────── selection model ─────────
//
// A selection is just a node in the hierarchy: one fiber, the host DOM node
// associated with it, and the kind (drives which body sections render).
// Clicking on the canvas selects the exact host you clicked (kind=element).
// Clicking a row in the Hierarchy tree re-selects that fiber. There is no
// separate "scope" — the tree IS the navigation.

type SelectedNode = {
  fiber: Fiber;
  domNode: HTMLElement;
  kind: AncestryKind;
  tokens: StyleTokens;
  resolved: ResolvedStyles;
  // Source-location anchor (`data-anchor`, stamped by the build-time Babel
  // plugin) + the host's artboard slot. Captured at selection time so the
  // selection can be re-resolved after an HMR edit detaches `domNode`/`fiber`.
  // `anchor` is null for elements the plugin didn't stamp (e.g. Spring-internal
  // hosts rendered from node_modules) — those just can't be HMR-recovered.
  anchor: string | null;
  artboardSlot: string | null;
};

// Read the durable re-anchor info off a host node: its `data-anchor` source
// stamp and the `[data-dc-slot]` artboard it lives in (scopes the post-HMR
// lookup so the same component in another artboard isn't matched by mistake).
function anchorInfoFor(dom: Element): { anchor: string | null; artboardSlot: string | null } {
  return {
    anchor: dom.getAttribute('data-anchor'),
    artboardSlot: dom.closest('[data-dc-slot]')?.getAttribute('data-dc-slot') ?? null,
  };
}

// ───────── agent-handoff resolvers ─────────
//
// Dependency injection for agentHandoff.ts (the cross-stack "Copy for agent"
// serializer): everything that needs the Inspector's fiber/identity/token
// machinery is packaged here so the serializer module stays standalone.

// Components (outermost first) whose FIRST rendered host is exactly this
// element — same walk as `ownerComponentAtRoot`, but collecting the whole
// chain instead of only the outermost, so the serializer can annotate
// `StatusTile › Button (Spring UI)` on one host.
function handoffComponentChainFor(el: Element): ComponentChainEntry[] {
  const start = getFiberFromDom(el);
  if (!start) return [];
  const out: ComponentChainEntry[] = [];
  let cur: Fiber | null = start.return;
  let depth = 0;
  while (cur && depth < ANCESTRY_MAX_DEPTH) {
    const rawName = getComponentName(cur.type);
    if (rawName && ANCESTRY_STOP_NAMES.has(rawName)) break; // artboard boundary
    if (findFirstHostElement(cur) !== el) break; // climbed above this host
    const name = springAwareName(cur.type);
    if (isInterestingName(name) && rendersOwnDom(cur)) {
      out.push({
        name: name!,
        kind: isSpringType(cur.type) ? 'spring' : 'user',
        props: cur.memoizedProps,
      });
    }
    cur = cur.return;
    depth++;
  }
  return out.reverse();
}

// Spring icon export name for an svg root (walks up the fiber chain a few
// levels — the icon component's fiber sits just above the svg host).
function handoffIconNameFor(el: Element): string | null {
  let cur: Fiber | null = getFiberFromDom(el);
  let depth = 0;
  while (cur && depth < 8) {
    const t = cur.type;
    if (t && (typeof t === 'function' || typeof t === 'object')) {
      const n = SPRING_ICON_NAMES.get(t);
      if (n) return n;
    }
    cur = cur.return;
    depth++;
  }
  return null;
}

const HANDOFF_RESOLVERS: HandoffResolvers = {
  componentChainFor: handoffComponentChainFor,
  iconNameFor: handoffIconNameFor,
  colorToken: (value, scopeEl) => lookupColorToken(value, themeScopeHostOf(scopeEl)),
  typographyToken: (cs) => lookupTypographyToken(cs),
  shadowToken: (v) => lookupShadowToken(v),
  radiusToken: (px) => lookupRadiusToken(px),
  spacingToken: (px) => lookupSpacingToken(px),
  themeInfoFor: (el) => readThemeInfo(el),
};

// "Promote at component root" (Option 1): if the clicked host IS the outermost
// DOM a Spring/user component renders, return that component's fiber + kind so
// the selection surfaces JSX / props / variants. Returns null when the host
// isn't a component root — a deeper inner host, or a plain authored element —
// so those stay selected as bare elements (styles focus).
//
// Walks up from the host's fiber, taking the OUTERMOST component whose first
// rendered host is still this exact element. Stops the moment the chain's
// first host differs (we've climbed above the clicked element) or we reach the
// artboard boundary. `isInterestingName(springAwareName(...))` keeps Spring's
// own ThemeProvider / SuiModeProvider out (their export names end in Provider),
// while rendersOwnDom drops context-only passthroughs.
function ownerComponentAtRoot(host: Element): { fiber: Fiber; kind: AncestryKind } | null {
  const hostFiber = getFiberFromDom(host);
  if (!hostFiber) return null;
  let cur: Fiber | null = hostFiber.return;
  let best: { fiber: Fiber; kind: AncestryKind } | null = null;
  let depth = 0;
  while (cur && depth < ANCESTRY_MAX_DEPTH) {
    const rawName = getComponentName(cur.type);
    if (rawName && ANCESTRY_STOP_NAMES.has(rawName)) break; // artboard boundary
    if (findFirstHostElement(cur) !== host) break; // climbed above the click
    const name = springAwareName(cur.type);
    if (isInterestingName(name) && rendersOwnDom(cur)) {
      best = { fiber: cur, kind: isSpringType(cur.type) ? 'spring' : 'user' };
    }
    cur = cur.return;
    depth++;
  }
  return best;
}

function buildSelectedFromHost(host: Element): SelectedNode | null {
  const fiber = getFiberFromDom(host);
  if (!fiber) return null;
  // SVG hosts are valid selection targets (icons, vectors). At runtime every
  // helper we hand `host` to only uses APIs that exist on both HTMLElement
  // and SVGElement (getComputedStyle, parentElement, getBoundingClientRect,
  // childNodes; the few `className` reads are typeof-guarded). Cast to
  // HTMLElement so the rest of the inspector's typing stays simple.
  const h = host as HTMLElement;
  // Bind the selection to the owning component when the host is its root, so a
  // canvas click on a <Button> shows JSX in one click (instead of selecting the
  // bare host and forcing a second click on the already-highlighted tree row).
  // domNode stays the host either way — styles/box-model read from the real DOM
  // node; only `fiber`/`kind` change so JSX/props resolve from the component.
  const owner = ownerComponentAtRoot(host);
  return {
    fiber: owner ? owner.fiber : fiber,
    domNode: h,
    kind: owner ? owner.kind : 'element',
    tokens: collectStyleTokens(h),
    resolved: readResolvedStyles(h),
    ...anchorInfoFor(h),
  };
}

function buildSelectedFromFiber(
  fiber: Fiber,
  knownKind?: AncestryKind,
): SelectedNode | null {
  const dom =
    fiber.stateNode instanceof HTMLElement
      ? fiber.stateNode
      : findFirstHostElement(fiber);
  if (!dom) return null;
  return {
    fiber,
    domNode: dom,
    kind: knownKind ?? inferKind(fiber),
    tokens: collectStyleTokens(dom),
    resolved: readResolvedStyles(dom),
    ...anchorInfoFor(dom),
  };
}

function selectedLabel(selected: SelectedNode): string {
  return nodeNameFor(selected.fiber, selected.kind);
}

// ───────── Inspector ─────────

// Shape of the imperative viewport handle stashed on the DesignCanvas
// `[data-dc-viewport]` DOM node by DesignCanvas.jsx. Only the bits the
// Inspector calls are listed.
type DCTransform = { x: number; y: number; scale: number };
type DCViewportApi = {
  subscribe: (fn: (t: DCTransform) => void) => () => void;
  getTransform: () => DCTransform;
  setTransform: (t: DCTransform) => void;
  animateTransform: (t: DCTransform, ms?: number) => void;
};

// HoverOverlay moved to ../CommentLayer/HoverOverlay (shared by Inspect +
// Comment modes). Inspector renders it with `data-inspector-ui` so its own
// pickers/scans filter the overlay out (see usages at the picker + scan loops).

// Persistent selection-highlight overlay on the canvas. Owns its own rect
// state + viewport-transform subscription + scroll/resize listeners — so the
// per-frame setState during pan/zoom only re-renders this small subtree, NOT
// the whole Inspector panel + recursive HierarchyTree. Also skips entirely
// while a canvas viewport is mid-interaction (drag/wheel/gesture); a
// MutationObserver re-measures the moment the interaction ends so the
// outline catches up to the post-pan transform.
function SelectedOverlay({
  enabled,
  selected,
}: {
  enabled: boolean;
  selected: SelectedNode | null;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!enabled || !selected?.domNode) {
      setRect(null);
      return;
    }
    const el = selected.domNode;
    const vpEl = document.querySelector('[data-dc-viewport]') as
      | (HTMLElement & { __dcViewport?: DCViewportApi })
      | null;

    const update = () => {
      if (document.querySelector('[data-dc-interacting]')) return;
      if (!el.isConnected) {
        setRect(null);
        return;
      }
      setRect(el.getBoundingClientRect());
    };
    update();
    const api = vpEl?.__dcViewport;
    const unsub = api?.subscribe(update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    let mo: MutationObserver | null = null;
    if (vpEl) {
      mo = new MutationObserver(() => {
        if (!vpEl.hasAttribute('data-dc-interacting')) update();
      });
      mo.observe(vpEl, {
        attributes: true,
        attributeFilter: ['data-dc-interacting'],
      });
    }

    return () => {
      unsub?.();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      mo?.disconnect();
    };
  }, [enabled, selected]);

  if (!enabled || !rect) return null;
  return (
    <div
      data-inspector-ui
      style={{
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        outline: '2px solid #9aa6bb',
        outlineOffset: 0,
        pointerEvents: 'none',
        zIndex: 1998,
        borderRadius: 2,
      }}
    />
  );
}

export function Inspector({
  mode,
  setMode,
}: {
  mode: CanvasMode;
  setMode: (m: CanvasMode) => void;
}) {
  // Dev mode owns the inspector; the bottom-left ModeBar drives it now (no
  // local toggle). Leaving the mode clears any held selection.
  const enabled = mode === 'dev';
  const [selected, setSelected] = useState<SelectedNode | null>(null);
  useEffect(() => {
    if (mode !== 'dev') setSelected(null);
  }, [mode]);

  // Forced interaction states (hover / active / focus) — see forceState.ts.
  // One forced host at a time. The forcing survives selecting DESCENDANTS of
  // the forced element (so you can force hover on a tile, then inspect its
  // label's hovered styles), and clears when the selection leaves the subtree.
  const [forced, setForced] = useState<{
    host: Element;
    states: PseudoState[];
  } | null>(null);
  useEffect(() => {
    if (!forced) return;
    if (!selected || !forced.host.contains(selected.domNode)) {
      applyForcedStates(null, new Set());
      setForced(null);
    }
  }, [selected, forced]);
  // Clear any leftover forcing when the inspector unmounts.
  useEffect(() => () => applyForcedStates(null, new Set()), []);

  // Console tools (see agentHandoff.ts):
  //   __dcHandoffAudit()      — report authored style props the serializer
  //                             does NOT yet emit (whitelist completeness)
  //   __dcAgentHandoff(el?)   — return the "Copy for agent" markdown for an
  //                             element (defaults to the current selection's
  //                             root); lets a browser-driving agent pull the
  //                             payload without the UI.
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__dcHandoffAudit = auditStyleCoverage;
    w.__dcAgentHandoff = (el?: Element, includeStates = true) => {
      const target =
        el ??
        selectedRef.current?.domNode ??
        (document.querySelector('[data-dc-slot] .dc-card') as Element | null);
      if (!target) return null;
      return serializeSelection(target, {
        resolvers: HANDOFF_RESOLVERS,
        title: `<${target.tagName.toLowerCase()}>`,
        artboard:
          target.closest('[data-dc-slot]')?.getAttribute('data-dc-slot') ?? null,
        anchor: target.getAttribute('data-anchor'),
        authoredJSX: null,
        includeStates,
      });
    };
    return () => {
      delete w.__dcHandoffAudit;
      delete w.__dcAgentHandoff;
    };
  }, []);

  // Re-read the selection's computed styles after a forcing change so the
  // Styles/Box-model sections show the forced state's values.
  const refreshSelectedStyles = () => {
    setSelected((p) =>
      p
        ? {
            ...p,
            tokens: collectStyleTokens(p.domNode),
            resolved: readResolvedStyles(p.domNode),
          }
        : p,
    );
  };
  const toggleForcedState = (state: PseudoState) => {
    if (!selected) return;
    const sameHost = forced?.host === selected.domNode;
    const next = new Set<PseudoState>(sameHost ? forced!.states : []);
    if (next.has(state)) next.delete(state);
    else next.add(state);
    // Toggling on a different element (e.g. a descendant of the current
    // forced host) MOVES the forcing there — one forced host at a time.
    applyForcedStates(next.size ? selected.domNode : null, next);
    setForced(next.size ? { host: selected.domNode, states: [...next] } : null);
    refreshSelectedStyles();
  };
  const clearForcedState = () => {
    if (!forced) return;
    applyForcedStates(null, new Set());
    setForced(null);
    refreshSelectedStyles();
  };
  // User-resizable inspector width. Lifted to the top so panToElement,
  // ExplodedView, XRayView, and ScanResultsPane all see the same value.
  const [inspectorWidth, setInspectorWidth] = useState<number>(
    INSPECTOR_DEFAULT_WIDTH,
  );
  const inspectorWidthRef = useRef(inspectorWidth);
  inspectorWidthRef.current = inspectorWidth;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // While enabled, attach capture-phase listeners so we win over the
  // artboard contents' own click handlers.
  useEffect(() => {
    if (!enabled) return;

    // Track where the press started so a pan (drag) on empty canvas isn't
    // treated as a click that clears the selection. A genuine click moves
    // less than the threshold between pointerdown and the click event.
    let downX = 0;
    let downY = 0;
    const DRAG_SLOP = 5;
    const onDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      // Allow clicks on the inspector UI itself.
      if (t.closest('[data-inspector-ui]')) return;
      const inArtboard = t.closest('[data-dc-slot]');
      if (!inArtboard) {
        // Click on empty canvas (not a drag/pan) clears the current selection.
        const moved =
          Math.abs(e.clientX - downX) > DRAG_SLOP ||
          Math.abs(e.clientY - downY) > DRAG_SLOP;
        if (!moved) setSelected(null);
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const next = buildSelectedFromHost(t);
      if (next) setSelected(next);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMode('cursor');
        setSelected(null);
      }
    };

    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey);
    document.body.style.cursor = 'crosshair';
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey);
      document.body.style.cursor = '';
    };
  }, [enabled]);

  // HMR-survivable selection. On a JSX edit, Vite/React Fast Refresh rebuilds
  // the artboard subtree — the held `selected.domNode` detaches (overlay reads
  // a zero rect → highlight vanishes) and `selected.fiber` goes stale. After
  // each HMR apply, re-resolve the selection by its source-location `data-anchor`
  // (scoped to its original artboard) and rebuild it against the fresh DOM/fiber.
  // Dev-only: `import.meta.hot` is undefined in production builds.
  useEffect(() => {
    // Minimal structural type for Vite's HMR context — avoids depending on
    // `vite/client` types being wired into the shared tsconfig.
    type HotCtx = {
      on(event: string, cb: () => void): void;
      off?(event: string, cb: () => void): void;
    };
    const hot = (import.meta as unknown as { hot?: HotCtx }).hot;
    if (!hot) return;

    let raf = 0;
    let tries = 0;
    const MAX_TRIES = 12; // ~12 frames ≈ 200ms — covers Fast Refresh's async re-render

    const reResolve = () => {
      const prev = selectedRef.current;
      // Nothing selected, or a target the plugin never stamped → can't recover.
      if (!prev || !prev.anchor) return;

      const scope: ParentNode = prev.artboardSlot
        ? document.querySelector(`[data-dc-slot="${CSS.escape(prev.artboardSlot)}"]`) ?? document
        : document;
      const next = scope.querySelector(`[data-anchor="${CSS.escape(prev.anchor)}"]`);

      if (next instanceof HTMLElement) {
        // Re-resolving from the host reproduces the original selection logic
        // (component-root promotion included). Caveat: a tree-row selection of
        // a component whose host isn't its render-root may re-promote to a
        // different fiber — acceptable; the anchor lives on the host.
        const rebuilt = buildSelectedFromHost(next);
        if (rebuilt) setSelected(rebuilt);
        return;
      }
      // New DOM not painted yet (or element removed by the edit) — retry a few
      // frames, then give up and leave the stale selection in place.
      if (tries++ < MAX_TRIES) raf = requestAnimationFrame(reResolve);
    };

    const onUpdate = () => {
      tries = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(reResolve);
    };

    hot.on('vite:afterUpdate', onUpdate);
    return () => {
      hot.off?.('vite:afterUpdate', onUpdate);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Pan/zoom the canvas so the given element is brought into a comfortable
  // viewing area (centered in the region left of the Inspector panel). Used
  // by the Scan-results click flow — canvas/explode/x-ray picks don't need
  // this because the user already had their cursor on the element.
  const panToElement = useCallback((el: Element) => {
    const vpEl = document.querySelector('[data-dc-viewport]') as
      | (HTMLElement & { __dcViewport?: DCViewportApi })
      | null;
    const api = vpEl?.__dcViewport;
    if (!vpEl || !api) return;
    const vpRect = vpEl.getBoundingClientRect();
    const tf = api.getTransform();
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;

    // Decide target scale: only adjust if the element is uncomfortably small
    // or large at the current zoom. The 60→400px band covers most useful
    // sizes; outside that we ease toward a comfortable rendered ~150px.
    const screenMax = Math.max(r.width, r.height);
    let newScale = tf.scale;
    if (screenMax < 60) {
      newScale = tf.scale * (150 / screenMax);
    } else if (screenMax > 600) {
      newScale = tf.scale * (400 / screenMax);
    }
    // viewport clamp happens inside animateTransform; soft-clamp here too so
    // the centering math uses the actual scale that'll be applied.
    newScale = Math.min(4, Math.max(0.15, newScale));

    // Target on-screen position: center of the region left of the inspector
    // panel. Inspector is fixed at right:INSPECTOR_LEFT_GAP with live width
    // `inspectorWidthRef.current` → its left edge sits at
    // `vpRect.right - INSPECTOR_LEFT_GAP - inspectorWidth`. Read via ref so
    // back-to-back pans pick up width changes without re-creating the
    // callback (it's only set once at mount via useCallback).
    const PANEL_W = inspectorWidthRef.current;
    const PANEL_GAP = INSPECTOR_LEFT_GAP;
    const leftRegionRight = vpRect.right - PANEL_GAP - PANEL_W - 16;
    const targetScreenX = (vpRect.left + leftRegionRight) / 2;
    const targetScreenY = vpRect.top + vpRect.height / 2;

    // World coords of the element's center under the current transform.
    const worldCx = (r.left + r.width / 2 - vpRect.left - tf.x) / tf.scale;
    const worldCy = (r.top + r.height / 2 - vpRect.top - tf.y) / tf.scale;

    // New transform that places that world point under the target screen pt.
    const newX = targetScreenX - vpRect.left - worldCx * newScale;
    const newY = targetScreenY - vpRect.top - worldCy * newScale;

    api.animateTransform({ x: newX, y: newY, scale: newScale }, 260);
  }, []);

  return createPortal(
    <>
      {/* Persistent selection highlight — owns its own state + subscription
          so per-frame pan/zoom rect updates don't cascade re-renders into
          the heavy InspectorPanel. Sits underneath the hover overlay so a
          mid-pan hover preview wins visually. */}
      <SelectedOverlay enabled={enabled} selected={selected} />

      {/* Hover highlight — owns its own mousemove + state so the panel
          doesn't re-render on every pixel of cursor movement. */}
      <HoverOverlay enabled={enabled} data-inspector-ui />

      {/* Toggle lives in the bottom-left ModeBar now (Dev mode). */}

      {/* Side panel — visible whenever the inspector is on, even with no
          selection yet (empty-state hides per-element bands and exposes
          the global Scan section). */}
      {enabled && (
        <InspectorPanel
          selected={selected}
          onClose={() => {
            setMode('cursor');
            setSelected(null);
          }}
          onJumpTo={setSelected}
          onPanToElement={panToElement}
          width={inspectorWidth}
          onWidthChange={setInspectorWidth}
          forced={forced}
          onToggleState={toggleForcedState}
          onClearStates={clearForcedState}
        />
      )}
    </>,
    document.body,
  );
}

function InspectorPanel({
  selected,
  onClose,
  onJumpTo,
  onPanToElement,
  width,
  onWidthChange,
  forced,
  onToggleState,
  onClearStates,
}: {
  selected: SelectedNode | null;
  onClose: () => void;
  onJumpTo: (next: SelectedNode) => void;
  onPanToElement: (el: Element) => void;
  width: number;
  onWidthChange: (w: number) => void;
  forced: { host: Element; states: PseudoState[] } | null;
  onToggleState: (s: PseudoState) => void;
  onClearStates: () => void;
}) {
  // Track copy feedback per source so each button gets its own ✓ pulse.
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  // Only one visualization pane open at a time — they'd overlap in the same
  // slot to the left of the Inspector.
  const [activePane, setActivePane] = useState<'explode' | 'xray' | null>(null);
  // Serialized forced-state signature. Bumps the explode/x-ray clone rebuild
  // when a state chip toggles — the source element's appearance changed but
  // none of those panes' other deps can see it.
  const forcedKey = forced ? `${forced.states.slice().sort().join(',')}` : '';
  // Persists across selections so picking a new element keeps the chosen
  // color display form (Tok / Hex / Var).
  const [colorMode, setColorMode] = useState<ColorDisplayMode>('token');
  // Same idea for box-model diagram labels (Tok / Px). Default token so the
  // handoff-shaped values come first; falls back to px per-label when no
  // Spring token matches.
  const [boxModelMode, setBoxModelMode] = useState<'token' | 'px'>('token');
  // Hierarchy section is user-resizable via a drag-handle at its bottom.
  // Persists across selections so it doesn't reset when jumping rows.
  const [treeHeight, setTreeHeight] = useState<number>(280);

  // Scan state — two independent sets (Spring adherence vs Accessibility).
  // Each section owns its own results + scanning + expanded set; both share
  // the side pane via `paneMode`, which says which set the pane is currently
  // showing (null = pane closed). Pane width persists across modes.
  const [tokenResults, setTokenResults] = useState<ScanBucket[] | null>(null);
  const [tokenScanning, setTokenScanning] = useState(false);
  const [tokenExpanded, setTokenExpanded] = useState<Set<string>>(new Set());
  // Scope label the last results were produced with (null = whole canvas).
  // Stored per set so the header/pane can report what was scanned.
  const [tokenScopeLabel, setTokenScopeLabel] = useState<string | null>(null);
  const [a11yResults, setA11yResults] = useState<ScanBucket[] | null>(null);
  const [a11yScanning, setA11yScanning] = useState(false);
  const [a11yExpanded, setA11yExpanded] = useState<Set<string>>(new Set());
  const [a11yScopeLabel, setA11yScopeLabel] = useState<string | null>(null);
  const [paneMode, setPaneMode] = useState<'tokens' | 'a11y' | null>(null);
  const [scanPaneWidth, setScanPaneWidth] = useState<number>(
    SCAN_PANE_DEFAULT_WIDTH,
  );

  // Two-RAF gate so the "Scanning…" label paints before we block the main
  // thread with the synchronous walk. Typical scans complete in <100ms;
  // worst-case (hundreds of layers across many artboards) ~300ms.
  const runTokenScan = useCallback(
    (scope?: Element | null, scopeLabel?: string | null) => {
      setTokenScanning(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            const buckets = scanArtboardsForViolations(scope ?? null);
            setTokenResults(buckets);
            setTokenScopeLabel(scope ? scopeLabel ?? 'selection' : null);
            setTokenExpanded(
              buckets.length === 1
                ? new Set([`${buckets[0].kind}::${buckets[0].value}`])
                : new Set(),
            );
            if (buckets.length > 0) setPaneMode('tokens');
          } finally {
            setTokenScanning(false);
          }
        });
      });
    },
    [],
  );

  const runA11yScan = useCallback(
    (scope?: Element | null, scopeLabel?: string | null) => {
      setA11yScanning(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            const buckets = scanA11yViolations(scope ?? null);
            setA11yResults(buckets);
            setA11yScopeLabel(scope ? scopeLabel ?? 'selection' : null);
            setA11yExpanded(
              buckets.length === 1
                ? new Set([`${buckets[0].kind}::${buckets[0].value}`])
                : new Set(),
            );
            if (buckets.length > 0) setPaneMode('a11y');
          } finally {
            setA11yScanning(false);
          }
        });
      });
    },
    [],
  );

  // Current selection, exposed to the scan sections as the scope to confine to.
  // The DOM host is the walk root; the label names it in the scope chip/results.
  const scanScopeEl = selected?.domNode ?? null;
  const scanScopeLabel = selected ? selectedLabel(selected) : null;

  const toggleTokenBucket = useCallback((key: string) => {
    setTokenExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);
  const toggleA11yBucket = useCallback((key: string) => {
    setA11yExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Stable callback for ExplodedView/X-ray so their build effects don't re-run
  // on every parent render. Walks up the DOM if the immediate clicked element
  // has no fiber (Spring portals can render escape hatches that don't carry a
  // React fiber on every leaf node).
  const pickHost = useCallback(
    (host: Element) => {
      let cur: Element | null = host;
      while (cur) {
        const next = buildSelectedFromHost(cur);
        if (next) {
          onJumpTo(next);
          return;
        }
        cur = cur.parentElement;
      }
    },
    [onJumpTo],
  );

  // Scan-results click: pan/zoom the canvas so the element is brought into
  // view, then select it. Canvas/explode/x-ray clicks keep using bare
  // pickHost since the user's cursor already says "here".
  const pickAndPan = useCallback(
    (host: Element) => {
      onPanToElement(host);
      pickHost(host);
    },
    [pickHost, onPanToElement],
  );

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    });
  }, []);

  const domNode = selected?.domNode ?? null;

  // Left-edge resize grip — mirrors the ScanResultsPane grip pattern. Drag
  // LEFT (decreasing clientX) widens the inspector; right edge is anchored
  // at INSPECTOR_LEFT_GAP so the panel grows toward the canvas.
  const gripDragRef = useRef<{ startX: number; startW: number } | null>(null);
  const [gripHover, setGripHover] = useState(false);
  const onGripDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    gripDragRef.current = { startX: e.clientX, startW: width };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
  };
  const onGripMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gripDragRef.current) return;
    const dx = gripDragRef.current.startX - e.clientX;
    const next = Math.min(
      INSPECTOR_MAX_WIDTH,
      Math.max(INSPECTOR_MIN_WIDTH, gripDragRef.current.startW + dx),
    );
    onWidthChange(next);
  };
  const endGripDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gripDragRef.current) return;
    gripDragRef.current = null;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };
  const gripDragging = !!gripDragRef.current;
  const gripActive = gripHover || gripDragging;

  return (
    <>
    {activePane === 'explode' && domNode && (
      <ExplodedView
        node={domNode}
        onPickHost={pickHost}
        onClose={() => setActivePane(null)}
        inspectorWidth={width}
        rebuildKey={forcedKey}
      />
    )}
    {activePane === 'xray' && domNode && (
      <XRayView
        node={domNode}
        onPickHost={pickHost}
        onClose={() => setActivePane(null)}
        inspectorWidth={width}
        rebuildKey={forcedKey}
      />
    )}
    {paneMode === 'tokens' && tokenResults !== null && tokenResults.length > 0 && (
      <ScanResultsPane
        title={tokenScopeLabel ? `Spring adherence · ${tokenScopeLabel}` : 'Spring adherence'}
        results={tokenResults}
        expanded={tokenExpanded}
        onToggleBucket={toggleTokenBucket}
        onPickEl={pickAndPan}
        onClose={() => setPaneMode(null)}
        width={scanPaneWidth}
        onWidthChange={setScanPaneWidth}
        inspectorWidth={width}
      />
    )}
    {paneMode === 'a11y' && a11yResults !== null && a11yResults.length > 0 && (
      <ScanResultsPane
        title={a11yScopeLabel ? `Accessibility · ${a11yScopeLabel}` : 'Accessibility'}
        results={a11yResults}
        expanded={a11yExpanded}
        onToggleBucket={toggleA11yBucket}
        onPickEl={pickAndPan}
        onClose={() => setPaneMode(null)}
        width={scanPaneWidth}
        onWidthChange={setScanPaneWidth}
        inspectorWidth={width}
      />
    )}
    <div
      data-inspector-ui
      style={{
        position: 'fixed',
        top: 16,
        right: INSPECTOR_LEFT_GAP,
        bottom: 16,
        width,
        zIndex: 2000,
        background: '#18191b',
        color: '#f5f1e8',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        fontSize: 13,
        lineHeight: 1.5,
        overflow: 'hidden',
      }}
    >
      {/* Left-edge drag grip — 6px hot zone with a faint blue line that
          fades in on hover/drag. Matches the ScanResultsPane grip so the
          two stack visually consistent. */}
      <div
        onPointerDown={onGripDown}
        onPointerMove={onGripMove}
        onPointerUp={endGripDrag}
        onPointerCancel={endGripDrag}
        onMouseEnter={() => setGripHover(true)}
        onMouseLeave={() => setGripHover(false)}
        style={{
          position: 'absolute',
          top: 0,
          left: -3,
          bottom: 0,
          width: 6,
          cursor: 'ew-resize',
          zIndex: 1,
        }}
        title="Drag to resize"
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 2,
            width: 2,
            background: gripActive ? '#9aa6bb' : 'transparent',
            transition: gripActive
              ? 'none'
              : 'background 120ms ease 120ms',
            pointerEvents: 'none',
          }}
        />
      </div>
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#fff',
            letterSpacing: -0.2,
            flexShrink: 0,
          }}
        >
          RingScope
        </span>
        <span
          title="Alpha — APIs and tree behaviour may change without notice"
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: '#cfe0ff',
            background: 'rgba(154,166,187,0.18)',
            border: '1px solid rgba(154,166,187,0.45)',
            padding: '1px 6px',
            borderRadius: 999,
            lineHeight: 1.4,
            flexShrink: 0,
          }}
        >
          alpha
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: 'rgba(255,255,255,0.45)',
            fontStyle: 'italic',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0,
          }}
        >
          created by Alex Roitch
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 22,
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
          }}
          title="Close (Esc to exit inspector)"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {selected ? (
          <SelectedElementBody
            selected={selected}
            onJumpTo={onJumpTo}
            activePane={activePane}
            setActivePane={setActivePane}
            copy={copy}
            copiedKey={copiedKey}
            treeHeight={treeHeight}
            setTreeHeight={setTreeHeight}
            boxModelMode={boxModelMode}
            setBoxModelMode={setBoxModelMode}
            colorMode={colorMode}
            setColorMode={setColorMode}
            forced={forced}
            onToggleState={onToggleState}
            onClearStates={onClearStates}
          />
        ) : (
          <EmptySelectionMessage />
        )}

        <ScanSection
          mode="tokens"
          title="Spring adherence"
          emptyHint="Press Scan to find computed colors, typography, and shadows that don't reverse-lookup to any Spring token. Select an element first to scope the scan to it."
          okHint="No off-token values found."
          results={tokenResults}
          scanning={tokenScanning}
          paneOpen={paneMode === 'tokens'}
          scopeEl={scanScopeEl}
          scopeLabel={scanScopeLabel}
          resultScopeLabel={tokenScopeLabel}
          onRunScan={runTokenScan}
          onTogglePane={() =>
            setPaneMode((p) => (p === 'tokens' ? null : 'tokens'))
          }
        />

        <ScanSection
          mode="a11y"
          title="Accessibility"
          emptyHint="Press Scan to find text whose contrast against its painted background falls below WCAG AA. Select an element first to scope the scan to it."
          okHint="No contrast failures found."
          results={a11yResults}
          scanning={a11yScanning}
          paneOpen={paneMode === 'a11y'}
          scopeEl={scanScopeEl}
          scopeLabel={scanScopeLabel}
          resultScopeLabel={a11yScopeLabel}
          onRunScan={runA11yScan}
          onTogglePane={() =>
            setPaneMode((p) => (p === 'a11y' ? null : 'a11y'))
          }
        />
      </div>
    </div>
    </>
  );
}

// Amber = "state is being forced" accent, matching Chrome DevTools' forced-
// state convention. Used by the chips and the tree kbd badge.
const FORCED_ACCENT = '#ffc46e';
const FORCED_BG = 'rgba(255,180,84,0.16)';
const FORCEABLE_STATES: PseudoState[] = ['hover', 'active', 'focus'];

function StateChips({
  states,
  ancestorForced,
  onToggle,
  onClear,
}: {
  states: PseudoState[];
  ancestorForced: boolean;
  onToggle: (s: PseudoState) => void;
  onClear: () => void;
}) {
  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '3px 9px',
    borderRadius: 5,
    fontSize: 11,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    cursor: 'pointer',
    border: active
      ? `1px solid ${FORCED_ACCENT}`
      : '1px solid rgba(255,255,255,0.14)',
    background: active ? FORCED_BG : 'transparent',
    color: active ? FORCED_ACCENT : 'rgba(255,255,255,0.6)',
    transition: 'all 100ms ease',
  });
  const idle = states.length === 0;
  return (
    <Section title="State">
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={onClear}
          style={{ ...chipStyle(false), fontFamily: 'inherit', opacity: idle ? 1 : 0.8 }}
          title="Clear forced states"
        >
          idle
        </button>
        {FORCEABLE_STATES.map((s) => (
          <button
            key={s}
            onClick={() => onToggle(s)}
            style={chipStyle(states.includes(s))}
            title={`Force ${s} on the selected element`}
          >
            {s}
          </button>
        ))}
      </div>
      {ancestorForced && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.45,
          }}
        >
          A state is forced on an ancestor (amber badge in the tree). It stays
          while you inspect its contents; toggling here moves the forcing to
          this element.
        </div>
      )}
    </Section>
  );
}

function EmptySelectionMessage() {
  return (
    <div
      style={{
        padding: '32px 16px',
        marginBottom: 16,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.55)',
        fontSize: 13,
        lineHeight: 1.55,
        border: '1px dashed rgba(255,255,255,0.12)',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div
        aria-hidden
        style={{
          fontSize: 24,
          marginBottom: 8,
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        ⌖
      </div>
      Click an element in an artboard to see its details.
      <div style={{ marginTop: 8, fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>
        Or run a canvas-wide scan below.
      </div>
    </div>
  );
}

// ───────── Agent handoff (Copy for agent) ─────────
//
// The Figma-dev-mode-MCP analogue: one click copies a self-contained,
// platform-neutral markdown spec of the selection (rendered structure with
// resolved values inlined, Spring token names as comments, forced
// :hover/:active/:focus diffs, motion) for pasting into ANY coding agent —
// including ones implementing in a different stack (iOS/Android). The chip
// shows an approximate token cost before you commit, like Figma's dev mode.

function fmtTokenCount(n: number): string {
  return n < 1000 ? `${n}` : `${(n / 1000).toFixed(1)}k`;
}

// Hand-rolled AI sparkle (NOT a Spring icon import — the vendored bundle stubs
// `@ringcentral/spring-icon`, so panel chrome must never render Spring
// components). Gradient echoes Spring's AI-accent treatment.
function AiSparkleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id="dc-ai-sparkle"
          x1="0"
          y1="0"
          x2="24"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#7ab8ff" />
          <stop offset="0.55" stopColor="#a08cff" />
          <stop offset="1" stopColor="#ff9ecb" />
        </linearGradient>
      </defs>
      <path
        fill="url(#dc-ai-sparkle)"
        d="M10 1.5 C10.7 6.2 12.5 8.6 17.5 10 C12.5 11.4 10.7 13.8 10 18.5 C9.3 13.8 7.5 11.4 2.5 10 C7.5 8.6 9.3 6.2 10 1.5 Z"
      />
      <path
        fill="url(#dc-ai-sparkle)"
        d="M18.5 14.5 C18.9 16.9 19.9 18.2 22.5 19 C19.9 19.8 18.9 21.1 18.5 23.5 C18.1 21.1 17.1 19.8 14.5 19 C17.1 18.2 18.1 16.9 18.5 14.5 Z"
      />
    </svg>
  );
}

function AgentHandoffSection({
  selected,
  forced,
  copy,
  copiedKey,
}: {
  selected: SelectedNode;
  forced: { host: Element; states: PseudoState[] } | null;
  copy: (text: string, key: string) => void;
  copiedKey: string | null;
}) {
  const [estimate, setEstimate] = useState<number | null>(null);

  // Artboard selections serialize the design surface (.dc-card), not the
  // slot wrapper (which carries the label row + focus-button chrome).
  const root =
    selected.kind === 'artboard'
      ? (selected.domNode.querySelector('.dc-card') as HTMLElement | null) ??
        selected.domNode
      : selected.domNode;

  const baseOpts = () => {
    const name =
      selected.kind === 'element' || selected.kind === 'artboard'
        ? null
        : springAwareName(selected.fiber.type);
    return {
      resolvers: HANDOFF_RESOLVERS,
      title: selectedLabel(selected),
      artboard: selected.artboardSlot,
      anchor: selected.anchor,
      authoredJSX: name
        ? formatJSX(name, selected.fiber.memoizedProps ?? {})
        : null,
    };
  };

  // Token estimate: serialize WITHOUT state forcing (pure reads — running the
  // forcer on every selection change would mutate live DOM attrs). Deferred a
  // beat so rapid tree-walking doesn't pay the walk on every keydown.
  useEffect(() => {
    let cancelled = false;
    setEstimate(null);
    const t = setTimeout(() => {
      try {
        const res = serializeSelection(root, { ...baseOpts(), includeStates: false });
        if (!cancelled) setEstimate(res.tokenEstimate);
      } catch {
        if (!cancelled) setEstimate(null);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);

  const onCopy = () => {
    try {
      const res = serializeSelection(root, {
        ...baseOpts(),
        includeStates: true,
        restoreForced: forced,
      });
      copy(res.markdown, 'agent-handoff');
    } catch {
      // serialization failure — leave the button un-ticked
    }
  };

  const copied = copiedKey === 'agent-handoff';
  return (
    <div
      style={{
        marginBottom: 16,
        padding: '10px 12px 11px',
        borderRadius: 10,
        border: '1px solid rgba(122,140,255,0.38)',
        background:
          'linear-gradient(135deg, rgba(45,127,255,0.13), rgba(160,110,255,0.10) 55%, rgba(255,158,203,0.08))',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          marginBottom: 9,
        }}
      >
        <AiSparkleIcon />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: '#dbe6ff',
          }}
        >
          Agent handoff
        </span>
        {estimate != null && (
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
              fontSize: 11,
              color: 'rgba(219,230,255,0.6)',
            }}
            title="Approximate LLM token cost of the copied spec (chars ÷ 4)"
          >
            ~{fmtTokenCount(estimate)} tokens
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onCopy}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 7,
          border: '1px solid rgba(45,127,255,0.6)',
          background: copied ? 'rgba(45,127,255,0.42)' : 'rgba(45,127,255,0.24)',
          color: '#e6efff',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
        title="Copy a self-contained spec of this selection for an AI coding agent (any stack)"
      >
        {copied ? '✓ Copied — paste into any coding agent' : 'Copy for agent'}
      </button>
      <div
        style={{
          marginTop: 7,
          fontSize: 11,
          lineHeight: '15px',
          color: 'rgba(219,230,255,0.55)',
        }}
      >
        Self-contained spec — implement in any stack.
      </div>
      {/* Nudge authors toward richer handoffs: interaction choreography can't
          be machine-captured, but authored data-interaction notes ride the
          rendered DOM into every copy (see agentHandoff.ts / UPDATES.md #14). */}
      <div
        style={{
          marginTop: 5,
          fontSize: 10,
          lineHeight: '14px',
          color: 'rgba(219,230,255,0.4)',
        }}
      >
        Tip for designers: ask your agent to add{' '}
        <code
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: 9.5,
            color: 'rgba(219,230,255,0.55)',
          }}
        >
          data-interaction
        </code>{' '}
        notes to the prototype — behaviors ship in the spec too.
      </div>
    </div>
  );
}

function SelectedElementBody({
  selected,
  onJumpTo,
  activePane,
  setActivePane,
  copy,
  copiedKey,
  treeHeight,
  setTreeHeight,
  boxModelMode,
  setBoxModelMode,
  colorMode,
  setColorMode,
  forced,
  onToggleState,
  onClearStates,
}: {
  selected: SelectedNode;
  onJumpTo: (next: SelectedNode) => void;
  activePane: 'explode' | 'xray' | null;
  setActivePane: React.Dispatch<React.SetStateAction<'explode' | 'xray' | null>>;
  copy: (text: string, key: string) => void;
  copiedKey: string | null;
  treeHeight: number;
  setTreeHeight: (n: number) => void;
  boxModelMode: 'token' | 'px';
  setBoxModelMode: (m: 'token' | 'px') => void;
  colorMode: ColorDisplayMode;
  setColorMode: (m: ColorDisplayMode) => void;
  forced: { host: Element; states: PseudoState[] } | null;
  onToggleState: (s: PseudoState) => void;
  onClearStates: () => void;
}) {
  const { fiber, kind, domNode } = selected;
  // States forced on the SELECTED element (chips reflect these). A forced
  // ancestor still shows via the tree badge, but the chips always act on the
  // current selection — toggling while a descendant is selected moves the
  // forcing there.
  const selectedForced: PseudoState[] =
    forced && forced.host === domNode ? forced.states : [];
  const forcedBadge = forced
    ? {
        host: forced.host,
        label: forced.states.join(' '),
      }
    : null;
  const isHost = kind === 'element' || kind === 'artboard';
  const componentName = isHost ? null : springAwareName(fiber.type) ?? 'unknown';
  const props = fiber.memoizedProps ?? {};
  const propEntries = !isHost
    ? Object.entries(props).filter(
        ([k]) => k !== 'children' && k !== 'key' && k !== 'ref',
      )
    : [];

  // Asset detection. Try the selected node directly; if it's a Spring Icon
  // wrapper span (or any element whose only meaningful descendant is a single
  // svg/img/video/audio) the asset is "really" the inner element. The descend
  // path is intentionally narrow — we don't want every container with an
  // <img> deep inside it to surface an Image section.
  let assetInfo = getAssetInfo(domNode);
  if (!assetInfo && (kind === 'spring' || kind === 'user')) {
    const inner =
      domNode.querySelector(':scope > svg, :scope > img, :scope > video, :scope > audio') ||
      domNode.querySelector('svg, img, video, audio');
    if (inner) assetInfo = getAssetInfo(inner as HTMLElement | SVGElement);
  }

  return (
    <>
      <ElementPreview
        node={domNode}
        activePane={activePane}
        onTogglePane={(p) => setActivePane((cur) => (cur === p ? null : p))}
        rebuildKey={
          forced
            ? `${elementKey(forced.host)}:${forced.states.slice().sort().join(',')}`
            : ''
        }
      />

      {/* Interaction-state forcer — freeze hover/active/focus so their styles
          can be read calmly with the cursor away in this panel. */}
      <StateChips
        states={selectedForced}
        ancestorForced={!!forced && forced.host !== domNode}
        onToggle={onToggleState}
        onClear={onClearStates}
      />

      <ComponentTree
        selected={selected}
        onJumpTo={onJumpTo}
        height={treeHeight}
        onHeightChange={setTreeHeight}
        forcedBadge={forcedBadge}
      />

      <AgentHandoffSection
        selected={selected}
        forced={forced}
        copy={copy}
        copiedKey={copiedKey}
      />

      <BoxModel
        node={domNode}
        mode={boxModelMode}
        onModeChange={setBoxModelMode}
        onCopy={(t) => copy(t, `tok:${t}`)}
        copiedKey={copiedKey}
      />

      {/* Component selection → the props ARE the design spec, so they sit
          prominently right under the box model (element selections show
          styles instead — a component isn't a particular DOM node). */}
      {!isHost && propEntries.length > 0 && (
        <Section title={`${componentName ?? 'Component'} props`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {propEntries.map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr',
                  gap: 8,
                  alignItems: 'baseline',
                  fontSize: 12,
                  padding: '4px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{k}</span>
                <span
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                    color: '#f5f1e8',
                    wordBreak: 'break-word',
                  }}
                >
                  {formatPropValue(v).replace(/^\{|\}$/g, '') || 'true'}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Figma capture + Spring-components-in-capture sections hidden for
          now — re-enable by uncommenting when the bridge work resumes. */}
      {false && !isHost && (
        <FigmaCaptureSection
          fiber={fiber}
          onCopy={(text) => copy(text, 'figma')}
          copiedKey={copiedKey}
        />
      )}

      {assetInfo && (
        <AssetSection info={assetInfo} copy={copy} copiedKey={copiedKey} />
      )}

      {isHost && (
        <ElementBodySections
          domNode={domNode}
          copy={copy}
          copiedKey={copiedKey}
        />
      )}

      <StylesSection
        tokens={selected.tokens}
        resolved={selected.resolved}
        onCopy={(t) => copy(t, `tok:${t}`)}
        copiedKey={copiedKey}
        colorMode={colorMode}
        onColorModeChange={setColorMode}
      />

      {getDirectText(domNode) !== null && (
        <AccessibilitySection
          node={domNode}
          onCopy={(t) => copy(t, `tok:${t}`)}
          copiedKey={copiedKey}
        />
      )}

      <EffectsSection
        node={domNode}
        onCopy={(t) => copy(t, `tok:${t}`)}
        copiedKey={copiedKey}
      />

      {/* The old "Web dev" (Source vscode-link / JSX / className) and "Misc"
          (data-anchor verification) bands were removed 2026-07-16: the Agent
          handoff payload carries the anchor + authored JSX for consumers, the
          vscode:// link only ever resolved on the authoring machine, and the
          raw className row was web plumbing no handoff audience needed. */}
    </>
  );
}

function ElementPreview({
  node,
  activePane,
  onTogglePane,
  rebuildKey,
}: {
  node: HTMLElement;
  activePane: 'explode' | 'xray' | null;
  onTogglePane: (pane: 'explode' | 'xray') => void;
  // Changes whenever the source's appearance changed for a reason `node`
  // identity can't see (forced hover/active states) — re-clones the preview.
  rebuildKey?: string;
}) {
  const exploded = activePane === 'explode';
  const xrayed = activePane === 'xray';
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.innerHTML = '';

    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      const empty = document.createElement('div');
      empty.textContent = 'zero-size element';
      empty.style.cssText =
        'color:rgba(255,255,255,0.4);font-size:11px;font-style:italic;height:100%;display:flex;align-items:center;justify-content:center;';
      wrap.appendChild(empty);
      return;
    }

    // Compensate for any ancestor transform (DesignCanvas viewport zoom).
    // Without this, a zoomed-out canvas hands us a shrunken rect while the
    // clone's internal CSS sizing is still at natural CSS px — clone ends up
    // looking like it was drag-resized.
    const canvasScale = getAncestorScale(node);
    const naturalW = rect.width / canvasScale;
    const naturalH = rect.height / canvasScale;

    const containerW = wrap.clientWidth;
    const containerH = wrap.clientHeight;
    const scale = Math.min(
      containerW / naturalW,
      containerH / naturalH,
      1,
    );

    // cloneNode(true) carries class names and inline styles — since our
    // stylesheets are global, the clone renders with the real visual
    // appearance. Event handlers and refs don't clone, which is what we want
    // for a read-only thumbnail.
    const clone = node.cloneNode(true) as HTMLElement;
    // cloneNode drops React's property-only `muted` — re-mute or every cloned
    // video tile autoplays with sound.
    muteClonedMedia(clone);
    // Re-supply ancestor-defined CSS vars the clone's subtree references
    // (Squircle fills, Button bg vars, …) — the panel is outside them all.
    inlineCustomProperties(node, clone);
    clone.style.margin = '0';
    clone.style.transformOrigin = 'top left';
    clone.style.transform = `scale(${scale})`;
    clone.style.width = `${naturalW}px`;
    clone.style.height = `${naturalH}px`;
    clone.style.boxSizing = 'border-box';
    clone.style.flexShrink = '0';
    clone.style.position = 'absolute';
    clone.style.top = '0';
    clone.style.left = '0';

    const scaledW = naturalW * scale;
    const scaledH = naturalH * scale;
    const positioner = document.createElement('div');
    positioner.style.cssText = `position:absolute;left:${Math.round((containerW - scaledW) / 2)}px;top:${Math.round((containerH - scaledH) / 2)}px;width:${scaledW}px;height:${scaledH}px;pointer-events:none;`;
    // If the source sits inside a scoped Spring theme (e.g. a dark
    // <ThemeProvider scope="…">), the preview lives in the inspector panel —
    // outside that scope — so the clone would render in the global (light)
    // theme. ThemeProvider injects the scope's token rule globally, so
    // re-stamping the same `data-sui-theme-scope` on the preview container
    // re-applies those tokens and the clone matches the real screen.
    const scopeHost = themeScopeHostOf(node);
    const scopeId = scopeHost?.getAttribute('data-sui-theme-scope');
    if (scopeId) positioner.setAttribute('data-sui-theme-scope', scopeId);
    positioner.appendChild(clone);
    wrap.appendChild(positioner);
  }, [node, rebuildKey]);

  return (
    <Section
      title="Preview"
      action={
        <span style={{ display: 'inline-flex', gap: 6 }}>
          <button
            onClick={() => onTogglePane('xray')}
            title={xrayed ? 'Close x-ray pane' : 'Open x-ray pane'}
            style={previewActionBtnStyle(xrayed)}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <rect x="5" y="5" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" />
            </svg>
            {xrayed ? 'x-ray' : 'x-ray'}
          </button>
          <button
            onClick={() => onTogglePane('explode')}
            title={exploded ? 'Close 3D explode pane' : 'Open 3D explode pane'}
            style={previewActionBtnStyle(exploded)}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1.5l5.5 3v7L8 14.5l-5.5-3v-7L8 1.5zM8 1.5v6m0 0L2.5 4.5M8 7.5l5.5-3M8 7.5v7"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            {exploded ? 'exploded' : 'explode'}
          </button>
        </span>
      }
    >
      <div
        ref={wrapRef}
        style={{
          position: 'relative',
          height: 140,
          background:
            'repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, rgba(255,255,255,0.06) 0% 50%) 50% / 14px 14px',
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      />
    </Section>
  );
}

// Walk the selected element's direct DOM children and classify each one in
// React terms — find the outermost interesting fiber between the child's
// fiber and the selected fiber, that's the "child component" we attribute to.
// Pure-host children fall through and we just show their tag name.
// DOM-complete child enumeration: one row per direct DOM child of `parent`,
// always. Fibers are used only to LABEL/PROMOTE a row (e.g. collapse a host
// chain into a single "Button" row) — never to prune the walk. This is what
// lets the tree reach the same nodes the preview reads: SVG internals, nodes
// behind fiber-less wrappers, sibling hosts that share one component fiber, and
// content rendered through a portal (Spring Modal/Popover) that lands in the
// DOM under this subtree. `parentFiber` (when known) bounds the upward
// promotion walk; null means "don't promote" (we're under a fiber-less node).
function getChildSummary(
  parent: Element,
  parentFiber: Fiber | null,
): AncestryNode[] {
  const out: AncestryNode[] = [];

  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i];
    if (!(child instanceof Element)) continue;
    const childFiber = getFiberFromDom(child);

    // Collect the full ladder of "interesting" component fibers between this
    // host and the parent boundary — only possible when both fibers are known.
    // Walked innermost→outermost, then reversed so the tree renders the
    // outermost rung first (StatusTile above Button above <button>).
    let chain: NonNullable<AncestryNode['chain']> = [];
    if (childFiber && parentFiber) {
      let cur: Fiber | null = childFiber;
      let reachedParent = false;
      while (cur) {
        // Boundary check is alternate-aware with a DOM-host fallback: the
        // `.return` chain of a DOM-stamped fiber can route through the OTHER
        // generation of the parent's alternate pair after a re-render, and an
        // exact `===` here silently dropped component labels (the false-portal
        // bug). `stateNode === parent` catches the boundary regardless of
        // which generation we landed on.
        if (fiberMatch(cur, parentFiber) || cur.stateNode === parent) {
          reachedParent = true;
          break;
        }
        const cname = springAwareName(cur.type);
        if (isInterestingName(cname) && rendersOwnDom(cur)) {
          const kind: AncestryKind = isSpringType(cur.type) ? 'spring' : 'user';
          // memo(forwardRef(fn)) exports produce TWO fibers with the same
          // resolved name on the same host (memo wrapper + inner forwardRef).
          // One ladder rung is enough — keep the outer (later, since we walk
          // inner→outer) so selection binds to the outermost wrapper.
          const prev = chain[chain.length - 1];
          if (prev && prev.name === cname) {
            chain[chain.length - 1] = { fiber: cur, name: cname!, kind };
          } else {
            chain.push({ fiber: cur, name: cname!, kind });
          }
        }
        cur = cur.return;
      }
      // React-parent and DOM-parent disagree (genuine portal): we never met
      // the parent walking up. Don't trust the collected components here;
      // fall back to a plain element row. hostFor() returns `child` either way,
      // so recursion stays inside this DOM subtree.
      if (!reachedParent) chain = [];
      else {
        chain.reverse();
        // The outermost rung carries the host's authored layer label, same as
        // the old single promoted row ("StatusTile · BRB tile").
        if (chain.length) {
          chain[0] = { ...chain[0], name: appendLayerLabel(chain[0].name, child) };
        }
      }
    }

    out.push({
      fiber: childFiber ?? undefined,
      name: formatHostName(child, child.tagName.toLowerCase()),
      kind: 'element',
      dom: child,
      chain: chain.length ? chain : undefined,
    });
  }
  return out;
}

// Invisible plumbing filter for the Hierarchy tree. True when the element
// paints nothing a designer could point at: `display:none`, or a zero-size
// box whose descendants are ALL zero-size too (e.g. Spring Squircle's hidden
// 0×0 <svg><defs> that only declares the clip path). A 0×0 element with a
// visible overflowing descendant (anchor-point patterns) is NOT plumbing and
// stays in the tree.
const PLUMBING_SCAN_CAP = 60;
function isHiddenPlumbing(el: Element): boolean {
  let cs: CSSStyleDeclaration;
  try {
    cs = getComputedStyle(el);
  } catch {
    return false;
  }
  if (cs.display === 'none') return true;
  const r = el.getBoundingClientRect();
  if (r.width > 0 || r.height > 0) return false;
  const descendants = el.querySelectorAll('*');
  const n = Math.min(descendants.length, PLUMBING_SCAN_CAP);
  for (let i = 0; i < n; i++) {
    const dr = descendants[i].getBoundingClientRect();
    if (dr.width > 0 || dr.height > 0) return false;
  }
  // Bail out of hiding when the subtree is too big to have fully checked.
  return descendants.length <= PLUMBING_SCAN_CAP;
}

const LAYER_PALETTE: Record<
  AncestryKind,
  { label: string }
> = {
  artboard: { label: 'rgba(255,255,255,0.55)' },
  user: { label: '#ff9ecb' },
  spring: { label: '#9bb9ff' },
  element: { label: 'rgba(255,255,255,0.82)' },
};

// Resolve the host element for an ancestry node so we can read its children.
// Prefer the DOM element captured at walk time (getChildSummary) — it's exact
// for SVG and multi-host wrappers, where fiber-based resolution fails. Fall
// back to fiber resolution for nodes built without it (buildAncestry chain,
// artboard sentinel).
function hostFor(node: AncestryNode): Element | null {
  if (node.dom) return node.dom;
  if (!node.fiber) return null;
  if (node.kind === 'element' || node.kind === 'artboard') {
    return node.fiber.stateNode instanceof HTMLElement
      ? node.fiber.stateNode
      : findFirstHostElement(node.fiber);
  }
  return findFirstHostElement(node.fiber);
}

const TREE_MIN_HEIGHT = 120;
const TREE_MAX_HEIGHT = 800;
// Safety net for pathological trees (a participant list of 500, an icon-grid
// with 200 entries, anything where a single parent has way more children than
// is useful to scroll through). Cap any single level at this many rows; any
// child whose subtree contains the current selection is force-included so the
// path-to-selected always renders even when truncated. Click "show N more"
// on the parent to reveal the rest.
const TREE_BREADTH_CAP = 80;

function ComponentTree({
  selected,
  onJumpTo,
  height,
  onHeightChange,
  forcedBadge,
}: {
  selected: SelectedNode;
  onJumpTo: (next: SelectedNode) => void;
  height: number;
  onHeightChange: (h: number) => void;
  forcedBadge?: { host: Element; label: string } | null;
}) {
  // Persist which rows the user has opened, keyed by DOM host (the row's stable
  // identity — fiber is wrong: one host can back several fibers, and fiber-less
  // rows have none). Survives selection changes so that jumping into an
  // expanded child doesn't collapse its siblings.
  const [expanded, setExpanded] = useState<Set<Element>>(new Set());
  // Per-parent override: when present, render ALL children at that level
  // instead of truncating at TREE_BREADTH_CAP. Driven by the "show N more"
  // button on a truncated parent. Keyed by the parent host element.
  const [breadthExpanded, setBreadthExpanded] = useState<Set<Element>>(new Set());
  // Ladder-rung expansion (component rows stacked above a host element). Rungs
  // have no DOM element of their own, so they're keyed by `elementKey(host) +
  // rung index` strings instead.
  const [ladderOpen, setLadderOpen] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState(false);
  const toggle = (host: Element) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(host)) next.delete(host);
      else next.add(host);
      return next;
    });
  };
  const toggleLadder = (key: string) => {
    setLadderOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const toggleBreadth = (host: Element) => {
    setBreadthExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(host)) next.delete(host);
      else next.add(host);
      return next;
    });
  };

  // Ancestry comes deepest-first (selected → up); we want top → bottom in the
  // tree, so reverse. Strip the Artboard sentinel — it's a canvas construct
  // (DCArtboardFrame), not part of the design being inspected, so we don't
  // want it showing up as a clickable row.
  // Full layers-panel tree: render starting from the artboard's child list,
  // recursing down. Every ancestor of the selected element renders with its
  // siblings visible; chainFibers force-expands the path-to-selected. The
  // artboard itself stays out of the displayed tree (it's a canvas
  // construct, not part of the design) — we just use it as the root parent
  // whose children seed the recursion.
  const rawAncestry = buildAncestry(selected.fiber); // deepest-first
  if (rawAncestry.length === 0) return null;
  const rawChain = [...rawAncestry].reverse(); // top-down, may include artboard at [0]
  const displayChain = rawChain.filter((n) => n.kind !== 'artboard');
  const selectedAncestryNode = displayChain[displayChain.length - 1];
  // Find the artboard sentinel so we can render its children as the top of
  // the tree. If the selection isn't under an artboard (unusual), fall back
  // to today's "selected + its own children" rendering.
  const artboardNode = rawChain.find((n) => n.kind === 'artboard') ?? null;
  const artboardOuter = artboardNode ? hostFor(artboardNode) : null;
  // The DCArtboardFrame host renders a `[data-dc-slot]` outer with three
  // children: `.dc-labelrow` (drag handle + name), `.dc-expand` (focus
  // button), and `.dc-card` (the actual design surface). Only `.dc-card`
  // should seed the tree — everything else is canvas chrome, not part of
  // the design being inspected.
  const artboardHost =
    (artboardOuter?.querySelector('.dc-card') as HTMLElement | null) ??
    artboardOuter;
  // Force-open key: any row whose host DOM element contains the selected
  // DOM node is on the path to selection — by-DOM-containment is more
  // robust than by-fiber-set because buildAncestry only collects
  // "interesting" React fibers and skips intermediate host wrappers that
  // can show up as rows in our recursive render.
  const selectedHost = selected.domNode;

  const handleJump = (n: AncestryNode) => {
    // Prefer fiber (resolves component JSX/props); fall back to the DOM host
    // both for fiber-less rows and when fiber resolution comes up empty, so
    // every row with a known host stays selectable.
    const next =
      (n.fiber ? buildSelectedFromFiber(n.fiber, n.kind) : null) ??
      (n.dom ? buildSelectedFromHost(n.dom) : null);
    if (next) onJumpTo(next);
  };

  // Drag-resize. Capture pointer on the grip so movement outside the strip
  // still flows to us. Use clientY deltas (panel is position:fixed, so no
  // canvas-scale compensation needed). Disable text selection while
  // dragging to keep the cursor read as a resize affordance.
  const onGripPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = height;
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // some browsers throw if pointer is already released — ignore
    }
    setDragging(true);
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';

    const onMove = (ev: PointerEvent) => {
      const next = Math.max(
        TREE_MIN_HEIGHT,
        Math.min(TREE_MAX_HEIGHT, startH + (ev.clientY - startY)),
      );
      onHeightChange(next);
    };
    const onUp = () => {
      setDragging(false);
      document.body.style.userSelect = prevUserSelect;
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      target.removeEventListener('pointercancel', onUp);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
    target.addEventListener('pointercancel', onUp);
  };

  // Auto-scroll the selected row into view whenever the selection changes
  // (canvas click, walkUp, scan jump). `block: 'nearest'` no-ops when the
  // row is already visible — feels stable instead of constantly recentering.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current?.querySelector<HTMLElement>(
      '[data-tree-selected="true"]',
    );
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selected.fiber]);

  return (
    <Section title="Hierarchy">
      <div
        style={{
          fontSize: 11.5,
          lineHeight: 1.4,
          color: 'rgba(255,255,255,0.45)',
          marginBottom: 6,
        }}
      >
        Tip: add a{' '}
        <code
          style={{
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: 11,
            padding: '0 4px',
            borderRadius: 3,
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          data-name
        </code>{' '}
        attribute to any element to label it in this tree.
      </div>
      <div
        ref={scrollRef}
        style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 6,
          padding: '4px 0',
          height,
          overflowY: 'auto',
        }}
      >
        {artboardNode && artboardHost ? (
          // Full tree: recurse from the artboard's children. Every ancestor
          // of the selected element renders with its siblings; the path
          // toward selected is force-expanded via chainFibers. Selected
          // itself is highlighted and also force-expanded so its own
          // children appear collapsed below it.
          <ChildrenList
            host={artboardHost}
            parentFiber={artboardNode.fiber}
            depth={0}
            expanded={expanded}
            breadthExpanded={breadthExpanded}
            ladderOpen={ladderOpen}
            activeFiber={selected.fiber}
            selectedKind={selected.kind}
            selectedHost={selectedHost}
            forcedBadge={forcedBadge}
            onToggle={toggle}
            onBreadthToggle={toggleBreadth}
            onLadderToggle={toggleLadder}
            onJumpTo={handleJump}
          />
        ) : (
          // Fallback: selection isn't under an artboard. Render the
          // displayChain as flat rows + selected's children below — this is
          // the legacy behavior; should rarely fire in practice since the
          // inspector is only enabled inside DesignCanvas.
          <>
            {displayChain.slice(0, -1).map((n, i) => (
              <TreeRow
                key={`anc:${i}`}
                node={n}
                depth={i}
                isSelected={false}
                expandable={false}
                isOpen={false}
                onToggle={() => {}}
                onJumpTo={() => handleJump(n)}
              />
            ))}
            <TreeRow
              node={selectedAncestryNode}
              depth={displayChain.length - 1}
              isSelected
              expandable={false}
              isOpen
              onToggle={() => {}}
              onJumpTo={() => handleJump(selectedAncestryNode)}
            />
            <ChildrenList
              host={selected.domNode}
              parentFiber={selected.fiber}
              depth={displayChain.length}
              expanded={expanded}
              breadthExpanded={breadthExpanded}
              ladderOpen={ladderOpen}
              activeFiber={selected.fiber}
              selectedKind={selected.kind}
              selectedHost={selectedHost}
              forcedBadge={forcedBadge}
              onToggle={toggle}
              onBreadthToggle={toggleBreadth}
              onLadderToggle={toggleLadder}
              onJumpTo={handleJump}
            />
          </>
        )}
      </div>
      {/* Drag-to-resize grip. Sits flush under the scroll container; small
          hit zone, larger visual gutter on hover. */}
      <div
        onPointerDown={onGripPointerDown}
        title="Drag to resize"
        style={{
          height: 10,
          marginTop: 2,
          cursor: 'ns-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'none',
          userSelect: 'none',
          borderRadius: 4,
          background: dragging ? 'rgba(155,185,255,0.18)' : 'transparent',
          transition: 'background 120ms ease',
        }}
        onMouseEnter={(e) => {
          if (!dragging)
            (e.currentTarget as HTMLDivElement).style.background =
              'rgba(255,255,255,0.06)';
        }}
        onMouseLeave={(e) => {
          if (!dragging)
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        }}
      >
        <div
          style={{
            width: 36,
            height: 3,
            borderRadius: 2,
            background: dragging
              ? 'rgba(155,185,255,0.7)'
              : 'rgba(255,255,255,0.25)',
          }}
        />
      </div>
    </Section>
  );
}

function ChildrenList({
  host,
  parentFiber,
  depth,
  expanded,
  breadthExpanded,
  ladderOpen,
  activeFiber,
  selectedKind,
  selectedHost,
  forcedBadge,
  onToggle,
  onBreadthToggle,
  onLadderToggle,
  onJumpTo,
}: {
  host: Element;
  // Fiber boundary that bounds promotion in getChildSummary. Null when we're
  // under a fiber-less host (no boundary to walk up to).
  parentFiber: Fiber | null;
  depth: number;
  expanded: Set<Element>;
  breadthExpanded: Set<Element>;
  ladderOpen: Set<string>;
  // The fiber that's actually selected — gets the highlight + force-expanded.
  activeFiber?: Fiber | null;
  // The selection's kind — decides whether the highlight lands on a component
  // rung (spring/user) or on the element row itself.
  selectedKind?: AncestryKind;
  // The selected element's DOM node. Used for force-open via DOM containment:
  // any row whose host DOM element contains this node is on the path to the
  // selection and should render expanded by default, regardless of whether
  // its fiber appears in buildAncestry's chain. Fixes the case where an
  // intermediate host wrapper (e.g. a span between Button and its inner
  // content) hides the selected element behind a collapsed row.
  selectedHost?: Element | null;
  // Host carrying forced interaction states + its ':hover:active' label — the
  // matching row renders an amber kbd badge.
  forcedBadge?: { host: Element; label: string } | null;
  onToggle: (host: Element) => void;
  onBreadthToggle: (host: Element) => void;
  onLadderToggle: (key: string) => void;
  onJumpTo: (n: AncestryNode) => void;
}) {
  // Drop invisible-plumbing rows (display:none subtrees, 0×0 defs-only svgs)
  // — but never a row that holds or contains the current selection, so a
  // selection reached some other way (scan jump) can't be orphaned.
  const allChildren = getChildSummary(host, parentFiber).filter((c) => {
    const h = hostFor(c);
    if (!h) return true;
    if (selectedHost && (h === selectedHost || h.contains(selectedHost))) return true;
    return !isHiddenPlumbing(h);
  });
  if (allChildren.length === 0) {
    if (depth === 0) return null;
    return (
      <div
        style={{
          paddingLeft: 8 + depth * 14,
          paddingRight: 8,
          paddingTop: 2,
          paddingBottom: 2,
          fontSize: 10,
          color: 'rgba(255,255,255,0.35)',
          fontStyle: 'italic',
        }}
      >
        empty
      </div>
    );
  }

  // Breadth cap. If the parent has more than TREE_BREADTH_CAP children and
  // the user hasn't opted into "show all" for this parent, render only the
  // first cap-worth — PLUS any child whose subtree contains the selected
  // element, so the path-to-selection never gets hidden behind truncation.
  const showAll = breadthExpanded.has(host);
  let visibleChildren = allChildren;
  let hiddenCount = 0;
  if (!showAll && allChildren.length > TREE_BREADTH_CAP) {
    const head = allChildren.slice(0, TREE_BREADTH_CAP);
    const tailMustInclude = selectedHost
      ? allChildren.slice(TREE_BREADTH_CAP).filter((c) => {
          const ch = hostFor(c);
          return ch ? ch.contains(selectedHost) : false;
        })
      : [];
    visibleChildren = [...head, ...tailMustInclude];
    hiddenCount = allChildren.length - visibleChildren.length;
  }

  return (
    <>
      {visibleChildren.map((child, i) => (
        <ChildSubtree
          key={`${i}:${child.name}`}
          node={child}
          depth={depth}
          parentFiber={parentFiber}
          expanded={expanded}
          breadthExpanded={breadthExpanded}
          ladderOpen={ladderOpen}
          activeFiber={activeFiber}
          selectedKind={selectedKind}
          selectedHost={selectedHost}
          forcedBadge={forcedBadge}
          onToggle={onToggle}
          onBreadthToggle={onBreadthToggle}
          onLadderToggle={onLadderToggle}
          onJumpTo={onJumpTo}
        />
      ))}
      {hiddenCount > 0 && (
        <div
          onClick={() => onBreadthToggle(host)}
          title="Show all hidden children at this level"
          style={{
            paddingLeft: 8 + (depth + 1) * 14,
            paddingRight: 8,
            paddingTop: 3,
            paddingBottom: 3,
            fontSize: 11,
            color: 'rgba(155,185,255,0.8)',
            cursor: 'pointer',
            fontStyle: 'italic',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.color = '#cfe0ff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.color =
              'rgba(155,185,255,0.8)';
          }}
        >
          + show {hiddenCount} more
        </div>
      )}
    </>
  );
}

function ChildSubtree({
  node,
  depth,
  parentFiber,
  expanded,
  breadthExpanded,
  ladderOpen,
  activeFiber,
  selectedKind,
  selectedHost,
  forcedBadge,
  onToggle,
  onBreadthToggle,
  onLadderToggle,
  onJumpTo,
}: {
  node: AncestryNode;
  depth: number;
  // The boundary fiber inherited from the enclosing ChildrenList. A fiber-less
  // row introduces no new boundary, so its children keep using this one.
  parentFiber: Fiber | null;
  expanded: Set<Element>;
  breadthExpanded: Set<Element>;
  ladderOpen: Set<string>;
  activeFiber?: Fiber | null;
  selectedKind?: AncestryKind;
  selectedHost?: Element | null;
  forcedBadge?: { host: Element; label: string } | null;
  onToggle: (host: Element) => void;
  onBreadthToggle: (host: Element) => void;
  onLadderToggle: (key: string) => void;
  onJumpTo: (n: AncestryNode) => void;
}) {
  const childHost = hostFor(node);
  const chain = node.chain ?? [];
  // The forced-state kbd sits on this host's TOP visible row (the outermost
  // ladder rung when one exists, else the element row itself).
  const hostBadge =
    forcedBadge && childHost === forcedBadge.host ? forcedBadge.label : undefined;
  const hasChildren = !!(childHost && childHost.children.length > 0);
  // Force-open when this row's DOM subtree contains the selected element.
  // Catches every ancestor on the path to selection — including intermediate
  // host wrappers (`<span>`s, layout divs) that buildAncestry doesn't track
  // because they aren't "interesting" React components on their own.
  const containsSelection = !!(
    selectedHost && childHost && childHost.contains(selectedHost)
  );
  const elementOpen =
    containsSelection || (!!childHost && expanded.has(childHost));
  // Identity is the DOM host. The highlight lands on the element row only when
  // the selection IS the element (kind 'element'); a component selection on
  // this host highlights the matching ladder rung instead. When the ladder
  // couldn't be built (portal fallback), the element row takes the highlight
  // regardless of kind so the selection is never invisible.
  const isElementSelected =
    (!!selectedHost &&
      childHost === selectedHost &&
      (selectedKind === 'element' || chain.length === 0)) ||
    (!!node.fiber && fiberMatch(activeFiber, node.fiber) && selectedKind === 'element');

  // The element row + its children — the bottom of the ladder.
  const elementRow = (d: number) => (
    <>
      <TreeRow
        node={node}
        depth={d}
        isSelected={isElementSelected}
        expandable={hasChildren}
        isOpen={elementOpen}
        stateBadge={chain.length === 0 ? hostBadge : undefined}
        onToggle={() => childHost && onToggle(childHost)}
        onJumpTo={() => onJumpTo(node)}
      />
      {elementOpen && childHost && (
        <ChildrenList
          host={childHost}
          parentFiber={node.fiber ?? parentFiber}
          depth={d + 1}
          expanded={expanded}
          breadthExpanded={breadthExpanded}
          ladderOpen={ladderOpen}
          activeFiber={activeFiber}
          selectedKind={selectedKind}
          selectedHost={selectedHost}
          forcedBadge={forcedBadge}
          onToggle={onToggle}
          onBreadthToggle={onBreadthToggle}
          onLadderToggle={onLadderToggle}
          onJumpTo={onJumpTo}
        />
      )}
    </>
  );

  // Component ladder above the element: each rung is a component that shares
  // this DOM host (renders no DOM of its own), outermost first. Rungs are
  // collapsible so the default tree keeps today's density — expanding
  // StatusTile reveals Button, expanding Button reveals the element itself.
  // The path to the selection force-opens the whole ladder.
  const renderRung = (i: number, d: number): React.ReactNode => {
    if (i >= chain.length) return elementRow(d);
    const rung = chain[i];
    const rungKey = childHost ? `${elementKey(childHost)}:${i}` : null;
    const rungOpen =
      containsSelection || (rungKey !== null && ladderOpen.has(rungKey));
    const rungSelected =
      !!selectedHost &&
      childHost === selectedHost &&
      selectedKind !== 'element' &&
      fiberMatch(activeFiber, rung.fiber);
    return (
      <>
        <TreeRow
          node={{ fiber: rung.fiber, name: rung.name, kind: rung.kind, dom: childHost ?? undefined }}
          depth={d}
          isSelected={rungSelected}
          expandable={true}
          isOpen={rungOpen}
          stateBadge={i === 0 ? hostBadge : undefined}
          onToggle={() => rungKey !== null && onLadderToggle(rungKey)}
          onJumpTo={() =>
            onJumpTo({
              fiber: rung.fiber,
              name: rung.name,
              kind: rung.kind,
              dom: childHost ?? undefined,
            })
          }
        />
        {rungOpen && renderRung(i + 1, d + 1)}
      </>
    );
  };

  return <>{renderRung(0, depth)}</>;
}

function TreeRow({
  node,
  depth,
  isSelected,
  expandable,
  isOpen,
  stateBadge,
  onToggle,
  onJumpTo,
}: {
  node: AncestryNode;
  depth: number;
  isSelected: boolean;
  expandable: boolean;
  isOpen: boolean;
  // Forced interaction states held by this row's host (':hover:active') —
  // rendered as an amber kbd between the type chip and the name.
  stateBadge?: string;
  onToggle: () => void;
  onJumpTo: () => void;
}) {
  const p = LAYER_PALETTE[node.kind];
  return (
    <div
      onClick={onJumpTo}
      title={`Jump to ${node.kind} · ${node.name}`}
      data-tree-selected={isSelected ? 'true' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        paddingTop: 3,
        paddingBottom: 3,
        paddingRight: 8,
        paddingLeft: 8 + depth * 14,
        background: isSelected ? 'rgba(154,166,187,0.16)' : 'transparent',
        borderLeft: isSelected
          ? '2px solid #9aa6bb'
          : '2px solid transparent',
        cursor: 'pointer',
        fontSize: 11.5,
        color: p.label,
        fontFamily: node.kind === 'element' ? MONO_FF : 'inherit',
        fontWeight: isSelected ? 700 : 500,
        lineHeight: 1.4,
      }}
    >
      {expandable ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 9,
            cursor: 'pointer',
            width: 14,
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isOpen ? '▼' : '▶'}
        </button>
      ) : (
        <span style={{ width: 14, flexShrink: 0 }} />
      )}
      <TypeChip node={node} />
      {stateBadge && (
        <kbd
          title={`Forced interaction state: ${stateBadge}`}
          style={{
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: 9.5,
            lineHeight: 1,
            padding: '2px 4px',
            borderRadius: 3,
            border: `1px solid ${FORCED_ACCENT}`,
            background: FORCED_BG,
            color: FORCED_ACCENT,
            flexShrink: 0,
          }}
        >
          {stateBadge}
        </kbd>
      )}
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          minWidth: 0,
        }}
      >
        {rowLabel(node)}
      </span>
    </div>
  );
}

// Row glyph kind. Components (Spring + user) get a diamond, artboards a frame,
// text-authoring elements a "T", and everything else (layout wrappers, svg/img)
// a box.
type RowGlyph = 'component' | 'artboard' | 'text' | 'box';

function rowGlyph(node: AncestryNode): RowGlyph {
  if (node.kind === 'artboard') return 'artboard';
  if (node.kind === 'spring' || node.kind === 'user') return 'component';
  const dom = node.dom ?? null;
  if (dom instanceof HTMLElement && getDirectText(dom) !== null) return 'text';
  return 'box';
}

// Display text for a row. Components/artboards keep their resolved name (already
// data-name-aware). For elements: a text-authoring element is named by its own
// text content (Figma-style) — that wins even over `data-name`, since the
// visible text is the most recognizable label. Otherwise fall back to
// `data-name`, then the capitalized tag ("Div"). The angle-bracket `<tag>` form
// is replaced by the chip glyph, so the text stays clean.
function rowLabel(node: AncestryNode): string {
  if (node.kind !== 'element') return node.name;
  const dom = node.dom ?? null;
  if (dom instanceof HTMLElement) {
    const text = getDirectText(dom);
    if (text) return text.replace(/\s+/g, ' ').trim(); // CSS ellipsizes long runs
  }
  const dataName = layerLabel(dom);
  if (dataName) return dataName;
  const tag =
    dom?.tagName.toLowerCase() ??
    /^<([a-z0-9-]+)>/i.exec(node.name)?.[1] ??
    'node';
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}

// Keycap-style type chip that leads every hierarchy row. The icon is tinted by
// the row's kind color (via currentColor); Spring components get a filled
// diamond to distinguish design-system components from local (user) ones.
function TypeChip({ node }: { node: AncestryNode }) {
  const p = LAYER_PALETTE[node.kind];
  // Design-system rows get the word spelled out inside the keycap — the
  // filled-vs-outline diamond alone was too subtle a distinction.
  const isSpring = node.kind === 'spring';
  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        width: isSpring ? undefined : 17,
        height: 17,
        flexShrink: 0,
        borderRadius: 4,
        padding: isSpring ? '0 5px' : 0,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.13)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 1px rgba(0,0,0,0.35)',
        color: p.label,
      }}
    >
      <TypeIcon glyph={rowGlyph(node)} filled={isSpring} />
      {isSpring && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: 0.4,
            lineHeight: 1,
            fontFamily: 'inherit',
          }}
        >
          spring
        </span>
      )}
    </kbd>
  );
}

function TypeIcon({ glyph, filled }: { glyph: RowGlyph; filled?: boolean }) {
  const common = {
    width: 11,
    height: 11,
    viewBox: '0 0 12 12',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (glyph) {
    case 'component':
      return (
        <svg {...common}>
          <path d="M6 1.4 L10.6 6 L6 10.6 L1.4 6 Z" fill={filled ? 'currentColor' : 'none'} />
        </svg>
      );
    case 'artboard':
      return (
        <svg {...common} strokeWidth={1.1}>
          <path d="M4 1.5V10.5M8 1.5V10.5M1.5 4H10.5M1.5 8H10.5" />
        </svg>
      );
    case 'text':
      return (
        <svg {...common}>
          <path d="M3 3.4H9M6 3.4V9" />
        </svg>
      );
    case 'box':
    default:
      return (
        <svg {...common}>
          <rect x="2.2" y="2.2" width="7.6" height="7.6" rx="1.4" />
        </svg>
      );
  }
}

// Element-only sections (Text + Attributes). Styles / Effects / className
// live at the panel level since they apply to any selected DOM node.
function ElementBodySections({
  domNode,
  copy,
  copiedKey,
}: {
  domNode: HTMLElement;
  copy: (text: string, key: string) => void;
  copiedKey: string | null;
}) {
  const text = getDirectText(domNode);
  const attrs = getInterestingAttrs(domNode);

  return (
    <>
      {text && (
        <Section
          title="Text"
          action={
            <button
              onClick={() => copy(text, 'text')}
              style={btnStyle}
              title="Copy text"
            >
              {copiedKey === 'text' ? '✓ copied' : 'copy'}
            </button>
          }
        >
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(0,0,0,0.35)',
              borderRadius: 6,
              fontSize: 12.5,
              lineHeight: 1.5,
              color: '#f5f1e8',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {text}
          </div>
        </Section>
      )}

      {attrs.length > 0 && (
        <Section title="Attributes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {attrs.map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr',
                  gap: 8,
                  alignItems: 'baseline',
                  fontSize: 12,
                  padding: '4px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{k}</span>
                <span
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                    color: '#f5f1e8',
                    wordBreak: 'break-word',
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

// ───────── asset section ─────────
//
// Renders when the selected DOM element is a downloadable / serializable asset
// (img / video / audio / svg) or a Spring icon. Surfaces the URL or icon
// token, copyable + downloadable in one click. Sits right after BoxModel —
// asset-shaped info is more relevant than generic Text + Attributes when the
// selected thing IS the asset.

function downloadHref(url: string, suggestedName?: string) {
  const a = document.createElement('a');
  a.href = url;
  if (suggestedName) a.download = suggestedName;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function downloadSvg(svgEl: SVGSVGElement, suggestedName: string) {
  // Clone + ensure xmlns is present (some inline svgs omit it; without xmlns
  // the saved file won't open in Figma / browsers).
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    downloadHref(url, suggestedName);
  } finally {
    // Defer revoke so the click has a chance to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
}

function basenameFromUrl(url: string, fallback: string): string {
  try {
    const u = new URL(url, 'http://x/');
    const last = u.pathname.split('/').filter(Boolean).pop();
    if (last) return decodeURIComponent(last);
  } catch {
    // ignore
  }
  return fallback;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

function AssetTypePill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        background: 'rgba(155,185,255,0.16)',
        color: '#c5d3f4',
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function AssetKV({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '92px 1fr',
        gap: 8,
        alignItems: 'baseline',
        fontSize: 12,
        padding: '4px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
      <span
        style={{
          fontFamily: MONO_FF,
          color: '#f5f1e8',
          wordBreak: 'break-word',
          minWidth: 0,
        }}
      >
        {children}
      </span>
    </div>
  );
}

const ASSET_ACTION_BTN: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#f5f1e8',
  padding: '6px 10px',
  borderRadius: 6,
  fontSize: 11.5,
  cursor: 'pointer',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  whiteSpace: 'nowrap',
};

const ASSET_ACTION_PRIMARY: React.CSSProperties = {
  ...ASSET_ACTION_BTN,
  background: 'rgba(155,185,255,0.18)',
  borderColor: 'rgba(155,185,255,0.35)',
  color: '#c5d3f4',
};

function AssetSection({
  info,
  copy,
  copiedKey,
}: {
  info: AssetInfo;
  copy: (text: string, key: string) => void;
  copiedKey: string | null;
}) {
  if (info.kind === 'spring-icon') {
    const importLine = `import { ${info.iconName} } from '@ringcentral/spring-icon';`;
    return (
      <Section title="Spring icon" action={<AssetTypePill label="icon" />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: 'rgba(0,0,0,0.35)',
              borderRadius: 6,
            }}
          >
            <span
              style={{
                fontFamily: MONO_FF,
                fontSize: 14,
                fontWeight: 600,
                color: '#f5f1e8',
                wordBreak: 'break-all',
              }}
            >
              {info.iconName}
            </span>
            <button
              onClick={() => copy(info.iconName, 'icon-name')}
              style={{ ...ASSET_ACTION_BTN, marginLeft: 'auto' }}
              title="Copy icon name"
            >
              {copiedKey === 'icon-name' ? '✓ copied' : 'copy name'}
            </button>
          </div>

          <div>
            <div
              style={{
                fontSize: 10.5,
                color: 'rgba(255,255,255,0.45)',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                fontWeight: 600,
              }}
            >
              Import
            </div>
            <pre
              style={{
                margin: 0,
                padding: '8px 10px',
                background: 'rgba(0,0,0,0.35)',
                borderRadius: 6,
                fontFamily: MONO_FF,
                fontSize: 11.5,
                lineHeight: 1.5,
                color: '#f5f1e8',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {importLine}
            </pre>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <button
                onClick={() => copy(importLine, 'icon-import')}
                style={ASSET_ACTION_PRIMARY}
                title="Copy import statement"
              >
                {copiedKey === 'icon-import' ? '✓ copied' : 'copy import'}
              </button>
              <button
                onClick={() =>
                  downloadSvg(info.svgEl, `${info.iconName}.svg`)
                }
                style={ASSET_ACTION_BTN}
                title="Download the rendered SVG"
              >
                ↓ svg
              </button>
            </div>
          </div>

          <div>
            {info.springSize && (
              <AssetKV label="Icon size">{info.springSize}</AssetKV>
            )}
            {info.color && (
              <AssetKV label="Color">
                <span
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Swatch color={info.color} />
                  {info.colorToken ? `${info.colorToken} · ` : ''}
                  {info.color}
                </span>
              </AssetKV>
            )}
            {info.viewBox && (
              <AssetKV label="viewBox">{info.viewBox}</AssetKV>
            )}
            <AssetKV label="Rendered">
              {info.displayedWidth} × {info.displayedHeight} px
            </AssetKV>
          </div>
        </div>
      </Section>
    );
  }

  if (info.kind === 'image') {
    const fileName = basenameFromUrl(info.src, 'image');
    return (
      <Section
        title="Image"
        action={
          <AssetTypePill label={info.format ? info.format : 'image'} />
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <UrlBlock
            url={info.src}
            copyKey="img-url"
            copiedKey={copiedKey}
            copy={copy}
          />
          <div>
            {info.alt && <AssetKV label="alt">{info.alt}</AssetKV>}
            <AssetKV label="Natural">
              {info.naturalWidth} × {info.naturalHeight} px
            </AssetKV>
            <AssetKV label="Rendered">
              {info.displayedWidth} × {info.displayedHeight} px
            </AssetKV>
            {info.format && <AssetKV label="Format">{info.format}</AssetKV>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => downloadHref(info.src, fileName)}
              style={ASSET_ACTION_PRIMARY}
              title="Download image"
            >
              ↓ download
            </button>
            <button
              onClick={() => window.open(info.src, '_blank', 'noopener')}
              style={ASSET_ACTION_BTN}
              title="Open in new tab"
            >
              open ↗
            </button>
          </div>
        </div>
      </Section>
    );
  }

  if (info.kind === 'video') {
    const url = info.src || info.poster || '';
    const fileName = basenameFromUrl(url, 'video');
    return (
      <Section
        title="Video"
        action={<AssetTypePill label={info.format ? info.format : 'video'} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {info.src && (
            <UrlBlock
              url={info.src}
              copyKey="vid-url"
              copiedKey={copiedKey}
              copy={copy}
              label="src"
            />
          )}
          {info.poster && (
            <UrlBlock
              url={info.poster}
              copyKey="vid-poster"
              copiedKey={copiedKey}
              copy={copy}
              label="poster"
            />
          )}
          <div>
            <AssetKV label="Natural">
              {info.naturalWidth} × {info.naturalHeight} px
            </AssetKV>
            <AssetKV label="Rendered">
              {info.displayedWidth} × {info.displayedHeight} px
            </AssetKV>
            {info.duration != null && (
              <AssetKV label="Duration">{formatDuration(info.duration)}</AssetKV>
            )}
            {info.format && <AssetKV label="Format">{info.format}</AssetKV>}
          </div>
          {info.src && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => downloadHref(info.src!, fileName)}
                style={ASSET_ACTION_PRIMARY}
                title="Download video"
              >
                ↓ download
              </button>
              <button
                onClick={() => window.open(info.src!, '_blank', 'noopener')}
                style={ASSET_ACTION_BTN}
                title="Open in new tab"
              >
                open ↗
              </button>
            </div>
          )}
        </div>
      </Section>
    );
  }

  if (info.kind === 'audio') {
    const url = info.src || '';
    const fileName = basenameFromUrl(url, 'audio');
    return (
      <Section
        title="Audio"
        action={<AssetTypePill label={info.format ? info.format : 'audio'} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {info.src && (
            <UrlBlock
              url={info.src}
              copyKey="aud-url"
              copiedKey={copiedKey}
              copy={copy}
            />
          )}
          <div>
            {info.duration != null && (
              <AssetKV label="Duration">{formatDuration(info.duration)}</AssetKV>
            )}
            {info.format && <AssetKV label="Format">{info.format}</AssetKV>}
          </div>
          {info.src && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => downloadHref(info.src!, fileName)}
                style={ASSET_ACTION_PRIMARY}
                title="Download audio"
              >
                ↓ download
              </button>
              <button
                onClick={() => window.open(info.src!, '_blank', 'noopener')}
                style={ASSET_ACTION_BTN}
                title="Open in new tab"
              >
                open ↗
              </button>
            </div>
          )}
        </div>
      </Section>
    );
  }

  // Plain (non-Spring) SVG
  return (
    <Section title="Vector" action={<AssetTypePill label="svg" />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          {info.viewBox && (
            <AssetKV label="viewBox">{info.viewBox}</AssetKV>
          )}
          <AssetKV label="Rendered">
            {info.displayedWidth} × {info.displayedHeight} px
          </AssetKV>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => downloadSvg(info.svgEl, 'asset.svg')}
            style={ASSET_ACTION_PRIMARY}
            title="Download SVG"
          >
            ↓ svg
          </button>
          <button
            onClick={() => {
              const clone = info.svgEl.cloneNode(true) as SVGSVGElement;
              if (!clone.getAttribute('xmlns')) {
                clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
              }
              const xml = new XMLSerializer().serializeToString(clone);
              copy(xml, 'svg-markup');
            }}
            style={ASSET_ACTION_BTN}
            title="Copy SVG markup"
          >
            {copiedKey === 'svg-markup' ? '✓ copied' : 'copy markup'}
          </button>
        </div>
      </div>
    </Section>
  );
}

function UrlBlock({
  url,
  copyKey,
  copiedKey,
  copy,
  label,
}: {
  url: string;
  copyKey: string;
  copiedKey: string | null;
  copy: (text: string, key: string) => void;
  label?: string;
}) {
  return (
    <div>
      {label && (
        <div
          style={{
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.45)',
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            fontWeight: 600,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 8px',
          background: 'rgba(0,0,0,0.35)',
          borderRadius: 6,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontFamily: MONO_FF,
            fontSize: 11.5,
            color: '#f5f1e8',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          }}
          title={url}
        >
          {url}
        </span>
        <button
          onClick={() => copy(url, copyKey)}
          style={{ ...ASSET_ACTION_BTN, padding: '4px 8px', fontSize: 11 }}
          title="Copy URL"
        >
          {copiedKey === copyKey ? '✓' : 'copy'}
        </button>
      </div>
    </div>
  );
}

// ───────── box model ─────────
//
// Figma-style diagram: dark surface, red margin pills on the four sides with
// crosshair guides, a rounded Border layer that displays its actual corner
// radii (clamped visually) and per-side border-width values, a tinted Padding
// layer with per-side padding values, and a dashed content rect with W × H.
// `border-box` / `content-box` is shown in the bottom-right corner.

const MONO_FF =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

type BoxLabelMode = 'token' | 'px';

// Token mode shows the full Spring token name (`space-3`, `radius-sm`,
// `radius-full`) so a label is never ambiguous with a px fallback. Px mode
// always shows the raw integer pixel count. Zero collapses to "–" in both
// modes. The `isToken` flag tells the label component whether to enable
// click-to-copy.
type LabelText = { text: string; isToken: boolean };
function fmtSpacingSide(n: number, mode: BoxLabelMode): LabelText {
  if (n === 0) return { text: '–', isToken: false };
  if (mode === 'px') return { text: `${n}`, isToken: false };
  const tok = lookupSpacingToken(n);
  return tok ? { text: tok, isToken: true } : { text: `${n}`, isToken: false };
}
function fmtRadiusCorner(n: number, mode: BoxLabelMode): LabelText {
  if (n === 0) return { text: '–', isToken: false };
  if (mode === 'px') return { text: `${n}`, isToken: false };
  const tok = lookupRadiusToken(n);
  return tok ? { text: tok, isToken: true } : { text: `${n}`, isToken: false };
}

function BoxModel({
  node,
  mode,
  onModeChange,
  onCopy,
  copiedKey,
}: {
  node: HTMLElement;
  mode: BoxLabelMode;
  onModeChange: (m: BoxLabelMode) => void;
  onCopy: (text: string) => void;
  copiedKey: string | null;
}) {
  const s = getComputedStyle(node);
  // Compensate for any ancestor transform (DesignCanvas zoom) so the W × H
  // shown is the element's natural CSS size, not the post-zoom visual size.
  const canvasScale = getAncestorScale(node);
  const rawRect = node.getBoundingClientRect();
  const rect = { width: rawRect.width / canvasScale, height: rawRect.height / canvasScale };
  const px = (k: string) => Math.round(parseFloat(s.getPropertyValue(k)) || 0);

  const margin = {
    t: px('margin-top'),
    r: px('margin-right'),
    b: px('margin-bottom'),
    l: px('margin-left'),
  };
  const border = {
    t: px('border-top-width'),
    r: px('border-right-width'),
    b: px('border-bottom-width'),
    l: px('border-left-width'),
  };
  const padding = {
    t: px('padding-top'),
    r: px('padding-right'),
    b: px('padding-bottom'),
    l: px('padding-left'),
  };
  const radius = {
    tl: px('border-top-left-radius'),
    tr: px('border-top-right-radius'),
    br: px('border-bottom-right-radius'),
    bl: px('border-bottom-left-radius'),
  };

  const contentW = Math.round(
    rect.width - padding.l - padding.r - border.l - border.r,
  );
  const contentH = Math.round(
    rect.height - padding.t - padding.b - border.t - border.b,
  );

  // Clamp the on-screen radius so a 200px-radius pill doesn't eat the diagram.
  const visualR = (n: number) => (n === 0 ? 0 : Math.max(3, Math.min(14, n / 2)));

  return (
    <Section
      title="Box model"
      action={<BoxModelModeToggle mode={mode} onChange={onModeChange} />}
    >
      <div
        style={{
          position: 'relative',
          background: 'rgba(0,0,0,0.35)',
          borderRadius: 6,
          height: 260,
          overflow: 'hidden',
        }}
      >
        {/* Crosshair guides */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 1,
            background: 'rgba(232,88,67,0.32)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: 1,
            background: 'rgba(232,88,67,0.32)',
            pointerEvents: 'none',
          }}
        />

        {/* Margin pills */}
        <MarginPill side="t" value={margin.t} mode={mode} onCopy={onCopy} copiedKey={copiedKey} />
        <MarginPill side="b" value={margin.b} mode={mode} onCopy={onCopy} copiedKey={copiedKey} />
        <MarginPill side="l" value={margin.l} mode={mode} onCopy={onCopy} copiedKey={copiedKey} />
        <MarginPill side="r" value={margin.r} mode={mode} onCopy={onCopy} copiedKey={copiedKey} />

        {/* Border layer */}
        <div
          style={{
            position: 'absolute',
            top: 30,
            right: 38,
            bottom: 30,
            left: 38,
            border: '1.5px solid rgba(255,255,255,0.6)',
            borderTopLeftRadius: visualR(radius.tl),
            borderTopRightRadius: visualR(radius.tr),
            borderBottomRightRadius: visualR(radius.br),
            borderBottomLeftRadius: visualR(radius.bl),
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 4,
              left: 26,
              color: 'rgba(255,255,255,0.6)',
              fontSize: 11,
            }}
          >
            Border
          </span>

          {/* Corner-radius labels (TL TR BR BL) */}
          <CornerLabel pos="tl" value={radius.tl} mode={mode} onCopy={onCopy} copiedKey={copiedKey} />
          <CornerLabel pos="tr" value={radius.tr} mode={mode} onCopy={onCopy} copiedKey={copiedKey} />
          <CornerLabel pos="br" value={radius.br} mode={mode} onCopy={onCopy} copiedKey={copiedKey} />
          <CornerLabel pos="bl" value={radius.bl} mode={mode} onCopy={onCopy} copiedKey={copiedKey} />

          {/* Per-side border-width labels — border widths are off-scale (0.5,
              1.2, 1.35 px), so they always show px regardless of mode. */}
          <SideLabel pos="t" value={border.t} kind="border" mode={mode} onCopy={onCopy} copiedKey={copiedKey} />
          <SideLabel pos="r" value={border.r} kind="border" mode={mode} onCopy={onCopy} copiedKey={copiedKey} />
          <SideLabel pos="b" value={border.b} kind="border" mode={mode} onCopy={onCopy} copiedKey={copiedKey} />
          <SideLabel pos="l" value={border.l} kind="border" mode={mode} onCopy={onCopy} copiedKey={copiedKey} />

          {/* Padding layer */}
          <div
            style={{
              position: 'absolute',
              top: 22,
              right: 22,
              bottom: 22,
              left: 22,
              background: 'rgba(78,93,156,0.55)',
              border: '1px solid rgba(255,255,255,0.45)',
              borderRadius: 3,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 4,
                left: 10,
                color: 'rgba(255,255,255,0.85)',
                fontSize: 11,
              }}
            >
              Padding
            </span>

            {/* Per-side padding labels */}
            <SideLabel pos="t" value={padding.t} kind="spacing" mode={mode} onCopy={onCopy} copiedKey={copiedKey} />
            <SideLabel pos="r" value={padding.r} kind="spacing" mode={mode} onCopy={onCopy} copiedKey={copiedKey} />
            <SideLabel pos="b" value={padding.b} kind="spacing" mode={mode} onCopy={onCopy} copiedKey={copiedKey} />
            <SideLabel pos="l" value={padding.l} kind="spacing" mode={mode} onCopy={onCopy} copiedKey={copiedKey} />

            {/* Content rect */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                right: 24,
                bottom: 20,
                left: 24,
                border: '1px dashed rgba(255,255,255,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: MONO_FF,
                fontSize: 12,
                color: '#fff',
              }}
            >
              {contentW} × {contentH}
            </div>
          </div>
        </div>

        {/* Box-sizing footer */}
        <span
          style={{
            position: 'absolute',
            bottom: 4,
            right: 8,
            fontSize: 10,
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          {s.boxSizing}
        </span>
      </div>
    </Section>
  );
}

// Tok / Px segmented control in the Box-model section header. Mirrors the
// Color display toggle in Styles. Two states only — there's no "var" form
// for spacing/radius the way there is for colors.
function BoxModelModeToggle({
  mode,
  onChange,
}: {
  mode: BoxLabelMode;
  onChange: (m: BoxLabelMode) => void;
}) {
  const opts: Array<{ value: BoxLabelMode; label: string; title: string }> = [
    { value: 'token', label: 'Tok', title: 'Spring spacing / radius token (falls back to px when no match)' },
    { value: 'px', label: 'Px', title: 'Raw pixel values' },
  ];
  return (
    <div
      style={{
        display: 'inline-flex',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      {opts.map((o, i) => {
        const active = mode === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            title={o.title}
            style={{
              background: active ? 'rgba(154,166,187,0.22)' : 'transparent',
              color: active ? '#cfe0ff' : 'rgba(255,255,255,0.55)',
              border: 0,
              borderLeft: i === 0 ? 0 : '1px solid rgba(255,255,255,0.12)',
              padding: '2px 7px',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// Shared props used by all three label components — onCopy + copiedKey to
// drive click-to-copy on token chips with a brief ✓ feedback.
type LabelCopyProps = {
  onCopy: (text: string) => void;
  copiedKey: string | null;
};

// Cap on visible label length so a long token like `space-150` can't burst
// out of its strip. Values longer than this clip with an ellipsis; full text
// is in the title tooltip.
const LABEL_MAX_WIDTH = 64;

function copyableStyle(isToken: boolean): React.CSSProperties {
  return {
    maxWidth: LABEL_MAX_WIDTH,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: isToken ? 'pointer' : 'default',
    pointerEvents: isToken ? 'auto' : 'none',
    boxSizing: 'border-box',
  };
}

function MarginPill({
  side,
  value,
  mode,
  onCopy,
  copiedKey,
}: {
  side: 't' | 'r' | 'b' | 'l';
  value: number;
  mode: BoxLabelMode;
} & LabelCopyProps) {
  const { text, isToken } = fmtSpacingSide(value, mode);
  // L/R sides get rotated when showing a token so longer names ("space-3")
  // run vertically along the strip. Skip rotation when the value is 0 — a
  // rotated "–" reads as "1". Px mode also stays horizontal.
  const isVertical = (side === 'l' || side === 'r') && isToken;
  // Rotated L/R pills sit centered in the margin strip (half of the 38px
  // gap between the diagram edge and the border layer) so they don't crash
  // into the border. Unrotated pills hug the diagram edge as before.
  const position: React.CSSProperties =
    side === 't'
      ? { top: 4, left: '50%' }
      : side === 'b'
        ? { bottom: 4, left: '50%' }
        : side === 'l'
          ? isVertical
            ? { left: 19, top: '50%' }
            : { left: 4, top: '50%' }
          : isVertical
            ? { right: 19, top: '50%' }
            : { right: 4, top: '50%' };
  const transform = isVertical
    ? `translate(${side === 'r' ? '50%' : '-50%'}, -50%) ${side === 'r' ? 'rotate(90deg)' : 'rotate(-90deg)'}`
    : side === 't' || side === 'b'
      ? 'translateX(-50%)'
      : 'translateY(-50%)';
  const copyKey = `tok:${text}`;
  const justCopied = isToken && copiedKey === copyKey;
  return (
    <span
      onClick={isToken ? () => onCopy(text) : undefined}
      title={isToken ? `Copy "${text}"` : undefined}
      style={{
        position: 'absolute',
        background: '#e85843',
        color: '#fff',
        fontSize: 10,
        fontWeight: 600,
        padding: '1px 6px',
        borderRadius: 3,
        fontFamily: MONO_FF,
        lineHeight: 1.3,
        zIndex: 2,
        minWidth: 18,
        textAlign: 'center',
        ...position,
        transform,
        ...copyableStyle(isToken),
      }}
    >
      {justCopied ? '✓' : text}
    </span>
  );
}

function CornerLabel({
  pos,
  value,
  mode,
  onCopy,
  copiedKey,
}: {
  pos: 'tl' | 'tr' | 'br' | 'bl';
  value: number;
  mode: BoxLabelMode;
} & LabelCopyProps) {
  const offsets: Record<typeof pos, React.CSSProperties> = {
    tl: { top: 3, left: 5 },
    tr: { top: 3, right: 5 },
    br: { bottom: 3, right: 5 },
    bl: { bottom: 3, left: 5 },
  };
  const { text, isToken } = fmtRadiusCorner(value, mode);
  const copyKey = `tok:${text}`;
  const justCopied = isToken && copiedKey === copyKey;
  return (
    <span
      onClick={isToken ? () => onCopy(text) : undefined}
      title={isToken ? `Copy "${text}"` : undefined}
      style={{
        position: 'absolute',
        fontSize: 10,
        color: 'rgba(255,255,255,0.85)',
        fontFamily: MONO_FF,
        ...offsets[pos],
        ...copyableStyle(isToken),
      }}
    >
      {justCopied ? '✓' : text}
    </span>
  );
}

function SideLabel({
  pos,
  value,
  kind,
  mode,
  onCopy,
  copiedKey,
}: {
  pos: 't' | 'r' | 'b' | 'l';
  value: number;
  // 'spacing' = padding label, 'border' = border-width label (off-scale).
  kind: 'spacing' | 'border';
  mode: BoxLabelMode;
} & LabelCopyProps) {
  // Border widths never resolve to a Spring spacing token (they're 0.5 / 1
  // / 1.2 / 1.35 / 2 px, not on the spacing scale) so always render px
  // without click-to-copy.
  const result: LabelText =
    kind === 'border'
      ? { text: value === 0 ? '–' : `${value}`, isToken: false }
      : fmtSpacingSide(value, mode);
  const { text, isToken } = result;
  const isVertical = (pos === 'l' || pos === 'r') && isToken;
  const baseTransform =
    pos === 't' || pos === 'b' ? 'translateX(-50%)' : 'translateY(-50%)';
  // Rotated L/R padding labels sit in the *center* of the padding strip
  // (12px from the padding-layer edge, which is half of the 24px strip
  // width). The translate-by-50% on top of that keeps the visual center
  // aligned at that point after rotation. Unrotated labels hug the edge.
  const position: React.CSSProperties =
    pos === 't'
      ? { top: 3, left: '50%' }
      : pos === 'b'
        ? { bottom: 3, left: '50%' }
        : pos === 'l'
          ? isVertical
            ? { top: '50%', left: 12 }
            : { top: '50%', left: 4 }
          : isVertical
            ? { top: '50%', right: 12 }
            : { top: '50%', right: 4 };
  const transform = isVertical
    ? `translate(${pos === 'r' ? '50%' : '-50%'}, -50%) ${pos === 'r' ? 'rotate(90deg)' : 'rotate(-90deg)'}`
    : baseTransform;
  // Padding labels need a small dark bg so they stay readable against the
  // tinted padding layer + dashed content-rect border. Border-width labels
  // don't (the border layer behind them is clean).
  const needsBg = kind === 'spacing' && value > 0;
  const copyKey = `tok:${text}`;
  const justCopied = isToken && copiedKey === copyKey;
  return (
    <span
      onClick={isToken ? () => onCopy(text) : undefined}
      title={isToken ? `Copy "${text}"` : undefined}
      style={{
        position: 'absolute',
        fontSize: 10,
        color: 'rgba(255,255,255,0.95)',
        fontFamily: MONO_FF,
        ...(needsBg
          ? {
              background: 'rgba(0,0,0,0.55)',
              padding: '1px 4px',
              borderRadius: 3,
            }
          : null),
        ...position,
        transform,
        ...copyableStyle(isToken),
      }}
    >
      {justCopied ? '✓' : text}
    </span>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(255,255,255,0.15)',
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

function previewActionBtnStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? 'rgba(154,166,187,0.18)' : 'transparent',
    color: active ? '#9bb9ff' : 'rgba(255,255,255,0.7)',
    border: `1px solid ${active ? 'rgba(154,166,187,0.45)' : 'rgba(255,255,255,0.15)'}`,
    padding: '3px 8px 3px 6px',
    borderRadius: 6,
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  };
}

function isTransparent(color: string): boolean {
  return (
    !color ||
    color === 'transparent' ||
    color === 'rgba(0, 0, 0, 0)' ||
    color === 'rgb(0, 0, 0, 0)'
  );
}

// Reverse-lookup of resolved CSS colors → Spring token names. Built lazily
// on first lookup by walking the document's stylesheets for `--sui-colors-*`
// declarations, then resolving each variable through a sniffer div. The
// resolved rgb() string is the key so any color value the browser hands back
// from `getComputedStyle` can be matched without manual normalization.
//
// Cached for the session. If the theme changes at runtime, call
// `invalidateColorMap()` (not currently exported — add a hook when we ship a
// theme switcher).
// Theme-scope awareness: Spring's `<ThemeProvider scope="…">` wraps a subtree
// in a `[data-sui-theme-scope="…"]` element and injects that selector's token
// values globally — so the SAME `--sui-colors-*` var resolves to different rgb
// inside a scoped (e.g. dark) subtree than at `:root`. To keep token
// matching/swatches correct we resolve every var through a sniffer mounted
// INSIDE the inspected element's nearest theme-scope host (falling back to
// <body> = the global/:root theme), and cache the resulting maps per host.

// Nearest ancestor (incl. self) that establishes a non-global Spring theme
// scope. Returns null when the element only sees the global :root theme.
export function themeScopeHostOf(node: Element | null): HTMLElement | null {
  let cur: Element | null = node;
  while (cur) {
    if (cur instanceof HTMLElement && cur.hasAttribute('data-sui-theme-scope')) {
      const v = cur.getAttribute('data-sui-theme-scope');
      if (v && v !== 'global') return cur;
    }
    cur = cur.parentElement;
  }
  return null;
}

function makeSnifferEl(): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;visibility:hidden;pointer-events:none;left:-9999px;top:-9999px;';
  return el;
}

// One hidden probe div per theme-scope host (mounted inside it so it inherits
// the scoped vars), plus a shared one on <body> for the global theme.
const _sniffers = new WeakMap<HTMLElement, HTMLDivElement>();
let _bodySniffer: HTMLDivElement | null = null;
function getSniffer(host?: HTMLElement | null): HTMLDivElement {
  if (host) {
    const ex = _sniffers.get(host);
    if (ex && ex.isConnected) return ex;
    const el = makeSnifferEl();
    host.appendChild(el);
    _sniffers.set(host, el);
    return el;
  }
  if (_bodySniffer && _bodySniffer.isConnected) return _bodySniffer;
  _bodySniffer = makeSnifferEl();
  document.body.appendChild(_bodySniffer);
  return _bodySniffer;
}

// `--sui-colors-*` var names are theme-independent (every theme defines the
// same set), so discover them once from the global `:root` rules + any scoped
// rule + the documentElement inline style.
let _colorNamesCache: Set<string> | null = null;
function colorVarNames(): Set<string> {
  if (_colorNamesCache) return _colorNamesCache;
  const names = new Set<string>();
  for (let i = 0; i < document.styleSheets.length; i++) {
    let rules: CSSRuleList | null = null;
    try {
      rules = document.styleSheets[i].cssRules;
    } catch {
      continue; // cross-origin sheet — skip
    }
    if (!rules) continue;
    for (let j = 0; j < rules.length; j++) {
      const rule = rules[j];
      if (!(rule instanceof CSSStyleRule)) continue;
      const sel = rule.selectorText;
      if (!sel || (!sel.includes(':root') && !sel.includes('data-sui-theme-scope')))
        continue;
      for (let k = 0; k < rule.style.length; k++) {
        const prop = rule.style[k];
        if (prop.startsWith('--sui-colors-')) names.add(prop);
      }
    }
  }
  const inlineStyle = document.documentElement.style;
  for (let i = 0; i < inlineStyle.length; i++) {
    const prop = inlineStyle[i];
    if (prop.startsWith('--sui-colors-')) names.add(prop);
  }
  _colorNamesCache = names;
  return names;
}

function buildColorMap(sniffer: HTMLDivElement): Map<string, string> {
  const map = new Map<string, string>();
  for (const name of colorVarNames()) {
    sniffer.style.backgroundColor = '';
    sniffer.style.backgroundColor = `var(${name})`;
    const resolved = getComputedStyle(sniffer).backgroundColor;
    if (resolved && resolved !== 'rgba(0, 0, 0, 0)' && !map.has(resolved)) {
      map.set(resolved, name.replace(/^--sui-colors-/, ''));
    }
  }
  return map;
}

// Reverse-lookup of resolved CSS colors → Spring token names, cached per
// theme-scope host (rgb keys differ by theme).
const _colorMaps = new WeakMap<HTMLElement, Map<string, string>>();
let _colorMapBody: Map<string, string> | null = null;
function ensureColorMap(host?: HTMLElement | null): Map<string, string> {
  if (host) {
    const cached = _colorMaps.get(host);
    if (cached) return cached;
    const map = buildColorMap(getSniffer(host));
    _colorMaps.set(host, map);
    return map;
  }
  if (_colorMapBody) return _colorMapBody;
  _colorMapBody = buildColorMap(getSniffer(null));
  return _colorMapBody;
}

function lookupColorToken(
  resolved: string,
  host?: HTMLElement | null,
): string | null {
  if (!resolved || isTransparent(resolved)) return null;
  return ensureColorMap(host).get(resolved) ?? null;
}

// Forward lookup: resolve a Spring color utility (`text-neutral-b0`,
// `bg-primary-b`, `border-warning`) to its computed rgb() value, so we can
// render a swatch beside the chip. Returns null for non-color tokens (e.g.
// `typography-*`) or values that don't resolve through `--sui-colors-*`.
const _tokenColorMaps = new WeakMap<HTMLElement, Map<string, string | null>>();
const _tokenColorBody = new Map<string, string | null>();
function resolveTokenColor(
  token: string,
  host?: HTMLElement | null,
): string | null {
  let cache: Map<string, string | null>;
  if (host) {
    cache = _tokenColorMaps.get(host) ?? new Map();
    _tokenColorMaps.set(host, cache);
  } else {
    cache = _tokenColorBody;
  }
  if (cache.has(token)) return cache.get(token) ?? null;
  let base: string | null = null;
  if (token.startsWith('text-')) base = token.slice('text-'.length);
  else if (token.startsWith('bg-')) base = token.slice('bg-'.length);
  else if (token.startsWith('border-')) base = token.slice('border-'.length);
  if (!base) {
    cache.set(token, null);
    return null;
  }
  const sniffer = getSniffer(host);
  sniffer.style.backgroundColor = '';
  sniffer.style.backgroundColor = `var(--sui-colors-${base})`;
  const resolved = getComputedStyle(sniffer).backgroundColor;
  const value = resolved && resolved !== 'rgba(0, 0, 0, 0)' ? resolved : null;
  cache.set(token, value);
  return value;
}

// What Spring theme is active at this element? Reads the nearest theme-scope
// host's scope id and infers light/dark from a resolved token (neutral-b0 is
// the foreground: black in light, white in dark). Used for the Styles "Theme"
// row so it's obvious when a subtree runs a scoped (e.g. dark) theme.
export type ThemeInfo = { scope: string; type: 'light' | 'dark' | null };
function readThemeInfo(node: Element | null): ThemeInfo {
  const host = themeScopeHostOf(node);
  const scope = host?.getAttribute('data-sui-theme-scope') || 'global';
  const fg = resolveTokenColor('text-neutral-b0', host);
  let type: 'light' | 'dark' | null = null;
  const m = fg?.match(/rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/);
  if (m) {
    const lum = (+m[1] * 299 + +m[2] * 587 + +m[3] * 114) / 1000;
    // Bright foreground ⇒ dark theme (and vice-versa).
    type = lum > 140 ? 'dark' : 'light';
  }
  return { scope, type };
}

// ───────── shadow reverse-lookup ─────────
//
// Spring exposes `--sui-box-shadow-*` CSS vars (e.g. shadow-md, shadow-sm-primary).
// We discover them the same way we did colors, resolve each through the
// sniffer, and key the map by the browser-normalized box-shadow string so a
// plain `getComputedStyle(node).boxShadow` lookup matches a token exactly.

let shadowMapCache: Map<string, string> | null = null;

function ensureShadowMap(): Map<string, string> {
  if (shadowMapCache) return shadowMapCache;
  const map = new Map<string, string>();
  const sniffer = getSniffer();
  const names = new Set<string>();

  for (let i = 0; i < document.styleSheets.length; i++) {
    let rules: CSSRuleList | null = null;
    try {
      rules = document.styleSheets[i].cssRules;
    } catch {
      continue;
    }
    if (!rules) continue;
    for (let j = 0; j < rules.length; j++) {
      const rule = rules[j];
      if (!(rule instanceof CSSStyleRule)) continue;
      if (!rule.selectorText || !rule.selectorText.includes(':root')) continue;
      for (let k = 0; k < rule.style.length; k++) {
        const prop = rule.style[k];
        if (prop.startsWith('--sui-box-shadow-')) names.add(prop);
      }
    }
  }
  const inlineStyle = document.documentElement.style;
  for (let i = 0; i < inlineStyle.length; i++) {
    const prop = inlineStyle[i];
    if (prop.startsWith('--sui-box-shadow-')) names.add(prop);
  }

  for (const name of names) {
    sniffer.style.boxShadow = '';
    sniffer.style.boxShadow = `var(${name})`;
    const resolved = getComputedStyle(sniffer).boxShadow;
    if (resolved && resolved !== 'none' && !map.has(resolved)) {
      // Drop the `--sui-box-shadow-` prefix so the chip reads as the Tailwind
      // utility name (`shadow-md`, `shadow-sm-primary`, …).
      map.set(resolved, name.replace(/^--sui-box-shadow-/, 'shadow-'));
    }
  }

  shadowMapCache = map;
  return map;
}

function lookupShadowToken(resolvedShadow: string): string | null {
  if (!resolvedShadow || resolvedShadow === 'none') return null;
  return ensureShadowMap().get(resolvedShadow) ?? null;
}

// Split a multi-shadow string at top-level commas. Commas inside `rgb(…)` /
// `rgba(…)` are inside parens and skipped.
function splitShadows(value: string): string[] {
  if (!value || value === 'none') return [];
  const out: string[] = [];
  let depth = 0;
  let buf = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      if (buf.trim()) out.push(buf.trim());
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

type ParsedShadow = {
  inset: boolean;
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
};

// Computed box-shadow format from getComputedStyle is stable:
//   "<color> <x>px <y>px <blur>px <spread>px [inset]"
function parseShadow(raw: string): ParsedShadow | null {
  const inset = /\binset\b/.test(raw);
  const noInset = raw.replace(/\binset\b/, ' ').trim();
  const colorMatch = noInset.match(
    /rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+/,
  );
  if (!colorMatch) return null;
  const color = colorMatch[0];
  const lengths = noInset.replace(color, '').trim();
  const nums = lengths
    .split(/\s+/)
    .filter(Boolean)
    .map((x) => parseFloat(x) || 0);
  return {
    inset,
    color,
    offsetX: nums[0] ?? 0,
    offsetY: nums[1] ?? 0,
    blur: nums[2] ?? 0,
    spread: nums[3] ?? 0,
  };
}

// ───────── spacing + radius reverse-lookup ─────────
//
// Mirrors the color/shadow lookup pattern: discover --sui-spacing-* and
// --sui-border-radius-* vars from stylesheets + the documentElement inline
// style, resolve each through a sniffer div, and key the map by the integer
// pixel value the browser computes. A computed `padding-top: 16px` reverse-
// resolves to "space-4"; `border-top-left-radius: 10px` to "radius-sm".
//
// Why px keys: getComputedStyle hands back resolved px (e.g. "16px" for
// 1rem at 16px root font-size), and Spring's scale is dense enough that
// integer pixels are unambiguous in practice. Floats round to the nearest
// int. The 0px slot is skipped to avoid every zero-side reading as
// "space-0" / "radius-none" — the BoxModel already shows "–" for zero.
//
// Radius has a wrinkle: `--sui-border-radius-circle` and `--sui-border-radius-full`
// both resolve to 9999px. We prefer `radius-full` (the more conventional name)
// when both land on the same key.

let spacingMapCache: Map<number, string> | null = null;
function ensureSpacingMap(): Map<number, string> {
  if (spacingMapCache) return spacingMapCache;
  const map = new Map<number, string>();
  const sniffer = getSniffer();
  const names = new Set<string>();

  for (let i = 0; i < document.styleSheets.length; i++) {
    let rules: CSSRuleList | null = null;
    try {
      rules = document.styleSheets[i].cssRules;
    } catch {
      continue;
    }
    if (!rules) continue;
    for (let j = 0; j < rules.length; j++) {
      const rule = rules[j];
      if (!(rule instanceof CSSStyleRule)) continue;
      if (!rule.selectorText || !rule.selectorText.includes(':root')) continue;
      for (let k = 0; k < rule.style.length; k++) {
        const prop = rule.style[k];
        if (prop.startsWith('--sui-spacing-')) names.add(prop);
      }
    }
  }
  const inlineStyle = document.documentElement.style;
  for (let i = 0; i < inlineStyle.length; i++) {
    const prop = inlineStyle[i];
    if (prop.startsWith('--sui-spacing-')) names.add(prop);
  }

  for (const name of names) {
    sniffer.style.width = '';
    sniffer.style.width = `var(${name})`;
    const resolved = parseFloat(getComputedStyle(sniffer).width);
    if (!Number.isFinite(resolved) || resolved <= 0) continue;
    const key = Math.round(resolved);
    // Spring's scale key is the trailing portion (e.g. `4`, `2.5`).
    const suffix = name.replace(/^--sui-spacing-/, '');
    const token = `space-${suffix}`;
    // Keep the lowest-numbered match if duplicates (shouldn't happen but safe).
    if (!map.has(key)) map.set(key, token);
  }
  sniffer.style.width = '';

  spacingMapCache = map;
  return map;
}

export function lookupSpacingToken(px: number): string | null {
  if (!Number.isFinite(px) || px <= 0) return null;
  return ensureSpacingMap().get(Math.round(px)) ?? null;
}

let radiusMapCache: Map<number, string> | null = null;
function ensureRadiusMap(): Map<number, string> {
  if (radiusMapCache) return radiusMapCache;
  const map = new Map<number, string>();
  const sniffer = getSniffer();
  const names = new Set<string>();

  for (let i = 0; i < document.styleSheets.length; i++) {
    let rules: CSSRuleList | null = null;
    try {
      rules = document.styleSheets[i].cssRules;
    } catch {
      continue;
    }
    if (!rules) continue;
    for (let j = 0; j < rules.length; j++) {
      const rule = rules[j];
      if (!(rule instanceof CSSStyleRule)) continue;
      if (!rule.selectorText || !rule.selectorText.includes(':root')) continue;
      for (let k = 0; k < rule.style.length; k++) {
        const prop = rule.style[k];
        if (prop.startsWith('--sui-border-radius-')) names.add(prop);
      }
    }
  }
  const inlineStyle = document.documentElement.style;
  for (let i = 0; i < inlineStyle.length; i++) {
    const prop = inlineStyle[i];
    if (prop.startsWith('--sui-border-radius-')) names.add(prop);
  }

  // Need a fixed-width host so a percentage value (e.g. --sui-border-radius-none = 0%)
  // resolves to a deterministic px. Sniffer is 0×0 by default; force a 100px box.
  const prevW = sniffer.style.width;
  const prevH = sniffer.style.height;
  sniffer.style.width = '100px';
  sniffer.style.height = '100px';

  for (const name of names) {
    sniffer.style.borderTopLeftRadius = '';
    sniffer.style.borderTopLeftRadius = `var(${name})`;
    const resolvedRaw = getComputedStyle(sniffer).borderTopLeftRadius;
    const resolved = parseFloat(resolvedRaw);
    if (!Number.isFinite(resolved) || resolved < 0) continue;
    const key = Math.round(resolved);
    const suffix = name.replace(/^--sui-border-radius-/, '');
    const token = `radius-${suffix}`;
    // Prefer `radius-full` over `radius-circle` when they land on the same key.
    const existing = map.get(key);
    if (!existing || (existing === 'radius-circle' && suffix === 'full')) {
      map.set(key, token);
    }
  }
  sniffer.style.borderTopLeftRadius = '';
  sniffer.style.width = prevW;
  sniffer.style.height = prevH;

  radiusMapCache = map;
  return map;
}

function lookupRadiusToken(px: number): string | null {
  if (!Number.isFinite(px) || px < 0) return null;
  // Skip 0 → radius-none unless explicitly asked; the diagram shows "–" for zero.
  if (px === 0) return null;
  return ensureRadiusMap().get(Math.round(px)) ?? null;
}

// ───────── typography reverse-lookup ─────────
//
// Sniff every `.typography-*` utility off the stylesheets, apply it to the
// hidden sniffer div, and key by the resulting computed font signature
// (family|size|weight|line-height|letter-spacing). An element's computed
// font props can then be tested against the map — if any token's resolved
// signature matches, the element is "on-token", regardless of whether the
// class lives on it directly or on an ancestor. This is what the canvas
// scan uses to flag text-leaf elements whose font properties don't
// correspond to any Spring typography token.

let typographyMapCache: Map<string, string> | null = null;
function ensureTypographyMap(): Map<string, string> {
  if (typographyMapCache) return typographyMapCache;
  const map = new Map<string, string>();
  const names = new Set<string>();

  for (let i = 0; i < document.styleSheets.length; i++) {
    let rules: CSSRuleList | null = null;
    try {
      rules = document.styleSheets[i].cssRules;
    } catch {
      continue;
    }
    if (!rules) continue;
    for (let j = 0; j < rules.length; j++) {
      const rule = rules[j];
      if (!(rule instanceof CSSStyleRule)) continue;
      const sel = rule.selectorText || '';
      // Match `.typography-foo` and `.typography-foo-bar` (no further suffixes
      // like `:hover` since we want the base utility).
      const re = /\.typography-([a-z0-9-]+)/gi;
      let m: RegExpExecArray | null;
      while ((m = re.exec(sel)) !== null) {
        names.add(`typography-${m[1]}`);
      }
    }
  }

  const sniffer = getSniffer();
  const prevClass = sniffer.className;
  for (const name of names) {
    sniffer.className = name;
    const s = getComputedStyle(sniffer);
    const key = typographyKey(s);
    if (!map.has(key)) map.set(key, name);
  }
  sniffer.className = prevClass;

  typographyMapCache = map;
  return map;
}

function typographyKey(s: CSSStyleDeclaration): string {
  return [
    s.fontFamily,
    s.fontSize,
    s.fontWeight,
    s.lineHeight,
    s.letterSpacing,
  ].join('|');
}

function lookupTypographyToken(s: CSSStyleDeclaration): string | null {
  return ensureTypographyMap().get(typographyKey(s)) ?? null;
}

// ───────── canvas scan (off-token violation finder) ─────────
//
// Walks every host element inside every `[data-dc-slot]` artboard on the
// page and flags computed values that don't reverse-lookup to a Spring
// token. The trigger is the manual "Scan canvas" button in the Inspector's
// Scan section — we never run this automatically because it iterates a few
// hundred to a few thousand elements per pass and reads computed styles
// for each.
//
// Categories checked:
//   • color (direct-text elements only)
//   • backgroundColor (when non-transparent)
//   • border-{side}-color (per side, only when that side has width > 0)
//   • boxShadow (when not "none")
//   • typography (text-leaf elements whose computed font signature
//     doesn't match any `typography-*` token)
//
// Skipped:
//   • Inspector's own UI (data-inspector-ui)
//   • display:none / visibility:hidden elements
//   • SVG descendants of an <svg> root (the root SVG can be flagged for
//     stroke/fill colors only via direct computed reads we don't do yet;
//     for now SVGs are skipped entirely — Spring icons get their color
//     from the parent's `color` which is already flagged separately).
//   • Plain text inside Spring icons (svgs)

export type ScanKind = 'color' | 'typography' | 'shadow' | 'contrast';

export type ScanMode = 'tokens' | 'a11y';

export type ScanOccurrence = {
  el: HTMLElement;
  prop: string;        // 'color' | 'backgroundColor' | 'borderTopColor' | … | 'boxShadow' | 'font'
  artboard: string;    // [data-dc-slot] value
  tag: string;         // human-readable element label, e.g. 'div.foo'
};

export type ScanBucket = {
  kind: ScanKind;
  value: string;        // raw computed value (rgb/shadow/font signature)
  displayValue: string; // friendlier form (hex for colors; sample for typography; trimmed for shadow)
  swatch?: string;      // the rgb string to render in a color chip (color kind only)
  occurrences: ScanOccurrence[];
};

function rgbToHex(rgb: string): string | null {
  const m = rgb.match(/^rgba?\(\s*(\d+)[ ,]\s*(\d+)[ ,]\s*(\d+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);
  if (!m) return null;
  const [, r, g, b, a] = m;
  const hex =
    '#' +
    [r, g, b]
      .map((n) => parseInt(n, 10).toString(16).padStart(2, '0'))
      .join('');
  if (a !== undefined && parseFloat(a) < 1) {
    const aHex = Math.round(parseFloat(a) * 255)
      .toString(16)
      .padStart(2, '0');
    return hex + aHex;
  }
  return hex;
}

// ─── Contrast / effective-background composite (WCAG 2.x) ──────────────────
//
// `parseColor` accepts the strings getComputedStyle hands back plus hex —
// rgb()/rgba()/named/hex — and returns sRGB channels 0–255 + alpha 0–1.
// `compositeOver` is Porter-Duff source-over: top OVER bottom.
// `effectiveBackground` walks the element's ancestor chain compositing each
// non-transparent bg downward until the accumulator is opaque, then falls
// back to the document body bg (or white). Spring overlays stack alpha
// layers, so the *immediate* ancestor is rarely the right answer.

type RGBA = { r: number; g: number; b: number; a: number };

function parseColor(input: string): RGBA | null {
  if (!input) return null;
  const s = input.trim();
  if (!s || s === 'transparent' || s === 'none') return { r: 0, g: 0, b: 0, a: 0 };
  const m = s.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const parts = m[1].split(/[ ,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const r = parseFloat(parts[0]);
    const g = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
    if (![r, g, b, a].every(Number.isFinite)) return null;
    return { r, g, b, a };
  }
  if (s[0] === '#') {
    const hex = s.slice(1);
    let r = 0, g = 0, b = 0, a = 1;
    if (hex.length === 3 || hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255;
    } else if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16) / 255;
    } else return null;
    if (![r, g, b].every(Number.isFinite)) return null;
    return { r, g, b, a };
  }
  // Named-color fallback via a hidden probe. Rare path; the browser hands us
  // rgb() form 99% of the time.
  const probe = getSniffer();
  probe.style.color = '';
  probe.style.color = s;
  const computed = getComputedStyle(probe).color;
  if (computed && computed !== s) return parseColor(computed);
  return null;
}

function compositeOver(top: RGBA, bottom: RGBA): RGBA {
  const a = top.a + bottom.a * (1 - top.a);
  if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a,
    g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a,
    b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a,
    a,
  };
}

// Parse out color stops from a CSS background-image gradient. Handles
// linear-gradient, radial-gradient, conic-gradient. Returns hex/rgb colors
// only — color hints like `45deg` / `0%` / `at center` are ignored.
// Non-gradient backgrounds (url(...), none) return [].
function extractGradientStops(backgroundImage: string): RGBA[] {
  if (!backgroundImage || backgroundImage === 'none') return [];
  if (!/gradient\s*\(/i.test(backgroundImage)) return [];
  // Match rgba()/rgb() with paren-balanced contents, #hex, or bare color
  // keywords. Function form has to come first so the regex doesn't bite off
  // just `rgb` from `rgb(...)`.
  const re = /rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b|\b(?:white|black|red|green|blue|yellow|cyan|magenta|gray|grey|orange|purple|pink|brown|transparent)\b/gi;
  const out: RGBA[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(backgroundImage)) !== null) {
    const c = parseColor(m[0]);
    if (c && c.a > 0) out.push(c);
  }
  return out;
}

// Returns one or more candidate effective backgrounds for an element. Most
// elements return a single composite (the normal walk). Elements whose
// ancestor chain hits a gradient return multiple candidates — one per
// extracted gradient color stop — so contrast checks can use the worst case
// (a gradient that goes from cyan to white over a span of white text needs
// to flag the white-on-white end). Callers iterate and pick the worst.
function effectiveBackgrounds(el: Element): RGBA[] {
  // Walk UP collecting non-transparent bgs; stop at the first opaque one.
  // When we hit a gradient, we treat its color stops as alternate opaque
  // bases (one per stop), each combined with the overlying layers below.
  type Layer = { color: RGBA; gradientStops?: RGBA[] };
  const chain: Layer[] = [];
  let cur: Element | null = el;
  while (cur) {
    const cs = getComputedStyle(cur);
    const c = parseColor(cs.backgroundColor);
    const stops = extractGradientStops(cs.backgroundImage);
    if (stops.length > 0) {
      // Gradient is fully opaque in practice (gradients without `transparent`
      // stops paint every pixel). Use the bg color as the base color (in case
      // gradient has alpha stops) and treat the gradient stops as candidates.
      chain.push({ color: c && c.a > 0 ? c : { r: 0, g: 0, b: 0, a: 0 }, gradientStops: stops });
      break;
    }
    if (c && c.a > 0) {
      chain.push({ color: c });
      if (c.a >= 0.999) break;
    }
    cur = cur.parentElement;
  }
  // Fall back to document body bg, then white. We need the bottom of the
  // stack to be opaque for the composite to terminate.
  const lastLayer = chain[chain.length - 1];
  const baseIsOpaque =
    !!lastLayer &&
    (lastLayer.gradientStops
      ? lastLayer.gradientStops.length > 0
      : lastLayer.color.a >= 0.999);
  if (chain.length === 0 || !baseIsOpaque) {
    const docBg = parseColor(getComputedStyle(document.body).backgroundColor);
    chain.push({
      color: docBg && docBg.a >= 0.999 ? docBg : { r: 255, g: 255, b: 255, a: 1 },
    });
  }

  // Build candidate bases. If no gradient anywhere, one base (the bottom).
  // If gradient at the bottom, one base per stop.
  const bottom = chain[chain.length - 1];
  const bases: RGBA[] =
    bottom.gradientStops && bottom.gradientStops.length > 0
      ? bottom.gradientStops
      : [bottom.color];

  // For each candidate base, composite all overlying layers down.
  return bases.map((base) => {
    let acc = base;
    for (let i = chain.length - 2; i >= 0; i--) {
      acc = compositeOver(chain[i].color, acc);
    }
    return acc;
  });
}

// Single-bg convenience for callers that don't care about gradient variance
// (e.g., the bg hex chip in the panel — we just show the worst-contrast
// candidate vs. a given fg color, since that's the most actionable).
function effectiveBackground(el: Element): RGBA {
  const bgs = effectiveBackgrounds(el);
  return bgs[0];
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(c: RGBA): number {
  return (
    0.2126 * srgbToLinear(c.r) +
    0.7152 * srgbToLinear(c.g) +
    0.0722 * srgbToLinear(c.b)
  );
}

function contrastRatio(a: RGBA, b: RGBA): number {
  const La = relativeLuminance(a);
  const Lb = relativeLuminance(b);
  const hi = Math.max(La, Lb);
  const lo = Math.min(La, Lb);
  return (hi + 0.05) / (lo + 0.05);
}

// WCAG: large text = ≥18pt (24px) normal, OR ≥14pt (18.66px) when bold
// (font-weight ≥ 700). Lowers the AA threshold from 4.5:1 to 3:1.
function isLargeText(fontSizePx: number, fontWeight: number): boolean {
  if (!Number.isFinite(fontSizePx)) return false;
  return fontWeight >= 700 ? fontSizePx >= 18.66 : fontSizePx >= 24;
}

function rgbaToHex(c: RGBA): string {
  const h = [c.r, c.g, c.b]
    .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0'))
    .join('');
  return '#' + h;
}

function formatRatio(r: number): string {
  if (!Number.isFinite(r)) return '–';
  return r < 10 ? r.toFixed(2) : r.toFixed(1);
}

function shortTag(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  const cls = typeof el.className === 'string' ? el.className.trim() : '';
  if (!cls) return tag;
  const first = cls.split(/\s+/)[0];
  return `${tag}.${first}`;
}

function elementHasDirectText(el: HTMLElement): boolean {
  for (let i = 0; i < el.childNodes.length; i++) {
    const c = el.childNodes[i];
    if (c.nodeType === Node.TEXT_NODE && (c.textContent ?? '').trim().length > 0) {
      return true;
    }
  }
  return false;
}

// Resolve the roots a scan walks. With a `scope` element the scan is confined
// to that subtree (the element itself included, so a selected leaf gets tested);
// without one it covers every artboard's `.dc-card` on the canvas. The artboard
// label is carried through so occurrences group/report the same either way.
type ScanRoot = { artboard: string; root: HTMLElement; includeRoot: boolean };
function scanRoots(scope?: Element | null): ScanRoot[] {
  if (scope) {
    const artboard =
      scope.closest('[data-dc-slot]')?.getAttribute('data-dc-slot') ?? '?';
    return [{ artboard, root: scope as HTMLElement, includeRoot: true }];
  }
  const out: ScanRoot[] = [];
  for (const slot of document.querySelectorAll<HTMLElement>('[data-dc-slot]')) {
    const card = slot.querySelector('.dc-card') as HTMLElement | null;
    if (card)
      out.push({ artboard: slot.dataset.dcSlot ?? '?', root: card, includeRoot: false });
  }
  return out;
}

// `scope` (when set) confines the walk to that element's subtree; default is
// every artboard on the canvas.
export function scanArtboardsForViolations(scope?: Element | null): ScanBucket[] {
  const map = new Map<string, ScanBucket>();
  const bump = (
    kind: ScanKind,
    value: string,
    displayValue: string,
    swatch: string | undefined,
    occ: ScanOccurrence,
  ) => {
    const key = `${kind}::${value}`;
    let b = map.get(key);
    if (!b) {
      b = { kind, value, displayValue, swatch, occurrences: [] };
      map.set(key, b);
    }
    b.occurrences.push(occ);
  };

  for (const { artboard, root, includeRoot } of scanRoots(scope)) {
    const all: HTMLElement[] = includeRoot
      ? [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
      : Array.from(root.querySelectorAll<HTMLElement>('*'));
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      // Skip inspector's own DOM (e.g. preview clones inside the inspector
      // that happen to land inside the page — defensive only; preview clones
      // sit in the panel itself, not inside artboards).
      if (el.closest('[data-inspector-ui]')) continue;
      // Skip SVG glyph internals — we don't yet do svg-fill/stroke lookups.
      if (
        typeof (el as unknown as Element).ownerSVGElement !== 'undefined' &&
        (el as unknown as SVGElement).ownerSVGElement
      )
        continue;

      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') continue;

      // Match tokens in this element's own theme scope so a dark/scoped
      // subtree isn't flagged off-token against the global (light) palette.
      const host = themeScopeHostOf(el);

      const hasText = elementHasDirectText(el);

      // Color (only meaningful when element actually authors text)
      if (hasText && s.color && !isTransparent(s.color) && !lookupColorToken(s.color, host)) {
        const hex = rgbToHex(s.color) ?? s.color;
        bump('color', s.color, hex, s.color, {
          el,
          prop: 'color',
          artboard,
          tag: shortTag(el),
        });
      }

      // Background
      if (
        s.backgroundColor &&
        !isTransparent(s.backgroundColor) &&
        !lookupColorToken(s.backgroundColor, host)
      ) {
        const hex = rgbToHex(s.backgroundColor) ?? s.backgroundColor;
        bump('color', s.backgroundColor, hex, s.backgroundColor, {
          el,
          prop: 'backgroundColor',
          artboard,
          tag: shortTag(el),
        });
      }

      // Border per side, only when that side has width > 0
      const sides: Array<[string, string, number]> = [
        ['borderTopColor', s.borderTopColor, parseFloat(s.borderTopWidth) || 0],
        ['borderRightColor', s.borderRightColor, parseFloat(s.borderRightWidth) || 0],
        ['borderBottomColor', s.borderBottomColor, parseFloat(s.borderBottomWidth) || 0],
        ['borderLeftColor', s.borderLeftColor, parseFloat(s.borderLeftWidth) || 0],
      ];
      const seenBorderVals = new Set<string>();
      for (const [prop, val, w] of sides) {
        if (w <= 0) continue;
        if (!val || isTransparent(val)) continue;
        if (seenBorderVals.has(val)) continue;
        seenBorderVals.add(val);
        if (!lookupColorToken(val, host)) {
          const hex = rgbToHex(val) ?? val;
          bump('color', val, hex, val, {
            el,
            prop,
            artboard,
            tag: shortTag(el),
          });
        }
      }

      // Box shadow
      if (s.boxShadow && s.boxShadow !== 'none' && !lookupShadowToken(s.boxShadow)) {
        const trimmed =
          s.boxShadow.length > 60 ? s.boxShadow.slice(0, 57) + '…' : s.boxShadow;
        bump('shadow', s.boxShadow, trimmed, undefined, {
          el,
          prop: 'boxShadow',
          artboard,
          tag: shortTag(el),
        });
      }

      // Typography — text-leaf elements only (matches the "Color" gate)
      if (hasText && !lookupTypographyToken(s)) {
        const sizePx = parseFloat(s.fontSize);
        const sizeLabel = Number.isFinite(sizePx)
          ? `${sizePx % 1 === 0 ? sizePx : sizePx.toFixed(1)}px`
          : s.fontSize;
        const familyFirst = (s.fontFamily.split(',')[0] || '').replace(/['"]/g, '').trim();
        const sample = `${sizeLabel} · ${s.fontWeight} · ${familyFirst || '—'}`;
        const key = typographyKey(s);
        bump('typography', key, sample, undefined, {
          el,
          prop: 'font',
          artboard,
          tag: shortTag(el),
        });
      }
    }
  }

  const kindOrder: Record<ScanKind, number> = {
    color: 0,
    typography: 1,
    shadow: 2,
    contrast: 3,
  };
  return Array.from(map.values()).sort((a, b) => {
    if (a.kind !== b.kind) return kindOrder[a.kind] - kindOrder[b.kind];
    if (b.occurrences.length !== a.occurrences.length) {
      return b.occurrences.length - a.occurrences.length;
    }
    return a.displayValue.localeCompare(b.displayValue);
  });
}

// A11y scan: walks every text-leaf element inside every artboard and flags
// pairs whose computed contrast against the *effective* (composited) bg
// falls below the applicable WCAG AA threshold. Threshold shifts to 3:1
// for large text (≥24px or ≥18.66px@700) — so a heading at 3.2:1 passes
// while body at the same ratio doesn't. Buckets key by `(fg, bg)` hex so
// one bad token pair used across N elements collapses into one row.

// `scope` (when set) confines the walk to that element's subtree; default is
// every artboard on the canvas.
export function scanA11yViolations(scope?: Element | null): ScanBucket[] {
  const map = new Map<string, ScanBucket>();

  for (const { artboard, root, includeRoot } of scanRoots(scope)) {
    const all: HTMLElement[] = includeRoot
      ? [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
      : Array.from(root.querySelectorAll<HTMLElement>('*'));
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      if (el.closest('[data-inspector-ui]')) continue;
      if (
        typeof (el as unknown as Element).ownerSVGElement !== 'undefined' &&
        (el as unknown as SVGElement).ownerSVGElement
      )
        continue;

      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (!elementHasDirectText(el)) continue;

      const fgRaw = parseColor(cs.color);
      if (!fgRaw || fgRaw.a <= 0) continue;
      // Pick worst-contrast bg when the ancestor chain hits a gradient (so
      // text-over-gradient gets flagged at its worst stop rather than the
      // first one). For non-gradient elements there's only one candidate.
      const bgCandidates = effectiveBackgrounds(el);
      if (bgCandidates.length === 0 || bgCandidates[0].a < 0.999) continue;
      let bg = bgCandidates[0];
      let ratio = contrastRatio(
        fgRaw.a < 1 ? compositeOver(fgRaw, bg) : fgRaw,
        bg,
      );
      for (let i = 1; i < bgCandidates.length; i++) {
        const candidate = bgCandidates[i];
        const fgC = fgRaw.a < 1 ? compositeOver(fgRaw, candidate) : fgRaw;
        const r = contrastRatio(fgC, candidate);
        if (r < ratio) {
          ratio = r;
          bg = candidate;
        }
      }
      const fg = fgRaw.a < 1 ? compositeOver(fgRaw, bg) : fgRaw;
      const fontSizePx = parseFloat(cs.fontSize);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const large = isLargeText(fontSizePx, weight);
      const threshold = large ? 3 : 4.5;
      if (ratio >= threshold) continue;

      const fgHex = rgbaToHex(fg);
      const bgHex = rgbaToHex(bg);
      const key = `contrast::${fgHex}|${bgHex}`;
      let bucket = map.get(key);
      if (!bucket) {
        bucket = {
          kind: 'contrast',
          value: `${fgHex}|${bgHex}`,
          // Bucket-level display: fg on bg + the (single, well-defined)
          // ratio for this pair. The badge in the row UI shows the count.
          displayValue: `${fgHex} on ${bgHex} · ${formatRatio(ratio)}:1`,
          swatch: fgHex,
          occurrences: [],
        };
        map.set(key, bucket);
      }
      // Per-occurrence prop string carries the size class so the
      // expanded list reads "large 4.5:1 / 3.0 needed" vs
      // "normal 4.5:1 / 4.5 needed" — useful since the same (fg,bg)
      // can fail one and pass the other.
      const propLabel = large
        ? `large · need ${threshold}:1`
        : `normal · need ${threshold}:1`;
      bucket.occurrences.push({
        el,
        prop: propLabel,
        artboard,
        tag: shortTag(el),
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.occurrences.length !== a.occurrences.length) {
      return b.occurrences.length - a.occurrences.length;
    }
    return a.displayValue.localeCompare(b.displayValue);
  });
}

// Build the CSS var() reference for a Spring token suffix
// ("neutral-b0" → "var(--sui-colors-neutral-b0)"). Used by the
// Hex/Token/Var display-mode toggle so the chip can rotate forms.
function colorVarFromToken(token: string): string {
  return `var(--sui-colors-${token})`;
}

// Color display mode for the Styles section. "token" shows the Spring name
// (`~ neutral-b0`); "value" shows the raw rgba; "var" shows the CSS var().
// Lifted out so the StylesSection toggle can pass it down to each row.
export type ColorDisplayMode = 'token' | 'value' | 'var';

function EffectsSection({
  node,
  onCopy,
  copiedKey,
}: {
  node: HTMLElement;
  onCopy: (text: string) => void;
  copiedKey: string | null;
}) {
  const s = getComputedStyle(node);
  // Filter out no-op shadows before rendering. Spring components frequently
  // emit multi-shadow stacks where some components resolve to "0 0 0 0
  // rgba(0,0,0,0)" — fully transparent OR zero-geometry, painting nothing.
  // Showing these as rows is pure noise; only surface shadows that actually
  // contribute pixels. The raw computed value (preserved for token lookup)
  // is still passed through unchanged.
  const allShadows = splitShadows(s.boxShadow);
  const shadows = allShadows.filter((raw) => {
    const p = parseShadow(raw);
    if (!p) return false;
    if (isTransparent(p.color)) return false;
    if (
      p.offsetX === 0 &&
      p.offsetY === 0 &&
      p.blur === 0 &&
      p.spread === 0
    ) {
      return false;
    }
    return true;
  });
  const outlineStyle = s.outlineStyle;
  const outlineWidth = parseFloat(s.outlineWidth) || 0;
  const outlineColor = s.outlineColor;
  const outlineOffset = s.outlineOffset;
  const opacity = parseFloat(s.opacity);
  const filter = s.filter;
  const backdropFilter = (s as unknown as { backdropFilter?: string })
    .backdropFilter;

  const hasShadows = shadows.length > 0;
  // Transparent outlines are invisible placeholders (Spring sets
  // `outline: 2px solid transparent` at rest so the focus ring can appear
  // without layout shift) — not a rendered effect, so don't list them.
  const hasOutline =
    outlineStyle &&
    outlineStyle !== 'none' &&
    outlineWidth > 0 &&
    !isTransparent(outlineColor);
  const hasOpacity = !Number.isNaN(opacity) && opacity < 1;
  const hasFilter = filter && filter !== 'none';
  const hasBackdrop = !!backdropFilter && backdropFilter !== 'none';

  if (
    !hasShadows &&
    !hasOutline &&
    !hasOpacity &&
    !hasFilter &&
    !hasBackdrop
  ) {
    return null;
  }

  return (
    <Section title="Effects">
      {shadows.map((raw, i) => (
        <ShadowRow
          key={`${i}:${raw}`}
          raw={raw}
          onCopy={onCopy}
          copiedKey={copiedKey}
        />
      ))}
      {hasOutline && (
        <EffectRow
          label="Outline"
          swatch={outlineColor}
          mainText={`${Math.round(outlineWidth)}px ${outlineStyle}${
            parseFloat(outlineOffset)
              ? ` · offset ${Math.round(parseFloat(outlineOffset))}px`
              : ''
          }`}
          sub={outlineColor}
        />
      )}
      {hasOpacity && (
        <EffectRow
          label="Opacity"
          mainText={`${Math.round(opacity * 100)}%`}
          sub={`${opacity}`}
        />
      )}
      {hasFilter && (
        <EffectRow label="Filter" mainText={filter} sub="" wrap />
      )}
      {hasBackdrop && (
        <EffectRow
          label="Backdrop"
          mainText={backdropFilter as string}
          sub=""
          wrap
        />
      )}
    </Section>
  );
}

function ShadowRow({
  raw,
  onCopy,
  copiedKey,
}: {
  raw: string;
  onCopy: (text: string) => void;
  copiedKey: string | null;
}) {
  const parsed = parseShadow(raw);
  if (!parsed) return null;
  const shadowToken = lookupShadowToken(raw);
  const colorToken = lookupColorToken(parsed.color);
  const valuesStr = `${Math.round(parsed.offsetX)} ${Math.round(
    parsed.offsetY,
  )} ${Math.round(parsed.blur)} ${Math.round(parsed.spread)}`;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '58px 1fr',
        gap: 8,
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Preview rect */}
      <div
        style={{
          width: 50,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 4,
        }}
      >
        <div
          style={{
            width: 32,
            height: 18,
            background: 'rgba(245,241,232,0.95)',
            borderRadius: 3,
            boxShadow: raw,
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          {parsed.inset && (
            <span
              style={{
                fontSize: 9.5,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                fontWeight: 600,
                color: '#cfe0ff',
                border: '1px solid rgba(155,185,255,0.4)',
                padding: '1px 4px',
                borderRadius: 3,
              }}
            >
              inset
            </span>
          )}
          {shadowToken ? (
            (() => {
              const justCopied = copiedKey === `tok:${shadowToken}`;
              return (
                <button
                  onClick={() => onCopy(shadowToken)}
                  title={`Copy "${shadowToken}"`}
                  style={{
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: justCopied
                      ? 'rgba(154,166,187,0.25)'
                      : 'rgba(255,255,255,0.04)',
                    color: '#f5f1e8',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontFamily: MONO_FF,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {justCopied ? `✓ ${shadowToken}` : shadowToken}
                </button>
              );
            })()
          ) : (
            <span
              style={{
                color: 'rgba(255,180,90,0.85)',
                fontSize: 11,
                fontStyle: 'italic',
              }}
              title="No matching Spring shadow token"
            >
              ⚠ off-token
            </span>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: MONO_FF,
            fontSize: 11,
            color: 'rgba(255,255,255,0.65)',
            flexWrap: 'wrap',
          }}
        >
          <span title="offset-x · offset-y · blur · spread">{valuesStr}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
          <Swatch color={parsed.color} />
          <span style={{ wordBreak: 'break-all' }}>
            {colorToken ?? parsed.color}
          </span>
        </div>
      </div>
    </div>
  );
}

function EffectRow({
  label,
  swatch,
  mainText,
  sub,
  wrap = false,
}: {
  label: string;
  swatch?: string;
  mainText: string;
  sub: string;
  wrap?: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '90px 1fr',
        gap: 8,
        alignItems: 'center',
        padding: '6px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
        {label}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: MONO_FF,
            fontSize: 11.5,
            color: '#f5f1e8',
            wordBreak: wrap ? 'break-word' : 'normal',
            whiteSpace: wrap ? 'normal' : 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {swatch && !isTransparent(swatch) && <Swatch color={swatch} />}
          <span>{mainText}</span>
        </div>
        {sub && (
          <span
            style={{
              fontSize: 10,
              fontFamily: MONO_FF,
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function StylesSection({
  tokens,
  resolved,
  onCopy,
  copiedKey,
  colorMode,
  onColorModeChange,
}: {
  tokens: StyleTokens;
  resolved: ResolvedStyles;
  onCopy: (text: string) => void;
  copiedKey: string | null;
  colorMode: ColorDisplayMode;
  onColorModeChange: (mode: ColorDisplayMode) => void;
}) {
  // Color / Background / Border are driven purely by the computed value of
  // the selected element. We deliberately ignore the class-collected
  // textColor / bgColor / borderColor tokens (which scan ancestors too) —
  // those produce noise like "bg-neutral-static-b0" listed for an element
  // whose computed background is transparent because the class lives on a
  // parent or is overridden. Computed value + reverse-lookup is the single
  // source of truth that always matches what's on screen.
  // Typography: prefer the class-collected token when present (walks
  // ancestors for `typography-*` utilities); otherwise, for text-leaf
  // elements, fall back to the reverse-lookup against the computed font
  // signature (`resolved.typographyAutoToken`). This catches Spring
  // components that style text via component-internal CSS rules rather
  // than a utility class — clicking the painted span shows the matching
  // token instead of an empty row.
  const hasTypography = tokens.typography.length > 0 || resolved.hasDirectText;
  // Only show Color where the element actually paints text — otherwise the
  // computed color is just inherited and renders nothing on this node.
  const hasText = resolved.hasDirectText && !isTransparent(resolved.color);
  const hasBg = !isTransparent(resolved.backgroundColor);
  const hasBorder = resolved.hasBorderWidth && !isTransparent(resolved.borderColor);
  const hasFill = !!resolved.fill && !isTransparent(resolved.fill);
  const hasStroke = !!resolved.stroke && !isTransparent(resolved.stroke);
  if (!hasTypography && !hasText && !hasBg && !hasBorder && !hasFill && !hasStroke)
    return null;

  // Take the first family from the font stack and strip quotes — matches
  // the Scan's `familyFirst` so the off-token chip's sub line reads the
  // same as Scan's typography bucket display.
  const familyFirst = (resolved.fontFamily.split(',')[0] || '')
    .replace(/['"]/g, '')
    .trim();
  const fontSummary = `${familyFirst ? `${familyFirst} · ` : ''}${resolved.fontSize} · ${resolved.fontWeight} · ${
    resolved.lineHeight === 'normal'
      ? 'lh normal'
      : `lh ${resolved.lineHeight}`
  }`;

  // Toggle is only meaningful when at least one color row will render.
  const showToggle = hasText || hasBg || hasBorder || hasFill || hasStroke;

  return (
    <Section
      title="Styles"
      action={
        showToggle && (
          <ColorDisplayToggle mode={colorMode} onChange={onColorModeChange} />
        )
      }
    >
      <ThemeRow theme={resolved.theme} />
      {hasTypography && (
        <StyleRow
          label="Typography"
          tokens={tokens.typography}
          autoToken={resolved.typographyAutoToken}
          sub={fontSummary}
          onCopy={onCopy}
          copiedKey={copiedKey}
        />
      )}
      {hasText && (
        <StyleRow
          label="Color"
          tokens={[]}
          autoToken={resolved.colorToken}
          swatch={resolved.color}
          sub={resolved.color}
          onCopy={onCopy}
          copiedKey={copiedKey}
          colorMode={colorMode}
        />
      )}
      {hasBg && (
        <StyleRow
          label="Background"
          tokens={[]}
          autoToken={resolved.backgroundToken}
          swatch={resolved.backgroundColor}
          sub={resolved.backgroundColor}
          onCopy={onCopy}
          copiedKey={copiedKey}
          colorMode={colorMode}
        />
      )}
      {hasBorder && (
        <StyleRow
          label="Border"
          tokens={[]}
          autoToken={resolved.borderToken}
          swatch={resolved.borderColor}
          sub={resolved.borderColor}
          onCopy={onCopy}
          copiedKey={copiedKey}
          colorMode={colorMode}
        />
      )}
      {hasFill && (
        <StyleRow
          label="Fill"
          tokens={[]}
          autoToken={resolved.fillToken}
          swatch={resolved.fill!}
          sub={resolved.fill!}
          onCopy={onCopy}
          copiedKey={copiedKey}
          colorMode={colorMode}
        />
      )}
      {hasStroke && (
        <StyleRow
          label="Stroke"
          tokens={[]}
          autoToken={resolved.strokeToken}
          swatch={resolved.stroke!}
          sub={`${resolved.stroke}${resolved.strokeWidth ? ` · ${resolved.strokeWidth}` : ''}`}
          onCopy={onCopy}
          copiedKey={copiedKey}
          colorMode={colorMode}
        />
      )}
    </Section>
  );
}

// Three-way segmented control in the Styles section header. Decides whether
// Color/Background/Border rows show the Spring token name, the raw rgba
// value, or the CSS var() form as their primary chip.
function ColorDisplayToggle({
  mode,
  onChange,
}: {
  mode: ColorDisplayMode;
  onChange: (mode: ColorDisplayMode) => void;
}) {
  const opts: Array<{ value: ColorDisplayMode; label: string; title: string }> = [
    { value: 'token', label: 'Tok', title: 'Spring token (neutral-b0)' },
    { value: 'value', label: 'Hex', title: 'Computed rgba value' },
    { value: 'var', label: 'Var', title: 'CSS var(--sui-colors-…) form' },
  ];
  return (
    <div
      style={{
        display: 'inline-flex',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      {opts.map((o, i) => {
        const active = mode === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            title={o.title}
            style={{
              background: active ? 'rgba(154,166,187,0.22)' : 'transparent',
              color: active ? '#cfe0ff' : 'rgba(255,255,255,0.55)',
              border: 0,
              borderLeft: i === 0 ? 0 : '1px solid rgba(255,255,255,0.12)',
              padding: '2px 7px',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: 2,
        background: color,
        border: '1px solid rgba(255,255,255,0.18)',
        flexShrink: 0,
      }}
    />
  );
}

// Shows which Spring theme the selected element runs under — its scope id plus
// the inferred light/dark mode. Makes it obvious when a subtree opts into a
// scoped (e.g. dark) `<ThemeProvider>`, which is why a token can resolve to a
// different value than the global theme.
function ThemeRow({ theme }: { theme: ThemeInfo }) {
  const scoped = theme.scope !== 'global';
  const dark = theme.type === 'dark';
  const mono =
    'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '90px 1fr',
        gap: 8,
        alignItems: 'baseline',
        padding: '6px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>Theme</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#f5f1e8',
            fontFamily: mono,
            fontSize: 11,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: dark ? '#1b1d1f' : '#f5f6f9',
              border: '1px solid rgba(255,255,255,0.35)',
              flexShrink: 0,
            }}
          />
          {theme.type ?? 'unknown'}
          {scoped && (
            <span
              style={{
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 4,
                padding: '0 4px',
                fontSize: 10,
              }}
            >
              scoped
            </span>
          )}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: mono }}>
          {scoped ? `scope: ${theme.scope}` : 'global (:root)'}
        </span>
      </div>
    </div>
  );
}

function StyleRow({
  label,
  tokens,
  autoToken,
  swatch,
  sub,
  onCopy,
  copiedKey,
  colorMode,
}: {
  label: string;
  tokens: string[];
  autoToken?: string | null;
  swatch?: string;
  sub: string;
  onCopy: (text: string) => void;
  copiedKey: string | null;
  colorMode?: ColorDisplayMode;
}) {
  // Token-collected rows (Typography) keep the original chip behavior — the
  // colorMode toggle doesn't apply there. Computed-color rows (Color /
  // Background / Border) rotate between three display forms.
  const mode: ColorDisplayMode = colorMode ?? 'token';
  let primary: string | null = null;
  let primaryKind: 'token' | 'value' | 'var' = 'token';
  let subLine: string = sub;
  let offToken = false;
  // Hex form of the computed color — what the "Hex" display mode shows and
  // what the off-token fallback chip copies.
  const hexValue = swatch ? rgbToHex(swatch) ?? swatch : null;
  if (tokens.length === 0) {
    if (mode === 'value') {
      primary = hexValue ?? sub;
      primaryKind = 'value';
      subLine = autoToken ? autoToken : '';
    } else if (mode === 'var') {
      if (autoToken) {
        primary = colorVarFromToken(autoToken);
        primaryKind = 'var';
        subLine = swatch ?? sub;
      } else {
        // No token resolved → can't build var(); fall back to the value form.
        primary = hexValue ?? sub;
        primaryKind = 'value';
        subLine = '';
      }
    } else {
      primary = autoToken;
      primaryKind = 'token';
      subLine = sub;
      if (!autoToken && hexValue) {
        // Off-token color: keep the warning, but still surface the computed
        // value as a copyable hex chip (same presentation as Hex mode) so
        // the dev doesn't have to flip modes to grab it.
        offToken = true;
        primary = hexValue;
        primaryKind = 'value';
        subLine = sub === swatch ? '' : sub;
      }
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '90px 1fr',
        gap: 8,
        alignItems: 'baseline',
        padding: '6px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
        {label}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        {offToken && (
          <span
            style={{
              color: 'rgba(255,180,90,0.85)',
              fontSize: 11.5,
              fontStyle: 'italic',
            }}
            title="No matching Spring token — likely an off-token value"
          >
            ⚠ off-token
          </span>
        )}
        {tokens.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {tokens.map((t) => {
              const justCopied = copiedKey === `tok:${t}`;
              const chipColor = resolveTokenColor(t);
              return (
                <button
                  key={t}
                  onClick={() => onCopy(t)}
                  title={`Copy "${t}"`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: justCopied
                      ? 'rgba(154,166,187,0.25)'
                      : 'rgba(255,255,255,0.04)',
                    color: '#f5f1e8',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {chipColor && <Swatch color={chipColor} />}
                  <span>{justCopied ? `✓ ${t}` : t}</span>
                </button>
              );
            })}
          </div>
        ) : primary ? (
          (() => {
            const justCopied = copiedKey === `tok:${primary}`;
            const tokenChip = primaryKind === 'token';
            const display = tokenChip ? `~ ${primary}` : primary;
            const title =
              primaryKind === 'token'
                ? `Resolved from CSS variable. Copy "${primary}"`
                : primaryKind === 'var'
                  ? `CSS var() form. Copy "${primary}"`
                  : `Computed value. Copy "${primary}"`;
            return (
              <button
                onClick={() => onCopy(primary!)}
                title={title}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  border: tokenChip
                    ? '1px dashed rgba(154,166,187,0.55)'
                    : '1px solid rgba(255,255,255,0.18)',
                  background: justCopied
                    ? 'rgba(154,166,187,0.25)'
                    : tokenChip
                      ? 'rgba(154,166,187,0.08)'
                      : 'rgba(255,255,255,0.04)',
                  color: tokenChip ? '#cfe0ff' : '#f5f1e8',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  fontSize: 11,
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {swatch && !isTransparent(swatch) && <Swatch color={swatch} />}
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {justCopied ? `✓ ${display}` : display}
                </span>
              </button>
            );
          })()
        ) : (
          <span
            style={{
              color: 'rgba(255,180,90,0.85)',
              fontSize: 11.5,
              fontStyle: 'italic',
            }}
            title="No matching Spring token — likely an off-token value"
          >
            ⚠ off-token
          </span>
        )}
        {subLine && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'rgba(255,255,255,0.6)',
              fontSize: 11,
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            }}
          >
            {tokens.length > 0 && swatch && !isTransparent(swatch) && (
              <span
                aria-hidden
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: swatch,
                  border: '1px solid rgba(255,255,255,0.15)',
                  flexShrink: 0,
                }}
              />
            )}
            <span style={{ wordBreak: 'break-all' }}>{subLine}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Accessibility section ────────────────────────────────────────────────
//
// Renders for text-leaf elements only — the foreground/background pair is
// only meaningful when the element actually paints text. Background is the
// composited stack walked from the element up to the first opaque ancestor
// (see effectiveBackground above), so Spring's translucent overlays produce
// the right answer instead of "transparent on transparent". Foreground is
// composited onto that bg too when the text color has alpha < 1.
//
// Thresholds shift between AA 4.5:1 / AAA 7:1 (normal text) and AA 3:1 /
// AAA 4.5:1 (large text), where "large" = ≥24px OR ≥18.66px when
// font-weight ≥ 700. The threshold applied is shown so devs don't have to
// guess which row they're reading.

function AccessibilitySection({
  node,
  onCopy,
  copiedKey,
}: {
  node: HTMLElement;
  onCopy: (text: string) => void;
  copiedKey: string | null;
}) {
  const cs = getComputedStyle(node);
  const fgRaw = parseColor(cs.color);
  const bgCandidates = effectiveBackgrounds(node);
  if (!fgRaw || bgCandidates.length === 0 || bgCandidates[0].a < 0.999)
    return null;

  // Pick the worst-contrast bg vs. raw fg — when the ancestor chain hits a
  // gradient, there's more than one candidate and we want to flag the worst.
  // Tie-break via the first one so behaviour is stable for non-gradient
  // elements.
  let bg = bgCandidates[0];
  let ratio = contrastRatio(
    fgRaw.a < 1 ? compositeOver(fgRaw, bg) : fgRaw,
    bg,
  );
  for (let i = 1; i < bgCandidates.length; i++) {
    const candidate = bgCandidates[i];
    const fg = fgRaw.a < 1 ? compositeOver(fgRaw, candidate) : fgRaw;
    const r = contrastRatio(fg, candidate);
    if (r < ratio) {
      ratio = r;
      bg = candidate;
    }
  }
  const fg = fgRaw.a < 1 ? compositeOver(fgRaw, bg) : fgRaw;
  const fontSizePx = parseFloat(cs.fontSize);
  const weight = parseInt(cs.fontWeight, 10) || 400;
  const large = isLargeText(fontSizePx, weight);
  const aaThreshold = large ? 3 : 4.5;
  const aaaThreshold = large ? 4.5 : 7;
  const passesAA = ratio >= aaThreshold;
  const passesAAA = ratio >= aaaThreshold;

  const fgHex = rgbaToHex(fg);
  const bgHex = rgbaToHex(bg);
  const ratioStr = formatRatio(ratio);

  const sizeLabel = Number.isFinite(fontSizePx)
    ? `${fontSizePx % 1 === 0 ? fontSizePx : fontSizePx.toFixed(1)}px`
    : cs.fontSize;

  return (
    <Section title="Accessibility">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 12,
          alignItems: 'center',
          padding: '10px 12px',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Live sample painted with the actual fg/bg pair */}
        <div
          aria-hidden
          title={`Sample: ${fgHex} on ${bgHex}`}
          style={{
            width: 56,
            height: 48,
            borderRadius: 6,
            background: bgHex,
            color: fgHex,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: -0.3,
            border: '1px solid rgba(255,255,255,0.10)',
            flexShrink: 0,
          }}
        >
          Aa
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: MONO_FF,
                fontSize: 18,
                fontWeight: 600,
                color: '#f5f1e8',
                letterSpacing: -0.2,
              }}
            >
              {ratioStr}
              <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>:1</span>
            </span>
            <div style={{ display: 'flex', gap: 5 }}>
              <ContrastBadge label="AA" passes={passesAA} threshold={aaThreshold} />
              <ContrastBadge label="AAA" passes={passesAAA} threshold={aaaThreshold} />
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: 0.2,
            }}
          >
            {large ? 'Large text' : 'Normal text'} · {sizeLabel} · {weight}
          </div>
        </div>
      </div>

      {/* fg / bg hex chips — click to copy */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          marginTop: 8,
        }}
      >
        <ContrastHexChip
          label="Text"
          hex={fgHex}
          onCopy={onCopy}
          copiedKey={copiedKey}
        />
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>on</span>
        <ContrastHexChip
          label="Background"
          hex={bgHex}
          onCopy={onCopy}
          copiedKey={copiedKey}
          composited={chainCompositedNote(node)}
        />
      </div>
    </Section>
  );
}

// Returns a short note when the effective background isn't a simple solid
// color: either composited from multiple alpha layers, or sampled from a
// gradient. Useful for explaining "why does the hex not match the class on
// this element's parent" (composite) and "this hex is just one stop along
// a gradient" (gradient — text may sit on a different color along it).
function chainCompositedNote(el: Element): string | null {
  let cur: Element | null = el;
  let layers = 0;
  while (cur) {
    const cs = getComputedStyle(cur);
    if (extractGradientStops(cs.backgroundImage).length > 0) {
      return 'gradient (worst-case)';
    }
    const c = parseColor(cs.backgroundColor);
    if (c && c.a > 0) {
      layers += 1;
      if (c.a >= 0.999) break;
    }
    cur = cur.parentElement;
  }
  return layers > 1 ? `composited (${layers} layers)` : null;
}

function ContrastBadge({
  label,
  passes,
  threshold,
}: {
  label: string;
  passes: boolean;
  threshold: number;
}) {
  return (
    <span
      title={`${label} threshold: ${threshold}:1 — ${passes ? 'pass' : 'fail'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        borderRadius: 4,
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: 0.4,
        background: passes ? 'rgba(80,180,120,0.16)' : 'rgba(230,90,90,0.16)',
        border: `1px solid ${passes ? 'rgba(80,180,120,0.45)' : 'rgba(230,90,90,0.45)'}`,
        color: passes ? '#bfe5cd' : '#f3b5b5',
        fontFamily: 'inherit',
      }}
    >
      <span aria-hidden style={{ fontSize: 10 }}>{passes ? '✓' : '✗'}</span>
      <span>{label}</span>
    </span>
  );
}

function ContrastHexChip({
  label,
  hex,
  onCopy,
  copiedKey,
  composited,
}: {
  label: string;
  hex: string;
  onCopy: (text: string) => void;
  copiedKey: string | null;
  composited?: string | null;
}) {
  const justCopied = copiedKey === `tok:${hex}`;
  return (
    <button
      onClick={() => onCopy(hex)}
      title={composited ? `${label} — ${composited}. Copy ${hex}` : `${label} — copy ${hex}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: justCopied ? 'rgba(154,166,187,0.25)' : 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#f5f1e8',
        padding: '2px 8px 2px 6px',
        borderRadius: 4,
        fontFamily: MONO_FF,
        fontSize: 11,
        cursor: 'pointer',
      }}
    >
      <Swatch color={hex} />
      <span>{justCopied ? `✓ ${hex}` : hex}</span>
      {composited && (
        <span
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: 10,
            fontStyle: 'italic',
            fontFamily: 'inherit',
            letterSpacing: 0,
          }}
        >
          {composited}
        </span>
      )}
    </button>
  );
}

function FigmaCaptureSection({
  fiber,
  onCopy,
  copiedKey,
}: {
  fiber: Fiber;
  onCopy: (text: string) => void;
  copiedKey: string | null;
}) {
  // Re-compute on every fiber change. The capture reads live DOM
  // (getBoundingClientRect / getComputedStyle) so this needs to happen at
  // render-time, not on click — but the work is cheap relative to the
  // panel's other reads.
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [phase, setPhase] = useState<'idle' | 'copied' | 'downloaded'>('idle');

  useEffect(() => {
    setPhase('idle');
    try {
      setResult(captureForFigma(fiber as any));
    } catch (e) {
      console.error('[figma-bridge] capture failed', e);
      setResult(null);
    }
  }, [fiber]);

  // Sync local phase with the panel-level copy feedback for the JSON button.
  useEffect(() => {
    if (copiedKey !== 'figma' && phase === 'copied') {
      setPhase('idle');
    }
  }, [copiedKey, phase]);

  if (!result) {
    return (
      <Section title="Figma capture">
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontStyle: 'italic' }}>
          nothing to capture
        </div>
      </Section>
    );
  }

  const s = result.summary;
  const json = JSON.stringify(result, null, 2);
  const bytes = new Blob([json]).size;

  const copyJson = () => {
    onCopy(json);
    setPhase('copied');
    setTimeout(() => setPhase('idle'), 1500);
  };

  const downloadJson = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `figma-capture-${result.rootName}-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setPhase('downloaded');
    setTimeout(() => setPhase('idle'), 1500);
  };

  return (
    <Section
      title="Figma capture"
      action={
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={copyJson} style={btnStyle} title="Copy JSON to clipboard">
            {phase === 'copied' ? '✓ copied' : 'copy JSON'}
          </button>
          <button onClick={downloadJson} style={btnStyle} title="Download JSON file">
            {phase === 'downloaded' ? '✓ saved' : 'download'}
          </button>
        </div>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 4,
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.35)',
          borderRadius: 6,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: 11.5,
          color: '#f5f1e8',
        }}
      >
        <Stat label="total nodes" value={s.totalNodes} />
        <Stat label="payload" value={formatBytes(bytes)} />
        <Stat label="spring instances" value={s.springInstances} />
        <Stat label="spring icons" value={s.springIcons} />
        <Stat label="host nodes" value={s.hostNodes} />
        <Stat label="text nodes" value={s.textNodes} />
      </div>
      {s.springNames.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 11,
              marginBottom: 4,
            }}
          >
            Spring components in capture
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {s.springNames.map((n) => (
              <span
                key={n}
                style={{
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#f5f1e8',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  fontSize: 11,
                }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
      <span style={{ color: '#f5f1e8' }}>{value}</span>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 6,
          color: 'rgba(255,255,255,0.5)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        <span>{title}</span>
        <span style={{ marginLeft: 'auto' }}>{action}</span>
      </div>
      {children}
    </div>
  );
}

// Group of sections that share a platform context (e.g. "Web dev" = JSX +
// className + Props). Collapsed by default so the inspector reads as
// platform-agnostic; users opt in when they actually need the React /
// Tailwind specifics. Future cross-platform SDK groups (iOS, Android) will
// reuse this wrapper.
function CollapsibleGroup({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        marginBottom: 16,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          background: 'transparent',
          border: 0,
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
        title={open ? 'Collapse' : 'Expand'}
      >
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 8,
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 120ms ease',
            fontSize: 9,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          ▶
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            style={{
              fontSize: 10.5,
              color: 'rgba(255,255,255,0.4)',
              fontStyle: 'italic',
              marginLeft: 2,
            }}
          >
            {subtitle}
          </span>
        )}
      </button>
      {open && (
        <div style={{ padding: '4px 10px 2px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ───────── Scan section (off-token violations across all artboards) ─────────
//
// On press, scans every host element inside every `[data-dc-slot]` artboard
// for computed values that don't reverse-lookup to a Spring token (off-token
// colors, typography signatures, box shadows). Results are bucketed by
// (kind, value) so a single bad hex used across N elements collapses into
// one row.
//
// As of 2026-05-24 the inspector RHS Scan section is just a control surface:
// it shows the Scan/Rescan button + a one-line summary + a Show/Hide-results
// toggle. The actual bucket list lives in a separate `ScanResultsPane` to
// the left of the inspector — see ScanResultsPane below. State (results,
// scanning, expanded buckets, pane open/width) is lifted to InspectorPanel
// so the pane and the section share it.

const SCAN_PANE_MIN_WIDTH = 240;
const SCAN_PANE_MAX_WIDTH = 700;
const SCAN_PANE_DEFAULT_WIDTH = 280;

// Inspector panel width — user-resizable via a drag grip on the left edge.
// Min keeps the box-model + a11y row legible; max keeps the canvas usable.
const INSPECTOR_MIN_WIDTH = 360;
const INSPECTOR_MAX_WIDTH = 700;
const INSPECTOR_DEFAULT_WIDTH = 440;
// Gap between the inspector and any sibling pane to its left (scan results,
// explode, x-ray). Used in every `right: ...` math throughout this module.
const INSPECTOR_LEFT_GAP = 16;

function ScanSection({
  mode,
  title,
  emptyHint,
  okHint,
  results,
  scanning,
  paneOpen,
  scopeEl,
  scopeLabel,
  resultScopeLabel,
  onRunScan,
  onTogglePane,
}: {
  mode: ScanMode;
  title: string;
  emptyHint: string;
  okHint: string;
  results: ScanBucket[] | null;
  scanning: boolean;
  paneOpen: boolean;
  // Current selection available to scope to (null = nothing selected).
  scopeEl: Element | null;
  scopeLabel: string | null;
  // Scope the displayed results were produced with (null = whole canvas).
  resultScopeLabel: string | null;
  onRunScan: (scope: Element | null, label: string | null) => void;
  onTogglePane: () => void;
}) {
  const totalIssues = results?.reduce((n, b) => n + b.occurrences.length, 0) ?? 0;
  const hasResults = results !== null && results.length > 0;
  const what =
    mode === 'a11y'
      ? 'text/background pairs that fail WCAG AA'
      : 'off-token colors, typography, and shadows';
  const buttonLabel = scanning
    ? 'Scanning…'
    : scopeEl
      ? 'Scan selection'
      : results
        ? 'Rescan'
        : 'Scan canvas';
  return (
    <Section
      title={title}
      action={
        <button
          onClick={() => onRunScan(scopeEl, scopeLabel)}
          disabled={scanning}
          style={{
            background: scanning
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(154,166,187,0.18)',
            color: scanning ? 'rgba(255,255,255,0.55)' : '#cfe0ff',
            border: '1px solid rgba(154,166,187,0.35)',
            padding: '3px 10px',
            borderRadius: 5,
            fontSize: 11,
            cursor: scanning ? 'default' : 'pointer',
            fontFamily: 'inherit',
            letterSpacing: 0.3,
          }}
          title={
            scopeEl
              ? `Walk only the selected ${scopeLabel ?? 'element'} and list ${what}`
              : `Walk every artboard and list ${what}`
          }
        >
          {buttonLabel}
        </button>
      }
    >
      {/* Scope row — only when something is selected. The button above scans
          that subtree; this offers the whole-canvas sweep as the alternative. */}
      {scopeEl && !scanning && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
            marginBottom: 8,
            fontSize: 11.5,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '2px 8px',
              borderRadius: 999,
              background: 'rgba(154,166,187,0.16)',
              border: '1px solid rgba(154,166,187,0.32)',
              color: '#cfe0ff',
              maxWidth: '100%',
            }}
          >
            <span aria-hidden style={{ opacity: 0.8 }}>◳</span>
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Scope: {scopeLabel ?? 'selection'}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onRunScan(null, null)}
            style={{
              background: 'transparent',
              border: 0,
              padding: 0,
              color: '#9bb9ff',
              cursor: 'pointer',
              fontSize: 11.5,
              fontFamily: 'inherit',
              textDecoration: 'underline',
              textDecorationStyle: 'dashed',
              textUnderlineOffset: 2,
            }}
            title="Scan every artboard on the canvas instead"
          >
            scan whole canvas
          </button>
        </div>
      )}

      {results === null && !scanning && (
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.5,
            padding: '4px 0 2px',
          }}
        >
          {emptyHint}
        </div>
      )}

      {results !== null && results.length === 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 6,
            background: 'rgba(80,180,120,0.10)',
            border: '1px solid rgba(80,180,120,0.25)',
            color: '#bfe5cd',
            fontSize: 12,
          }}
        >
          <span aria-hidden style={{ fontSize: 13 }}>✓</span>
          <span>
            {okHint}
            {resultScopeLabel ? ` (scanned ${resultScopeLabel})` : ''}
          </span>
        </div>
      )}

      {hasResults && (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: 11.5,
            color: 'rgba(255,255,255,0.55)',
            padding: '2px 0',
          }}
        >
          <span>
            {totalIssues} occurrence{totalIssues === 1 ? '' : 's'} ·{' '}
            {results!.length} unique value{results!.length === 1 ? '' : 's'}
            {resultScopeLabel ? (
              <span style={{ color: '#9bb9ff' }}> · in {resultScopeLabel}</span>
            ) : null}
          </span>
          <button
            type="button"
            onClick={onTogglePane}
            style={{
              background: 'transparent',
              border: 0,
              padding: 0,
              color: '#9bb9ff',
              cursor: 'pointer',
              fontSize: 11.5,
              fontFamily: 'inherit',
              textDecoration: 'underline',
              textDecorationStyle: 'dashed',
              textUnderlineOffset: 2,
            }}
            title={paneOpen ? 'Hide the results pane' : 'Show the results pane'}
          >
            {paneOpen ? 'Hide results' : 'Show results'}
          </button>
        </div>
      )}
    </Section>
  );
}

// ───────── Scan results pane (left-of-inspector list of buckets) ─────────
//
// Side panel that mirrors the explode/x-ray slot pattern but with a list
// payload instead of a fullscreen visualization. Sits at `right: 472`
// (16 gutter + 440 inspector width + 16 inter-panel gap) and is
// user-resizable via a drag grip on its LEFT edge. Width is clamped to
// [240, 700]. Renders nothing when there are no scan results.

function ScanResultsPane({
  title,
  results,
  expanded,
  onToggleBucket,
  onPickEl,
  onClose,
  width,
  onWidthChange,
  inspectorWidth,
}: {
  title: string;
  results: ScanBucket[];
  expanded: Set<string>;
  onToggleBucket: (key: string) => void;
  onPickEl: (el: Element) => void;
  onClose: () => void;
  width: number;
  onWidthChange: (w: number) => void;
  inspectorWidth: number;
}) {
  const totalIssues = results.reduce((n, b) => n + b.occurrences.length, 0);
  const grouped: Record<ScanKind, ScanBucket[]> = {
    color: results.filter((b) => b.kind === 'color'),
    typography: results.filter((b) => b.kind === 'typography'),
    shadow: results.filter((b) => b.kind === 'shadow'),
    contrast: results.filter((b) => b.kind === 'contrast'),
  };

  const dragRef = useRef<{ startX: number; startW: number } | null>(null);
  const [gripHover, setGripHover] = useState(false);
  const onGripDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { startX: e.clientX, startW: width };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
  };
  const onGripMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    // Dragging the grip LEFT (decreasing clientX) widens the pane.
    const dx = dragRef.current.startX - e.clientX;
    const next = Math.min(
      SCAN_PANE_MAX_WIDTH,
      Math.max(SCAN_PANE_MIN_WIDTH, dragRef.current.startW + dx),
    );
    onWidthChange(next);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };
  const dragging = !!dragRef.current;
  const gripActive = gripHover || dragging;

  return (
    <div
      data-inspector-ui
      style={{
        position: 'fixed',
        top: 16,
        right: INSPECTOR_LEFT_GAP + inspectorWidth + INSPECTOR_LEFT_GAP,
        bottom: 16,
        width,
        zIndex: 2000,
        background: '#18191b',
        color: '#f5f1e8',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        fontSize: 13,
        lineHeight: 1.5,
        overflow: 'hidden',
      }}
    >
      {/* Left-edge drag grip — 6px hot zone with a faint blue line that
          appears on hover/drag so the affordance is discoverable but doesn't
          compete with the panel content at rest. */}
      <div
        onPointerDown={onGripDown}
        onPointerMove={onGripMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => setGripHover(true)}
        onMouseLeave={() => setGripHover(false)}
        style={{
          position: 'absolute',
          top: 0,
          left: -3,
          bottom: 0,
          width: 6,
          cursor: 'ew-resize',
          zIndex: 1,
        }}
        title="Drag to resize"
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 2,
            width: 2,
            background: gripActive ? '#9aa6bb' : 'transparent',
            transition: gripActive
              ? 'none'
              : 'background 120ms ease 120ms',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {title}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>
          {totalIssues} · {results.length} unique
        </span>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
          }}
          title="Hide the scan results pane"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {(['color', 'typography', 'shadow', 'contrast'] as ScanKind[]).map((kind) => {
          const list = grouped[kind];
          if (list.length === 0) return null;
          return (
            <ScanKindGroup
              key={kind}
              kind={kind}
              buckets={list}
              expanded={expanded}
              onToggleBucket={onToggleBucket}
              onPickEl={onPickEl}
            />
          );
        })}
      </div>
    </div>
  );
}

const KIND_LABELS: Record<ScanKind, string> = {
  color: 'Color',
  typography: 'Typography',
  shadow: 'Shadow',
  contrast: 'Contrast',
};

function ScanKindGroup({
  kind,
  buckets,
  expanded,
  onToggleBucket,
  onPickEl,
}: {
  kind: ScanKind;
  buckets: ScanBucket[];
  expanded: Set<string>;
  onToggleBucket: (key: string) => void;
  onPickEl: (el: Element) => void;
}) {
  const count = buckets.reduce((n, b) => n + b.occurrences.length, 0);
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
          marginBottom: 4,
        }}
      >
        <span>{KIND_LABELS[kind]}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span style={{ color: 'rgba(255,255,255,0.55)' }}>{count}</span>
      </div>
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        {buckets.map((b, i) => {
          const key = `${b.kind}::${b.value}`;
          const isOpen = expanded.has(key);
          return (
            <div
              key={key}
              style={{
                borderTop: i === 0 ? 0 : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <button
                type="button"
                onClick={() => onToggleBucket(key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  background: 'transparent',
                  border: 0,
                  color: '#f5f1e8',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  textAlign: 'left',
                }}
                title={isOpen ? 'Collapse' : 'Expand'}
              >
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 8,
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 120ms ease',
                    fontSize: 8,
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  ▶
                </span>
                {b.swatch && <Swatch color={b.swatch} />}
                <span
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                    fontSize: 11.5,
                    color: '#f5f1e8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                  }}
                  title={b.displayValue}
                >
                  {b.displayValue}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.5)',
                    flexShrink: 0,
                  }}
                >
                  ×{b.occurrences.length}
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    padding: '2px 8px 6px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {b.occurrences.map((occ, j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => onPickEl(occ.el)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto auto 1fr',
                        gap: 8,
                        alignItems: 'baseline',
                        padding: '4px 6px',
                        background: 'transparent',
                        border: 0,
                        color: 'rgba(255,255,255,0.78)',
                        fontFamily: 'inherit',
                        fontSize: 11.5,
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderRadius: 3,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          'rgba(255,255,255,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          'transparent';
                      }}
                      title={`Select ${occ.tag} (${occ.prop}) in ${occ.artboard}`}
                    >
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.45)',
                          fontSize: 10.5,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 90,
                        }}
                      >
                        {occ.artboard}
                      </span>
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.55)',
                          fontSize: 10.5,
                        }}
                      >
                        {occ.prop}
                      </span>
                      <span
                        style={{
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                          color: '#cfe0ff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minWidth: 0,
                        }}
                      >
                        {occ.tag}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
