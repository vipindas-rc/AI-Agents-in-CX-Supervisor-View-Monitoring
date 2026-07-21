import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Composer } from './Composer';
import { CommentsSidebar } from './CommentsSidebar';
import { PinLayer, type PinView } from './PinLayer';
import { Thread } from './Thread';
import { panToThread } from './pan';
import { capturePinAnchor } from './pinAnchor';
// Snapshot preview is disabled for now (html2canvas output looked too rough).
// `capturePreview.ts` + `PreviewImage.tsx` are left dormant for an easy re-enable
// (better capture lib, or once the backend stores real images). To turn back on:
// re-add the post-create capture in submitDraft + the previews merge below, and
// render <PreviewImage> in CommentsSidebar.
import { createMockCommentsClient } from './mockClient';
import { createNetworkCommentsClient, isLiveCommentsHost } from './networkClient';
import { useComments } from './useComments';
import { FONT } from './ui';
import { isThreadUnread } from './types';
import type { CommentsConfig, PinTarget } from './types';
import type { CanvasMode } from './ModeBar';

// Custom comment-dropper cursor: a small white speech bubble, tail pointing
// down-left. Layered strokes give it a thin dark outline with a 2px white
// border outside that (so it reads on any background) — the wide white stroke
// is drawn first, the thin dark stroke on top. The hotspot sits at the tail
// tip so the comment drops where the point lands. Falls back to crosshair if
// SVG cursors are unsupported.
const COMMENT_BUBBLE_PATH =
  'M5 3 H17 A2 2 0 0 1 19 5 V13 A2 2 0 0 1 17 15 H9 L5 18 V15 A2 2 0 0 1 3 13 V5 A2 2 0 0 1 5 3 Z';
const COMMENT_CURSOR_SVG =
  `<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22'>` +
  `<path d='${COMMENT_BUBBLE_PATH}' fill='#ffffff' stroke='#ffffff' stroke-width='5' stroke-linejoin='round'/>` +
  `<path d='${COMMENT_BUBBLE_PATH}' fill='none' stroke='#444444' stroke-width='1' stroke-linejoin='round'/>` +
  `</svg>`;
const COMMENT_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(COMMENT_CURSOR_SVG)}") 4 19, crosshair`;

/**
 * Comment overlay for a DesignCanvas. Mounted by DesignCanvas when the `comments`
 * prop is set; active while the shared canvas mode is 'comment' (driven by the
 * bottom-left ModeBar). Drop pins on artboard elements → read/reply/resolve in
 * the right-hand comments sidebar. Inert with no config.
 *
 * `devMode` swaps the in-memory mock store for the hosted comments-service
 * (Replit Auth, bearer-token sign-in). The mock gives a full, testable UX with
 * no network/sign-in; the network client is the production path.
 */
