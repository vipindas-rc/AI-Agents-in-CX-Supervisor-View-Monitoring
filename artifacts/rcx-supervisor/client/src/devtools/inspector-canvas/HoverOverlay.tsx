import { useEffect, useRef, useState } from 'react';

/**
 * Hover-highlight overlay for elements inside a DesignCanvas artboard. Extracted
 * from Inspector.tsx so both Inspect mode and Comment mode share one hover infra.
 *
 * Lives in its own component so a mousemove only re-renders this ~30-line subtree
 * — NOT whatever large panel/tree owns it. Without that isolation, pan/zoom across
 * the canvas spirals the main thread (mousemoves fire ~60×/sec). It also bails
 * entirely while a DesignCanvas viewport is mid-interaction (drag/wheel/gesture) —
 * see `data-dc-interacting` in DesignCanvas.jsx.
 *
 * Only highlights elements within `[data-dc-slot]` (artboard scope). Extra DOM
 * props are spread onto the overlay div — Inspector passes `data-inspector-ui` so
 * its own pickers/scans filter the overlay out.
 */
export function HoverOverlay({
  enabled,
  color = '#9aa6bb',
  onHover,
  ...rest
}: {
  enabled: boolean;
  /** Outline/tint colour. Defaults to the carbon accent grey. */
  color?: string;
  /** Fires with the currently-hovered artboard element (or null), for click-to-drop. */
  onHover?: (el: HTMLElement | null, rect: DOMRect | null) => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);

  // Read onHover through a ref so the listener only re-attaches when `enabled`
  // flips, not on every parent render.
  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;

  useEffect(() => {
    if (!enabled) {
      setHoverRect(null);
      onHoverRef.current?.(null, null);
      return;
    }
    const onMove = (e: MouseEvent) => {
      if (document.querySelector('[data-dc-interacting]')) {
        setHoverRect((prev) => (prev ? null : prev));
        onHoverRef.current?.(null, null);
        return;
      }
      const t = e.target as HTMLElement | null;
      if (!t || t.closest('[data-inspector-ui]') || !t.closest('[data-dc-slot]')) {
        setHoverRect((prev) => (prev ? null : prev));
        onHoverRef.current?.(null, null);
        return;
      }
      const rect = t.getBoundingClientRect();
      setHoverRect(rect);
      onHoverRef.current?.(t, rect);
    };
    document.addEventListener('mousemove', onMove, true);
    return () => document.removeEventListener('mousemove', onMove, true);
  }, [enabled]);

  if (!enabled || !hoverRect) return null;
  return (
    <div
      {...rest}
      style={{
        position: 'fixed',
        top: hoverRect.top,
        left: hoverRect.left,
        width: hoverRect.width,
        height: hoverRect.height,
        border: `2px solid ${color}`,
        background: `${color}14`, // ~8% alpha
        pointerEvents: 'none',
        zIndex: 1999,
        borderRadius: 2,
        ...rest.style,
      }}
    />
  );
}
