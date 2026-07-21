// Layer 2 of the pin anchor — a stable, artboard-scoped CSS selector.
//
// Reality check (see PLAN.md): in this Tailwind-only, JSX-edited codebase,
// `data-name` is the ONLY anchor that survives a real refactor. Everything else
// degrades gracefully toward "anchor lost". So this builder prioritizes durable
// attributes hard, and only falls back to `tag:nth-of-type(n)` as a last resort.

// Priority order. Authored attrs first (they survive a JSX refactor because you
// carry them with the element), then `data-anchor` — the build-time source
// `relPath:line:col` stamp every host element gets (tools/babel-plugin-data-anchor.js).
// data-anchor is globally unique + stable across runtime DOM changes and edits
// elsewhere in the file; it only drifts if lines are inserted *above* the element.
// That makes it a far stronger default than `tag:nth-of-type(n)`.
const DURABLE_ATTRS = ['data-name', 'data-comment-anchor', 'data-testid', 'data-anchor'] as const;

// Tailwind / Spring utility-class prefixes — skipped when picking a "semantic"
// class, because they carry no identity and change constantly. Anything NOT
// matching is treated as semantic (e.g. `hero-card`, `composer`).
const UTILITY_PREFIX =
  /^(text|bg|border|rounded|shadow|ring|outline|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|w|h|min|max|size|flex|grid|gap|space|divide|items|justify|self|content|place|order|col|row|basis|grow|shrink|absolute|relative|fixed|sticky|static|inset|top|left|right|bottom|z|opacity|overflow|object|leading|tracking|font|italic|uppercase|lowercase|capitalize|truncate|whitespace|break|cursor|select|pointer|transition|duration|ease|delay|animate|transform|translate|scale|rotate|skew|origin|will|backdrop|filter|blur|brightness|contrast|aspect|table|list|align|inline|hidden|visible|sr|antialiased|sui)([-:]|$)/;

function isSemanticClass(cls: string): boolean {
  if (!cls) return false;
  // Strip Tailwind variant prefixes (hover:, md:, etc.) before testing.
  const base = cls.includes(':') ? cls.slice(cls.lastIndexOf(':') + 1) : cls;
  if (!base || /^[[(]/.test(base)) return false; // arbitrary values like [w-4]
  return !UTILITY_PREFIX.test(base);
}

function cssEscape(s: string): string {
  // CSS.escape exists in all evergreen browsers; fall back for SSR/tests.
  const fn = (globalThis as { CSS?: { escape?: (s: string) => string } }).CSS?.escape;
  return fn ? fn(s) : s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
}

function attrSelector(name: string, value: string): string {
  return `[${name}="${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`;
}

/** nth-of-type index (1-based) among same-tag siblings. */
function nthOfType(el: Element): number {
  const tag = el.tagName;
  let i = 1;
  let sib = el.previousElementSibling;
  while (sib) {
    if (sib.tagName === tag) i++;
    sib = sib.previousElementSibling;
  }
  return i;
}

/** The most stable single-element selector segment available for `el`. */
function segmentFor(el: Element): string {
  for (const attr of DURABLE_ATTRS) {
    const v = el.getAttribute(attr);
    if (v) return attrSelector(attr, v);
  }
  const id = el.getAttribute('id');
  if (id && /^[A-Za-z][\w-]*$/.test(id)) return `#${cssEscape(id)}`;

  const tag = el.tagName.toLowerCase();
  const classes = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
  const semantic = classes.find(isSemanticClass);
  if (semantic) return `${tag}.${cssEscape(semantic)}`;

  return `${tag}:nth-of-type(${nthOfType(el)})`;
}

function isUnique(root: Element, selector: string): boolean {
  try {
    return root.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

/**
 * Build the shortest selector that uniquely resolves `el` within `artboardRoot`.
 * Walks up from the element, prepending parent segments (direct-child combinator)
 * only until uniqueness is reached — don't over-specify. Scoped to the artboard so
 * it never matches an identical element in another artboard on the same canvas.
 */
export function buildStableSelector(el: Element, artboardRoot: Element): string {
  const segments: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== artboardRoot) {
    segments.unshift(segmentFor(cur));
    const candidate = segments.join(' > ');
    if (isUnique(artboardRoot, candidate)) return candidate;
    cur = cur.parentElement;
  }
  // The optimized walk didn't reach uniqueness — common with library components
  // (Spring/MUI) whose shared classes like `MuiButtonBase-root` look semantic but
  // repeat across the tree. Fall back to an absolute, `:scope`-anchored structural
  // path: guaranteed to resolve to exactly this element so the pin never falsely
  // reports anchor-lost. Less durable than data-anchor, but correct.
  return structuralPath(el, artboardRoot);
}

/** Absolute direct-child path from the artboard root to `el` (always unique). */
function structuralPath(el: Element, artboardRoot: Element): string {
  const segs: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== artboardRoot) {
    segs.unshift(`${cur.tagName.toLowerCase()}:nth-of-type(${nthOfType(cur)})`);
    cur = cur.parentElement;
  }
  // `:scope` binds the path to the artboard root we query against in resolveSelector.
  return `:scope > ${segs.join(' > ')}`;
}

/** Resolve a selector within an artboard, returning the single match or null. */
export function resolveSelector(selector: string, artboardRoot: Element): HTMLElement | null {
  try {
    const matches = artboardRoot.querySelectorAll(selector);
    return matches.length === 1 ? (matches[0] as HTMLElement) : null;
  } catch {
    return null;
  }
}

/** Layer 4 — 60-char text snapshot used to detect anchor drift. */
export function textSnapshot(el: Element): string {
  return (el.textContent || '').slice(0, 60).trim();
}

/** Find the artboard slot element an element belongs to (or null). */
export function artboardRootOf(el: Element): HTMLElement | null {
  return el.closest('[data-dc-slot]') as HTMLElement | null;
}

/** The artboard id (`data-dc-slot` value) for an element, or null. */
export function artboardIdOf(el: Element): string | null {
  return artboardRootOf(el)?.getAttribute('data-dc-slot') ?? null;
}
