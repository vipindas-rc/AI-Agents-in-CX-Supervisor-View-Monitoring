// Force CSS pseudo-states (hover / active / focus) on an element so the
// Inspector can freeze an interaction state while the cursor is away in the
// panel. A page can't fake a real `:hover` — browsers don't allow it — so this
// uses the stylesheet-rewrite trick (same approach as Storybook's
// pseudo-states addon):
//
//   1. Scan every same-origin stylesheet for rules mentioning the pseudo-
//      classes and clone them with the pseudo swapped for a marker attribute
//      (`:hover` → `[data-dc-force-hover]`). Attribute selectors score the
//      same specificity points as pseudo-classes, and clones keep their
//      original order, so the cascade resolves exactly like a real hover.
//   2. Stamp the marker attribute(s) on the target element. Each rule is
//      cloned in THREE directions (self / marker-is-ancestor /
//      marker-is-descendant via :has) so forcing anywhere in a component's
//      chain lights the whole chain — see rewriteSelector. Only the marked
//      subtree can match, so the rest of the page is untouched.
//   3. Spring/MUI flag some interaction states with CLASSES driven by JS
//      (`sui-active`, `focus-visible`) rather than pseudo-classes — stamp
//      those too so Spring components play along.
//
// The Inspector preview clone inherits the markers via cloneNode, so the
// thumbnail renders the forced state as well.

export type PseudoState = 'hover' | 'active' | 'focus';

const STYLE_ID = 'dc-forced-state-rules';

const MARKERS: Record<PseudoState, string> = {
  hover: 'data-dc-force-hover',
  active: 'data-dc-force-active',
  focus: 'data-dc-force-focus',
};

// JS-driven state classes per forced state. Only added if not already
// present, and removed on clear.
const STATE_CLASSES: Record<PseudoState, string[]> = {
  hover: [],
  active: ['sui-active'],
  focus: ['focus-visible', 'sui-focus-visible'],
};

// Pseudo → marker rewrites. Longest-first so `:focus-visible` isn't half-eaten
// by the `:focus` rule. The negative lookbehind skips escaped colons inside
// Tailwind class names (`.focus\:hover\:bg-x` contains a literal ":hover"
// that is part of the class name, not a pseudo). The class-selector entries
// treat the design system's JS-driven state classes (`sui-active`,
// `focus-visible`) as pseudo-classes so their rules force too — including on
// descendants, where class-stamping wouldn't reach.
const REWRITES: { re: RegExp; marker: string }[] = [
  { re: /(?<!\\):focus-visible/g, marker: `[${MARKERS.focus}]` },
  { re: /(?<!\\):focus-within/g, marker: `[${MARKERS.focus}]` },
  { re: /(?<!\\):focus/g, marker: `[${MARKERS.focus}]` },
  { re: /(?<!\\):hover/g, marker: `[${MARKERS.hover}]` },
  { re: /(?<!\\):active/g, marker: `[${MARKERS.active}]` },
  { re: /\.sui-focus-visible(?![\w-])/g, marker: `[${MARKERS.focus}]` },
  { re: /\.focus-visible(?![\w-])/g, marker: `[${MARKERS.focus}]` },
  { re: /\.sui-active(?![\w-])/g, marker: `[${MARKERS.active}]` },
];

// `:has()` support — needed for the ancestor-direction variant below.
const SUPPORTS_HAS = (() => {
  try {
    return CSS.supports('selector(:has(*))');
  } catch {
    return false;
  }
})();

// Rewrite one selector into forced variants. Returns [] when it mentions none
// of the pseudos — callers must DROP those (a selector list like
// `.a:hover, .a.on` may only keep the rewritten half; cloning `.a.on`
// verbatim would apply it always).
//
// A real pointer hover applies `:hover` to the element under the cursor AND
// every ancestor — and the cursor usually also covers a descendant. So
// "force this state on the selection" should light the WHOLE chain, not just
// rules written against the exact selected element. Three variants per rule:
//   1. self       — pseudo → `[marker]` in place. Same specificity as the
//                    pseudo it replaces, so the cascade resolves identically.
//   2. descendant — pseudo stripped, markers prepended as an ancestor
//                    (`[marker] .btn`): forcing a WRAPPER lights the control
//                    inside it. (+1 pseudo of specificity — acceptable.)
//   3. ancestor   — pseudo → `:has([marker])`: forcing an inner element
//                    (icon) lights the control around it, like a real pointer
//                    would. `:has(attr)` scores the same as the pseudo it
//                    replaces, so specificity is preserved.
function rewriteSelector(sel: string): string[] {
  let self = sel;
  let stripped = sel;
  let ancestor = sel;
  const markers = new Set<string>();
  let hit = false;
  for (const { re, marker } of REWRITES) {
    re.lastIndex = 0;
    if (!re.test(sel)) continue;
    hit = true;
    markers.add(marker);
    re.lastIndex = 0;
    self = self.replace(re, marker);
    re.lastIndex = 0;
    stripped = stripped.replace(re, '');
    re.lastIndex = 0;
    ancestor = ancestor.replace(re, `:has(${marker})`);
  }
  if (!hit) return [];
  const out = [self];
  // Stripping can leave an empty compound (a bare `:hover` selector) — fall
  // back to `*` so the descendant variant stays valid.
  const markerCompound = [...markers].join('');
  const strippedClean = stripped.trim();
  out.push(
    strippedClean && !/[\s>+~]$/.test(strippedClean)
      ? `${markerCompound} ${strippedClean}`
      : `${markerCompound} *`,
  );
  if (SUPPORTS_HAS) out.push(ancestor);
  return out;
}

