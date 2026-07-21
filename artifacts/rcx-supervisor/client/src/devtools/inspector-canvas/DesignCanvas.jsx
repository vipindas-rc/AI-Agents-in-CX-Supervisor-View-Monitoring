// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboard labels select-on-click (with a copy-share-link popover; deeplink
// back via `?artboard=<id>`), rename on double-click; section titles are
// inline-editable; any artboard can open in a fullscreen focus overlay
// (←/→/Esc).
// No assets, no deps beyond React + ReactDOM.
//
// PERSISTENCE: this build has no persistence layer — renames and reorders
// live for the current session only. To persist across reloads, plug a
// writer into the `state.sections` effect inside DesignCanvas (localStorage,
// fetch, or any host bridge).
//
// HEAVY CONTENT: artboards expose an `active` flag via the `useArtboardActive`
// hook — `false` when the artboard is offscreen or zoomed below
// `minActiveScale` (default 0.35). Heavy children (videos, canvases, iframes,
// continuous animations) should gate on it so the canvas doesn't burn CPU
// painting things the user can't see. Outside a DesignCanvas the hook returns
// `true`, so the same component still works in fullscreen prototypes.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

import React from 'react';
import { createPortal } from 'react-dom';
import { Inspector } from './Inspector';
import { CommentLayer } from './CommentLayer';
import { ModeBar } from './ModeBar';

const DC = {
  bg: '#18191b',
  grid: 'rgba(255,255,255,0.55)',
  label: 'rgba(233,234,237,0.6)',
  title: 'rgba(240,241,244,0.92)',
  subtitle: 'rgba(233,234,237,0.5)',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = [
    '.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}',
    '.dc-editable:focus{background:rgba(255,255,255,.1);color:#fff;box-shadow:0 0 0 1.5px #9aa6bb}',
    '.dc-card{transition:box-shadow .15s,transform .15s}',
    '.dc-card *{scrollbar-width:none}',
    '.dc-card *::-webkit-scrollbar{display:none}',
    '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px}',
    '.dc-labeltext{cursor:pointer;border-radius:4px;padding:3px 6px;display:flex;align-items:center;transition:background .12s}',
    '.dc-labeltext:hover{background:rgba(255,255,255,.08)}',
    '.dc-labeltext.dc-selected{background:rgba(154,166,187,.12)}',
    '.dc-share-pop{position:absolute;bottom:100%;left:-4px;margin-bottom:32px;z-index:5;display:flex;align-items:center;',
    '  background:#2a251f;color:#f5f1e8;border-radius:7px;padding:5px 6px;gap:2px;',
    '  box-shadow:0 6px 24px rgba(0,0,0,.28);white-space:nowrap}',
    '.dc-share-pop button{display:flex;align-items:center;gap:6px;border:none;background:transparent;color:inherit;',
    '  cursor:pointer;font:500 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;padding:5px 8px;border-radius:5px;transition:background .12s}',
    '.dc-share-pop button:hover{background:rgba(255,255,255,.12)}',
    '.dc-expand{position:absolute;bottom:100%;right:0;margin-bottom:5px;z-index:2;opacity:0;transition:opacity .12s,background .12s;',
    '  width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;',
    '  background:transparent;color:rgba(233,234,237,.55);display:flex;align-items:center;justify-content:center}',
    '.dc-expand:hover{background:rgba(255,255,255,.08);color:#fff}',
    '[data-dc-slot]:hover .dc-expand{opacity:1}',
  ].join('\n');
  document.head.appendChild(s);
}

const DCCtx = React.createContext(null);

// Viewport ctx — lets artboards subscribe to pan/zoom transform updates so they
// can self-deactivate when offscreen or zoomed too small. Default null means
// "no viewport in the tree" (e.g. tests, focus overlay) and consumers should
// treat their artboard as active.
const DCViewportCtx = React.createContext(null);

