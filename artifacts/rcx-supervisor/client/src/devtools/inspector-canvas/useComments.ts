import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { groupThreads, type Comment, type CommentsClient, type CreateCommentInput, type Me } from './types';

/**
 * Owns the comment list + identity for one canvas. Loads on mount, polls every
 * 3s while the tab is visible, and exposes mutators that merge the server's
 * returned row back into local state. Polling pauses on hidden tabs.
 */
export function useComments(client: CommentsClient) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [reads, setReads] = useState<Record<string, string>>({});
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  // rootId → ISO of when we optimistically marked it UNREAD. A poll can land
  // before the server has recorded the delete and would re-add the stale read
  // mark, flashing the thread back to read; while a thread is "pending unread" we
  // suppress any server read mark at-or-older-than that stamp (mirrors markRead's
  // later-timestamp-wins rule, but for a deletion, which has no timestamp).
  const pendingUnread = useRef<Record<string, string>>({});

  const mergeOne = (c: Comment) =>
    setComments((prev) => {
      const i = prev.findIndex((x) => x.id === c.id);
      if (i === -1) return [...prev, c];
      const next = prev.slice();
      next[i] = c;
      return next;
    });

  const removeLocal = (id: string) =>
    setComments((prev) => prev.filter((c) => c.id !== id && c.parentCommentId !== id));

  const refresh = useCallback(async () => {
    const res = await client.list({});
    setComments(res.comments);
    // Merge server reads with any optimistic local marks, keeping the LATER
    // timestamp per thread — so a poll that lands before the server has recorded
    // a just-opened thread doesn't flash it back to unread.
    setReads((prev) => {
      const merged = { ...prev };
      for (const [id, ts] of Object.entries(res.reads ?? {})) {
        // Skip a server read mark that's stale relative to a pending mark-unread
        // (the server hasn't processed our delete yet). A genuinely newer read
        // (e.g. opened on another device) outranks the pending unread and applies.
        const pending = pendingUnread.current[id];
        if (pending && ts <= pending) continue;
        if (pending) delete pendingUnread.current[id]; // server caught up → stop suppressing
        if (!merged[id] || ts > merged[id]) merged[id] = ts;
      }
      return merged;
    });
  }, [client]);

  useEffect(() => {
    let alive = true;
    setReady(false);
    (async () => {
      const m = await client.me().catch(() => null);
      if (!alive) return;
      setMe(m);
      await refresh().catch(() => {});
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [client, refresh]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void refresh().catch(() => {});
    }, 3000);
    return () => clearInterval(timer);
  }, [refresh]);

  const actions = useMemo(
    () => ({
      async create(input: CreateCommentInput) {
        const c = await client.create(input);
        mergeOne(c);
        return c;
      },
      async reply(rootId: string, body: string) {
        const c = await client.reply(rootId, body);
        mergeOne(c);
        return c;
      },
      async resolve(id: string) {
        mergeOne(await client.resolve(id));
      },
      async unresolve(id: string) {
        mergeOne(await client.unresolve(id));
      },
      async remove(id: string) {
        await client.remove(id);
        removeLocal(id);
      },
      async markRead(rootId: string) {
        // Optimistic: flip to read immediately, then persist. The merge in
        // refresh() keeps this from being clobbered by an in-flight poll.
        delete pendingUnread.current[rootId]; // a read supersedes any pending unread
        setReads((prev) => ({ ...prev, [rootId]: new Date().toISOString() }));
        await client.markRead(rootId).catch(() => {});
      },
      async markUnread(rootId: string) {
        // Optimistic: drop the read mark so it shows unread immediately, then persist.
        // Record the stamp so an in-flight poll can't re-add the stale read mark.
        pendingUnread.current[rootId] = new Date().toISOString();
        setReads((prev) => {
          const next = { ...prev };
          delete next[rootId];
          return next;
        });
        await client.markUnread(rootId).catch(() => {});
      },
      async signIn() {
        const m = client.signIn ? await client.signIn() : me;
        setMe(m);
        await refresh().catch(() => {});
        return m;
      },
      async signOut() {
        if (client.signOut) await client.signOut();
        setMe(null);
      },
      refresh,
    }),
    [client, refresh, me],
  );

  const threads = useMemo(() => groupThreads(comments), [comments]);

  return { comments, threads, reads, me, ready, ...actions };
}
