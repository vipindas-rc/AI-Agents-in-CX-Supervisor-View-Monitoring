import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties } from 'react';
import type { DirectoryPerson } from './types';
import { Avatar, FONT, textareaStyle } from './ui';

/**
 * A `@`-mention input. Type `@` + a name, pick from the dropdown, and the mention
 * lands as an atomic blue chip — a single Backspace deletes the whole thing, and it
 * renders as `@Name` (no `@[brackets]` leaking through).
 *
 * It's a `contenteditable` div, not a <textarea>, because a textarea can only hold
 * flat text — it can't paint an inline chip or treat one as a single deletable unit.
 * Each mention is a `contenteditable="false"` <span>; browsers delete such a span
 * atomically for free. We keep the DOM FLAT (text nodes + chip spans + `\n` text,
 * no <div>/<br> wrappers) by intercepting Enter and sanitizing paste, so reading the
 * value back out is a simple childNodes walk.
 *
 * The component is effectively uncontrolled: it owns its DOM and reports changes via
 * `onChange(display, serialized)`. `value` is only read to detect an external reset
 * (parent clears the field to '' after submit) — see the reset effect.
 *
 *  - display:    text with `@[Name]` tokens — what the parent length-checks.
 *  - serialized: `@[Name](rc:id)` — what gets submitted + the backend parses.
 *
 * The dropdown is portaled to <body> and positioned `fixed` from the editor's screen
 * rect: the composer rides inside the (transformed, overflow-hidden) canvas pin
 * wrapper, so an in-flow dropdown would be clipped/mis-scaled.
 */

// Active query = a trailing `@word` at the caret, only when the `@` starts a token
// (start-of-node — i.e. start-of-text or right after a chip — or after whitespace),
// so emails like "a@b" don't trigger it. No spaces in the query.
const QUERY_RE = /(?:^|\s)@([^@\s[\]\n]*)$/;

const NBSP = ' ';

interface ActiveQuery {
  node: Text; // the text node holding the `@query`
  atIndex: number; // offset of `@` within node
  caretOffset: number; // caret offset within node
  query: string;
}

/** Read the editor DOM back into (display, serialized) strings. Assumes a flat tree. */
function readEditor(root: HTMLElement): { display: string; serialized: string } {
  let display = '';
  let serialized = '';
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent || '';
      display += t;
      serialized += t;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if ('mention' in el.dataset) {
        const name = el.dataset.name || '';
        const id = el.dataset.id || '';
        display += `@[${name}]`;
        serialized += id ? `@[${name}](rc:${id})` : `@[${name}]`;
      } else if (el.tagName === 'BR') {
        display += '\n';
        serialized += '\n';
      } else {
        // Defensive: an unexpected nested element (stray paste) → flatten its text.
        const t = el.textContent || '';
        display += t;
        serialized += t;
      }
    }
  });
  const norm = (s: string) => s.replace(/ /g, ' '); // nbsp → space for the stored body
  return { display: norm(display), serialized: norm(serialized) };
}

function makeChip(p: DirectoryPerson): HTMLSpanElement {
  const span = document.createElement('span');
  span.dataset.mention = '';
  span.dataset.id = p.rcPersonId;
  span.dataset.name = p.name;
  span.contentEditable = 'false';
  span.textContent = `@${p.name}`;
  span.style.cssText =
    'color:#cdd5e1;background:rgba(154,166,187,0.18);border-radius:5px;padding:1px 5px;font-weight:600;white-space:nowrap;';
  return span;
}