// Artboard active flag — read by heavy content (videos, canvases) to pause
// work when its artboard isn't worth painting. Defaults to true so anything
// rendered outside a DesignCanvas behaves normally.
const DCArtboardActiveCtx = React.createContext(true);
export const useArtboardActive = () => React.useContext(DCArtboardActiveCtx);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, focused
// artboard). All state is ephemeral in this build — see header comment
// for how to wire up persistence.
// ─────────────────────────────────────────────────────────────
export function DesignCanvas({ children, minScale, maxScale, minActiveScale, style, inspector = false, comments = false }) {
  const [state, setState] = React.useState({ sections: {}, focus: null, selected: null });

  // Shared canvas interaction mode ('cursor' | 'comment' | 'dev'), surfaced by
  // the bottom-left ModeBar and consumed by the Inspector + CommentLayer so each
  // derives its active state from one source of truth.
  const [mode, setMode] = React.useState('cursor');

  // Unread (unresolved) comment count, reported up by the CommentLayer so the
  // ModeBar's Comment tab can show a blue dot while you're in cursor/dev mode.
  const [commentUnread, setCommentUnread] = React.useState(0);

  // ── Pages ──────────────────────────────────────────────────────
  // Figma-style pages: direct `<DCPage>` children each hold their own
  // sections; only the active page renders. A canvas with no DCPage children
  // is unpaged and behaves exactly as before (one implicit page).
  const pages = [];
  React.Children.forEach(children, (p) => {
    if (!p || p.type !== DCPage) return;
    const pid = p.props.id ?? p.props.title;
    if (!pid) return;
    pages.push({ id: pid, title: p.props.title ?? pid, children: p.props.children });
  });
  const paged = pages.length > 0;

  // Active page id. Init from the `?page=` URL param if it names a real page,
  // else the first page. Unpaged canvases ignore this entirely.
  const [activePageId, setActivePageId] = React.useState(() => {
    if (!paged) return null;
    const ids = pages.map((p) => p.id);
    let fromUrl = null;
    if (typeof window !== 'undefined') {
      fromUrl = new URLSearchParams(window.location.search).get('page');
    }
    return fromUrl && ids.includes(fromUrl) ? fromUrl : pages[0].id;
  });
  // If the page set changes (HMR/edit) and the active id no longer exists,
  // fall back to the first page so we never render a dead page.
  React.useEffect(() => {
    if (paged && !pages.some((p) => p.id === activePageId)) {
      setActivePageId(pages[0].id);
    }
  }, [paged, pages.map((p) => p.id).join('|'), activePageId]);

  const switchPage = React.useCallback((id) => {
    setActivePageId(id);
    setState((s) => ({ ...s, focus: null })); // focus targets are page-scoped
    if (typeof window !== 'undefined' && window.history) {
      const url = new URL(window.location.href);
      url.searchParams.set('page', id);
      window.history.replaceState(null, '', url);
    }
  }, []);

  const activePage = paged ? (pages.find((p) => p.id === activePageId) || pages[0]) : null;
  // Everything below (registry, viewport, focus) operates on the visible
  // page's children so focus navigation stays scoped to one page.
  const activeChildren = paged ? activePage.children : children;

  // Comments are scoped to the whole canvas (one CommentLayer instance, one
  // fetch of every page) — NOT remounted per page. The sidebar lists comments
  // from all pages; the active page + a page switcher are passed down so pins
  // render only for the visible page and a row-click can jump to another page.
  // (This single canvas-wide subscription is also the seam realtime plugs into —
  // see CommentLayer/REALTIME.md.)
  const hasComments = !!(comments && comments.canvasId);
  const pageList = React.useMemo(
    () => (paged ? pages.map((p) => ({ id: p.id, title: p.title })) : undefined),
    [paged, pages],
  );

  // Build registries synchronously from the active page's children so
  // FocusOverlay can read them in the same render. Only direct
  // DCSection > DCArtboard children are walked — wrapping them in other
  // elements opts out of focus/reorder.
  const registry = {};     // slotId -> { sectionId, artboard }
  const sectionMeta = {};  // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(activeChildren, (sec) => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const srcIds = [];
    React.Children.forEach(sec.props.children, (ab) => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (!aid) return;
      registry[`${sid}/${aid}`] = { sectionId: sid, artboard: ab };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter((k) => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter((k) => !kept.includes(k))],
    };
  });

  const api = React.useMemo(() => ({
    state,
    section: (id) => state.sections[id] || {},
    patchSection: (id, p) => setState((s) => ({
      ...s,
      sections: { ...s.sections, [id]: { ...s.sections[id], ...(typeof p === 'function' ? p(s.sections[id] || {}) : p) } },
    })),
    setFocus: (slotId) => setState((s) => ({ ...s, focus: slotId })),
    setSelected: (slotId) => setState((s) => (s.selected === slotId ? s : { ...s, selected: slotId })),
    activePageId,
  }), [state, activePageId]);

  // Esc exits focus + clears the selection; any outside pointerdown commits an
  // in-progress rename and deselects (the label's own click re-selects after).
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setState((s) => (s.focus || s.selected ? { ...s, focus: null, selected: null } : s));
    };
    const onPd = (e) => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
      if (!(e.target instanceof Element) || !e.target.closest('.dc-labelrow, .dc-share-pop')) {
        setState((s) => (s.selected ? { ...s, selected: null } : s));
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, []);

  // Deeplink: `?artboard=<id>` (share-link counterpart of the comments' `?pin=`).
  // `?page=` has already picked the page above; once the slot mounts, pan/zoom
  // to it and select it so the recipient sees exactly what was shared.
  const artboardDeeplinkDone = React.useRef(false);
  React.useEffect(() => {
    if (artboardDeeplinkDone.current || typeof window === 'undefined') return;
    artboardDeeplinkDone.current = true;
    const aid = new URLSearchParams(window.location.search).get('artboard');
    if (!aid) return;
    let tries = 0;
    const tick = () => {
      const el = document.querySelector(`[data-dc-slot="${CSS.escape(aid)}"]`);
      if (el) {
        panToSlot(el);
        const sec = el.closest('[data-dc-section]');
        if (sec) setState((s) => ({ ...s, selected: `${sec.getAttribute('data-dc-section')}/${aid}` }));
        return;
      }
      if (tries++ < 40) requestAnimationFrame(tick); // ~0.6s for the page to mount
    };
    requestAnimationFrame(tick);
  }, []);

  // An active page with no DCSection children shows a placeholder rather than
  // an empty grid — e.g. a page reserved for content authored later.
  const hasSections = React.Children.toArray(activeChildren).some((c) => c && c.type === DCSection);

  return (
    <DCCtx.Provider value={api}>
      <DCViewport minScale={minScale} maxScale={maxScale} minActiveScale={minActiveScale} style={style}>
        {paged && !hasSections ? <DCEmptyPage title={activePage.title} /> : activeChildren}
      </DCViewport>
      {state.focus && registry[state.focus] && (
        <DCFocusOverlay entry={registry[state.focus]} sectionMeta={sectionMeta} sectionOrder={sectionOrder} />
      )}
      {inspector && <Inspector mode={mode} setMode={setMode} />}
      {hasComments && (
        <CommentLayer
          config={comments}
          mode={mode}
          setMode={setMode}
          activePageId={paged ? activePageId : null}
          pages={pageList}
          onSwitchPage={switchPage}
          onUnreadChange={setCommentUnread}
        />
      )}
      {(inspector || hasComments) && (
        <ModeBar
          mode={mode}
          setMode={setMode}
          hasComments={hasComments}
          hasInspector={!!inspector}
          commentUnread={commentUnread}
          canvasLabel={hasComments ? comments.canvasId : undefined}
          pages={paged ? pages.map((p) => ({ id: p.id, title: p.title })) : undefined}
          activePageId={activePageId}
          setActivePage={switchPage}
        />
      )}
    </DCCtx.Provider>
  );
}

