import { useRef, useState } from 'react';
import { MentionTextarea } from './MentionTextarea';
import type { DirectoryPerson } from './types';
import { cardStyle, ghostBtn, primaryBtn } from './ui';

/**
 * New-comment composer popover, anchored to a freshly dropped pin. The textarea is
 * a MentionTextarea: type `@` to mention a colleague (pinged in RingCentral chat).
 * It surfaces both the display string (with `@[Name]` tokens, for the UI) and the
 * serialized markup (`@[Name](rc:id)`, what we submit + the backend parses).
 *
 * No "may not survive edits" nag — every host element carries a build-stamped
 * `data-anchor`, so pins anchor durably; the anchor-lost ⚠ is the honest signal.
 */
export function Composer({
  busy,
  searchDirectory,
  onSubmit,
  onCancel,
}: {
  busy?: boolean;
  searchDirectory: (q: string) => Promise<DirectoryPerson[]>;
  onSubmit: (body: string) => void;
  onCancel: () => void;
}) {
  const [display, setDisplay] = useState('');
  const serialized = useRef('');

  const submit = () => {
    const t = serialized.current.trim();
    if (t) onSubmit(t);
  };

  return (
    <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
      <div style={{ padding: 12 }}>
        <MentionTextarea
          value={display}
          onChange={(d, s) => {
            setDisplay(d);
            serialized.current = s;
          }}
          searchDirectory={searchDirectory}
          placeholder="Add a comment…  @ to mention"
          autoFocus
          onSubmitKey={submit}
          onEscape={onCancel}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
          <button type="button" style={ghostBtn} onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            style={{ ...primaryBtn, opacity: busy || !display.trim() ? 0.5 : 1 }}
            onClick={submit}
            disabled={busy || !display.trim()}
          >
            {busy ? 'Posting…' : 'Comment'}
          </button>
        </div>
      </div>
    </div>
  );
}
