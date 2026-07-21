import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/**
 * The canvas interaction mode. One bar, mutually-exclusive modes:
 *   • cursor  — normal pointer; play with the live prototypes, pan/zoom freely
 *   • comment — drop pins + open the comments sidebar
 *   • dev     — click-to-inspect + the inspector panel
 *
 * Owned by DesignCanvas and threaded into the Inspector / CommentLayer so each
 * derives its `enabled` state from the shared mode rather than its own toggle.
 */
export type CanvasMode = 'cursor' | 'comment' | 'dev';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

const ACCENT = 'linear-gradient(135deg,#cbd2de 0%,#868fa0 100%)';

function Seg({
  active,
  disabled,
  title,
  onClick,
  icon,
  label,
  badge,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick?: () => void;
  icon: ReactNode;
  label: string;
  /** Show a blue unread dot on the icon. */
  badge?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        border: 'none',
        borderRadius: 8,
        padding: '7px 11px',
        font: `600 12.5px ${FONT}`,
        cursor: disabled ? 'default' : 'pointer',
        color: active ? '#16181b' : disabled ? 'rgba(245,241,232,0.4)' : 'rgba(245,241,232,0.82)',
        background: active ? ACCENT : 'transparent',
        opacity: disabled ? 0.7 : 1,
        transition: 'background 120ms ease, color 120ms ease',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ display: 'flex', flexShrink: 0, position: 'relative' }}>
        {icon}
        {badge && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -4,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#9aa6bb',
              boxShadow: '0 0 0 1.5px #18191b',
            }}
          />
        )}
      </span>
      {label}
    </button>
  );
}

const Divider = () => (
  <span
    style={{
      width: 1,
      alignSelf: 'stretch',
      margin: '5px 3px',
      background: 'rgba(255,255,255,0.1)',
      flexShrink: 0,
    }}
  />
);

const ICON = {
  page: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="1.5" width="10" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  cursor: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2.5 1.8l8.3 4-3.4 1.1-1.1 3.4-3.8-8.5z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  comment: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2 3.2A1.2 1.2 0 0 1 3.2 2h7.6A1.2 1.2 0 0 1 12 3.2v5A1.2 1.2 0 0 1 10.8 9.4H6l-2.8 2.3V9.4H3.2A1.2 1.2 0 0 1 2 8.2v-5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  ),
  dev: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M6 1v3M6 8v3M1 6h3M8 6h3M6 6l5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export interface CanvasPage {
  id: string;
  title: string;
}

// Minimal shape of the imperative API DCViewport stashes on its DOM node.
type ViewportApi = {
  subscribe: (fn: (t: { x: number; y: number; scale: number }) => void) => () => void;
  getTransform: () => { x: number; y: number; scale: number };
  animateTransform: (next: { x: number; y: number; scale: number }, ms?: number) => void;
};

// Preset zoom levels (descending — the menu opens upward, so 100% sits on top).
const ZOOM_PRESETS = [1, 0.5, 0.25];

/**
 * Live zoom readout + preset jump menu. Subscribes to the DCViewport transform
 * feed so the percentage tracks every pan/zoom to the nearest 1%; the dropdown
 * snaps to a preset, zooming about the viewport center and letting the viewport
 * clamp to its own min/max scale.
 */