export function CommentLayer({
  config,
  mode,
  setMode,
  activePageId = null,
  pages,
  onSwitchPage,
  onUnreadChange,
}: {
  config: CommentsConfig;
  mode: CanvasMode;
  setMode: (m: CanvasMode) => void;
  /** Active DCPage id (null = unpaged canvas). Pins render only for this page. */
  activePageId?: string | null;
  /** All pages, for the sidebar's cross-page location labels + jumps. */
  pages?: { id: string; title: string }[];
  /** Switch the canvas to another page (used when a sidebar row is off-page). */
  onSwitchPage?: (id: string) => void;
  /** Reports the count of unread (unresolved) threads up to the ModeBar so the
   *  Comment tab can show an unread dot when you're in another mode. */
  onUnreadChange?: (count: number) => void;
}) {
  const client = useMemo(
    () =>
      config.devMode
        ? createMockCommentsClient(config.canvasId)
        : createNetworkCommentsClient(config.canvasId, config.serviceUrl),
    [config.canvasId, config.devMode, config.serviceUrl],
  );

  const { threads, reads, me, ready, signIn, signOut, create, reply, resolve, unresolve, remove, markRead, markUnread } =
    useComments(client);

  // Posting is gated to real, published deployments — dev/preview/localhost are
  // READ-ONLY so iterating on a prototype doesn't scatter throwaway comments onto
  // a canvas. The mock store (devMode) stays writable (it's a self-contained
  // sandbox), and an explicit `?comments-write` URL opt-in re-enables posting on a
  // dev host when you genuinely want to test the flow there. Host classification
  // is the same robust signal resolveCanvasId trusts — nothing hardcoded per canvas.
  const writeAllowedHere = useMemo(() => {
    if (config.devMode) return true; // mock sandbox — always writable
    if (isLiveCommentsHost()) return true; // real *.replit.app / custom domain
    try {
      return new URLSearchParams(window.location.search).has('comments-write'); // dev opt-in
    } catch {
      return false;
    }
  }, [config.devMode]);

  // Mock users always have write access; on the network the panel must show a
  // sign-in prompt when signed-out or read-only (non-RC). Hide it until the
  // first /me resolves so it doesn't flash before silent SSO completes. Suppressed
  // on read-only preview hosts — signing in there still wouldn't let you post.
  const needsAuth = !config.devMode && ready && !me?.canWrite && writeAllowedHere;
  // True only when posting is blocked *because* this is a dev/preview host (vs an
  // auth/permission gap) — drives the sidebar's read-only note.
  const previewReadOnly = !config.devMode && !writeAllowedHere;

  const enabled = mode === 'comment';
  const [showResolved, setShowResolved] = useState(false);
  const [draft, setDraft] = useState<PinTarget | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canWrite = !!me?.canWrite && writeAllowedHere;

  // Unread (unresolved) thread count, mirroring the sidebar's "N new" rule.
  // Surfaced to the ModeBar so the Comment tab can flag unread comments while
  // you're in cursor/dev mode.
  const unreadCount = useMemo(
    () => threads.filter((t) => !t.root.resolvedAt && isThreadUnread(t, me, reads)).length,
    [threads, me, reads],
  );
  useEffect(() => { onUnreadChange?.(unreadCount); }, [unreadCount, onUnreadChange]);

  const closeAll = () => {
    setDraft(null);
    setOpenId(null);
  };

  // Click-to-drop while Comment mode is on.
  useEffect(() => {
    if (!enabled) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest('[data-cl-ui]') || t.closest('[data-inspector-ui]')) return; // our own UI
      // Only the artboard frame itself (.dc-card) accepts drops. The artboard
      // title / focus / share chrome are siblings of the card inside the slot,
      // so gating on the slot let pins land on the title — gate on the card.
      const inFrame = t.closest('.dc-card');
      if (!inFrame) {
        if (!t.closest('[data-dc-slot]')) closeAll(); // empty canvas — dismiss; chrome → leave its own handler
        return;
      }
      if (!canWrite) return;
      e.preventDefault();
      e.stopPropagation();
      const target = capturePinAnchor(t, e.clientX, e.clientY);
      if (!target) return;
      setDraft(target);
      setOpenId('draft');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [enabled, canWrite]);

  // Leaving comment mode tears down any draft/open thread.
  useEffect(() => {
    if (!enabled) closeAll();
  }, [enabled]);

  // Esc cancels a draft / closes an open thread; exits the mode otherwise.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (draft || openId) closeAll();
      else if (enabled) setMode('cursor');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [draft, openId, enabled]);

  // Build the pin list. Pins render ONLY for the active page (other pages'
  // artboards are unmounted), but the numbering is GLOBAL across all visible
  // threads so a pin's number matches its sidebar row exactly (the sidebar lists
  // every page) — a page can legitimately show pins #2, #5, #7.
  const pins: PinView[] = useMemo(() => {
    const list: PinView[] = [];
    let globalIndex = 0;
    for (const t of threads) {
      const resolved = !!t.root.resolvedAt;
      if (resolved && !showResolved) continue;
      globalIndex++; // counts all visible threads, matching the sidebar's order
      if (t.root.pageId !== activePageId) continue; // pin lives on its own page only
      list.push({
        id: t.root.id,
        artboardId: t.root.artboardId,
        anchor: t.root.anchor,
        kind: resolved ? 'resolved' : 'unresolved',
        index: globalIndex,
      });
    }
    if (draft) {
      list.push({ id: 'draft', artboardId: draft.artboardId, anchor: draft, kind: 'draft' });
    }
    return list;
  }, [threads, showResolved, draft, activePageId]);

  // Opening a thread (from a pin or the sidebar) marks it read for this user.
  // markRead is idempotent + bumps the timestamp, so reopening after new replies
  // re-reads correctly. Kept in a ref so the effect only depends on openId.
  const markReadRef = useRef(markRead);
  markReadRef.current = markRead;
  useEffect(() => {
    if (!openId || openId === 'draft') return;
    void markReadRef.current(openId);
  }, [openId]);

  // Deeplink from a bot notification: `?pin=<commentId>`. On arrival, switch into
  // comment mode immediately; then, once the list has loaded, open the thread and
  // pan to its pin (switching to its page first if needed). Reveals it even if
  // resolved. Resolves once — a missing id just keeps checking on the next poll
  // (the target may land a beat later), which is harmless.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).has('pin')) setMode('comment');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deeplinkDone = useRef(false);
  useEffect(() => {
    if (deeplinkDone.current || !ready || typeof window === 'undefined') return;
    const pin = new URLSearchParams(window.location.search).get('pin');
    if (!pin) {
      deeplinkDone.current = true;
      return;
    }
    const t = threads.find((x) => x.root.id === pin);
    if (!t) return; // not loaded yet (or resolved/deleted) — recheck on the next poll
    deeplinkDone.current = true;
    if (t.root.resolvedAt) setShowResolved(true); // a resolved target is hidden by default
    setOpenId(pin);
    panToThread(t, { paged: !!pages, activePageId, onSwitchPage });
  }, [ready, threads, activePageId, pages, onSwitchPage]);

  async function submitDraft(body: string) {
    if (!draft) return;
    const { artboardId, selector, relX, relY, artboardX, artboardY, anchorText, elementTag, dataName } =
      draft;
    setBusy(true);
    try {
      const created = await create({
        canvasId: config.canvasId,
        pageId: activePageId,
        artboardId,
        body,
        anchor: { selector, relX, relY, artboardX, artboardY, anchorText, elementTag, dataName },
      });
      setDraft(null);
      setOpenId(created.id);
    } finally {
      setBusy(false);
    }
  }

  // On-canvas popover at the pin: the composer for a fresh draft, the full
  // thread for a saved comment (Figma-style — the rail is the index, the
  // popover at the drop spot is where you read & reply).
  const renderPopover = (pin: PinView, lost: boolean) => {
    if (pin.id === 'draft') {
      return (
        <Composer
          busy={busy}
          searchDirectory={(q) => client.searchDirectory(q)}
          onSubmit={submitDraft}
          onCancel={closeAll}
        />
      );
    }
    const thread = threads.find((t) => t.root.id === pin.id);
    if (!thread) return null;
    return (
      <Thread
        thread={thread}
        me={me}
        canWrite={canWrite}
        lost={lost}
        busy={busy}
        searchDirectory={(q) => client.searchDirectory(q)}
        onReply={(body) => void reply(pin.id, body)}
        onResolve={async () => {
          await resolve(pin.id);
          if (!showResolved) setOpenId(null);
        }}
        onUnresolve={() => void unresolve(pin.id)}
        onDelete={async (id) => {
          await remove(id);
          if (id === pin.id) setOpenId(null);
        }}
        onClose={() => setOpenId(null)}
      />
    );
  };

  return createPortal(
    <div data-cl-ui style={{ fontFamily: FONT }}>
      {/* Comment-dropper cursor while dropping. No hover highlight — the cursor
          signals intent and the pin lands on the click target directly, so the
          inspect-style outline/tint just adds noise for comment dropping. */}
      {enabled && canWrite && (
        <style>{`[data-dc-slot] * { cursor: ${COMMENT_CURSOR} !important; }`}</style>
      )}

      {/* Pins ride the canvas; only the draft carries an on-canvas popover. */}
      {enabled && (
        <PinLayer pins={pins} openId={openId} onOpen={setOpenId} renderPopover={renderPopover} />
      )}

      {/* Right-hand reading surface: element preview + comment chain per thread. */}
      {enabled && (
        <CommentsSidebar
          threads={threads}
          reads={reads}
          me={me}
          canWrite={canWrite}
          activePageId={activePageId}
          pages={pages}
          onSwitchPage={onSwitchPage}
          signedOut={config.devMode ? false : !me}
          needsAuth={needsAuth}
          previewReadOnly={previewReadOnly}
          onSignIn={() => void signIn()}
          onSignOut={() => void signOut()}
          openId={openId === 'draft' ? null : openId}
          busy={busy}
          showResolved={showResolved}
          onSetShowResolved={setShowResolved}
          onMarkUnread={(id) => void markUnread(id)}
          onOpen={setOpenId}
          onResolve={async (id) => {
            await resolve(id);
            if (!showResolved) setOpenId((cur) => (cur === id ? null : cur));
          }}
          onUnresolve={(id) => void unresolve(id)}
          onClose={() => setMode('cursor')}
        />
      )}
    </div>,
    document.body,
  );
}
