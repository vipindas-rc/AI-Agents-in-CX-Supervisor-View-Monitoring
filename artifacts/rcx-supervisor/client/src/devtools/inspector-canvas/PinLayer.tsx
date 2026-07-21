import { useEffect, useRef, useState, type ReactNode } from 'react';
import { resolvePinScreen } from './pinAnchor';
import type { PinAnchor } from './types';

export interface PinView {
  id: string; // root comment id, or 'draft'
  artboardId: string;
  anchor: PinAnchor;
  kind: 'unresolved' | 'resolved' | 'draft';
  /** Badge number (1-based) for saved pins; undefined for the draft. */
  index?: number;
}

const COLORS = {
  unresolved: '#26282c',
  resolved: '#1C8B4B',
  draft: '#26282c',
  lost: '#C8841C',
};

/**
 * Renders all pins as screen-space markers, glued to their targets by splitting
 * the work in two so pan/zoom stays buttery:
 *
 *  • reposition() — runs on every viewport transform write (the DCViewport
 *    subscriber feed, fired synchronously inside its own `apply()`), so pins move
 *    in the SAME frame as the canvas. Pure math from each pin's cached world-space
 *    coords — no `getBoundingClientRect`, no layout — so it's frame-locked and
 *    cheap even during a fast pan.
 *  • resolve() — the layout-reading 5-layer cascade that (re)finds each anchor and
 *    backs out its world coords + anchor-lost flag. Throttled (~100ms) and skipped
 *    while interacting; the transform feed keeps positions live in the meantime.
 *
 * Positions are written straight to each wrapper's `transform` (no per-frame React
 * render); only anchor-lost *flips* trigger a re-render. Each wrapper also hosts
 * that pin's popover (`renderPopover`), so the open thread rides along for free.
 */
export function PinLayer({
  pins,
  openId,
  onOpen,
  renderPopover,
}: {
  pins: PinView[];
  openId: string | null;
  onOpen: (id: string | null) => void;
  renderPopover: (pin: PinView, lost: boolean) => ReactNode;
}) {
  const wrapRefs = useRef(new Map<string, HTMLDivElement>());
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const lostRef = useRef(new Map<string, boolean>());
  // Per-pin cache: the anchor's position in the UNTRANSFORMED world layer (lx,ly)
  // + flags. resolve() refreshes it (slow); reposition() reads it (every frame).
  const worldRef = useRef(new Map<string, { lx: number; ly: number; visible: boolean; lost: boolean }>());
  const [, forceLostTick] = useState(0);

  useEffect(() => {
    const vpEl = document.querySelector('[data-dc-viewport]') as
      | (HTMLElement & {
          __dcViewport?: {
            subscribe: (fn: (tf: { x: number; y: number; scale: number }) => void) => () => void;
            getTransform: () => { x: number; y: number; scale: number };
          };
        })
      | null;
    const api = vpEl?.__dcViewport ?? null;
    // The viewport's screen origin only shifts on window resize/scroll (never
    // during a pan — the world layer moves inside it), so cache it.
    let vpRect = vpEl?.getBoundingClientRect() ?? null;

    // Place every pin from its cached world coords through the live transform.
    // The world layer is `translate(tf.x,tf.y) scale(tf.scale)` at origin 0,0, so
    // a world point (lx,ly) lands at screen (vpLeft + tf.x + lx*scale, …). No
    // layout reads → safe to run on every transform tick.
    const reposition = (tf: { x: number; y: number; scale: number }) => {
      if (!vpRect) return;
      for (const pin of pinsRef.current) {
        const wrap = wrapRefs.current.get(pin.id);
        if (!wrap) continue;
        const w = worldRef.current.get(pin.id);
        if (!w || !w.visible) {
          wrap.style.display = 'none';
          continue;
        }
        const sx = vpRect.left + tf.x + w.lx * tf.scale;
        const sy = vpRect.top + tf.y + w.ly * tf.scale;
        wrap.style.display = 'block';
        wrap.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
      }
    };

    // Run the 5-layer cascade to (re)find each anchor, then back out its world
    // coords for reposition(). Catches content reflow / anchor loss.
    const resolve = () => {
      const tf = api ? api.getTransform() : { x: 0, y: 0, scale: 1 };
      let flipped = false;
      for (const pin of pinsRef.current) {
        const pos = resolvePinScreen(pin);
        if (!pos.visible) {
          worldRef.current.set(pin.id, { lx: 0, ly: 0, visible: false, lost: false });
          continue;
        }
        const lx = vpRect ? (pos.x - vpRect.left - tf.x) / tf.scale : 0;
        const ly = vpRect ? (pos.y - vpRect.top - tf.y) / tf.scale : 0;
        worldRef.current.set(pin.id, { lx, ly, visible: true, lost: pos.lost });
        if (lostRef.current.get(pin.id) !== pos.lost) {
          lostRef.current.set(pin.id, pos.lost);
          flipped = true;
        }
      }
      reposition(tf);
      if (flipped) forceLostTick((v) => v + 1);
    };

    resolve(); // seed world coords before the transform feed starts
    const unsub = api ? api.subscribe(reposition) : null;

    // Slow re-resolve to catch content reflow. Skipped while panning/zooming —
    // the subscriber keeps positions live, so there's no need to thrash layout.
    // ~100ms is already ~6× less work than the old every-frame resolve.
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      if (!document.querySelector('[data-dc-interacting]') && now - last > 100) {
        last = now;
        resolve();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const refresh = () => {
      vpRect = vpEl?.getBoundingClientRect() ?? null;
      resolve();
    };
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);

    return () => {
      unsub?.();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, []);

  return (
    <>
      {pins.map((pin) => {
        const lost = lostRef.current.get(pin.id) ?? false;
        const open = openId === pin.id;
        const color = lost ? COLORS.lost : COLORS[pin.kind];
        return (
          <div
            key={pin.id}
            ref={(el) => {
              if (el) wrapRefs.current.set(pin.id, el);
              else wrapRefs.current.delete(pin.id);
            }}
            data-cl-pin
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              display: 'none', // shown by the loop once positioned
              pointerEvents: 'none',
              // Open pin rides ABOVE the comments rail (z 2000) + ModeBar (2001)
              // so its popover is never clipped by the rail; closed pins stay low.
              zIndex: open ? 2200 : 1500,
            }}
          >
            {/* Badge — tip points at the pin coordinate (bottom-left corner). */}
            <button
              type="button"
              data-cl-pin-badge
              onClick={(e) => {
                e.stopPropagation();
                if (pin.kind !== 'draft') onOpen(open ? null : pin.id);
              }}
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: 26,
                height: 26,
                padding: 0,
                border: open ? '2px solid #fff' : '2px solid rgba(255,255,255,0.9)',
                borderRadius: '13px 13px 13px 2px',
                background: color,
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                lineHeight: 1,
                cursor: pin.kind === 'draft' ? 'default' : 'pointer',
                pointerEvents: 'auto',
                boxShadow: open
                  ? '0 0 0 3px rgba(154,166,187,0.45), 0 2px 8px rgba(0,0,0,0.25)'
                  : '0 1px 4px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'system-ui, sans-serif',
              }}
              title={lost ? 'Anchor lost — element no longer found' : undefined}
            >
              {lost ? '!' : pin.kind === 'draft' ? '•' : (pin.index ?? '')}
            </button>

            {open && (
              <div style={{ position: 'absolute', left: 34, bottom: 0, pointerEvents: 'auto' }}>
                {renderPopover(pin, lost)}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
