import { resolveSelector } from './selector';
import type { Thread } from './types';

// Layout constants mirrored from CommentsSidebar so panToElement leaves room for
// the right rail + the pin popover.
const PANEL_W = 320;
const PANEL_GAP = 16;

/** Pan/zoom the canvas so `el` sits centered in the area left of the rail. */
export function panToElement(el: Element) {
  const vpEl = document.querySelector('[data-dc-viewport]') as
    | (HTMLElement & {
        __dcViewport?: {
          getTransform: () => { x: number; y: number; scale: number };
          animateTransform: (t: { x: number; y: number; scale: number }, ms?: number) => void;
        };
      })
    | null;
  const api = vpEl?.__dcViewport;
  if (!vpEl || !api) return;
  const vpRect = vpEl.getBoundingClientRect();
  const tf = api.getTransform();
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return;

  const screenMax = Math.max(r.width, r.height);
  let newScale = tf.scale;
  if (screenMax < 60) newScale = tf.scale * (150 / screenMax);
  else if (screenMax > 600) newScale = tf.scale * (400 / screenMax);
  newScale = Math.min(4, Math.max(0.15, newScale));

  const leftRegionRight = vpRect.right - PANEL_GAP - PANEL_W - 16;
  const targetScreenX = vpRect.left + (leftRegionRight - vpRect.left) * 0.42;
  const targetScreenY = vpRect.top + vpRect.height / 2;

  const worldCx = (r.left + r.width / 2 - vpRect.left - tf.x) / tf.scale;
  const worldCy = (r.top + r.height / 2 - vpRect.top - tf.y) / tf.scale;
  const newX = targetScreenX - vpRect.left - worldCx * newScale;
  const newY = targetScreenY - vpRect.top - worldCy * newScale;
  api.animateTransform({ x: newX, y: newY, scale: newScale }, 260);
}

/** The live DOM element a thread's pin anchors to (null if its artboard isn't mounted). */
export function resolveThreadEl(t: Thread): Element | null {
  const artboard = document.querySelector(`[data-dc-slot="${CSS.escape(t.root.artboardId)}"]`);
  return artboard ? resolveSelector(t.root.anchor.selector, artboard) : null;
}

/**
 * Open path: pan to a thread's pin. If it lives on another page, switch there
 * first, then pan once the artboard mounts (it was unmounted while hidden).
 * Shared by the sidebar row-click and the `?pin=` deeplink.
 */
export function panToThread(
  t: Thread,
  opts: { paged: boolean; activePageId: string | null; onSwitchPage?: (id: string) => void },
) {
  const onActivePage = !opts.paged || t.root.pageId === opts.activePageId;
  if (onActivePage) {
    const el = resolveThreadEl(t);
    if (el) panToElement(el);
    return;
  }
  if (t.root.pageId && opts.onSwitchPage) opts.onSwitchPage(t.root.pageId);
  let tries = 0;
  const tick = () => {
    const el = resolveThreadEl(t);
    if (el) {
      panToElement(el);
      return;
    }
    if (tries++ < 40) requestAnimationFrame(tick); // ~0.6s for the page to mount
  };
  requestAnimationFrame(tick);
}
