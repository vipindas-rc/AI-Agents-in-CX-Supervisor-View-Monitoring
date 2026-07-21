// ───────────────────────── Agent handoff serializer ─────────────────────────
//
// Turns an Inspector selection into a self-contained, platform-neutral spec an
// AI coding agent can implement from — in ANY stack (web, iOS, Android). The
// analogue of Figma dev-mode's MCP `get_design_context`, but grounded in the
// RENDERED truth instead of a reconstruction:
//
//   - markup is the real DOM subtree with resolved computed styles inlined
//     (only authored-here properties — diffed against per-tag probe defaults)
//   - values carry Spring design-token names as comments where they match
//   - component boundaries (Spring / user React components) annotate the
//     elements they render, with their design-spec props
//   - interaction states (:hover/:active/:focus) are captured by FORCING them
//     on the live subtree via forceState and diffing computed styles — states
//     no designer ever drew in Figma are still reported here
//   - transitions/animations are read off the live CSS as a motion spec
//
// The module is dependency-injected: everything that needs Inspector internals
// (fiber walking, token reverse-lookups, theme scoping) comes in through the
// `HandoffResolvers` interface, so this file only depends on forceState.
//
// Also exports `auditStyleCoverage` — the whitelist-completeness tool. It
// sweeps artboards, diffs every element's computed style against its probe
// default (inherited props compare against the PARENT instead), and reports
// authored properties the serializer does NOT yet emit, ranked by frequency.
// Exposed as `window.__dcHandoffAudit()` by the Inspector for console use.

import { setForcedStates, type PseudoState } from './forceState';
import { getAncestorScale } from './getAncestorScale';

// ───────── resolver injection ─────────

export type ComponentChainEntry = {
  name: string;
  kind: 'spring' | 'user';
  props: Record<string, unknown> | null;
};

export type HandoffResolvers = {
  /** Components (outermost first) whose first rendered host IS this element. */
  componentChainFor(el: Element): ComponentChainEntry[];
  /** Spring icon export name for an <svg> root (walks its fiber chain). */
  iconNameFor(el: Element): string | null;
  /** Reverse-lookup a computed color in the element's own theme scope. */
  colorToken(value: string, scopeEl: Element): string | null;
  typographyToken(cs: CSSStyleDeclaration): string | null;
  shadowToken(value: string): string | null;
  radiusToken(px: number): string | null;
  spacingToken(px: number): string | null;
  themeInfoFor(el: Element): { scope: string; type: 'light' | 'dark' | null };
};

export type SerializeOptions = {
  resolvers: HandoffResolvers;
  /** Human title for the header, e.g. the Inspector's selection label. */
  title: string;
  /** data-dc-slot id of the containing artboard (null outside a canvas). */
  artboard?: string | null;
  /** data-anchor of the selection root (source provenance). */
  anchor?: string | null;
  /** Shallow authored JSX of the selected component, if any. */
  authoredJSX?: string | null;
  /** Capture :hover/:active/:focus diffs (mutates DOM temporarily). */
  includeStates?: boolean;
  /** Forced state to restore after states capture (the Inspector's chips). */
  restoreForced?: { host: Element; states: PseudoState[] } | null;
};

export type SerializedHandoff = {
  markdown: string;
  /** chars/4 heuristic — Figma-level precision is all we need. */
  tokenEstimate: number;
  /** Elements emitted (after dedup) vs total walked, for the UI caption. */
  emittedElements: number;
};

// ───────── property model ─────────
//
// Three buckets, each with a different "is it authored?" test:
//   probe-diffed   — non-inherited; emit when ≠ the per-tag unstyled default
//   parent-diffed  — inherited; emit on TEXT-authoring elements always
//                    (a self-contained spec needs the resolved type stack)
//   geometry       — never emitted as CSS (computed w/h is layout residue,
//                    not authoring); rendered size rides in a comment instead

// Inherited text/typography properties — emitted (resolved) on any element
// that directly authors text; never on pure wrappers.
const TEXT_PROPS = [
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'color',
  'text-align',
  'text-transform',
  'text-decoration-line',
  'white-space',
  'text-overflow',
  'word-break',
] as const;

// Paint-ish properties diffed for interaction-state capture. Layout props are
// excluded on purpose: forcing :hover must not report reflow noise.
const STATE_DIFF_PROPS = [
  'color',
  'background-color',
  'background-image',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'box-shadow',
  'opacity',
  'transform',
  'outline-width',
  'outline-style',
  'outline-color',
  'filter',
  'text-decoration-line',
  'fill',
  'stroke',
] as const;

// Caps so an artboard-sized selection stays a readable payload.
const MAX_EMITTED_ELEMENTS = 350;
const MAX_STATE_ELEMENTS = 800;
const MAX_STATE_LINES_PER_STATE = 24;
const MAX_MOTION_LINES = 14;
// Verbatim svg assets larger than this are listed by name only (big
// illustrations would swamp the payload; icons are a few hundred chars).
const MAX_SVG_ASSET_CHARS = 6000;

// ───────── probe defaults (per-tag unstyled baseline) ─────────

let probeHost: HTMLDivElement | null = null;
const probeCache = new Map<string, CSSStyleDeclaration>();

function getProbeStyle(tag: string): CSSStyleDeclaration {
  const key = tag.toLowerCase();
  const cached = probeCache.get(key);
  if (cached) return cached;
  if (!probeHost || !probeHost.isConnected) {
    probeHost = document.createElement('div');
    probeHost.setAttribute('data-inspector-ui', '');
    probeHost.style.cssText =
      'position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none;';
    document.body.appendChild(probeHost);
  }
  let el: Element;
  try {
    el =
      key === 'svg' || probeIsSvgTag(key)
        ? document.createElementNS('http://www.w3.org/2000/svg', key)
        : document.createElement(key);
  } catch {
    el = document.createElement('div');
  }
  probeHost.appendChild(el);
  // Live CSSStyleDeclaration — stays valid while the probe stays in the DOM.
  const cs = getComputedStyle(el);
  probeCache.set(key, cs);
  return cs;
}

function probeIsSvgTag(tag: string): boolean {
  return ['path', 'circle', 'rect', 'g', 'line', 'polyline', 'polygon', 'ellipse', 'defs', 'use'].includes(tag);
}

// ───────── small formatters ─────────

function fmtNum(n: number): string {
  const r = Math.round(n * 100) / 100;
  return String(r);
}

/** "80px" → "80px", "12.5px" → "12.5px", strips float noise. */
function fmtLen(v: string): string {
  const m = v.match(/^(-?[\d.]+)px$/);
  return m ? `${fmtNum(parseFloat(m[1]))}px` : v;
}

function parseColor(v: string): { r: number; g: number; b: number; a: number } | null {
  const m = v.match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/,
  );
  if (!m) return null;
  let a = 1;
  if (m[4] !== undefined) {
    a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  }
  return { r: +m[1], g: +m[2], b: +m[3], a };
}

