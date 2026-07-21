import { getAncestorScale } from './getAncestorScale';
import {
  artboardRootOf,
  buildStableSelector,
  resolveSelector,
  textSnapshot,
} from './selector';
import type { PinAnchor, PinTarget } from './types';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Capture a pin target from a clicked element + click position. Builds all
 * persisted anchor layers (2–5 + identity hints). Returns null if the element
 * isn't inside an artboard.
 */
export function capturePinAnchor(el: Element, clientX: number, clientY: number): PinTarget | null {
  const artboard = artboardRootOf(el);
  const artboardId = artboard?.getAttribute('data-dc-slot');
  if (!artboard || !artboardId) return null;

  const rect = el.getBoundingClientRect();
  const relX = rect.width ? clamp01((clientX - rect.left) / rect.width) : 0.5;
  const relY = rect.height ? clamp01((clientY - rect.top) / rect.height) : 0.5;

  // Artboard-local coords (pre-canvas-transform) for the Layer-5 fallback.
  const scale = getAncestorScale(artboard) || 1;
  const slotRect = artboard.getBoundingClientRect();
  const artboardX = (clientX - slotRect.left) / scale;
  const artboardY = (clientY - slotRect.top) / scale;

  return {
    artboardId,
    selector: buildStableSelector(el, artboard),
    relX,
    relY,
    artboardX,
    artboardY,
    anchorText: textSnapshot(el) || null,
    elementTag: el.tagName.toLowerCase(),
    dataName:
      el.getAttribute('data-name') ||
      el.getAttribute('data-comment-anchor') ||
      el.getAttribute('data-testid') ||
      null,
  };
}

export interface PinScreenPos {
  /** Screen-space coords of the pin tip. */
  x: number;
  y: number;
  /** False = artboard offscreen / hidden element — don't paint. */
  visible: boolean;
  /** True = no element resolved; floating at last-known artboard coords. */
  lost: boolean;
}

const HIDDEN: PinScreenPos = { x: 0, y: 0, visible: false, lost: false };

// Cull margin (px) beyond the viewport before we stop resolving a pin.
const CULL_MARGIN = 200;

/**
 * Resolve a pin to a screen-space position for the current frame. Runs the
 * 5-layer cascade: data-rc-pin (in-session) → artboard-scoped selector (with a
 * Layer-4 text/tag drift check) → artboard-local fallback (anchor-lost).
 *
 * Returns screen coords directly (the pin badge is a fixed screen size — do NOT
 * divide by getAncestorScale here; that's only for the lost-fallback conversion).
 */
export function resolvePinScreen(pin: { id: string; artboardId: string; anchor: PinAnchor }): PinScreenPos {
  const artboard = document.querySelector(
    `[data-dc-slot="${cssAttr(pin.artboardId)}"]`,
  ) as HTMLElement | null;
  if (!artboard) return HIDDEN;

  const slotRect = artboard.getBoundingClientRect();
  // Guardrail 2 — viewport intersection cull.
  if (
    slotRect.right < -CULL_MARGIN ||
    slotRect.bottom < -CULL_MARGIN ||
    slotRect.left > window.innerWidth + CULL_MARGIN ||
    slotRect.top > window.innerHeight + CULL_MARGIN
  ) {
    return HIDDEN;
  }

  // Layer 1 (in-session) then Layer 2 (selector).
  let el: HTMLElement | null =
    pin.id !== 'draft'
      ? (artboard.querySelector(`[data-rc-pin="${cssAttr(pin.id)}"]`) as HTMLElement | null)
      : null;
  if (!el) el = resolveSelector(pin.anchor.selector, artboard);

  // Layer 4 — text/tag drift check; rejects a *wrong-element* match. Skipped when
  // the selector is a single precise identity (data-anchor / data-name / #id):
  // that already pins the exact element, so editing its text mustn't detach it.
  if (el && !isAtomicPrecise(pin.anchor.selector)) {
    if (pin.anchor.anchorText) {
      if (textSnapshot(el) !== pin.anchor.anchorText) el = null;
    } else if (pin.anchor.elementTag && el.tagName.toLowerCase() !== pin.anchor.elementTag) {
      el = null;
    }
  }

  if (el) {
    const r = el.getBoundingClientRect();
    // Visibility: zero-box / display:none / collapsed → hide.
    if (r.width === 0 && r.height === 0) return HIDDEN;
    return {
      x: r.left + r.width * pin.anchor.relX,
      y: r.top + r.height * pin.anchor.relY,
      visible: true,
      lost: false,
    };
  }

  // Layer 5 — anchor-lost: float at last-known artboard-local coords.
  const scale = getAncestorScale(artboard) || 1;
  return {
    x: slotRect.left + pin.anchor.artboardX * scale,
    y: slotRect.top + pin.anchor.artboardY * scale,
    visible: true,
    lost: true,
  };
}

/** A single-segment selector that pins one exact element by identity. */
function isAtomicPrecise(selector: string): boolean {
  if (selector.includes(' ')) return false; // has a combinator → ambiguous target
  return (
    selector.startsWith('#') ||
    /^\[data-(anchor|name|comment-anchor|testid)=/.test(selector)
  );
}

function cssAttr(s: string): string {
  const fn = (globalThis as { CSS?: { escape?: (s: string) => string } }).CSS?.escape;
  return fn ? fn(s) : s.replace(/["\\]/g, '\\$&');
}
