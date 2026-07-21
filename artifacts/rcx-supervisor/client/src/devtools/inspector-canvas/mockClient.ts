import type {
  Comment,
  CommentsClient,
  CreateCommentInput,
  DirectoryPerson,
  ListResult,
  Me,
  PublicUser,
} from './types';

// In-memory comments store with the same surface as the network client, so the
// whole UX can be built + demoed without a running comments-service. Pins persist
// for the session (Vite HMR is fine; a full reload clears). Used during initial
// integration and any `comments.devMode` usage.

const MOCK_ME: Me = {
  id: 'mock-you',
  username: 'you',
  displayName: 'You (dev)',
  avatarUrl: null,
  canWrite: true,
};

function publicMe(): PublicUser {
  const { id, username, displayName, avatarUrl } = MOCK_ME;
  return { id, username, displayName, avatarUrl };
}

let seq = 0;
function genId(): string {
  return `cmt_mock_${Date.now().toString(36)}_${(seq++).toString(36)}`;
}

// A tiny fake org directory so @mention works in devMode demos (no backend).
const MOCK_DIRECTORY: DirectoryPerson[] = [
  { rcPersonId: 'p1', name: 'Alex Roitch', email: 'alex.roitch@ringcentral.com' },
  { rcPersonId: 'p2', name: 'Jane Doe', email: 'jane.doe@ringcentral.com' },
  { rcPersonId: 'p3', name: 'Sam Patel', email: 'sam.patel@ringcentral.com' },
  { rcPersonId: 'p4', name: 'Maria Garcia', email: 'maria.garcia@ringcentral.com' },
  { rcPersonId: 'p5', name: 'Chen Wei', email: 'chen.wei@ringcentral.com' },
  { rcPersonId: 'p6', name: 'Priya Nair', email: 'priya.nair@ringcentral.com' },
];

export function createMockCommentsClient(canvasId: string): CommentsClient {
  const store: Comment[] = [];
  const reads: Record<string, string> = {}; // rootId → last-read ISO (this session)
  const now = () => new Date().toISOString();

  const find = (id: string) => store.find((c) => c.id === id);
  const patch = (id: string, p: Partial<Comment>): Comment => {
    const c = find(id);
    if (!c) throw new Error(`Comment ${id} not found`);
    Object.assign(c, p, { updatedAt: now() });
    return { ...c };
  };

  return {
    async me() {
      return MOCK_ME;
    },
    async signIn() {
      return MOCK_ME;
    },
    async signOut() {
      /* no-op in dev */
    },

    async list(): Promise<ListResult> {
      return { comments: store.map((c) => ({ ...c })), reads: { ...reads }, serverTime: now() };
    },

    async create(input: CreateCommentInput): Promise<Comment> {
      const c: Comment = {
        id: genId(),
        canvasId,
        pageId: input.pageId ?? null,
        artboardId: input.artboardId,
        parentCommentId: null,
        author: publicMe(),
        body: input.body,
        anchor: input.anchor,
        previewImage: input.previewImage ?? null,
        resolvedAt: null,
        resolvedBy: null,
        createdAt: now(),
        updatedAt: now(),
      };
      store.push(c);
      return { ...c };
    },

    async reply(rootId: string, body: string): Promise<Comment> {
      const root = find(rootId);
      if (!root) throw new Error(`Root comment ${rootId} not found`);
      const c: Comment = {
        id: genId(),
        canvasId,
        pageId: root.pageId,
        artboardId: root.artboardId,
        parentCommentId: rootId,
        author: publicMe(),
        body,
        anchor: root.anchor, // replies share the root anchor
        previewImage: null, // only roots carry a snapshot
        resolvedAt: null,
        resolvedBy: null,
        createdAt: now(),
        updatedAt: now(),
      };
      store.push(c);
      return { ...c };
    },

    async resolve(id: string): Promise<Comment> {
      return patch(id, { resolvedAt: now(), resolvedBy: publicMe() });
    },
    async unresolve(id: string): Promise<Comment> {
      return patch(id, { resolvedAt: null, resolvedBy: null });
    },
    async edit(id: string, body: string): Promise<Comment> {
      return patch(id, { body });
    },

    async remove(id: string): Promise<void> {
      const target = find(id);
      const isRoot = target && !target.parentCommentId;
      for (let i = store.length - 1; i >= 0; i--) {
        const c = store[i]!;
        if (c.id === id || (isRoot && c.parentCommentId === id)) store.splice(i, 1);
      }
      delete reads[id];
    },

    async markRead(rootId: string): Promise<void> {
      reads[rootId] = now();
    },

    async markUnread(rootId: string): Promise<void> {
      delete reads[rootId];
    },

    async searchDirectory(q: string): Promise<DirectoryPerson[]> {
      const s = q.trim().toLowerCase();
      if (!s) return [];
      return MOCK_DIRECTORY.filter(
        (p) => p.name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s),
      ).slice(0, 8);
    },
  };
}