function ZoomControl() {
  const [open, setOpen] = useState(false);
  const [pct, setPct] = useState(100);
  const ref = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ViewportApi | null>(null);

  // Locate the viewport API (set in a post-mount effect, so retry briefly) and
  // subscribe for live scale updates.
  useEffect(() => {
    let unsub: (() => void) | null = null;
    let tries = 0;
    let raf = 0;
    const attach = () => {
      const vp = document.querySelector('[data-dc-viewport]') as (HTMLElement & { __dcViewport?: ViewportApi }) | null;
      const api = vp?.__dcViewport ?? null;
      if (api) {
        apiRef.current = api;
        unsub = api.subscribe((t) => setPct(Math.round(t.scale * 100)));
        return;
      }
      if (tries++ < 60) raf = requestAnimationFrame(attach);
    };
    attach();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const zoomTo = (scale: number) => {
    const api = apiRef.current;
    const vp = document.querySelector('[data-dc-viewport]') as HTMLElement | null;
    if (!api || !vp) return;
    const r = vp.getBoundingClientRect();
    const cx = r.width / 2;
    const cy = r.height / 2;
    const t = api.getTransform();
    const k = scale / t.scale;
    // Keep the world point at the viewport center fixed (matches wheel-zoom math).
    api.animateTransform({ x: cx - (cx - t.x) * k, y: cy - (cy - t.y) * k, scale }, 200);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Zoom"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          border: 'none',
          borderRadius: 8,
          padding: '7px 9px 7px 11px',
          font: `600 12.5px ${FONT}`,
          cursor: 'pointer',
          color: 'rgba(245,241,232,0.82)',
          background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
          transition: 'background 120ms ease, color 120ms ease',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
          minWidth: 56,
          justifyContent: 'space-between',
        }}
      >
        <span>{pct}%</span>
        <svg width="9" height="9" viewBox="0 0 11 11" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" style={{ opacity: 0.6 }}>
          <path d={open ? 'M2 7l3.5-3.5L9 7' : 'M2 4l3.5 3.5L9 4'} />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: 8,
            background: '#2a251f',
            borderRadius: 10,
            boxShadow: '0 10px 32px rgba(0,0,0,0.4)',
            padding: 4,
            minWidth: 120,
            zIndex: 10,
          }}
        >
          {ZOOM_PRESETS.map((z) => {
            const zp = Math.round(z * 100);
            const isActive = zp === pct;
            return (
              <button
                key={z}
                type="button"
                onClick={() => zoomTo(z)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: '#fff',
                  padding: '8px 10px',
                  borderRadius: 6,
                  font: `${isActive ? 600 : 400} 13px ${FONT}`,
                  fontVariantNumeric: 'tabular-nums',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {zp}%
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Page chip + switcher. Inert chip when the canvas has ≤1 page; a clickable
 * dropdown (switch-only) once there are multiple `<DCPage>`s.
 */
function PageSwitcher({
  pages,
  activePageId,
  setActivePage,
  fallbackName,
}: {
  pages?: CanvasPage[];
  activePageId?: string | null;
  setActivePage?: (id: string) => void;
  fallbackName: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const multi = !!(pages && pages.length > 1);
  const active = pages?.find((p) => p.id === activePageId);
  const label = active ? active.title : fallbackName;

  // Close on outside-click / Esc while open.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex' }}>
      <button
        type="button"
        disabled={!multi}
        onClick={() => multi && setOpen((o) => !o)}
        title={multi ? 'Switch page' : `Page · ${label}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          border: 'none',
          borderRadius: 8,
          padding: '7px 11px',
          font: `600 12.5px ${FONT}`,
          cursor: multi ? 'pointer' : 'default',
          color: multi ? 'rgba(245,241,232,0.82)' : 'rgba(245,241,232,0.5)',
          background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
          transition: 'background 120ms ease, color 120ms ease',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ display: 'flex', flexShrink: 0 }}>{ICON.page}</span>
        {label}
        {multi && (
          <svg width="9" height="9" viewBox="0 0 11 11" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" style={{ opacity: 0.6, marginLeft: -1 }}>
            <path d={open ? 'M2 7l3.5-3.5L9 7' : 'M2 4l3.5 3.5L9 4'} />
          </svg>
        )}
      </button>
      {open && multi && pages && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: 8,
            background: '#2a251f',
            borderRadius: 10,
            boxShadow: '0 10px 32px rgba(0,0,0,0.4)',
            padding: 4,
            minWidth: 180,
            zIndex: 10,
          }}
        >
          {pages.map((p) => {
            const isActive = p.id === activePageId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => { setActivePage?.(p.id); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: '#fff',
                  padding: '8px 10px',
                  borderRadius: 6,
                  font: `${isActive ? 600 : 400} 13px ${FONT}`,
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ display: 'flex', flexShrink: 0, opacity: isActive ? 1 : 0.6 }}>{ICON.page}</span>
                {p.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Bottom-left mode switcher. Always shows the page chip + cursor mode; comment
 * and dev segments appear only when their capability is enabled on the canvas.
 */
export function ModeBar({
  mode,
  setMode,
  hasComments,
  hasInspector,
  commentUnread = 0,
  canvasLabel,
  pages,
  activePageId,
  setActivePage,
}: {
  mode: CanvasMode;
  setMode: (m: CanvasMode) => void;
  hasComments?: boolean;
  hasInspector?: boolean;
  /** Unread comment count — shows a dot on the Comment tab when > 0 off-mode. */
  commentUnread?: number;
  canvasLabel?: string;
  pages?: CanvasPage[];
  activePageId?: string | null;
  setActivePage?: (id: string) => void;
}) {
  // Short, human-ish page name from a `ns:project:page` canvasId — used as the
  // chip label for unpaged canvases.
  const pageName = canvasLabel ? canvasLabel.split(':').pop() || 'Canvas' : 'Canvas';

  const shell: CSSProperties = {
    position: 'fixed',
    left: 16,
    bottom: 16,
    zIndex: 2001,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: 4,
    background: '#18191b',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    boxShadow: '0 6px 22px rgba(0,0,0,0.32)',
    fontFamily: FONT,
  };

  return (
    <div data-dc-modebar style={shell} onPointerDown={(e) => e.stopPropagation()}>
      <ZoomControl />
      <Divider />
      <PageSwitcher
        pages={pages}
        activePageId={activePageId}
        setActivePage={setActivePage}
        fallbackName={pageName}
      />
      <Divider />
      <Seg
        title="Cursor — interact with the prototypes, pan & zoom"
        active={mode === 'cursor'}
        onClick={() => setMode('cursor')}
        icon={ICON.cursor}
        label="Cursor"
      />
      {hasComments && (
        <Seg
          title="Comment — drop pins and open the comments sidebar"
          active={mode === 'comment'}
          onClick={() => setMode('comment')}
          icon={ICON.comment}
          label="Comment"
          badge={commentUnread > 0 && mode !== 'comment'}
        />
      )}
      {hasInspector && (
        <Seg
          title="Dev — inspect components, tokens & accessibility"
          active={mode === 'dev'}
          onClick={() => setMode('dev')}
          icon={ICON.dev}
          label="Dev"
        />
      )}
    </div>
  );
}