function isTransparentColor(v: string | null | undefined): boolean {
  if (!v || v === 'transparent' || v === 'none') return true;
  const c = parseColor(v);
  return !!c && c.a === 0;
}

/** Opaque → #hex; translucent → normalized rgba() (clearer cross-platform). */
function fmtColor(v: string): string {
  const c = parseColor(v);
  if (!c) return v;
  if (c.a === 0) return 'transparent';
  if (c.a >= 1) {
    const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
  }
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${fmtNum(c.a)})`;
}

/** Pure translations/scales computed as matrix() → readable form. */
function fmtTransform(v: string): string {
  const m = v.match(/^matrix\(([^)]+)\)$/);
  if (!m) return v;
  const [a, b, c, d, tx, ty] = m[1].split(',').map((s) => parseFloat(s.trim()));
  if (a === 1 && b === 0 && c === 0 && d === 1) {
    return `translate(${fmtNum(tx)}px, ${fmtNum(ty)}px)`;
  }
  if (b === 0 && c === 0 && tx === 0 && ty === 0) {
    return a === d ? `scale(${fmtNum(a)})` : `scale(${fmtNum(a)}, ${fmtNum(d)})`;
  }
  return v;
}

/**
 * Drop no-op box-shadow layers (Spring stacks transparent / zero-geometry
 * placeholder layers under real ones). Null when nothing paints.
 */
function filterShadowLayers(shadow: string): string | null {
  const parts = shadow.split(/,(?![^(]*\))/).map((s) => s.trim());
  const kept = parts.filter((p) => {
    const colorMatch = p.match(/rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}/);
    if (colorMatch && isTransparentColor(colorMatch[0])) return false;
    const geom = p.replace(/rgba?\([^)]*\)/, '').match(/-?[\d.]+px/g);
    if (geom && geom.every((n) => parseFloat(n) === 0)) return false;
    return true;
  });
  return kept.length > 0 ? kept.join(', ') : null;
}

/** "0.1618s" → "162ms" */
function fmtDuration(v: string): string {
  const m = v.match(/^([\d.]+)s$/);
  return m ? `${Math.round(parseFloat(m[1]) * 1000)}ms` : v;
}

/** 4-side shorthand reduction (t r b l). */
function shorthand4(t: string, r: string, b: string, l: string): string {
  if (t === r && r === b && b === l) return t;
  if (t === b && r === l) return `${t} ${r}`;
  if (r === l) return `${t} ${r} ${b}`;
  return `${t} ${r} ${b} ${l}`;
}

function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

// ───────── DOM predicates ─────────

function hasDirectText(el: Element): boolean {
  for (let i = 0; i < el.childNodes.length; i++) {
    const c = el.childNodes[i];
    if (c.nodeType === Node.TEXT_NODE && (c.textContent ?? '').trim().length > 0) return true;
  }
  return false;
}

function isSvgRoot(el: Element): boolean {
  return el instanceof SVGSVGElement;
}

function skipElement(el: Element, cs: CSSStyleDeclaration): boolean {
  if (el.closest('[data-inspector-ui]')) return true;
  if (cs.display === 'none' || cs.visibility === 'hidden') return true;
  return false;
}

// ───────── declaration extraction ─────────

type Decl = { prop: string; value: string; note?: string };

function declsToStyle(decls: Decl[]): string {
  return decls
    .map((d) => `${d.prop}:${d.value}${d.note ? ` /* ${d.note} */` : ''}`)
    .join('; ');
}

/**
 * The whitelist, applied. Reads only authored-here properties for one element.
 * `probe` is the same-tag unstyled baseline; text props gate on direct text.
 */
function readDecls(
  el: Element,
  cs: CSSStyleDeclaration,
  R: HandoffResolvers,
  scale = 1,
): Decl[] {
  const probe = getProbeStyle(el.tagName.toLowerCase());
  const out: Decl[] = [];
  const diff = (prop: string) => cs.getPropertyValue(prop) !== probe.getPropertyValue(prop);
  const val = (prop: string) => cs.getPropertyValue(prop);

  // ── layout mode ──
  const display = val('display');
  if (diff('display')) out.push({ prop: 'display', value: display });
  const isFlex = display.includes('flex');
  const isGrid = display.includes('grid');
  if (isFlex) {
    const dir = val('flex-direction');
    if (dir !== 'row') out.push({ prop: 'flex-direction', value: dir });
    const wrap = val('flex-wrap');
    if (wrap !== 'nowrap') out.push({ prop: 'flex-wrap', value: wrap });
  }
  if (isGrid) {
    const cols = val('grid-template-columns');
    if (cols !== 'none') out.push({ prop: 'grid-template-columns', value: cols });
    const rows = val('grid-template-rows');
    if (rows !== 'none') out.push({ prop: 'grid-template-rows', value: rows });
    const flow = val('grid-auto-flow');
    if (flow !== 'row') out.push({ prop: 'grid-auto-flow', value: flow });
  }
  if (isFlex || isGrid) {
    const jc = val('justify-content');
    if (jc !== 'normal' && jc !== 'flex-start') out.push({ prop: 'justify-content', value: jc });
    const ai = val('align-items');
    if (ai !== 'normal' && ai !== 'stretch') out.push({ prop: 'align-items', value: ai });
    const ac = val('align-content');
    if (ac !== 'normal' && ac !== 'stretch') out.push({ prop: 'align-content', value: ac });
    const ji = val('justify-items');
    if (isGrid && ji !== 'normal' && ji !== 'legacy' && ji !== 'stretch')
      out.push({ prop: 'justify-items', value: ji });
    const rowGap = val('row-gap');
    const colGap = val('column-gap');
    const gapAuthored = (g: string) => g !== 'normal' && parseFloat(g) > 0;
    if (gapAuthored(rowGap) || gapAuthored(colGap)) {
      const rg = gapAuthored(rowGap) ? fmtLen(rowGap) : '0px';
      const cg = gapAuthored(colGap) ? fmtLen(colGap) : '0px';
      const value = rg === cg ? rg : `${rg} ${cg}`;
      const tok = rg === cg ? R.spacingToken(parseFloat(rg)) : null;
      out.push({ prop: 'gap', value, note: tok ?? undefined });
    }
  }

  // ── child-in-parent placement ──
  const alignSelf = val('align-self');
  if (alignSelf !== 'auto') out.push({ prop: 'align-self', value: alignSelf });
  const justifySelf = val('justify-self');
  if (justifySelf !== 'auto') out.push({ prop: 'justify-self', value: justifySelf });
  if (val('order') !== '0') out.push({ prop: 'order', value: val('order') });
  const grow = val('flex-grow');
  const shrink = val('flex-shrink');
  const basis = val('flex-basis');
  if (grow !== '0' || basis !== 'auto') {
    out.push({ prop: 'flex', value: `${grow} ${shrink} ${basis === 'auto' ? 'auto' : fmtLen(basis)}` });
  }
  const gridCol = `${val('grid-column-start')} / ${val('grid-column-end')}`;
  if (gridCol !== 'auto / auto') out.push({ prop: 'grid-column', value: gridCol });
  const gridRow = `${val('grid-row-start')} / ${val('grid-row-end')}`;
  if (gridRow !== 'auto / auto') out.push({ prop: 'grid-row', value: gridRow });

  // ── positioning ──
  const position = val('position');
  if (position !== 'static') {
    out.push({ prop: 'position', value: position });
    const insets = (['top', 'right', 'bottom', 'left'] as const).map((s) => fmtLen(val(s)));
    if (position === 'relative') {
      // relative: only actual offsets are meaningful (computed reports 0px).
      (['top', 'right', 'bottom', 'left'] as const).forEach((s, i) => {
        if (insets[i] !== 'auto' && parseFloat(insets[i]) !== 0) {
          out.push({ prop: s, value: insets[i] });
        }
      });
    } else {
      // absolute/fixed/sticky: computed insets are USED values (every side
      // resolves) — emit as one compact shorthand.
      out.push({ prop: 'inset', value: insets.join(' ') });
    }
    const z = val('z-index');
    if (z !== 'auto') out.push({ prop: 'z-index', value: z });
  }

  // ── explicit size constraints ──
  const ar = val('aspect-ratio');
  if (ar !== 'auto') out.push({ prop: 'aspect-ratio', value: ar });
  for (const [prop, none] of [
    ['min-width', '0px'],
    ['min-height', '0px'],
    ['max-width', 'none'],
    ['max-height', 'none'],
  ] as const) {
    const v = val(prop);
    if (v !== none && v !== 'auto') out.push({ prop, value: fmtLen(v) });
  }

  // ── spacing ──
  const pad = shorthand4(
    fmtLen(val('padding-top')),
    fmtLen(val('padding-right')),
    fmtLen(val('padding-bottom')),
    fmtLen(val('padding-left')),
  );
  if (pad !== '0px') {
    const single = !pad.includes(' ');
    const tok = single ? R.spacingToken(parseFloat(pad)) : null;
    out.push({ prop: 'padding', value: pad, note: tok ?? undefined });
  }
  const mar = shorthand4(
    fmtLen(val('margin-top')),
    fmtLen(val('margin-right')),
    fmtLen(val('margin-bottom')),
    fmtLen(val('margin-left')),
  );
  if (mar !== '0px') {
    const single = !mar.includes(' ');
    const tok = single ? R.spacingToken(parseFloat(mar)) : null;
    out.push({ prop: 'margin', value: mar, note: tok ?? undefined });
  }

  // ── paint ──
  const bg = val('background-color');
  if (!isTransparentColor(bg)) {
    out.push({ prop: 'background', value: fmtColor(bg), note: R.colorToken(bg, el) ?? undefined });
  }
  const bgImg = val('background-image');
  if (bgImg !== 'none') {
    out.push({ prop: 'background-image', value: bgImg });
    const bgSize = val('background-size');
    if (bgSize !== 'auto') out.push({ prop: 'background-size', value: bgSize });
    const bgPos = val('background-position');
    if (bgPos !== '0% 0%') out.push({ prop: 'background-position', value: bgPos });
    const bgRepeat = val('background-repeat');
    if (bgRepeat !== 'repeat') out.push({ prop: 'background-repeat', value: bgRepeat });
    const bgClip = val('background-clip');
    if (bgClip !== 'border-box') out.push({ prop: 'background-clip', value: bgClip });
    const bgBlend = val('background-blend-mode');
    if (bgBlend.split(',').some((s) => s.trim() !== 'normal')) {
      out.push({ prop: 'background-blend-mode', value: bgBlend });
    }
  }

  // ── border ──
  const sides = (['top', 'right', 'bottom', 'left'] as const).map((s) => ({
    side: s,
    width: parseFloat(val(`border-${s}-width`)) || 0,
    style: val(`border-${s}-style`),
    color: val(`border-${s}-color`),
  }));
  const painted = sides.filter((s) => s.width > 0 && s.style !== 'none' && !isTransparentColor(s.color));
  if (painted.length === 4 && painted.every(
    (s) => s.width === painted[0].width && s.style === painted[0].style && s.color === painted[0].color,
  )) {
    const s = painted[0];
    out.push({
      prop: 'border',
      value: `${fmtNum(s.width)}px ${s.style} ${fmtColor(s.color)}`,
      note: R.colorToken(s.color, el) ?? undefined,
    });
  } else {
    for (const s of painted) {
      out.push({
        prop: `border-${s.side}`,
        value: `${fmtNum(s.width)}px ${s.style} ${fmtColor(s.color)}`,
        note: R.colorToken(s.color, el) ?? undefined,
      });
    }
  }

  // ── radius ──
  const corners = [
    val('border-top-left-radius'),
    val('border-top-right-radius'),
    val('border-bottom-right-radius'),
    val('border-bottom-left-radius'),
  ].map(fmtLen);
  const radius = shorthand4(corners[0], corners[1], corners[2], corners[3]);
  if (radius !== '0px') {
    let note: string | undefined;
    if (!radius.includes(' ')) {
      const px = parseFloat(radius);
      const rect = el.getBoundingClientRect();
      const minDim = Math.min(rect.width, rect.height) / scale;
      if (minDim > 0 && px >= minDim / 2) note = 'fully rounded (pill/circle)';
      else note = R.radiusToken(px) ?? undefined;
    }
    out.push({ prop: 'border-radius', value: radius, note });
  }

  // ── effects ──
  const shadow = val('box-shadow');
  if (shadow !== 'none') {
    const painted = filterShadowLayers(shadow);
    if (painted) {
      // Token lookup keys off the browser-normalized FULL string (Spring's
      // placeholder layers included), so look up before filtering.
      out.push({ prop: 'box-shadow', value: painted, note: R.shadowToken(shadow) ?? undefined });
    }
  }
  const outlineStyle = val('outline-style');
  const outlineWidth = parseFloat(val('outline-width')) || 0;
  const outlineColor = val('outline-color');
  if (outlineStyle !== 'none' && outlineWidth > 0 && !isTransparentColor(outlineColor)) {
    out.push({
      prop: 'outline',
      value: `${fmtNum(outlineWidth)}px ${outlineStyle} ${fmtColor(outlineColor)}`,
      note: R.colorToken(outlineColor, el) ?? undefined,
    });
  }
  const opacity = val('opacity');
  if (opacity !== '1') out.push({ prop: 'opacity', value: opacity });
  const filter = val('filter');
  if (filter !== 'none') out.push({ prop: 'filter', value: filter });
  const backdrop = val('backdrop-filter');
  if (backdrop && backdrop !== 'none') out.push({ prop: 'backdrop-filter', value: backdrop });
  const blend = val('mix-blend-mode');
  if (blend !== 'normal') out.push({ prop: 'mix-blend-mode', value: blend });

  // ── clipping ──
  const ox = val('overflow-x');
  const oy = val('overflow-y');
  if (ox !== 'visible' || oy !== 'visible') {
    out.push({ prop: 'overflow', value: ox === oy ? ox : `${ox} ${oy}` });
  }
  const clip = val('clip-path');
  if (clip !== 'none') out.push({ prop: 'clip-path', value: clip });

  // ── transform ──
  const transform = val('transform');
  if (transform !== 'none') {
    out.push({ prop: 'transform', value: fmtTransform(transform) });
  }

  // ── replaced content ──
  if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement) {
    const fit = val('object-fit');
    if (fit !== 'fill') out.push({ prop: 'object-fit', value: fit });
    const pos = val('object-position');
    if (pos !== '50% 50%') out.push({ prop: 'object-position', value: pos });
  }

  // ── interactivity hint ──
  if (val('cursor') === 'pointer') out.push({ prop: 'cursor', value: 'pointer' });

  // ── SVG root paint ── (internals aren't walked, so the paint must surface
  // here). Icon glyphs inherit the root's fill rule; NON-icon svgs — e.g.
  // Spring Squircle's shape painter — carry fill/stroke on an inner shape via
  // CSS vars, so read the first shape descendant's computed paint instead.
  if (isSvgRoot(el)) {
    let paintStyle: CSSStyleDeclaration = cs;
    if (!R.iconNameFor(el)) {
      const shape = el.querySelector('path, circle, rect, ellipse, polygon, line, use');
      if (shape) {
        try {
          paintStyle = getComputedStyle(shape);
        } catch {
          /* keep root */
        }
      }
    }
    let fill = paintStyle.getPropertyValue('fill');
    if (fill.toLowerCase().includes('currentcolor')) fill = val('color');
    if (fill && fill !== 'none' && !isTransparentColor(fill)) {
      out.push({ prop: 'fill', value: fmtColor(fill), note: R.colorToken(fill, el) ?? undefined });
    }
    let stroke = paintStyle.getPropertyValue('stroke');
    if (stroke.toLowerCase().includes('currentcolor')) stroke = val('color');
    const strokeW = parseFloat(paintStyle.getPropertyValue('stroke-width')) || 0;
    if (stroke && stroke !== 'none' && !isTransparentColor(stroke) && strokeW > 0) {
      out.push({ prop: 'stroke', value: `${fmtColor(stroke)} (${fmtNum(strokeW)}px)`, note: R.colorToken(stroke, el) ?? undefined });
    }
  }

  // ── typography (text-authoring elements only, always resolved) ──
  if (hasDirectText(el)) {
    const family = val('font-family').split(',')[0].trim().replace(/^["']|["']$/g, '');
    const size = fmtLen(val('font-size'));
    const lh = val('line-height');
    const weight = val('font-weight');
    const typoTok = R.typographyToken(cs);
    out.push({
      prop: 'font',
      value: `${family} ${size}/${lh === 'normal' ? 'normal' : fmtLen(lh)} · weight ${weight}`,
      note: typoTok ?? undefined,
    });
    const style = val('font-style');
    if (style !== 'normal') out.push({ prop: 'font-style', value: style });
    const ls = val('letter-spacing');
    if (ls !== 'normal') out.push({ prop: 'letter-spacing', value: fmtLen(ls) });
    const color = val('color');
    if (!isTransparentColor(color)) {
      out.push({ prop: 'color', value: fmtColor(color), note: R.colorToken(color, el) ?? undefined });
    }
    const ta = val('text-align');
    if (ta !== 'start' && ta !== 'left') out.push({ prop: 'text-align', value: ta });
    const tt = val('text-transform');
    if (tt !== 'none') out.push({ prop: 'text-transform', value: tt });
    const td = val('text-decoration-line');
    if (td !== 'none') out.push({ prop: 'text-decoration', value: td });
    const ws = val('white-space');
    if (ws !== 'normal') out.push({ prop: 'white-space', value: ws });
    const to = val('text-overflow');
    if (to === 'ellipsis') out.push({ prop: 'text-overflow', value: 'ellipsis' });
    const wb = val('word-break');
    if (wb !== 'normal') out.push({ prop: 'word-break', value: wb });
  }

  return out;
}

// ───────── structure serialization ─────────

type SubtreeResult = {
  lines: string[];
  /** Content-independent signature for sibling dedup. */
  signature: string;
  /** Human summary of distinguishing content (text + icon names). */
  summary: string;
  emitted: number;
};

type WalkState = {
  R: HandoffResolvers;
  emitted: number;
  truncated: boolean;
  /** Canvas zoom compensation — getBoundingClientRect returns VISUAL size
   * (post-canvas-transform); divide by this for natural CSS px. */
  scale: number;
  /** Deduped verbatim svg sources, keyed by asset name (icon export name or
   * a generated inline-svg-N). Emitted as an appendix so a clean-room agent
   * gets the actual glyph/shape geometry, not just a name. */
  svgAssets: Map<string, string>;
  /** Dedup keys (id-normalized markup) for the generated inline-svg-N names. */
  svgAssetKeys: Map<string, string>;
  /** True once any `data-interaction` authored note was emitted — gates the
   * reading-notes bullet that tells the agent those comments are the spec. */
  hasInteractionNotes: boolean;
};

// Serialize an svg subtree for the assets appendix. Icons keep
// `currentColor` (per-instance color rides in the structure's `fill:` decl);
// non-icon svgs (e.g. Spring Squircle's shape painter) get CSS-var paints
// baked to the resolved value so the geometry stands alone.
function serializeSvgAsset(el: SVGSVGElement, bakeFill: string | null): string {
  const clone = el.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute('style');
  clone.removeAttribute('class');
  clone.removeAttribute('data-anchor');
  clone.removeAttribute('data-interaction');
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  // Paint often comes from a CSS rule (not a markup attribute), which a
  // standalone render loses — set it explicitly so shapes without their own
  // fill inherit the resolved value.
  if (bakeFill) clone.setAttribute('fill', bakeFill);
  // Strip references to defs living OUTSIDE this svg (e.g. Spring Squircle's
  // clip-path def sits in a hidden sibling svg) — dangling in isolation.
  for (const c of Array.from(clone.querySelectorAll('[clip-path], [mask], [filter]'))) {
    for (const attr of ['clip-path', 'mask', 'filter'] as const) {
      const v = c.getAttribute(attr);
      const m = v?.match(/#([^)'"]+)/);
      if (m && !clone.querySelector(`[id="${m[1]}"]`)) c.removeAttribute(attr);
    }
  }
  let s = new XMLSerializer().serializeToString(clone);
  if (bakeFill) {
    s = s
      .replace(/var\(--[^)]*\)/g, bakeFill)
      .replace(/currentColor/gi, bakeFill);
  }
  return s;
}

function componentComment(chain: ComponentChainEntry[], sizeLabel: string): string {
  // memo/forwardRef twins produce consecutive same-name entries — keep one.
  chain = chain.filter((c, i) => i === 0 || c.name !== chain[i - 1].name);
  const parts = chain.map((c) => {
    const specProps = c.props
      ? Object.entries(c.props)
          .filter(([k, v]) =>
            k !== 'children' && k !== 'className' && k !== 'style' && k !== 'classes' &&
            (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'),
          )
          .slice(0, 6)
          .map(([k, v]) => (v === true ? k : `${k}=${JSON.stringify(v)}`))
          .join(' ')
      : '';
    const origin = c.kind === 'spring' ? ' (Spring UI)' : '';
    return specProps ? `${c.name}${origin} ${specProps}` : `${c.name}${origin}`;
  });
  return `<!-- ⚛ ${parts.join(' › ')} · ${sizeLabel} -->`;
}

function serializeElement(el: Element, depth: number, state: WalkState): SubtreeResult | null {
  let cs: CSSStyleDeclaration;
  try {
    cs = getComputedStyle(el);
  } catch {
    return null;
  }
  if (skipElement(el, cs)) return null;
  if (state.emitted >= MAX_EMITTED_ELEMENTS) {
    state.truncated = true;
    return null;
  }

  const { R } = state;
  const indent = '  '.repeat(depth);
  const tag = el.tagName.toLowerCase();
  const rect = el.getBoundingClientRect();
  const w = rect.width / state.scale;
  const h = rect.height / state.scale;
  // Zero-area svg roots are plumbing (Spring Squircle's hidden <defs>
  // clip-path definition) — they paint nothing.
  if (isSvgRoot(el) && w < 1 && h < 1) return null;
  const sizeLabel = `${Math.round(w)}×${Math.round(h)}`;
  const lines: string[] = [];
  state.emitted++;

  // Component boundary annotation.
  const chain = R.componentChainFor(el);
  if (chain.length > 0) {
    lines.push(indent + componentComment(chain, sizeLabel));
  }

  // Authored interaction note (`data-interaction` attribute) — behavior lives
  // in JS event handlers and app state, which no computed-style diff can see.
  // Authors narrate it once, in the source, on the element it belongs to; the
  // attribute rides the rendered DOM into every handoff. Emitted in place so
  // the note sits next to the structure it describes.
  const interactionNote = el.getAttribute('data-interaction');
  if (interactionNote) {
    state.hasInteractionNotes = true;
    lines.push(`${indent}<!-- ⚡ interaction: ${esc(interactionNote)} -->`);
  }

  // SVG: leaf in the structure walk — internals are plumbing here, but the
  // full source is registered (deduped) in the assets appendix so a
  // clean-room agent gets the actual geometry, not just a name.
  if (isSvgRoot(el)) {
    const iconName = R.iconNameFor(el);
    const decls = readDecls(el, cs, R, state.scale);
    const style = declsToStyle(decls);
    const viewBox = el.getAttribute('viewBox');

    let assetName: string;
    if (iconName) {
      assetName = iconName;
      if (!state.svgAssets.has(assetName)) {
        // Icons keep currentColor — per-instance color rides in the
        // structure's fill decl, so one asset serves every tint.
        state.svgAssets.set(assetName, serializeSvgAsset(el as SVGSVGElement, null));
      }
    } else {
      // Non-icon svg (e.g. Squircle shape painter): bake resolved paint so
      // the asset stands alone, then dedup by markup — with generated ids
      // (clipPath ids etc.) normalized, else per-instance ids defeat dedup.
      const fillDecl = decls.find((d) => d.prop === 'fill');
      const markup = serializeSvgAsset(el as SVGSVGElement, fillDecl?.value ?? null);
      const dedupKey = markup
        .replace(/\bid="[^"]*"/g, 'id="•"')
        .replace(/url\((?:&quot;|['"])?#[^)'"&]*(?:&quot;|['"])?\)/g, 'url(#•)');
      let found: string | null = null;
      for (const [name, m] of state.svgAssetKeys) {
        if (m === dedupKey) {
          found = name;
          break;
        }
      }
      if (found) {
        assetName = found;
      } else {
        assetName = `inline-svg-${state.svgAssetKeys.size + 1}`;
        state.svgAssetKeys.set(assetName, dedupKey);
        state.svgAssets.set(assetName, markup);
      }
    }

    const label = iconName
      ? `Spring icon: ${iconName} (import from @ringcentral/spring-icon)`
      : `inline svg${viewBox ? ` viewBox="${viewBox}"` : ''}`;
    lines.push(
      `${indent}<svg${style ? ` style="${style}"` : ''}/> <!-- ${label} · ${sizeLabel} · source: "${assetName}" in SVG assets -->`,
    );
    return {
      lines,
      signature: `svg|${style}`,
      summary: iconName ?? 'svg',
      emitted: 1,
    };
  }

  const decls = readDecls(el, cs, R, state.scale);
  const style = declsToStyle(decls);
  const attrs: string[] = [];
  let mediaNote = '';
  const dataName = el.getAttribute('data-name');
  if (dataName) attrs.push(`data-name="${dataName}"`);
  if (el instanceof HTMLImageElement) {
    // Full URL, never truncated — on a deployed canvas it's fetchable; on
    // localhost the path still locates the file in the repo.
    attrs.push(`src="${el.currentSrc || el.src}"`);
    if (el.alt) attrs.push(`alt="${el.alt}"`);
    if (el.naturalWidth > 0) {
      mediaNote = ` · natural ${el.naturalWidth}×${el.naturalHeight}`;
    }
  }
  if (el instanceof HTMLVideoElement) {
    const src = el.currentSrc || el.src;
    if (src) attrs.push(`src="${src}"`);
    if (el.poster) attrs.push(`poster="${el.poster}"`);
    if (el.videoWidth > 0) {
      mediaNote = ` · natural ${el.videoWidth}×${el.videoHeight}`;
    }
  }
  if (style) attrs.push(`style="${style}"`);

  // Children: interleave text nodes and elements in DOM order, dedup siblings.
  const childLines: string[] = [];
  let childEmitted = 0;
  const childSignatures: string[] = [];

  type Pending = { result: SubtreeResult; el: Element };
  const flushGroup = (group: Pending[]) => {
    if (group.length === 0) return;
    childLines.push(...group[0].result.lines);
    childSignatures.push(group[0].result.signature);
    childEmitted += group[0].result.emitted;
    if (group.length > 1) {
      const summaries = group.slice(1).map((g) => g.result.summary).filter(Boolean);
      childLines.push(
        `${'  '.repeat(depth + 1)}<!-- ×${group.length - 1} more sibling${group.length > 2 ? 's' : ''}, identical structure/styles — content: ${truncate(summaries.join(' · '), 220)} -->`,
      );
    }
  };

  let group: Pending[] = [];
  for (let i = 0; i < el.childNodes.length; i++) {
    const c = el.childNodes[i];
    if (c.nodeType === Node.TEXT_NODE) {
      const text = (c.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (text) {
        flushGroup(group);
        group = [];
        childLines.push(`${'  '.repeat(depth + 1)}${esc(text)}`);
      }
      continue;
    }
    if (!(c instanceof Element)) continue;
    const sub = serializeElement(c, depth + 1, state);
    if (!sub) continue;
    if (group.length > 0 && group[0].result.signature === sub.signature && sub.signature.length > 0) {
      group.push({ result: sub, el: c });
    } else {
      flushGroup(group);
      group = [{ result: sub, el: c }];
    }
  }
  flushGroup(group);

  // Assemble.
  if (childLines.length === 0) {
    lines.push(`${indent}<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}/> <!-- ${sizeLabel}${mediaNote} -->`);
  } else {
    lines.push(`${indent}<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}> <!-- ${sizeLabel}${mediaNote} -->`);
    lines.push(...childLines);
    lines.push(`${indent}</${tag}>`);
  }

  // Signature: structure + styles + component names, CONTENT-FREE (so "React"
  // vs "Raise hand" tiles still group as identical siblings).
  const signature = [
    tag,
    chain.map((c) => c.name).join('>'),
    style,
    childSignatures.join(','),
  ].join('|');

  // Summary: what distinguishes this instance (its text, its icons).
  const ownText = truncate(
    (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
    40,
  );
  const iconNames = Array.from(el.querySelectorAll('svg'))
    .map((s) => R.iconNameFor(s))
    .filter(Boolean) as string[];
  const summary = [
    ownText ? `"${ownText}"` : '',
    iconNames.length ? `(${iconNames.join(', ')})` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return { lines, signature, summary, emitted: 1 + childEmitted };
}

// ───────── interaction states + motion ─────────

type StateReport = { state: PseudoState; lines: string[] };

function elementLabel(el: Element, R: HandoffResolvers): string {
  const chain = R.componentChainFor(el);
  const name = chain.length > 0 ? chain[chain.length - 1].name : `<${el.tagName.toLowerCase()}>`;
  const text = truncate((el.textContent ?? '').replace(/\s+/g, ' ').trim(), 24);
  return text ? `${name} "${text}"` : name;
}

function captureStates(
  root: Element,
  R: HandoffResolvers,
  restore: { host: Element; states: PseudoState[] } | null,
): StateReport[] {
  const els: Element[] = [root, ...Array.from(root.querySelectorAll('*'))]
    .filter((el) => {
      if (el.closest('[data-inspector-ui]')) return false;
      if ((el as SVGElement).ownerSVGElement) return false; // svg internals
      return true;
    })
    .slice(0, MAX_STATE_ELEMENTS);

  const snapshot = (): Map<Element, Record<string, string>> => {
    const map = new Map<Element, Record<string, string>>();
    for (const el of els) {
      const cs = getComputedStyle(el);
      const rec: Record<string, string> = {};
      for (const p of STATE_DIFF_PROPS) rec[p] = cs.getPropertyValue(p);
      // Svg internals are excluded from `els`, but Spring Squircle paints its
      // state change on an inner shape's CSS-var fill — surface it on the root.
      if (isSvgRoot(el)) {
        const shape = el.querySelector('path, circle, rect, ellipse, polygon, line, use');
        if (shape) {
          try {
            const scs = getComputedStyle(shape);
            rec['fill'] = scs.getPropertyValue('fill');
            rec['stroke'] = scs.getPropertyValue('stroke');
          } catch {
            /* keep root paint */
          }
        }
      }
      map.set(el, rec);
    }
    return map;
  };

  const reports: StateReport[] = [];
  try {
    setForcedStates(null, new Set());
    const idle = snapshot();
    for (const st of ['hover', 'active', 'focus'] as PseudoState[]) {
      setForcedStates(root, new Set([st]));
      // force sync style resolution
      void (root as HTMLElement).offsetWidth;
      const forced = snapshot();
      // Group identical "label: changes" lines (row of same-styled tiles all
      // shift together) → one line with a ×N count.
      const grouped = new Map<string, number>();
      for (const el of els) {
        const a = idle.get(el)!;
        const b = forced.get(el)!;
        const diffs = new Map<string, [string, string]>();
        for (const p of STATE_DIFF_PROPS) {
          if (a[p] !== b[p]) diffs.set(p, [a[p], b[p]]);
        }
        if (diffs.size === 0) continue;
        // Consolidate 4 identical per-side border-color changes into one.
        const sides = ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'];
        if (sides.every((s) => diffs.has(s))) {
          const first = diffs.get(sides[0])!;
          if (sides.every((s) => diffs.get(s)![0] === first[0] && diffs.get(s)![1] === first[1])) {
            sides.forEach((s) => diffs.delete(s));
            diffs.set('border-color', first);
          }
        }
        const fmt = (v: string) => (parseColor(v) ? fmtColor(v) : v);
        const changes = Array.from(diffs.entries()).map(([p, [av, bv]]) => {
          const tok = parseColor(bv) ? R.colorToken(bv, el) : null;
          return `${p}: ${fmt(av)} → ${fmt(bv)}${tok ? ` /* ${tok} */` : ''}`;
        });
        const line = `${elementLabel(el, R)}: ${changes.join('; ')}`;
        grouped.set(line, (grouped.get(line) ?? 0) + 1);
      }
      const lines: string[] = [];
      for (const [line, count] of grouped) {
        if (lines.length >= MAX_STATE_LINES_PER_STATE) {
          lines.push(`- … more elements changed (truncated)`);
          break;
        }
        lines.push(`- ${count > 1 ? `(×${count}) ` : ''}${line}`);
      }
      if (lines.length > 0) reports.push({ state: st, lines });
    }
  } finally {
    setForcedStates(
      restore ? restore.host : null,
      new Set(restore ? restore.states : []),
    );
  }
  return reports;
}

function captureMotion(root: Element, R: HandoffResolvers): string[] {
  const lines = new Set<string>();
  const els = [root, ...Array.from(root.querySelectorAll('*'))];
  for (const el of els) {
    if (lines.size >= MAX_MOTION_LINES) break;
    if (el.closest('[data-inspector-ui]')) continue;
    if ((el as SVGElement).ownerSVGElement) continue;
    let cs: CSSStyleDeclaration;
    try {
      cs = getComputedStyle(el);
    } catch {
      continue;
    }
    const durs = cs.transitionDuration.split(',').map((s) => s.trim());
    if (durs.some((d) => parseFloat(d) > 0)) {
      const props = cs.transitionProperty.split(',').map((s) => s.trim());
      const easings = cs.transitionTimingFunction.split(/,(?![^(]*\))/).map((s) => s.trim());
      const parts: string[] = [];
      for (let i = 0; i < props.length; i++) {
        const d = durs[i % durs.length];
        if (parseFloat(d) <= 0) continue;
        parts.push(`${props[i]} ${fmtDuration(d)} ${easings[i % easings.length]}`);
      }
      if (parts.length > 0) {
        lines.add(`- ${elementLabel(el, R)}: transition ${parts.join(', ')}`);
      }
    }
    if (cs.animationName !== 'none') {
      lines.add(
        `- ${elementLabel(el, R)}: animation "${cs.animationName}" ${fmtDuration(cs.animationDuration)} ${cs.animationTimingFunction} ${cs.animationIterationCount === 'infinite' ? 'infinite' : ''}`.trim(),
      );
    }
  }
  return Array.from(lines);
}

// ───────── top-level serialize ─────────

export function serializeSelection(root: Element, opts: SerializeOptions): SerializedHandoff {
  const { resolvers: R } = opts;
  const scale = getAncestorScale(root);
  const state: WalkState = {
    R,
    emitted: 0,
    truncated: false,
    scale,
    svgAssets: new Map(),
    svgAssetKeys: new Map(),
    hasInteractionNotes: false,
  };
  const rect = root.getBoundingClientRect();
  const theme = R.themeInfoFor(root);

  const tree = serializeElement(root, 0, state);
  const structure = tree ? tree.lines.join('\n') : '<!-- selection not serializable -->';

  const motion = captureMotion(root, R);
  const states = opts.includeStates
    ? captureStates(root, R, opts.restoreForced ?? null)
    : [];

  const md: string[] = [];
  md.push(`# Design handoff — ${opts.title}`);
  md.push('');
  md.push(
    'This is a machine-captured spec from a LIVE web prototype (React + RingCentral Spring UI). ' +
      'The markup below is the RENDERED DOM with resolved computed styles inlined — the ground truth of what the prototype paints, not authored source. ' +
      'Implement the equivalent in your target stack; CSS property names are used as a neutral vocabulary for layout/paint values.',
  );
  md.push('');
  // Divide out the canvas zoom so the summary matches the per-element
  // <!-- W×H --> comments (getBoundingClientRect returns VISUAL size).
  md.push(
    `- Selection: ${opts.title} · rendered ${Math.round(rect.width / scale)}×${Math.round(rect.height / scale)}px @1x`,
  );
  if (opts.artboard) md.push(`- Artboard: ${opts.artboard}`);
  md.push(`- Theme: ${theme.scope}${theme.type ? ` (${theme.type})` : ''}`);
  if (opts.anchor) md.push(`- Prototype source: ${opts.anchor} (React/Tailwind — provenance only)`);
  md.push(`- Canvas: ${typeof location !== 'undefined' ? location.href : ''}`);
  md.push('');
  md.push('Reading notes:');
  md.push('- `/* … */` comments after values are Spring design-token names — prefer your platform’s equivalent token over the literal value where one exists.');
  md.push('- `<!-- ⚛ … -->` comments mark design-system component boundaries and their spec props.');
  md.push('- `<!-- W×H -->` is the rendered size of the element at 1×. All px values are CSS px @1x — numerically equal to iOS points / Android dp.');
  md.push('- Repeated siblings are emitted once; `×N more` comments list what differs (labels/icons).');
  if (state.hasInteractionNotes) {
    md.push(
      '- `<!-- ⚡ interaction … -->` comments are AUTHORED behavior notes — interaction logic the style capture cannot see (gestures, snap points, state choreography). They are part of the spec: implement them, don’t treat them as commentary.',
    );
  }
  md.push('- Icon/shape geometry is verbatim in "SVG assets" below. Raster `src`/`poster`/background URLs are absolute: fetch them if this canvas host is reachable; otherwise the URL path locates the file in the prototype repo.');
  md.push('');
  md.push('## Rendered structure');
  md.push('```html');
  md.push(structure);
  if (state.truncated) {
    md.push(`<!-- TRUNCATED at ${MAX_EMITTED_ELEMENTS} elements — select a smaller region for full detail -->`);
  }
  md.push('```');

  if (state.svgAssets.size > 0) {
    md.push('');
    md.push(
      '## SVG assets (verbatim from the prototype — icons keep `currentColor`; each instance’s color is the `fill:` in the structure above)',
    );
    for (const [name, markup] of state.svgAssets) {
      md.push(`### ${name}`);
      if (markup.length > MAX_SVG_ASSET_CHARS) {
        md.push(`_source omitted (${Math.round(markup.length / 1024)} kB) — export it from the prototype's Inspector asset section_`);
      } else {
        md.push('```svg');
        md.push(markup);
        md.push('```');
      }
    }
  }

  if (states.length > 0) {
    md.push('');
    md.push('## Interaction states (captured from live CSS — includes states no mockup shows)');
    for (const rep of states) {
      md.push(`### :${rep.state}`);
      md.push(...rep.lines);
    }
  }

  if (motion.length > 0) {
    md.push('');
    md.push('## Motion');
    md.push(...motion);
  }

  if (opts.authoredJSX) {
    md.push('');
    md.push('## Authored source (React — intent reference, not the spec)');
    md.push('```tsx');
    md.push(opts.authoredJSX);
    md.push('```');
  }

  const markdown = md.join('\n');
  return {
    markdown,
    tokenEstimate: Math.ceil(markdown.length / 4),
    emittedElements: state.emitted,
  };
}

