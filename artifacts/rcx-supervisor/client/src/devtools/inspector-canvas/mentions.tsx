import type { CSSProperties, ReactNode } from 'react';

/**
 * Mentions live INSIDE the comment body as markup, so both root comments and
 * replies carry them with no extra wire fields, and the backend can parse the
 * same body to fire the @mention notification.
 *
 *  - Stored / sent form:  `@[Display Name](rc:<rcPersonId>)`
 *  - Composer display form (while typing, before serialize): `@[Display Name]`
 *  - Rendered form:        a highlighted `@Display Name` chip
 *
 * The composer shows the bracketed name (no id noise) and a name→id map is kept
 * alongside; `serializeMentions` folds the id back in at submit time.
 */

/** Stored markup: @[Name](rc:id) — name in group 1, id in group 2. */
export const MENTION_MARKUP_RE = /@\[([^\]]+)\]\(rc:([^)]+)\)/g;

/** Composer display token (no id): @[Name]. */
const DISPLAY_TOKEN_RE = /@\[([^\]]+)\]/g;

/**
 * Composer display text (with `@[Name]` tokens) → stored markup, using the
 * picked-mention map (display name → rcPersonId). A token whose name isn't in the
 * map (e.g. the user hand-typed brackets) is left literal — it just won't notify.
 */
export function serializeMentions(display: string, byName: Record<string, string>): string {
  return display.replace(DISPLAY_TOKEN_RE, (whole, name: string) => {
    const id = byName[name];
    return id ? `@[${name}](rc:${id})` : whole;
  });
}

/** Stored markup → plain "@Name" text (sidebar snippets, length checks, etc.). */
export function stripMentions(body: string): string {
  return body.replace(MENTION_MARKUP_RE, (_w, name: string) => `@${name}`);
}

const mentionChip: CSSProperties = {
  color: '#cdd5e1',
  fontWeight: 600,
  background: 'rgba(154,166,187,0.18)',
  borderRadius: 4,
  padding: '0 2px',
};

/** Render a body with its mentions as highlighted `@Name` chips. */
export function renderMentionBody(body: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = new RegExp(MENTION_MARKUP_RE.source, 'g');
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    if (m.index > last) out.push(body.slice(last, m.index));
    out.push(
      <span key={key++} style={mentionChip}>
        @{m[1]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < body.length) out.push(body.slice(last));
  return out;
}
