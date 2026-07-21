import { useEffect, useRef, useState } from 'react';
import { panToThread, resolveThreadEl } from './pan';
import { Avatar, FONT, relativeTime } from './ui';
import { stripMentions } from './mentions';
import { isThreadUnread, type Comment, type Me, type Thread as ThreadModel } from './types';

const PANEL_W = 320;
const PANEL_GAP = 16;
const DARK = '#18191b';

/** A readable location chip from a `${sectionId}/${artboardId}` slot. */
function locationLabel(artboardId: string): string {
  const part = artboardId.includes('/') ? artboardId.slice(artboardId.indexOf('/') + 1) : artboardId;
  return part.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Up to two distinct participants (root author first), for the avatar stack. */
function participants(thread: ThreadModel): Comment['author'][] {
  const seen = new Set<string>();
  const out: Comment['author'][] = [];
  for (const c of [thread.root, ...thread.replies]) {
    const id = c.author?.id ?? 'anon';
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(c.author);
    if (out.length === 2) break;
  }
  return out;
}

export function CommentsSidebar({
  threads,
  reads,
  me,
  activePageId = null,
  pages,
  onSwitchPage,
  canWrite: canWriteProp,
  signedOut,
  needsAuth,
  previewReadOnly,
  onSignIn,
  onSignOut,
  openId,
  busy,
  showResolved,
  onSetShowResolved,
  onMarkUnread,
  onOpen,
  onResolve,
  onUnresolve,
  onClose,
}: {
  threads: ThreadModel[];
  /** Per-thread last-read map for the current user (rootId → ISO). */
  reads: Record<string, string>;
  me: Me | null;
  /** Host-gated write permission (read-only on dev/preview). Defaults to me.canWrite. */
  canWrite?: boolean;
  /** Active page; threads on other pages still list but need a page switch to pan. */
  activePageId?: string | null;
  pages?: { id: string; title: string }[];
  onSwitchPage?: (id: string) => void;
  /** Network mode, no session at all — offer Sign in. */
  signedOut?: boolean;
  /** Network mode, signed-out OR signed-in-but-read-only (non-RC). */
  needsAuth?: boolean;
  /** Posting is off because this is a dev/preview/localhost host, not a real deploy. */
  previewReadOnly?: boolean;
  onSignIn?: () => void;
  onSignOut?: () => void;
  openId: string | null;
  busy?: boolean;
  showResolved: boolean;
  onSetShowResolved: (v: boolean) => void;
  /** Mark a thread unread without opening it (personal read state). */
  onMarkUnread?: (id: string) => void;
  onOpen: (id: string | null) => void;
  onResolve: (id: string) => void;
  onUnresolve: (id: string) => void;
  onClose: () => void;
}) {
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const canWrite = canWriteProp ?? !!me?.canWrite;
  // Which row's "⋯" menu is open (read/unread toggle). One at a time.
  const [menuId, setMenuId] = useState<string | null>(null);
  useEffect(() => {
    if (!menuId) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement | null)?.closest('[data-cl-rowmenu]')) setMenuId(null);
    };
    document.addEventListener('mousedown', close, true);
    return () => document.removeEventListener('mousedown', close, true);
  }, [menuId]);
  const paged = !!pages && pages.length > 0;
  const pageTitle = (id: string | null) =>
    (id && pages?.find((p) => p.id === id)?.title) || id || '';

  // Visible threads + 1-based GLOBAL index (across all pages), mirroring the pin
  // numbering exactly. The list spans every page; pins only show on their own.
  // Indices are assigned oldest-first (so pin numbers never shift as comments
  // arrive), then the list is reversed so the newest thread sits at the top.
  const visible: { thread: ThreadModel; index: number }[] = [];
  let n = 0;
  for (const t of threads) {
    const resolved = !!t.root.resolvedAt;
    if (resolved && !showResolved) continue;
    visible.push({ thread: t, index: ++n });
  }
  visible.reverse();
  const resolvedCount = threads.filter((t) => t.root.resolvedAt).length;
  const unreadCount = visible.filter(({ thread }) => isThreadUnread(thread, me, reads)).length;

  // When a pin is opened from the canvas, scroll its row into view.
  useEffect(() => {
    if (!openId) return;
    rowRefs.current.get(openId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [openId]);

  const onActivePage = (t: ThreadModel) => !paged || t.root.pageId === activePageId;

  // Click a row → open the thread popover at its pin + pan there (Figma-style),
  // switching pages first if it's off-page. Shared with the `?pin=` deeplink.
  const select = (t: ThreadModel) => {
    onOpen(t.root.id);
    panToThread(t, { paged, activePageId, onSwitchPage });
  };

  return (
    <div
      data-cl-ui
      style={{
        position: 'fixed',
        top: 16,
        right: PANEL_GAP,
        bottom: 16,
        width: PANEL_W,
        zIndex: 2000,
        background: DARK,
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT,
        color: '#f5f1e8',
        overflow: 'hidden',
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
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
        <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: -0.2 }}>
          Comments
        </span>
        <span style={{ fontSize: 12, color: 'rgba(245,241,232,0.5)' }}>{visible.length}</span>
        {unreadCount > 0 && (
          <span
            title={`${unreadCount} unread`}
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#16181b',
              background: '#9aa6bb',
              borderRadius: 999,
              padding: '1px 7px',
              lineHeight: 1.5,
            }}
          >
            {unreadCount} new
          </span>
        )}
        <button
          type="button"
          aria-label="Close comments"
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            border: 'none',
            background: 'transparent',
            color: 'rgba(245,241,232,0.7)',
            fontSize: 18,
            lineHeight: 1,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {/* Auth prompt (network mode): sign in to comment, or read-only note. */}
      {needsAuth && (
        <div
          style={{
            padding: '12px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(154,166,187,0.10)',
          }}
        >
          {signedOut ? (
            <>
              <div style={{ fontSize: 12.5, color: 'rgba(245,241,232,0.8)', marginBottom: 4, lineHeight: 1.5 }}>
                Sign in to see or add comments.
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(245,241,232,0.55)', marginBottom: 8, lineHeight: 1.5 }}>
                Use your RingCentral Google account (your{' '}
                <strong style={{ color: 'rgba(245,241,232,0.8)' }}>@ringcentral.com</strong> email) —
                that's the address it checks. Personal Gmail won't work.
              </div>
              <button
                type="button"
                onClick={onSignIn}
                style={{
                  font: `600 13px ${FONT}`,
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 14px',
                  background: 'linear-gradient(135deg,#cbd2de 0%,#868fa0 100%)',
                  color: '#16181b',
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, color: 'rgba(245,241,232,0.65)', lineHeight: 1.5 }}>
                Signed in as <strong style={{ color: '#fff' }}>{me?.displayName}</strong>. Only
                @ringcentral.com accounts can comment — you have read-only access.
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(245,241,232,0.55)', marginTop: 8, lineHeight: 1.5 }}>
                Used the wrong account?{' '}
                <button
                  type="button"
                  onClick={onSignOut}
                  style={{
                    font: `600 11.5px ${FONT}`,
                    border: 'none',
                    background: 'transparent',
                    color: '#9aa6bb',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  Log out
                </button>{' '}
                and sign back in with your @ringcentral.com email.
              </div>
            </>
          )}
        </div>
      )}

      {/* Read-only on a dev/preview host: explain why there's no composer. */}
      {previewReadOnly && (
        <div
          style={{
            padding: '12px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(245,193,46,0.14)',
            borderLeft: '3px solid #F5C12E',
          }}
        >
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: '#F7CE54',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span aria-hidden>⚠</span> Comments are read-only here
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(245,241,232,0.72)', marginTop: 5, lineHeight: 1.5 }}>
            This is a dev or testing build. Comments can only be posted on a{' '}
            <strong style={{ color: 'rgba(245,241,232,0.9)' }}>published link</strong>. Open the
            published canvas to leave a comment.
          </div>
        </div>
      )}

      {/* Resolved toggle */}
      {resolvedCount > 0 && (
        <button
          type="button"
          onClick={() => onSetShowResolved(!showResolved)}
          style={{
            textAlign: 'left',
            padding: '8px 14px',
            border: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'transparent',
            color: 'rgba(245,241,232,0.7)',
            font: `600 12px ${FONT}`,
            cursor: 'pointer',
          }}
        >
          {showResolved ? '✓ Showing resolved' : `Show resolved (${resolvedCount})`}
        </button>
      )}

      {/* Comment list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
        {visible.length === 0 && (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: 'rgba(245,241,232,0.45)',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            No comments yet.
            <br />
            Click any element on the canvas to add one.
          </div>
        )}
        {visible.map(({ thread, index }) => {
          const open = openId === thread.root.id;
          const resolved = !!thread.root.resolvedAt;
          const active = onActivePage(thread);
          const lost = active && !resolveThreadEl(thread); // off-page ≠ lost
          const unread = isThreadUnread(thread, me, reads);
          const people = participants(thread);
          // Brightness encodes read state: unread = full white, read = muted.
          const authorColor = unread ? '#fff' : 'rgba(245,241,232,0.55)';
          const snippetColor = unread ? 'rgba(245,241,232,0.85)' : 'rgba(245,241,232,0.42)';
          const chipColor = unread ? 'rgba(245,241,232,0.55)' : 'rgba(245,241,232,0.38)';
          const dotColor = resolved ? '#1C8B4B' : lost ? '#C8841C' : '#9aa6bb';
          const dotTitle = resolved
            ? 'Resolved'
            : lost
              ? 'Anchor lost'
              : !active
                ? `On ${pageTitle(thread.root.pageId)}`
                : 'Open';
          return (
            <div
              key={thread.root.id}
              ref={(el) => {
                if (el) rowRefs.current.set(thread.root.id, el);
                else rowRefs.current.delete(thread.root.id);
              }}
              role="button"
              tabIndex={0}
              onClick={() => select(thread)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  select(thread);
                }
              }}
              style={{
                padding: '10px 10px 11px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                // Open = blue selection; unread (unopened) = a subtle lighter fill
                // (instead of the old blue left rail); read = transparent.
                background: open
                  ? 'rgba(154,166,187,0.22)'
                  : unread
                    ? 'rgba(245,241,232,0.06)'
                    : 'transparent',
                transition: 'background 100ms ease',
              }}
            >
              {/* Top row: avatars + resolve check */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ display: 'flex' }}>
                  {people.map((p, i) => (
                    <span key={i} style={{ marginLeft: i ? -8 : 0, boxShadow: i ? `0 0 0 2px ${open ? '#35383e' : DARK}` : 'none', borderRadius: '50%' }}>
                      <Avatar user={p} size={22} />
                    </span>
                  ))}
                </span>
                <span
                  style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: dotColor }}
                  title={dotTitle}
                />
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {/* Per-row "⋯" menu — catch-all for row actions. Today: Mark as
                      unread (personal read state), disabled when already unread. */}
                  {me && onMarkUnread && (
                    <div data-cl-rowmenu style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <button
                        type="button"
                        aria-label="More"
                        title="More"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId(menuId === thread.root.id ? null : thread.root.id);
                        }}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          border: 'none',
                          background: menuId === thread.root.id ? 'rgba(245,241,232,0.12)' : 'transparent',
                          color: 'rgba(245,241,232,0.55)',
                          cursor: 'pointer',
                          fontSize: 16,
                          lineHeight: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        ⋯
                      </button>
                      {menuId === thread.root.id && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 26,
                            right: 0,
                            zIndex: 20,
                            minWidth: 150,
                            background: '#202225',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                            padding: 4,
                          }}
                        >
                          <button
                            type="button"
                            disabled={unread}
                            title={unread ? 'Already unread' : undefined}
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuId(null);
                              if (!unread) onMarkUnread?.(thread.root.id);
                            }}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              border: 'none',
                              background: 'transparent',
                              color: unread ? 'rgba(245,241,232,0.32)' : 'rgba(245,241,232,0.85)',
                              font: `500 12.5px ${FONT}`,
                              padding: '7px 9px',
                              borderRadius: 6,
                              cursor: unread ? 'default' : 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              if (!unread) e.currentTarget.style.background = 'rgba(245,241,232,0.08)';
                            }}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            Mark as unread
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label={resolved ? 'Reopen' : 'Resolve'}
                    disabled={busy || !canWrite}
                    onClick={(e) => {
                      e.stopPropagation();
                      resolved ? onUnresolve(thread.root.id) : onResolve(thread.root.id);
                    }}
                    title={canWrite ? (resolved ? 'Reopen' : 'Mark resolved') : 'Read-only — published links only'}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: '1.5px solid',
                      borderColor: resolved ? '#1C8B4B' : 'rgba(245,241,232,0.3)',
                      background: resolved ? '#1C8B4B' : 'transparent',
                      color: resolved ? '#fff' : 'rgba(245,241,232,0.6)',
                      fontSize: 12,
                      lineHeight: 1,
                      cursor: busy || !canWrite ? 'default' : 'pointer',
                      opacity: !canWrite ? 0.4 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </button>
                </div>
              </div>

              {/* Location chip — includes the page name on paged canvases, with a
                  ↗ hint when the comment is on another page (click jumps there). */}
              <div style={{ fontSize: 11.5, color: chipColor, fontWeight: 600, marginBottom: 3 }}>
                #{index} ·{' '}
                {paged && thread.root.pageId ? `${pageTitle(thread.root.pageId)} · ` : ''}
                {locationLabel(thread.root.artboardId)}
                {!active && <span style={{ marginLeft: 4, color: '#9aa6bb' }}>↗</span>}
              </div>

              {/* Author + time */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 12.5, fontWeight: unread ? 700 : 600, color: authorColor }}>
                  {thread.root.author?.displayName ?? 'Unknown'}
                </span>
                <span style={{ fontSize: 11.5, color: 'rgba(245,241,232,0.45)' }}>
                  {relativeTime(thread.root.createdAt)}
                </span>
              </div>

              {/* Snippet (2-line clamp) */}
              <div
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.45,
                  color: snippetColor,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                }}
              >
                {stripMentions(thread.root.body)}
              </div>

              {/* Reply count */}
              {thread.replies.length > 0 && (
                <div style={{ fontSize: 11.5, color: '#9aa6bb', fontWeight: 600, marginTop: 5 }}>
                  {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
