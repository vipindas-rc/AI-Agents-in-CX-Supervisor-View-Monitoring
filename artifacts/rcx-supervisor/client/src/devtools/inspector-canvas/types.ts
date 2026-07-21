// Shared types for the CommentLayer — kept in lockstep with the comments-service
// API shapes (see github.com/alexanderroitch-rct/comments-service). The mock
// client and the (future) network client both satisfy `CommentsClient`.

/** A person from the RC directory, for the @mention picker (GET /api/directory?q=). */
export interface DirectoryPerson {
  rcPersonId: string;
  name: string;
  /** Shown to disambiguate same-named colleagues; RC-internal + RC-gated audience. */
  email: string;
  /**
   * True when this person has already participated on the queried canvas (commented
   * or been @mentioned). Server-set, only present when a `canvasId` is sent with the
   * query; drives the "On this canvas" grouping in the picker. Undefined for the mock
   * client and any query without a canvas → the picker shows a flat, ungrouped list.
   */
  isParticipant?: boolean;
}

/** Curated public identity — what threads render. Never an email. */
export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

/** Signed-in profile (extends PublicUser with the write gate). */
export interface Me extends PublicUser {
  canWrite: boolean;
}

/**
 * The 5-layer pin anchor (minus Layer 1, the in-session `data-rc-pin` attr,
 * which is a runtime decoration not persisted). This is exactly what the
 * backend stores and returns.
 */
export interface PinAnchor {
  /** Layer 2 — artboard-scoped stable CSS selector. */
  selector: string;
  /** Layer 3 — fractional offset within the element rect (0..1). */
  relX: number;
  relY: number;
  /** Layer 5 — artboard-local coords (pre-canvas-transform) for anchor-lost fallback. */
  artboardX: number;
  artboardY: number;
  /** Layer 4 — 60-char text snapshot for identity disambiguation. */
  anchorText: string | null;
  /** Identity hints. */
  elementTag: string | null;
  dataName: string | null;
}

/** A captured pin target at drop time — the anchor plus its artboard. */
export interface PinTarget extends PinAnchor {
  artboardId: string;
}

/** A comment as returned by the service (root or reply). */
export interface Comment {
  id: string;
  canvasId: string;
  /**
   * DCPage id this comment lives on (`null` = unpaged canvas / pre-pages row).
   * The sidebar lists comments from ALL pages; pins only render for the comment
   * whose `pageId` matches the active page (other pages' artboards are unmounted).
   */
  pageId: string | null;
  artboardId: string;
  parentCommentId: string | null;
  author: PublicUser | null;
  body: string;
  anchor: PinAnchor;
  /**
   * Frozen rasterised snapshot of the area around the cursor, captured at
   * creation time — the point-in-time record of what the commenter saw. Only
   * root comments carry one. Data URL today (mock); a hosted `previewUrl` once
   * the network client + blob storage land. Null = capture failed / unavailable.
   */
  previewImage: string | null;
  resolvedAt: string | null;
  resolvedBy: PublicUser | null;
  createdAt: string;
  updatedAt: string;
}

/** Root comment + its flat, ordered replies. Derived client-side from the flat list. */
export interface Thread {
  root: Comment;
  replies: Comment[];
}

export interface ListResult {
  comments: Comment[];
  /**
   * Per-thread last-read timestamp for the CURRENT user: `rootCommentId → ISO8601`.
   * A missing key means the user has never opened that thread (→ unread). Server
   * computes it per requester; the mock keeps it in memory.
   */
  reads: Record<string, string>;
  serverTime: string;
}

export interface CreateCommentInput {
  canvasId: string;
  /** DCPage the comment is being dropped on (the active page). Null = unpaged. */
  pageId?: string | null;
  artboardId: string;
  body: string;
  anchor: PinAnchor;
  /** Frozen snapshot captured at creation time (data URL today). */
  previewImage?: string | null;
}

/**
 * The data layer. Both the in-memory mock and the network client implement this,
 * so the UI is swappable behind `comments.devMode`.
 */
export interface CommentsClient {
  /** Current user, or null if signed out / read-only. */
  me(): Promise<Me | null>;
  /** Trigger interactive sign-in (network client only; mock resolves a fake user). */
  signIn?(): Promise<Me | null>;
  signOut?(): Promise<void>;

  /**
   * List ALL comments for the canvas across every page (flat). `since` for
   * incremental polling. Carries the current user's per-thread read map.
   */
  list(opts: { since?: string }): Promise<ListResult>;
  create(input: CreateCommentInput): Promise<Comment>;
  reply(rootId: string, body: string): Promise<Comment>;
  resolve(id: string): Promise<Comment>;
  unresolve(id: string): Promise<Comment>;
  edit(id: string, body: string): Promise<Comment>;
  remove(id: string): Promise<void>;
  /** Mark a thread (by root id) read for the current user. */
  markRead(rootId: string): Promise<void>;
  /** Clear the read mark so the thread shows as unread again (personal, per-user). */
  markUnread(rootId: string): Promise<void>;

  /** @mention typeahead. Empty/whitespace query → []. */
  searchDirectory(q: string): Promise<DirectoryPerson[]>;
}

/** Public `comments` prop on DesignCanvas. */
export interface CommentsConfig {
  canvasId: string;
  /** Override the hosted service. Defaults to the RC instance. */
  serviceUrl?: string;
  /** Use the in-memory mock store instead of the network. */
  devMode?: boolean;
}

export const DEFAULT_SERVICE_URL = 'https://comments-service.replit.app';

/** Group a flat comment list into threads, roots ordered by creation. */
export function groupThreads(comments: Comment[]): Thread[] {
  const roots = comments.filter((c) => !c.parentCommentId);
  const repliesByRoot = new Map<string, Comment[]>();
  for (const c of comments) {
    if (c.parentCommentId) {
      const arr = repliesByRoot.get(c.parentCommentId) ?? [];
      arr.push(c);
      repliesByRoot.set(c.parentCommentId, arr);
    }
  }
  const byCreated = (a: Comment, b: Comment) => a.createdAt.localeCompare(b.createdAt);
  return roots
    .slice()
    .sort(byCreated)
    .map((root) => ({
      root,
      replies: (repliesByRoot.get(root.id) ?? []).sort(byCreated),
    }));
}

/**
 * Is this thread unread *for the given user*? Unread = it has at least one
 * comment authored by someone else that's newer than the user's last-read mark
 * (or the user has never opened it). Your own comments never make a thread
 * unread; a signed-out user has nothing "unread to them".
 */
export function isThreadUnread(
  thread: Thread,
  me: Me | null,
  reads: Record<string, string>,
): boolean {
  if (!me) return false;
  const lastRead = reads[thread.root.id] ?? null;
  let latestOther: string | null = null;
  for (const c of [thread.root, ...thread.replies]) {
    if (c.author?.id === me.id) continue;
    if (!latestOther || c.createdAt > latestOther) latestOther = c.createdAt;
  }
  if (!latestOther) return false; // nothing from anyone else
  return lastRead === null || latestOther > lastRead;
}