// ───────── whitelist coverage audit ─────────
//
// "What authored properties are we NOT emitting?" Sweeps artboards (or a
// scope), diffs every element's computed style against its per-tag probe
// default (inherited props diff against the PARENT — inherited-only values
// aren't authored here), and tallies differing properties the serializer
// neither emits nor deliberately skips. Run from the console:
//   __dcHandoffAudit()            — every artboard on the canvas
//   __dcHandoffAudit(el)          — one subtree
// Returns rows sorted by frequency; also console.tables them.

const INHERITED_PROPS = new Set([
  'color', 'cursor', 'direction', 'font-family', 'font-size', 'font-style',
  'font-variant', 'font-weight', 'font-stretch', 'letter-spacing', 'line-height',
  'list-style-image', 'list-style-position', 'list-style-type', 'pointer-events',
  'quotes', 'tab-size', 'text-align', 'text-indent', 'text-transform',
  'visibility', 'white-space', 'widows', 'orphans', 'word-break', 'word-spacing',
  'overflow-wrap', 'text-shadow', 'text-rendering', 'caret-color', 'accent-color',
  'fill', 'stroke', 'stroke-width', 'text-wrap', 'text-wrap-style', 'text-wrap-mode',
  'white-space-collapse',
]);

// Properties the serializer emits (or whose group it emits) — longhand names
// as they appear in computed-style enumeration.
const EMITTED_PROPS = new Set([
  'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
  'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content',
  'align-self', 'justify-items', 'justify-self', 'order', 'flex-grow', 'flex-shrink',
  'flex-basis', 'row-gap', 'column-gap', 'grid-template-columns', 'grid-template-rows',
  'grid-auto-flow', 'grid-auto-columns', 'grid-auto-rows',
  'grid-column-start', 'grid-column-end', 'grid-row-start', 'grid-row-end',
  'aspect-ratio', 'min-width', 'min-height', 'max-width', 'max-height',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'background-color', 'background-image', 'background-size', 'background-position',
  'background-position-x', 'background-position-y', 'background-repeat',
  'background-repeat-x', 'background-repeat-y', 'background-clip',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-top-left-radius', 'border-top-right-radius',
  'border-bottom-right-radius', 'border-bottom-left-radius',
  'box-shadow', 'outline-width', 'outline-style', 'outline-color', 'outline-offset',
  'opacity', 'filter', 'backdrop-filter', 'mix-blend-mode',
  'overflow-x', 'overflow-y', 'clip-path', 'transform',
  'object-fit', 'object-position', 'cursor',
  'transition-property', 'transition-duration', 'transition-timing-function',
  'transition-delay', 'transition-behavior',
  'animation-name', 'animation-duration', 'animation-timing-function',
  'animation-delay', 'animation-iteration-count', 'animation-direction',
  'animation-fill-mode', 'animation-play-state', 'animation-composition',
  'animation-range-start', 'animation-range-end', 'animation-timeline',
  'fill', 'stroke', 'stroke-width',
  'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
  'letter-spacing', 'color', 'text-align', 'text-transform', 'text-decoration-line',
  'white-space', 'text-overflow', 'word-break',
]);