function collectRules(rules: CSSRuleList, out: string[]): void {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      const kept = rule.selectorText
        .split(',')
        .flatMap((s) => rewriteSelector(s.trim()));
      if (kept.length) out.push(`${kept.join(', ')} { ${rule.style.cssText} }`);
    } else if (rule instanceof CSSMediaRule) {
      // Hoist contents of matching media blocks (e.g. Spring wraps hover rules
      // in `@media (hover: hover)`) — the condition is true right now, so the
      // inner rules apply as-is.
      try {
        if (window.matchMedia(rule.conditionText).matches) {
          collectRules(rule.cssRules, out);
        }
      } catch {
        // unparseable condition — skip
      }
    } else if (rule instanceof CSSSupportsRule) {
      try {
        if (CSS.supports(rule.conditionText)) collectRules(rule.cssRules, out);
      } catch {
        // skip
      }
    } else if (rule instanceof CSSImportRule) {
      try {
        if (rule.styleSheet) collectRules(rule.styleSheet.cssRules, out);
      } catch {
        // cross-origin import — skip
      }
    }
  }
}

function buildForcedSheet(): string {
  const out: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      collectRules(sheet.cssRules, out);
    } catch {
      // cross-origin stylesheet — skip
    }
  }
  return out.join('\n');
}

// Run a forcing mutation with CSS transitions suppressed, committing it via a
// forced synchronous style recalc. Spring buttons transition background-color
// over ~160ms, so without this the forced state lands as an ANIMATION START —
// the Inspector's synchronous getComputedStyle re-read right after the toggle
// returns the OLD (or worse, a mid-flight) color and the Styles panel looks
// like the toggle did nothing. Suppressing for the mutation's recalc makes the
// jump instant in both directions (force AND clear); the suppressor is removed
// two frames later so nothing else loses its transitions for long.
function withTransitionsSuppressed(mutate: () => void): void {
  const s = document.createElement('style');
  s.textContent = '* { transition: none !important; }';
  document.head.appendChild(s);
  mutate();
  // Synchronous reflow — the state change is committed while transitions are
  // off, so no animation is started for it.
  void document.documentElement.offsetWidth;
  requestAnimationFrame(() => requestAnimationFrame(() => s.remove()));
}

// Module-level tracking of the single currently-forced host.
let currentHost: Element | null = null;
let currentAddedClasses: string[] = [];

function clearHost(): void {
  if (!currentHost) return;
  for (const marker of Object.values(MARKERS)) {
    currentHost.removeAttribute(marker);
  }
  for (const cls of currentAddedClasses) {
    currentHost.classList.remove(cls);
  }
  currentHost = null;
  currentAddedClasses = [];
}

function removeSheet(): void {
  document.getElementById(STYLE_ID)?.remove();
}

// Single entry point. Pass the element + the set of states to force; pass
// null (or an empty set) to clear everything. Re-invoking with a different
// element moves the forcing (one forced host at a time).
export function setForcedStates(
  el: Element | null,
  states: Set<PseudoState>,
): void {
  withTransitionsSuppressed(() => {
    clearHost();
    if (!el || states.size === 0) {
      removeSheet();
      return;
    }

    // (Re)build the rewritten stylesheet. Rebuilt per call — HMR swaps style
    // tags underneath us, and a scan of every rule costs single-digit ms.
    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = buildForcedSheet();

    currentHost = el;
    for (const state of states) {
      el.setAttribute(MARKERS[state], '');
      for (const cls of STATE_CLASSES[state]) {
        if (!el.classList.contains(cls)) {
          el.classList.add(cls);
          currentAddedClasses.push(cls);
        }
      }
    }
  });
}
