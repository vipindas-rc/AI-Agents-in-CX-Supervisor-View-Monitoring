import { useRef, useState } from 'react';
import { MentionTextarea } from './MentionTextarea';
import { renderMentionBody } from './mentions';
import type { Comment, DirectoryPerson, Me, Thread as ThreadModel } from './types';
import { Avatar, cardStyle, ghostBtn, linkBtn, primaryBtn, relativeTime } from './ui';

function Row({
  comment,
  me,
  canWrite,
  onDelete,
}: {
  comment: Comment;
  me: Me | null;
  canWrite: boolean;
  onDelete?: (id: string) => void;
}) {
  const mine = me && comment.author?.id === me.id;
  return (
    <div style={{ display: 'flex', gap: 8, padding: '10px 12px' }}>
      <Avatar user={comment.author} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontWeight: 700 }}>{comment.author?.displayName ?? 'Unknown'}</span>
          <span style={{ color: 'rgba(245,241,232,0.45)', fontSize: 11.5 }}>{relativeTime(comment.createdAt)}</span>
          {mine && canWrite && onDelete && (
            <button
              type="button"
              style={{ ...linkBtn, color: 'rgba(245,241,232,0.45)', marginLeft: 'auto', fontSize: 11.5 }}
              onClick={() => onDelete(comment.id)}
            >
              Delete
            </button>
          )}
        </div>
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 2 }}>
          {renderMentionBody(comment.body)}
        </div>
      </div>
    </div>
  );
}

/** Thread popover — root + flat replies, resolve toggle, reply composer. */
export function Thread({
  thread,
  me,
  canWrite: canWriteProp,
  lost,
  busy,
  embedded,
  searchDirectory,
  onReply,
  onResolve,
  onUnresolve,
  onDelete,
  onClose,
}: {
  thread: ThreadModel;
  me: Me | null;
  /** Host-gated write permission (read-only on dev/preview). Defaults to me.canWrite. */
  canWrite?: boolean;
  lost: boolean;
  busy?: boolean;
  /** Render inside the comments sidebar: full width, no popover chrome/close. */
  embedded?: boolean;
  searchDirectory: (q: string) => Promise<DirectoryPerson[]>;
  onReply: (body: string) => void;
  onResolve: () => void;
  onUnresolve: () => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}) {
  const [reply, setReply] = useState('');
  const replySerialized = useRef('');
  const resolved = !!thread.root.resolvedAt;
  const canWrite = canWriteProp ?? !!me?.canWrite;

  const submitReply = () => {
    const t = replySerialized.current.trim();
    if (t) {
      onReply(t);
      setReply('');
      replySerialized.current = '';
    }
  };

  return (
    <div
      style={
        embedded
          ? { fontFamily: cardStyle.fontFamily, fontSize: 13, color: '#f5f1e8' }
          : { ...cardStyle, width: 320 }
      }
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px 8px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {resolved ? (
          <button type="button" style={{ ...ghostBtn, padding: '4px 10px' }} onClick={onUnresolve} disabled={busy}>
            ✓ Resolved · Reopen
          </button>
        ) : (
          <button type="button" style={{ ...ghostBtn, padding: '4px 10px' }} onClick={onResolve} disabled={busy || !canWrite}>
            ✓ Resolve
          </button>
        )}
        {lost && (
          <span style={{ color: '#C8841C', fontSize: 11.5, fontStyle: 'italic' }} title="Element no longer found">
            ⚠ anchor lost
          </span>
        )}
        {!embedded && (
          <button
            type="button"
            aria-label="Close"
            style={{ ...linkBtn, color: 'rgba(245,241,232,0.55)', marginLeft: 'auto', fontSize: 16, lineHeight: 1 }}
            onClick={onClose}
          >
            ✕
          </button>
        )}
      </div>

      {/* Comments */}
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        <Row comment={thread.root} me={me} canWrite={canWrite} onDelete={onDelete} />
        {thread.replies.map((r) => (
          <div key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Row comment={r} me={me} canWrite={canWrite} onDelete={onDelete} />
          </div>
        ))}
      </div>

      {/* Reply composer */}
      {canWrite && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: 10 }}>
          <MentionTextarea
            value={reply}
            onChange={(d, s) => {
              setReply(d);
              replySerialized.current = s;
            }}
            searchDirectory={searchDirectory}
            placeholder="Reply…  @ to mention"
            minHeight={40}
            onSubmitKey={submitReply}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="button"
              style={{ ...primaryBtn, opacity: busy || !reply.trim() ? 0.5 : 1 }}
              onClick={submitReply}
              disabled={busy || !reply.trim()}
            >
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