// Geometry residue + known plumbing we deliberately do not emit as CSS.
const AUDIT_SKIP = new Set([
  'width', 'height', 'block-size', 'inline-size',
  'perspective-origin', 'transform-origin',
  'box-sizing', 'pointer-events', 'user-select', 'touch-action', 'will-change',
  'visibility', 'content', 'contain', 'isolation', 'appearance', 'resize',
  'text-rendering', 'text-size-adjust', 'tab-size', 'direction', 'unicode-bidi',
  'caret-color', 'accent-color', 'speak', 'list-style-type', 'list-style-position',
  'list-style-image', 'text-wrap', 'text-wrap-style', 'text-wrap-mode',
  'white-space-collapse', 'font-variation-settings', 'font-feature-settings',
  'font-kerning', 'font-optical-sizing', 'font-synthesis-weight',
  'font-synthesis-style', 'font-synthesis-small-caps', 'font-variant',
  'text-decoration-color', 'text-decoration-style', 'text-decoration-thickness',
  'text-underline-position', 'text-underline-offset', 'text-shadow',
  'word-spacing', 'text-indent', 'vertical-align', 'zoom',
  'overflow-wrap', 'overscroll-behavior-x', 'overscroll-behavior-y',
  'border-collapse', 'border-spacing', 'caption-side', 'empty-cells',
  'table-layout', 'quotes', 'widows', 'orphans', 'image-rendering',
  'backface-visibility', 'transform-style', 'perspective',
  'view-transition-name', 'view-transition-class', 'interpolate-size',
  // Logical-property aliases of physical props we already emit (Chromium
  // enumerates both) — confirmed pure duplicates by the 2026-07-16 audit run
  // on the rooms-controller canvas.
  'min-block-size', 'min-inline-size', 'max-block-size', 'max-inline-size',
  'inset-block-start', 'inset-block-end', 'inset-inline-start', 'inset-inline-end',
  'padding-block-start', 'padding-block-end', 'padding-inline-start', 'padding-inline-end',
  'margin-block-start', 'margin-block-end', 'margin-inline-start', 'margin-inline-end',
  'border-block-start-width', 'border-block-end-width',
  'border-inline-start-width', 'border-inline-end-width',
  'border-block-start-style', 'border-block-end-style',
  'border-inline-start-style', 'border-inline-end-style',
  'border-block-start-color', 'border-block-end-color',
  'border-inline-start-color', 'border-inline-end-color',
  'border-start-start-radius', 'border-start-end-radius',
  'border-end-start-radius', 'border-end-end-radius',
  'overflow-block', 'overflow-inline',
  // currentColor-following props — differ whenever `color` differs, never
  // authored in these prototypes.
  'column-rule-color', 'row-rule-color', 'text-emphasis-color',
  // Global-reset noise + multi-layer background sub-props whose entries were
  // all default values in the audit ("scroll, scroll", "normal, normal").
  'scrollbar-width', 'scrollbar-color',
  'background-attachment', 'background-origin', 'background-blend-mode',
]);