export function MentionTextarea({
  value,
  onChange,
  searchDirectory,
  placeholder,
  autoFocus,
  minHeight,
  onSubmitKey,
  onEscape,
}: {
  /** Display string (with `@[Name]` tokens). Read-only here except for external resets. */
  value: string;
  /** (displayString, serializedMarkup) — store the markup, length-check the display. */
  onChange: (display: string, serialized: string) => void;
  searchDirectory: (q: string) => Promise<DirectoryPerson[]>;
  placeholder?: string;
  autoFocus?: boolean;
  minHeight?: number;
  /** Enter (or Cmd/Ctrl+Enter) while the dropdown is closed — post. Shift+Enter = newline. */
  onSubmitKey?: () => void;
  /** Esc while the dropdown is closed. */
  onEscape?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const activeQuery = useRef<ActiveQuery | null>(null);
  const searchSeq = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const [results, setResults] = useState<DirectoryPerson[]>([]);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  // Display order = canvas participants first, then everyone else (the service
  // already ranks this way, but partitioning here keeps the headers correct even
  // if it doesn't). `groupStart` is the index where "Everyone else" begins, or -1
  // when there's nothing to split — a flat list (no participant tags = mock client
  // / no canvasId, or an all-one-group result) renders with no headers at all.
  const { ordered, groupStart } = useMemo(() => {
    const here = results.filter((p) => p.isParticipant);
    const rest = results.filter((p) => !p.isParticipant);
    return {
      ordered: here.length ? [...here, ...rest] : results,
      groupStart: here.length && rest.length ? here.length : -1,
    };
  }, [results]);

  // Focus across the next few frames: the composer's pin wrapper mounts display:none
  // and is revealed a frame later by PinLayer, so a focus() at mount lands on a
  // hidden node.
  useEffect(() => {
    if (!autoFocus) return;
    let raf = 0;
    let tries = 0;
    const tryFocus = () => {
      const el = ref.current;
      if (el && el.offsetParent !== null) {
        el.focus();
        placeCaretAtEnd(el);
        return;
      }
      if (tries++ < 8) raf = requestAnimationFrame(tryFocus);
    };
    tryFocus();
    return () => cancelAnimationFrame(raf);
  }, [autoFocus]);

  // External reset: when the parent clears `value` to '' (e.g. after submitting a
  // reply) but the editor still has content, wipe the DOM. This is the only path by
  // which `value` drives the DOM — otherwise the editor is uncontrolled.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (value === '' && readEditor(el).display !== '') {
      el.innerHTML = '';
      setEmpty(true);
      onChange('', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const closeDropdown = () => {
    setOpen(false);
    setResults([]);
    activeQuery.current = null;
  };

  const runSearch = (q: string) => {
    const seq = ++searchSeq.current;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const r = await searchDirectory(q);
        if (seq === searchSeq.current) {
          setResults(r);
          setSel(0);
        }
      } catch {
        if (seq === searchSeq.current) setResults([]);
      }
    }, 150);
  };

  const getActiveQuery = (): ActiveQuery | null => {
    const el = ref.current;
    const selection = window.getSelection();
    if (!el || !selection || !selection.isCollapsed || selection.rangeCount === 0) return null;
    const node = selection.anchorNode;
    // The caret must sit in a text node (the typing area), not on a chip.
    if (!node || node.nodeType !== Node.TEXT_NODE || !el.contains(node)) return null;
    const offset = selection.anchorOffset;
    const before = (node.textContent || '').slice(0, offset);
    const m = before.match(QUERY_RE);
    if (!m) return null;
    return { node: node as Text, atIndex: before.lastIndexOf('@'), caretOffset: offset, query: m[1] ?? '' };
  };

  // Recompute value + the active @query after any edit. The single source of truth
  // for "what's in the box" and "is the picker open".
  const sync = () => {
    const el = ref.current;
    if (!el) return;
    const { display, serialized } = readEditor(el);
    setEmpty(display === '');
    onChange(display, serialized);
    const q = getActiveQuery();
    if (q) {
      activeQuery.current = q;
      const rect = el.getBoundingClientRect();
      setPos({ left: rect.left, top: rect.bottom + 4, width: Math.max(220, Math.min(300, rect.width)) });
      setOpen(true);
      runSearch(q.query.trim());
    } else {
      activeQuery.current = null;
      closeDropdown();
    }
  };

  const insertTextAtCaret = (text: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const tn = document.createTextNode(text);
    range.insertNode(tn);
    range.setStartAfter(tn);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const pick = (p: DirectoryPerson) => {
    const el = ref.current;
    const q = activeQuery.current;
    const selection = window.getSelection();
    if (!el || !selection) return;
    el.focus();

    const range = document.createRange();
    if (q) {
      // Replace the typed `@query` with the chip.
      range.setStart(q.node, q.atIndex);
      range.setEnd(q.node, q.caretOffset);
    } else {
      // No active query (shouldn't happen via the dropdown) — drop the chip at the end.
      range.selectNodeContents(el);
      range.collapse(false);
    }
    range.deleteContents();

    const chip = makeChip(p);
    const space = document.createTextNode(NBSP); // a real space after the chip; caret lands here
    const frag = document.createDocumentFragment();
    frag.append(chip, space);
    range.insertNode(frag);

    const after = document.createRange();
    after.setStartAfter(space);
    after.collapse(true);
    selection.removeAllRanges();
    selection.addRange(after);

    closeDropdown();
    const { display, serialized } = readEditor(el);
    setEmpty(display === '');
    onChange(display, serialized);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (open && ordered.length) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSel((s) => (s + 1) % ordered.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSel((s) => (s - 1 + ordered.length) % ordered.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        pick(ordered[sel]!);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation(); // don't also close the composer
        closeDropdown();
        return;
      }
    }
    if (e.key === 'Enter') {
      // Dropdown closed: Shift+Enter = newline, plain Enter (or Cmd/Ctrl+Enter) = post.
      e.preventDefault();
      if (e.shiftKey) {
        // Insert a flat `\n` ourselves so the browser doesn't wrap lines in
        // <div>/<br> (which would break the flat childNodes read).
        insertTextAtCaret('\n');
        sync();
      } else {
        onSubmitKey?.();
      }
      return;
    }
    if (e.key === 'Escape') onEscape?.();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Plain text only — keep the tree flat (no pasted markup/chips).
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') ?? '';
    insertTextAtCaret(text.replace(/\r\n?/g, '\n'));
    sync();
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        {empty && placeholder && <div style={placeholderStyle}>{placeholder}</div>}
        <div
          ref={ref}
          role="textbox"
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => setTimeout(closeDropdown, 120)}
          style={{ ...editorStyle, ...(minHeight ? { minHeight } : null) }}
        />
      </div>
      {open &&
        pos &&
        createPortal(
          <div data-cl-ui style={{ ...dropdownStyle, left: pos.left, top: pos.top, width: pos.width }}>
            {ordered.length === 0 ? (
              <div style={hintStyle}>Type a name to mention…</div>
            ) : (
              ordered.map((p, i) => (
                <div key={p.rcPersonId}>
                  {groupStart >= 0 && i === 0 && <div style={sectionStyle}>On this canvas</div>}
                  {groupStart >= 0 && i === groupStart && <div style={sectionStyle}>Everyone else</div>}
                  <div
                    // mousedown+preventDefault keeps editor focus (no blur → no caret loss)
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(p);
                    }}
                    onMouseEnter={() => setSel(i)}
                    style={{ ...rowStyle, background: i === sel ? 'rgba(255,255,255,0.07)' : 'transparent' }}
                  >
                    <Avatar user={{ id: p.rcPersonId, username: p.name, displayName: p.name, avatarUrl: null }} size={22} />
                    <div style={{ minWidth: 0 }}>
                      <div style={nameStyle}>{p.name}</div>
                      <div style={emailStyle}>{p.email}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

/** Place the caret at the end of a contenteditable element. */
function placeCaretAtEnd(el: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

const editorStyle: CSSProperties = {
  ...textareaStyle,
  resize: undefined,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  lineHeight: 1.5,
  cursor: 'text',
  overflowY: 'auto',
  maxHeight: 160,
};

const placeholderStyle: CSSProperties = {
  position: 'absolute',
  left: 11,
  top: 8,
  fontSize: 13,
  color: 'rgba(245,241,232,0.4)',
  pointerEvents: 'none',
  fontFamily: FONT,
};

const dropdownStyle: CSSProperties = {
  position: 'fixed',
  zIndex: 2147483647,
  maxHeight: 240,
  overflowY: 'auto',
  background: '#202225',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  padding: 4,
  fontFamily: FONT,
};

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 8px',
  borderRadius: 7,
  cursor: 'pointer',
};

const nameStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#f5f1e8',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const emailStyle: CSSProperties = {
  fontSize: 11.5,
  color: 'rgba(245,241,232,0.5)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const hintStyle: CSSProperties = { padding: '8px 10px', fontSize: 12.5, color: 'rgba(245,241,232,0.5)' };

const sectionStyle: CSSProperties = {
  padding: '6px 8px 3px',
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: 'rgba(245,241,232,0.45)',
};
