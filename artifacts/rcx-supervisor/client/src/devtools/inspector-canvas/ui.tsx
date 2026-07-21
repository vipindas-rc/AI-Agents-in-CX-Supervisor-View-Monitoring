import type { CSSProperties } from 'react';
import type { PublicUser } from './types';

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const cardStyle: CSSProperties = {
  width: 300,
  background: '#18191b',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
  fontFamily: FONT,
  fontSize: 13,
  color: '#f5f1e8',
  overflow: 'hidden',
};

export const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: 56,
  resize: 'vertical',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 8,
  padding: '8px 10px',
  font: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  color: '#f5f1e8',
};

export const primaryBtn: CSSProperties = {
  font: 'inherit',
  fontWeight: 600,
  border: 'none',
  borderRadius: 8,
  padding: '7px 14px',
  background: 'linear-gradient(135deg,#cbd2de 0%,#868fa0 100%)',
  color: '#16181b',
  cursor: 'pointer',
};

export const ghostBtn: CSSProperties = {
  font: 'inherit',
  fontWeight: 600,
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: 8,
  padding: '7px 12px',
  background: 'transparent',
  color: 'rgba(245,241,232,0.85)',
  cursor: 'pointer',
};

export const linkBtn: CSSProperties = {
  font: 'inherit',
  fontWeight: 600,
  border: 'none',
  background: 'transparent',
  color: '#9aa6bb',
  cursor: 'pointer',
  padding: 0,
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

const AVATAR_BG = ['#2D7FFF', '#7A3FF2', '#1C8B4B', '#C8841C', '#C8203A', '#0E8C8C'];

export function Avatar({ user, size = 24 }: { user: PublicUser | null; size?: number }) {
  const name = user?.displayName || user?.username || '?';
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const bg = AVATAR_BG[hash % AVATAR_BG.length];
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flex: '0 0 auto', alignSelf: 'flex-start' }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        fontSize: size * 0.42,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
        fontFamily: FONT,
      }}
    >
      {initials(name)}
    </div>
  );
}

/** Compact relative time: "now", "5m", "3h", "2d", else a short date. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (s < 45) return 'now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