export type AuditRow = {
  prop: string;
  count: number;
  examples: string[];
  tags: string[];
};

export function auditStyleCoverage(scope?: Element | null): AuditRow[] {
  const roots: Element[] = scope
    ? [scope]
    : Array.from(document.querySelectorAll('[data-dc-slot] .dc-card'));
  const tally = new Map<string, { count: number; examples: Set<string>; tags: Set<string> }>();
  let walked = 0;

  for (const root of roots) {
    const all = [root, ...Array.from(root.querySelectorAll<Element>('*'))];
    for (const el of all) {
      if (el.closest('[data-inspector-ui]')) continue;
      if ((el as SVGElement).ownerSVGElement) continue; // svg internals
      let cs: CSSStyleDeclaration;
      try {
        cs = getComputedStyle(el);
      } catch {
        continue;
      }
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      walked++;
      const probe = getProbeStyle(el.tagName.toLowerCase());
      const parent = el.parentElement ? getComputedStyle(el.parentElement) : null;

      for (let i = 0; i < cs.length; i++) {
        const prop = cs.item(i);
        if (prop.startsWith('--') || prop.startsWith('-webkit') || prop.startsWith('-moz')) continue;
        if (EMITTED_PROPS.has(prop) || AUDIT_SKIP.has(prop)) continue;
        const value = cs.getPropertyValue(prop);
        // "Authored here": inherited props differ from the parent; everything
        // else differs from the unstyled same-tag probe.
        const baseline = INHERITED_PROPS.has(prop)
          ? parent?.getPropertyValue(prop)
          : probe.getPropertyValue(prop);
        if (baseline === undefined || value === baseline) continue;
        let row = tally.get(prop);
        if (!row) {
          row = { count: 0, examples: new Set(), tags: new Set() };
          tally.set(prop, row);
        }
        row.count++;
        if (row.examples.size < 3) row.examples.add(truncate(value, 60));
        if (row.tags.size < 5) row.tags.add(el.tagName.toLowerCase());
      }
    }
  }

  const rows: AuditRow[] = Array.from(tally.entries())
    .map(([prop, r]) => ({
      prop,
      count: r.count,
      examples: Array.from(r.examples),
      tags: Array.from(r.tags),
    }))
    .sort((a, b) => b.count - a.count);

  // eslint-disable-next-line no-console
  console.log(
    `[agentHandoff audit] walked ${walked} elements across ${roots.length} root(s); ` +
      `${rows.length} authored propert${rows.length === 1 ? 'y' : 'ies'} NOT covered by the serializer:`,
  );
  // eslint-disable-next-line no-console
  console.table(
    rows.map((r) => ({
      property: r.prop,
      count: r.count,
      examples: r.examples.join(' | '),
      tags: r.tags.join(','),
    })),
  );
  return rows;
}