// DCPage — marker; its children (DCSections) render only while it's the active
// page. Read structurally by DesignCanvas; renders nothing itself.
export function DCPage() { return null; }

// Pan/zoom the viewport so an artboard slot fills the screen comfortably.
// Same __dcViewport handshake the CommentLayer's pin-pan uses.
function panToSlot(slotEl) {
  const vpEl = document.querySelector('[data-dc-viewport]');
  const api = vpEl && vpEl.__dcViewport;
  if (!api) return;
  const vpRect = vpEl.getBoundingClientRect();
  const tf = api.getTransform();
  const r = slotEl.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return;
  const worldW = r.width / tf.scale;
  const worldH = r.height / tf.scale;
  const worldCx = (r.left + r.width / 2 - vpRect.left - tf.x) / tf.scale;
  const worldCy = (r.top + r.height / 2 - vpRect.top - tf.y) / tf.scale;
  const scale = Math.min(2, Math.max(0.15,
    Math.min((vpRect.width - 160) / worldW, (vpRect.height - 200) / worldH)));
  api.animateTransform({
    x: vpRect.width / 2 - worldCx * scale,
    y: vpRect.height / 2 - worldCy * scale,
    scale,
  }, 320);
}

// Centered placeholder for an active page that has no sections yet.
function DCEmptyPage({ title }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: 'none',
      fontFamily: DC.font, color: DC.subtitle,
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}>
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <div style={{ fontSize: 18, fontWeight: 600, color: DC.title }}>{title}</div>
      <div style={{ fontSize: 14 }}>Nothing here yet — add artboards in code.</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({ children, minScale = 0.1, maxScale = 8, minActiveScale = 0.35, style = {} }) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({ x: 0, y: 0, scale: 1 });
  // Subscribers fire after every transform write — kept in a ref so apply()
  // stays a stable callback and wheel ticks don't go through React.
  const subsRef = React.useRef(new Set());

  const apply = React.useCallback(() => {
    const { x, y, scale } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    subsRef.current.forEach((fn) => fn(tf.current));
  }, []);

  // Imperative transform setter for external callers (e.g. the Inspector's
  // "click a scan result to bring its element into view" flow). Clamps scale
  // to the viewport's configured range and routes through apply() so the
  // subscriber set runs the same as any user-driven pan/zoom.
  const setTransform = React.useCallback((next) => {
    const t = tf.current;
    t.x = next.x;
    t.y = next.y;
    t.scale = Math.min(maxScale, Math.max(minScale, next.scale));
    apply();
  }, [apply, minScale, maxScale]);

  // Tweened version — 240ms ease-out. Cancels any in-flight tween via a
  // bumped token. Use this for "bring into view" gestures so the move reads
  // as intentional motion rather than a teleport.
  const tweenTokenRef = React.useRef(0);
  const animateTransform = React.useCallback((next, ms = 240) => {
    const start = { ...tf.current };
    const target = {
      x: next.x,
      y: next.y,
      scale: Math.min(maxScale, Math.max(minScale, next.scale)),
    };
    const token = ++tweenTokenRef.current;
    const t0 = performance.now();
    const step = (now) => {
      if (token !== tweenTokenRef.current) return; // cancelled
      const u = Math.min(1, (now - t0) / ms);
      const k = 1 - Math.pow(1 - u, 3); // ease-out cubic
      tf.current.x = start.x + (target.x - start.x) * k;
      tf.current.y = start.y + (target.y - start.y) * k;
      tf.current.scale = start.scale + (target.scale - start.scale) * k;
      apply();
      if (u < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [apply, minScale, maxScale]);

  const viewportCtx = React.useMemo(() => ({
    subscribe: (fn) => {
      subsRef.current.add(fn);
      // Fire once so subscribers can initialize with the current transform.
      fn(tf.current);
      return () => { subsRef.current.delete(fn); };
    },
    getTransform: () => tf.current,
    setTransform,
    animateTransform,
    minActiveScale,
  }), [minActiveScale, setTransform, animateTransform]);

  // Stash the viewport API on the DOM node so siblings outside the React
  // context (the Inspector portal) can find it via querySelector.
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    vp.__dcViewport = viewportCtx;
    return () => { if (vp.__dcViewport === viewportCtx) delete vp.__dcViewport; };
  }, [viewportCtx]);

  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;

    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left, py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Tag the viewport with [data-dc-interacting] whenever a pan/zoom is in
    // flight (drag, native gesture, or a recent wheel). The Inspector reads
    // this to suppress its hover-preview state updates during interaction —
    // without it, mousemoves fire ~60×/sec, each one re-renders the panel,
    // and the renders queue faster than they finish.
    const interacting = { drag: false, gesture: false };
    let wheelTimer = null;
    const syncInteractingAttr = () => {
      const active = interacting.drag || interacting.gesture || wheelTimer !== null;
      if (active) vp.setAttribute('data-dc-interacting', 'true');
      else vp.removeAttribute('data-dc-interacting');
    };
    const pulseWheelInteracting = () => {
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelTimer = null; syncInteractingAttr(); }, 150);
      syncInteractingAttr();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = (e) =>
      e.deltaMode !== 0 ||
      (e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40);

    // Opt-in escape hatch: if the wheel originates inside an element marked
    // [data-dc-allow-scroll] and that element can actually scroll in the
    // wheel's direction, let native scroll happen instead of pan/zoom. Pinch
    // (ctrlKey) and notched mouse wheel still zoom the canvas as before.
    const canNativelyScroll = (e) => {
      if (e.ctrlKey || isMouseWheel(e)) return false;
      const target = e.target;
      if (!target || !target.closest) return false;
      let el = target.closest('[data-dc-allow-scroll]');
      while (el) {
        const cs = getComputedStyle(el);
        const overY = cs.overflowY;
        const scrollableY =
          (overY === 'auto' || overY === 'scroll') &&
          el.scrollHeight > el.clientHeight;
        if (scrollableY) {
          const dy = e.deltaY;
          const atTop = el.scrollTop <= 0 && dy < 0;
          const atBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && dy > 0;
          if (!atTop && !atBottom) return true;
        }
        el = el.parentElement
          ? el.parentElement.closest('[data-dc-allow-scroll]')
          : null;
      }
      return false;
    };

    const onWheel = (e) => {
      if (canNativelyScroll(e)) return; // let the inner scrollable take it
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
      pulseWheelInteracting();
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = (e) => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
      interacting.gesture = true;
      syncInteractingAttr();
    };
    const onGestureChange = (e) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, (gsBase * e.scale) / tf.current.scale);
    };
    const onGestureEnd = (e) => {
      e.preventDefault();
      isGesturing = false;
      interacting.gesture = false;
      syncInteractingAttr();
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = (e) => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || (e.button === 0 && onBg))) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, lx: e.clientX, ly: e.clientY };
      vp.style.cursor = 'grabbing';
      interacting.drag = true;
      syncInteractingAttr();
    };
    const onPointerMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX; drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
      interacting.drag = false;
      syncInteractingAttr();
    };

    vp.addEventListener('wheel', onWheel, { passive: false });
    vp.addEventListener('gesturestart', onGestureStart, { passive: false });
    vp.addEventListener('gesturechange', onGestureChange, { passive: false });
    vp.addEventListener('gestureend', onGestureEnd, { passive: false });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
      if (wheelTimer) { clearTimeout(wheelTimer); wheelTimer = null; }
      vp.removeAttribute('data-dc-interacting');
    };
  }, [apply, minScale, maxScale]);

  const gridSvg = `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M37 40h6M40 37v6' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='0.75'/%3E%3C/svg%3E")`;
  return (
    <div
      ref={vpRef}
      className="design-canvas"
      data-dc-viewport
      style={{
        height: '100vh', width: '100vw',
        background: DC.bg,
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
        position: 'relative',
        fontFamily: DC.font,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        ref={worldRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          transformOrigin: '0 0',
          willChange: 'transform',
          width: 'max-content', minWidth: '100%',
          minHeight: '100%',
          padding: '60px 0 80px',
        }}
      >
        <div style={{ position: 'absolute', inset: -6000, backgroundImage: gridSvg, backgroundSize: '80px 80px', pointerEvents: 'none', zIndex: -1 }} />
        <DCViewportCtx.Provider value={viewportCtx}>{children}</DCViewportCtx.Provider>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
export function DCSection({ id, title, subtitle, children, gap = 48 }) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter((c) => c && c.type === DCArtboard);
  const rest = all.filter((c) => !(c && c.type === DCArtboard));
  const srcOrder = artboards.map((a) => a.props.id ?? a.props.label);
  const sec = (ctx && sid && ctx.section(sid)) || {};

  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter((k) => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter((k) => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);

  const byId = Object.fromEntries(artboards.map((a) => [a.props.id ?? a.props.label, a]));

  return (
    <div data-dc-section={sid} style={{ marginBottom: 80, position: 'relative' }}>
      <div style={{ padding: '0 60px 56px' }}>
        {/* Section/row title is display-only — not user-editable. The title
            still reflects programmatic renames (ctx.patchSection), so an AI
            agent can rename a row; users just can't click/edit it inline. */}
        <div style={{ fontSize: 28, fontWeight: 600, color: DC.title, letterSpacing: -0.4, marginBottom: 6, display: 'inline-block' }}>
          {sec.title ?? title}
        </div>
        {subtitle && <div style={{ fontSize: 16, color: DC.subtitle }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', gap, padding: '0 60px', alignItems: 'flex-start', width: 'max-content' }}>
        {order.map((k) => (
          <DCArtboardFrame key={k} sectionId={sid} artboard={byId[k]}
            label={(sec.labels || {})[k] ?? byId[k].props.label}
            selected={!!ctx && ctx.state.selected === `${sid}/${k}`}
            onSelect={() => ctx && ctx.setSelected(`${sid}/${k}`)}
            activePageId={ctx ? ctx.activePageId : null}
            onRename={(v) => ctx && ctx.patchSection(sid, (x) => ({ labels: { ...x.labels, [k]: v } }))}
            onFocus={() => ctx && ctx.setFocus(`${sid}/${k}`)} />
        ))}
      </div>
      {rest}
    </div>
  );
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
export function DCArtboard() { return null; }

function DCArtboardFrame({ sectionId, artboard, label, selected, onSelect, activePageId, onRename, onFocus }) {
  const { id: rawId, label: rawLabel, width = 260, height = 480, children, style = {} } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);

  // DCPostIt notes tether to the OUTSIDE of the frame — hoist them out of the
  // clipped (overflow:hidden) card and render them as frame siblings.
  const kids = React.Children.toArray(children);
  const noteKids = kids.filter((c) => React.isValidElement(c) && c.type === DCPostIt);
  const contentKids = kids.filter((c) => !(React.isValidElement(c) && c.type === DCPostIt));

  // Pause heavy content (videos etc.) when this artboard is offscreen or zoomed
  // out beyond minActiveScale. Recomputes on every transform tick + window
  // resize, but only re-renders when the boolean flips.
  const viewport = React.useContext(DCViewportCtx);
  const [active, setActive] = React.useState(true);
  React.useEffect(() => {
    if (!viewport) return;
    let last = true;
    const check = (t) => {
      const el = ref.current;
      if (!el) return;
      const tooSmall = t.scale < viewport.minActiveScale;
      // 400px margin so artboards re-mount slightly before they scroll in,
      // hiding the mount-time flash of any heavy content.
      const r = el.getBoundingClientRect();
      const m = 400;
      const inView =
        r.right > -m && r.left < window.innerWidth + m &&
        r.bottom > -m && r.top < window.innerHeight + m;
      const next = inView && !tooSmall;
      if (next !== last) { last = next; setActive(next); }
    };
    const unsub = viewport.subscribe(check);
    const onResize = () => check(viewport.getTransform());
    window.addEventListener('resize', onResize);
    return () => { unsub(); window.removeEventListener('resize', onResize); };
  }, [viewport]);

  // Single click on the label selects the artboard (ring + share popover);
  // double click renames; the hover expand button still opens focus mode.
  const [editing, setEditing] = React.useState(false);
  const labelRef = React.useRef(null);
  const startRename = () => {
    setEditing(true);
    requestAnimationFrame(() => {
      const el = labelRef.current;
      if (!el) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
  };
  const commitRename = () => {
    setEditing(false);
    if (labelRef.current) onRename(labelRef.current.textContent);
  };

  // Share link: current URL with `?artboard=<id>` (+ the active page when
  // paged), minus any `?pin=` — the artboard twin of a comment permalink.
  const [copied, setCopied] = React.useState(false);
  const copyShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('pin');
    if (activePageId) url.searchParams.set('page', activePageId);
    url.searchParams.set('artboard', id);
    navigator.clipboard?.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  React.useEffect(() => { if (!selected) setCopied(false); }, [selected]);

  return (
    <div ref={ref} data-dc-slot={id} style={{ position: 'relative', flexShrink: 0 }}>
      <div className="dc-labelrow" style={{ position: 'absolute', bottom: '100%', left: -4, marginBottom: 4, color: DC.label }}>
        <div className={`dc-labeltext${selected ? ' dc-selected' : ''}`}
          onClick={() => !editing && onSelect()} onDoubleClick={startRename}
          title={editing ? undefined : 'Click to select · double-click to rename'}>
          <span ref={labelRef} className="dc-editable" contentEditable={editing} suppressContentEditableWarning
            onPointerDown={(e) => { if (editing) e.stopPropagation(); }}
            onBlur={() => editing && commitRename()}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
            style={{ fontSize: 15, fontWeight: 500, color: selected ? '#9aa6bb' : DC.label, lineHeight: 1, cursor: editing ? 'text' : 'pointer' }}>
            {label}
          </span>
        </div>
      </div>
      {selected && (
        <div className="dc-share-pop" onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={copyShareLink}>
            {copied ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#7ed3a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.5L4.8 9.2 10 3.5"/></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M5 7a2.4 2.4 0 0 0 3.4.2l1.8-1.8a2.4 2.4 0 0 0-3.4-3.4l-1 1"/><path d="M7 5a2.4 2.4 0 0 0-3.4-.2L1.8 6.6A2.4 2.4 0 0 0 5.2 10l1-1"/></svg>
            )}
            {copied ? 'Link copied' : 'Copy link to artboard'}
          </button>
        </div>
      )}
      <button className="dc-expand" onClick={onFocus} onPointerDown={(e) => e.stopPropagation()} title="Focus">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"/></svg>
      </button>
      <div className="dc-card"
        style={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)', overflow: 'hidden', width, height, background: '#fff', ...style,
          ...(selected ? { outline: '2px solid #9aa6bb', outlineOffset: 2 } : null) }}>
        <DCArtboardActiveCtx.Provider value={active}>
          {contentKids.length > 0 ? contentKids : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13, fontFamily: DC.font }}>{id}</div>}
        </DCArtboardActiveCtx.Provider>
      </div>
      {noteKids}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({ entry, sectionMeta, sectionOrder }) {
  const ctx = React.useContext(DCCtx);
  const { sectionId, artboard } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);

  const go = (d) => { const n = peers[(idx + d + peers.length) % peers.length]; if (n) ctx.setFocus(`${sectionId}/${n}`); };
  const goSection = (d) => {
    const ns = sectionOrder[(secIdx + d + sectionOrder.length) % sectionOrder.length];
    const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
    if (first) ctx.setFocus(`${ns}/${first}`);
  };

  React.useEffect(() => {
    const k = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); goSection(-1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); goSection(1); }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });

  const { width = 260, height = 480, children } = artboard.props;
  const [vp, setVp] = React.useState({ w: window.innerWidth, h: window.innerHeight });
  React.useEffect(() => { const r = () => setVp({ w: window.innerWidth, h: window.innerHeight }); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));

  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({ dir, onClick }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ position: 'absolute', top: '50%', [dir]: 28, transform: 'translateY(-50%)',
        border: 'none', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.9)',
        width: 44, height: 44, borderRadius: 22, fontSize: 18, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.18)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.08)')}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d={dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'} /></svg>
    </button>
  );

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return createPortal(
    <div onClick={() => ctx.setFocus(null)}
      onWheel={(e) => e.preventDefault()}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(24,20,16,.6)', backdropFilter: 'blur(14px)',
        fontFamily: DC.font, color: '#fff' }}>

      {/* top bar: section dropdown (left) · close (right) */}
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 72, display: 'flex', alignItems: 'flex-start', padding: '16px 20px 0', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setDd((o) => !o)}
            style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', padding: '6px 8px',
              borderRadius: 6, textAlign: 'left', fontFamily: 'inherit' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>{meta.title}</span>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ opacity: .7 }}><path d="M2 4l3.5 3.5L9 4"/></svg>
            </span>
            {meta.subtitle && <span style={{ display: 'block', fontSize: 13, opacity: .6, fontWeight: 400, marginTop: 2 }}>{meta.subtitle}</span>}
          </button>
          {ddOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#2a251f', borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,.4)', padding: 4, minWidth: 200, zIndex: 10 }}>
              {sectionOrder.map((sid) => (
                <button key={sid} onClick={() => { setDd(false); const f = sectionMeta[sid].slotIds[0]; if (f) ctx.setFocus(`${sid}/${f}`); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent', color: '#fff',
                    padding: '8px 12px', borderRadius: 5, fontSize: 14, fontWeight: sid === sectionId ? 600 : 400, fontFamily: 'inherit' }}>
                  {sectionMeta[sid].title}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => ctx.setFocus(null)}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,.7)', width: 32, height: 32,
            borderRadius: 16, fontSize: 20, cursor: 'pointer', lineHeight: 1, transition: 'background .12s' }}>×</button>
      </div>

      {/* card centered, label + index below — only the card itself stops
          propagation so any backdrop click (including the margins around
          the card) exits focus */}
      <div
        style={{ position: 'absolute', top: 64, bottom: 56, left: 100, right: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: width * scale, height: height * scale, position: 'relative' }}>
          <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', background: '#fff', borderRadius: 2, overflow: 'hidden',
            boxShadow: '0 20px 80px rgba(0,0,0,.4)' }}>
            {children || <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}>{aid}</div>}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ fontSize: 14, fontWeight: 500, opacity: .85, textAlign: 'center' }}>
          {(sec.labels || {})[aid] ?? artboard.props.label}
          <span style={{ opacity: .5, marginLeft: 10, fontVariantNumeric: 'tabular-nums' }}>{idx + 1} / {peers.length}</span>
        </div>
      </div>

      <Arrow dir="left" onClick={() => go(-1)} />
      <Arrow dir="right" onClick={() => go(1)} />

      {/* dots */}
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {peers.map((p, i) => (
          <button key={p} onClick={() => ctx.setFocus(`${sectionId}/${p}`)}
            style={{ border: 'none', padding: 0, cursor: 'pointer', width: 6, height: 6, borderRadius: 3,
              background: i === idx ? '#fff' : 'rgba(255,255,255,.3)' }} />
        ))}
      </div>
    </div>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────
