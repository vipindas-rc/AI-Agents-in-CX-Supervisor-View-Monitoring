import {
  DEFAULT_SERVICE_URL,
  type Comment,
  type CommentsClient,
  type CreateCommentInput,
  type DirectoryPerson,
  type ListResult,
  type Me,
} from './types';

// Network client — the production data layer. Talks to the hosted comments-service
// (Express + Replit Auth, see CommentLayer/BACKEND.md and the dedicated repo
// alexanderroitch-rct/comments-service). Mirror of `createMockCommentsClient`'s
// surface, so the UI is swappable behind `comments.devMode`.
//
// Auth is a BEARER TOKEN, not a cookie. The service lives on a different origin
// from the prototype, so its session cookie is third-party (Safari ITP / Chrome
// 3p-cookie deprecation block it). Instead the service's /api/auth/complete page
// postMessages the session id back to us as `token`; we stash it and send it as
// `Authorization: Bearer <token>` on every call. localhost is allow-listed by the
// service's CORS, so this works in local dev too.

interface AuthMessage {
  type: 'rc-comments-auth';
  ok: boolean;
  token?: string | null;
  error?: string;
}

// Build-time-baked Repl owner username (Vite `define` in vite.config.base.ts).
// `typeof` guard so non-Vite consumers don't ReferenceError; '' off-Replit.
declare const __CANVAS_OWNER__: string | undefined;
const REPL_OWNER = typeof __CANVAS_OWNER__ !== 'undefined' ? __CANVAS_OWNER__ : '';

/**
 * A published deployment's public hostname is globally unique AND stable across
 * republishes (it's the address users hit — republishing swaps the code behind
 * it, not the domain), UNLIKE `process.env.REPL_ID`, which is a per-build value
 * that changed every deploy. So on a real deployment we read the hostname at
 * RUNTIME and use it as the canvas id → each published app gets its own
 * collision-proof canvas automatically, even across copy-pasted projects.
 *
 * Non-stable hosts fall back to the EXPLICIT per-project canvasId:
 *  - `localhost` / loopback / bare IPs — every local project shares 'localhost',
 *    so the hostname can't disambiguate; the explicit id does.
 *  - Replit workspace PREVIEW hosts (`*.replit.dev`) — these rotate, so they'd
 *    scatter comments the way REPL_ID did.
 * Net: published apps are auto-unique + stable; dev/preview stay per-project on
 * the explicit id (a separate canvas from prod — fine, only published comments
 * matter).
 */
function isStableDeploymentHost(host: string): boolean {
  if (!host || host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false; // LAN dev (192.168.x.x …)
  if (host.endsWith('.replit.dev')) return false; // rotating workspace preview
  return true; // *.replit.app + custom domains — stable, unique public address
}

function resolveCanvasId(explicitId: string): string {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  return isStableDeploymentHost(host) ? host : explicitId;
}

/**
 * Is the page being served from a real, published deployment — i.e. should comments
 * posted here be treated as durable + shared? Reuses the exact host classification
 * `resolveCanvasId` trusts: localhost, loopback, bare IPs, and rotating
 * `*.replit.dev` workspace previews are NOT live; `*.replit.app` + custom domains
 * are. The comment layer uses this to go read-only on dev/preview/localhost so
 * iterating on a prototype doesn't scatter throwaway comments. Robust + project-
 * agnostic — there's nothing to hardcode per canvas.
 */
export function isLiveCommentsHost(): boolean {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  return isStableDeploymentHost(host);
}

/** Typed error carrying the HTTP status + the service's machine-readable code. */
export class CommentsApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'CommentsApiError';
    this.status = status;
    this.code = code;
  }
}

/** Wait once for the service's postMessage auth handshake (popup or iframe). */
function awaitAuthMessage(serviceOrigin: string, timeoutMs: number): Promise<AuthMessage> {
  return new Promise((resolve, reject) => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== serviceOrigin) return;
      const data = e.data as AuthMessage | undefined;
      if (data?.type !== 'rc-comments-auth') return;
      cleanup();
      resolve(data);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('auth_timeout'));
    }, timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
    };
    window.addEventListener('message', onMessage);
  });
}

