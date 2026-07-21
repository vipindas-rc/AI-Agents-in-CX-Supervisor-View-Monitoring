import { resolveSelector } from './selector';
import type { PinAnchor } from './types';
import { FONT } from './ui';

/**
 * Renders the frozen snapshot captured when a comment was created — the true
 * point-in-time record of what the commenter was looking at, so it never drifts
 * as the design changes underneath it.
 *
 * No live DOM clone: if there's no stored image (capture failed, or a legacy
 * comment from before snapshots), we fall back to a small descriptor chip rather
 * than re-deriving a preview from the current — possibly changed — element.
 */
export function PreviewImage({
  src,
  artboardId,
  anchor,
  height = 124,
}: {
  src: string | null;
  artboardId: string;
  anchor: PinAnchor;
  height?: number;
}) {
  // Has the anchored element survived? Only used to tune the fallback copy.
  const artboard =
    typeof document !== 'undefined'
      ? document.querySelector(`[data-dc-slot="${CSS.escape(artboardId)}"]`)
      : null;
  const stillThere = !!(artboard && resolveSelector(anchor.selector, artboard));

  return (
    <div
      style={{
        position: 'relative',
        height,
        background: src ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}
    >
      {src ? (
        <img
          src={src}
          alt="Snapshot at comment time"
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: 12,
            textAlign: 'center',
            font: `500 12px ${FONT}`,
            color: 'rgba(245,241,232,0.5)',
          }}
        >
          <code style={{ fontSize: 11, color: 'rgba(245,241,232,0.6)' }}>
            &lt;{anchor.elementTag || 'element'}
            {anchor.dataName ? ` · ${anchor.dataName}` : ''}&gt;
          </code>
          <span style={{ fontStyle: 'italic' }}>
            {stillThere ? 'No snapshot' : 'Element no longer on canvas'}
          </span>
        </div>
      )}
    </div>
  );
}