// Note — annotation card tethered OUTSIDE an artboard frame by a short
// connector line + edge dot (Figma-comment style), styled as canvas chrome.
// Place as a child of DCArtboard: the frame hoists it out of the clipped
// card and anchors it to the chosen edge. (Replaces the old yellow post-it.)
// ─────────────────────────────────────────────────────────────
const DC_NOTE_DOT = {
  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
  background: 'rgba(233,234,237,0.45)',
};

export function DCPostIt({ children, side = 'right', top = 24, width = 230, gap = 28 }) {
  const connector = (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: 15 }}>
      {side === 'right' && <span style={{ ...DC_NOTE_DOT, marginLeft: -3 }} />}
      <span style={{ width: gap, height: 1, background: 'rgba(233,234,237,0.28)' }} />
      {side === 'left' && <span style={{ ...DC_NOTE_DOT, marginRight: -3 }} />}
    </div>
  );
  const card = (
    <div style={{
      width,
      background: '#202226',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 8,
      padding: '10px 13px 11px',
      fontFamily: DC.font,
      fontSize: 12.5, lineHeight: 1.55,
      color: 'rgba(233,234,237,0.78)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
    }}>
      <div style={{
        fontSize: 9, fontWeight: 600, letterSpacing: 1.3, textTransform: 'uppercase',
        color: 'rgba(233,234,237,0.38)', marginBottom: 5,
      }}>
        Note
      </div>
      {children}
    </div>
  );
  return (
    <div style={{
      position: 'absolute', top, zIndex: 5, display: 'flex', alignItems: 'flex-start',
      ...(side === 'right' ? { left: '100%' } : { right: '100%' }),
    }}>
      {side === 'right' ? connector : card}
      {side === 'right' ? card : connector}
    </div>
  );
}