export function createNetworkCommentsClient(
  canvasId: string,
  serviceUrl: string = DEFAULT_SERVICE_URL,
): CommentsClient {
  const base = serviceUrl.replace(/\/+$/, '');
  const serviceOrigin = new URL(base).origin;
  // The canvas this client reads/writes: the deployment hostname on a published
  // app, else the explicit per-project id (see resolveCanvasId). Computed once —
  // the hostname can't change within a page session.
  const effectiveCanvasId = resolveCanvasId(canvasId);
  // Scope the stored token per service origin so dev + prod don't collide.
  const tokenKey = `rc-comments-token:${serviceOrigin}`;

  let token: string | null = readToken();
  let silentTried = false;

  function readToken(): string | null {
    try {
      return window.localStorage.getItem(tokenKey);
    } catch {
      return null;
    }
  }
  function writeToken(t: string | null) {
    token = t;
    try {
      if (t) window.localStorage.setItem(tokenKey, t);
      else window.localStorage.removeItem(tokenKey);
    } catch {
      /* private mode / disabled storage — keep the in-memory copy */
    }
  }

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) };
    if (init?.body) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${base}${path}`, {
      ...init,
      headers,
      // First-party cookie path too, where the browser allows it (progressive
      // enhancement); the bearer token is the load-bearing mechanism.
      credentials: 'include',
    });

    if (res.status === 204) return undefined as T;
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const code = (data.error as string) ?? `http_${res.status}`;
      const message = (data.message as string) ?? code;
      // A stale/rejected token: drop it so the next me() reflects signed-out.
      if (res.status === 401) writeToken(null);
      throw new CommentsApiError(res.status, code, message);
    }
    return data as T;
  }

  /**
   * Open the service's sign-in flow and wait for the postMessage handshake.
   * `popup` → visible window (explicit click). `iframe` → hidden silent SSO
   * (prompt=none); resolves only if Replit can satisfy it without UI.
   */
  function startAuth(kind: 'popup' | 'iframe'): Promise<AuthMessage> {
    const ret = window.location.origin; // allow-listed (localhost / *.replit.app)
    // iframe = silent SSO (prompt=none). popup = explicit click → `prompt=login`
    // forces a fresh sign-in so a wrong/personal account can be swapped for the
    // @ringcentral.com one (the "Log out" → sign-in-again path). NB: Replit OIDC
    // does NOT support `select_account` (→ invalid_request); `login` is the
    // supported value that achieves the same intent.
    const prompt = kind === 'iframe' ? '&prompt=none' : '&prompt=login';
    const loginUrl = `${base}/api/auth/login?return=${encodeURIComponent(ret)}${prompt}`;

    if (kind === 'popup') {
      const popup = window.open(loginUrl, 'rc-comments-signin', 'width=520,height=680');
      if (!popup) return Promise.reject(new Error('Popup blocked. Allow popups and try again.'));
      // Popups can take a while (consent on first use); give them room.
      return awaitAuthMessage(serviceOrigin, 2 * 60 * 1000);
    }

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.display = 'none';
    iframe.src = loginUrl;
    document.body.appendChild(iframe);
    return awaitAuthMessage(serviceOrigin, 4000).finally(() => iframe.remove());
  }

  /** Apply a handshake result: store the token, return true on a usable token. */
  function applyAuth(msg: AuthMessage): boolean {
    if (msg.ok && msg.token) {
      writeToken(msg.token);
      return true;
    }
    return false;
  }

  async function fetchMe(): Promise<Me | null> {
    try {
      return await request<Me>('/api/me');
    } catch (err) {
      if (err instanceof CommentsApiError && err.status === 401) return null;
      throw err;
    }
  }

  return {
    async me() {
      let m = await fetchMe();
      // First load while signed-out: try silent SSO once. If the user already has
      // a Replit session this signs them in with zero clicks; otherwise it fails
      // quietly and the panel falls back to the visible Sign-in button.
      if (!m && !token && !silentTried) {
        silentTried = true;
        try {
          if (applyAuth(await startAuth('iframe'))) m = await fetchMe();
        } catch {
          /* no Replit session / blocked — stay signed out */
        }
      }
      return m;
    },

    async signIn() {
      const msg = await startAuth('popup');
      if (!applyAuth(msg)) {
        throw new Error(msg.error || 'Sign-in failed.');
      }
      return fetchMe();
    },

    async signOut() {
      try {
        await request<{ ok: true }>('/api/auth/logout', { method: 'POST' });
      } catch {
        /* best-effort; clear locally regardless */
      }
      writeToken(null);
    },

    async list(opts: { since?: string }): Promise<ListResult> {
      // No `#page` suffix → the service returns the WHOLE canvas (all pages); the
      // package filters pins by each comment's pageId client-side.
      const params = new URLSearchParams({ canvasId: effectiveCanvasId });
      if (opts.since) params.set('since', opts.since);
      const res = await request<ListResult>(`/api/comments?${params.toString()}`);
      // Tolerate an older backend that doesn't yet send `reads`.
      return { ...res, reads: res.reads ?? {} };
    },

    async create(input: CreateCommentInput): Promise<Comment> {
      // The service takes a FLAT body (anchor fields at top level), unlike the
      // nested shape it returns. Bridge it here. previewImage isn't persisted yet.
      // Use the client's own canvasId (not input.canvasId); suffix the ACTIVE page
      // so the service tags the row's page_id (it strips at the first '#').
      const { artboardId, body, anchor, pageId } = input;
      const cid = pageId ? `${effectiveCanvasId}#${pageId}` : effectiveCanvasId;
      return request<Comment>('/api/comments', {
        method: 'POST',
        // `replOwner` is an auto-provision hint: when this write is the first one
        // for an unregistered canvas, the service creates the canvas and resolves
        // the owner from this Repl-owner username (→ users.username → owner_id),
        // not from whoever happens to comment first. Ignored once the canvas
        // exists. Empty off-Replit → service falls back to first-writer.
        body: JSON.stringify({ canvasId: cid, artboardId, body, ...anchor, replOwner: REPL_OWNER }),
      });
    },

    async reply(rootId: string, body: string): Promise<Comment> {
      return request<Comment>(`/api/comments/${encodeURIComponent(rootId)}/replies`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
    },

    async resolve(id: string): Promise<Comment> {
      return request<Comment>(`/api/comments/${encodeURIComponent(id)}/resolve`, { method: 'POST' });
    },

    async unresolve(id: string): Promise<Comment> {
      return request<Comment>(`/api/comments/${encodeURIComponent(id)}/unresolve`, {
        method: 'POST',
      });
    },

    async edit(id: string, body: string): Promise<Comment> {
      return request<Comment>(`/api/comments/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ body }),
      });
    },

    async remove(id: string): Promise<void> {
      await request<{ ok: true }>(`/api/comments/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },

    async markRead(rootId: string): Promise<void> {
      await request<{ ok: true }>(`/api/comments/${encodeURIComponent(rootId)}/read`, {
        method: 'POST',
      });
    },

    async markUnread(rootId: string): Promise<void> {
      // Clears the per-user read mark → the thread reads as unread again.
      await request<{ ok: true }>(`/api/comments/${encodeURIComponent(rootId)}/read`, {
        method: 'DELETE',
      });
    },

    async searchDirectory(q: string): Promise<DirectoryPerson[]> {
      const query = q.trim();
      if (!query) return [];
      try {
        // Pass the BASE canvasId so the service can rank people who've already
        // participated on THIS canvas (commented or been @mentioned) ahead of the
        // org-wide fallback. effectiveCanvasId carries no `#page` suffix — directory
        // priority is per-canvas, not per-page. The service tags each row with
        // `isParticipant` for the grouped dropdown; ranking itself is server-side.
        const res = await request<{
          results: { rcPersonId: string; email: string; name: string | null; isParticipant?: boolean }[];
        }>(
          `/api/directory?q=${encodeURIComponent(query)}&canvasId=${encodeURIComponent(effectiveCanvasId)}`,
        );
        return (res.results ?? []).map((r) => ({
          rcPersonId: r.rcPersonId,
          email: r.email,
          name: r.name || r.email,
          isParticipant: r.isParticipant,
        }));
      } catch {
        // Typeahead is best-effort — a 401 (signed out) or transient error → no matches.
        return [];
      }
    },
  };
}
