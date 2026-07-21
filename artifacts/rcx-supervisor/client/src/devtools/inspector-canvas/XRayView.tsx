// XRayView.tsx — Wireframe x-ray pane for the Inspector.
//
// Sister pane to ExplodedView (mutually exclusive — Inspector only opens one
// at a time). Renders the selected subtree as a Figma-style wireframe: only
// elements with visible representation (background / border / border-radius /
// content leaves) get an outline, and text-leaf elements render their actual
// text in place of a bounding box. Invisible wrappers stay in the tree for
// spacing calculations but are not drawn (unless "show wireframes" is on).
//
// Hover-vs-selected: when you hover one element while another is selected,
// red distance lines + px labels appear between them — agnostic to whether
// the gap is margin, padding, gap, or empty space. When hover === selected
// (or no hover), the selected element shows its own padding (green) /
// margin (orange) tints with px labels.
//
// Stage supports scroll-to-zoom (centered on cursor) and drag-anywhere-to-pan.

import type { CSSProperties } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getAncestorScale } from './getAncestorScale';
import { lookupSpacingToken } from './Inspector';

// Format a px spacing value per the user's labelMode. Token mode prefers
// the Spring spacing-token name (e.g. "space-4") and falls back to px when
// no token matches; px mode always shows the integer pixel count.
function fmtSpacing(px: number, mode: 'token' | 'px'): string {
  const n = Math.round(px);
  if (mode === 'px') return `${n}`;
  return lookupSpacingToken(n) ?? `${n}`;
}

type Props = {
  node: HTMLElement;
  onPickHost: (host: Element) => void;
  onClose: () => void;
  // Live width of the Inspector panel to the right of this pane; used to
  // keep the right edge of the X-ray pane flush against the inspector
  // when the inspector is resized.
  inspectorWidth: number;
  // Changes whenever the source DOM's appearance changed for a reason the
  // other deps can't see (e.g. forced hover/active states) — bumps the layer
  // rebuild so the x-ray re-reads computed styles.
  rebuildKey?: string;
};

const INSPECTOR_GAP = 16;

type Box = { t: number; r: number; b: number; l: number };
type Corners = { tl: number; tr: number; br: number; bl: number };
type Rect = { x: number; y: number; w: number; h: number };

type LayerEntry = {
  el: HTMLElement | SVGElement;
  depth: number;
  // Source (unscaled) coordinates relative to xrayRoot's top-left.
  rect: Rect;
  padding: Box;
  margin: Box;
  border: Box;
  radius: Corners;
  // Visual classification.
  hasOutline: boolean; // bg / border / radius / content leaf — draw a box
  text: string | null; // direct text content if this element is a text leaf
  // Font properties captured for text rendering.
  font: {
    family: string;
    size: number;
    weight: string;
    style: string;
    // Unscaled px (or null when "normal"); scaled by the stage at render time.
    lineHeightPx: number | null;
    letterSpacingPx: number | null;
    textAlign: string;
    textTransform: string;
    // Replayed verbatim so the x-ray reproduces the source's own wrapping /
    // truncation (nowrap+ellipsis stays truncated; normal wraps).
    whiteSpace: string;
    textOverflow: string;
  } | null;
  // Cloneable visual content. SVGs always render (as hollow strokes). IMGs
  // are gated by the "show images" toggle — until then they render as a
  // placeholder rect like other content leaves. `clip` is the nearest
  // ancestor (up to 5 levels) that clips its contents via overflow / clip-path
  // — used as the wrapper shape so e.g. avatar circles render as circles.
  content:
    | { kind: 'svg'; source: SVGElement; color: string }
    | {
        kind: 'img';
        src: string;
        objectFit: string;
        objectPosition: string;
        clip: { rect: Rect; radius: Corners } | null;
      }
    | null;
};

type Fit = { baseScale: number; offsetX: number; offsetY: number };

const PANE_BG = '#18191b';
const PANE_BORDER = 'rgba(255,255,255,0.08)';
// Self-spacing rendered as diagonal hatch so the spacing rings read as "this
// is space, not solid content". Padding stripes go 45° turquoise, margin -45°
// pink so they're distinguishable when both are on.
const COLOR_PADDING = 'rgba(64,224,208,0.42)'; // turquoise
const COLOR_MARGIN = 'rgba(255,130,175,0.42)'; // pink
const HATCH_PADDING = `repeating-linear-gradient(45deg, rgba(64,224,208,0.65) 0 1px, rgba(64,224,208,0.15) 1px 4px)`;
const HATCH_MARGIN = `repeating-linear-gradient(-45deg, rgba(255,130,175,0.65) 0 1px, rgba(255,130,175,0.15) 1px 4px)`;
const COLOR_OUTLINE = 'rgba(255,255,255,0.72)';
const COLOR_TEXT = 'rgba(255,255,255,0.92)';
const COLOR_LABEL_BG = 'rgba(0,0,0,0.7)';
const COLOR_LABEL_TEXT = '#fff';
const COLOR_SELECTED = '#9aa6bb';
const COLOR_HOVER = '#9BB9FF';
const COLOR_DISTANCE = '#FF5C7A';

// Tags whose content is visually meaningful even without bg/border/radius.
const CONTENT_LEAF_TAGS = new Set([
  'IMG', 'SVG', 'INPUT', 'TEXTAREA', 'CANVAS', 'VIDEO', 'AUDIO', 'PICTURE',
  'IFRAME', 'OBJECT', 'EMBED',
]);

export function XRayView({ node, onPickHost, onClose, inspectorWidth, rebuildKey }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);

  // Like ExplodedView: root is whichever element was selected when the pane
  // opened. Picking a sublayer updates the Inspector but doesn't re-root
  // unless the new selection escapes the current subtree.
  const [xrayRoot, setXrayRoot] = useState<HTMLElement>(node);
  useEffect(() => {
    if (!xrayRoot.contains(node)) setXrayRoot(node);
  }, [node, xrayRoot]);

  const [showWireframes, setShowWireframes] = useState(false);
  const [showImages, setShowImages] = useState(true);
  // Default to tokens because the use-case is handoff. Falls back to px per
  // label when no Spring spacing token matches the value.
  const [labelMode, setLabelMode] = useState<'token' | 'px'>('token');
  const [hovered, setHovered] = useState<HTMLElement | SVGElement | null>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [layerVersion, setLayerVersion] = useState(0);
  // Zoom + pan (pan is in screen-pixel offset applied on top of the fit).
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // ESC closes the pane (capture-phase + stopPropagation so the main
  // Inspector's ESC doesn't also exit inspect mode).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const r = stage.getBoundingClientRect();
      setStageSize({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // Re-walk the live subtree when root or layerVersion changes. Pure
  // measurement, no cloning — overlays are drawn from these entries.
  const layers = useMemo<LayerEntry[]>(() => {
    void layerVersion;
    const rootRect = xrayRoot.getBoundingClientRect();
    if (!rootRect.width || !rootRect.height) return [];
    // Compensate for the DesignCanvas viewport's transform: scale(N) so all
    // rects come back in natural CSS px (matching the untransformed padding /
    // margin / font-size values we read from getComputedStyle).
    const canvasScale = getAncestorScale(xrayRoot);
    const out: LayerEntry[] = [];
    const walk = (el: HTMLElement | SVGElement, depth: number) => {
      const cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      const isSvgRoot = el instanceof SVGSVGElement;
      // Full text run for this element: a simple text leaf, OR an element
      // whose direct text is interleaved with inline children (e.g.
      // `Tap <strong>Allow</strong> when…`). In the latter case we render the
      // whole string here and stop recursing so the inline fragments don't
      // also render on top.
      const textBlock = getTextBlock(el, cs);
      if (r.width > 0 || r.height > 0) {
        const padding = readBox(cs, 'padding');
        const margin = readBox(cs, 'margin');
        const border = readBorderWidth(cs);
        const radius = readCorners(cs);
        let content = getRenderableContent(el, cs);
        if (content?.kind === 'img') {
          const clipAncestor = getClipAncestor(el, 5);
          if (clipAncestor) {
            const cr = clipAncestor.el.getBoundingClientRect();
            content = {
              ...content,
              clip: {
                rect: {
                  x: (cr.left - rootRect.left) / canvasScale,
                  y: (cr.top - rootRect.top) / canvasScale,
                  w: cr.width / canvasScale,
                  h: cr.height / canvasScale,
                },
                radius: clipAncestor.radius,
              },
            };
          }
        }
        out.push({
          el,
          depth,
          rect: {
            x: (r.left - rootRect.left) / canvasScale,
            y: (r.top - rootRect.top) / canvasScale,
            w: r.width / canvasScale,
            h: r.height / canvasScale,
          },
          padding,
          margin,
          border,
          radius,
          hasOutline: shouldDrawOutline(el, cs, border, radius),
          text: textBlock,
          font: textBlock !== null ? readFont(cs) : null,
          content,
        });
      }
      // SVG children are part of the icon's internal geometry — don't surface
      // them as separate layers. IMG and other content leaves have no
      // meaningful children to walk anyway.
      if (isSvgRoot) return;
      // Inline-text container already rendered its whole string — its inline
      // children (strong/em/a/span runs) are part of that text, not layers.
      if (textBlock !== null) return;
      for (const c of Array.from(el.children)) {
        if (c instanceof HTMLElement || c instanceof SVGElement) walk(c, depth + 1);
      }
    };
    walk(xrayRoot, 0);
    return out;
  }, [xrayRoot, layerVersion, rebuildKey]);

  // Effective scale (fit-to-stage × user zoom). Pan is applied separately
  // since it's in screen-pixel space.
  const fit = useMemo<Fit | null>(() => {
    if (!stageSize.w || !stageSize.h) return null;
    const rootRect = xrayRoot.getBoundingClientRect();
    if (!rootRect.width || !rootRect.height) return null;
    // Match the canvas-scale compensation done in the layer walk — fit the
    // natural CSS size, not the post-canvas-zoom visual size.
    const canvasScale = getAncestorScale(xrayRoot);
    const naturalW = rootRect.width / canvasScale;
    const naturalH = rootRect.height / canvasScale;
    const baseScale = Math.min(
      (stageSize.w * 0.86) / naturalW,
      (stageSize.h * 0.86) / naturalH,
      1.5,
    );
    return {
      baseScale,
      offsetX: (stageSize.w - naturalW * baseScale) / 2,
      offsetY: (stageSize.h - naturalH * baseScale) / 2,
    };
  }, [stageSize, xrayRoot, layers]);

  const scale = (fit?.baseScale ?? 1) * zoom;

  // Visible layers: hasOutline OR hasText. Wireframes-mode also shows
  // outlines for invisible wrappers (and makes them hit-testable). The
  // selected element is always kept — even an invisible layout wrapper — so
  // its padding/margin self-spacing shows in Simple view without needing to
  // flip to Detailed.
  const visibleLayers = useMemo(
    () => layers.filter((l) => l.hasOutline || l.text !== null || l.content !== null || showWireframes || l.el === node),
    [layers, showWireframes, node],
  );

  // Deeper renders on top — smaller, more specific hit targets win.
  const orderedLayers = useMemo(
    () => [...visibleLayers].sort((a, b) => a.depth - b.depth),
    [visibleLayers],
  );

  // Selected layer (if it's in the current subtree). Always pulled from
  // `layers` (not visibleLayers) so we can show selection stroke even on
  // an "invisible" element if it happens to be the selected one.
  const selectedLayer = useMemo(
    () => layers.find((l) => l.el === node) ?? null,
    [layers, node],
  );

  // Stage-level pointer handling: pan if drag, hit-test layer on move
  // (hover), pick layer on click (when no drag occurred).
  const dragRef = useRef<{ active: boolean; didDrag: boolean; startX: number; startY: number; startPanX: number; startPanY: number } | null>(null);

  const hitLayerAt = useCallback(
    (px: number, py: number): HTMLElement | SVGElement | null => {
      if (!fit) return null;
      for (let i = orderedLayers.length - 1; i >= 0; i--) {
        const l = orderedLayers[i];
        const left = fit.offsetX + pan.x + l.rect.x * scale;
        const top = fit.offsetY + pan.y + l.rect.y * scale;
        const w = l.rect.w * scale;
        const h = l.rect.h * scale;
        if (px >= left && px <= left + w && py >= top && py <= top + h) {
          return l.el;
        }
      }
      return null;
    },
    [orderedLayers, fit, scale, pan],
  );

  // SVG roots are valid pick targets now — Inspector's AssetSection detects
  // them and surfaces Spring icon info (token + import). For SVG sub-nodes
  // (path/g) walk up to the owner svg so the picker unit matches the visual
  // layer x-ray renders.
  const toPickTarget = (el: HTMLElement | SVGElement): Element | null => {
    if (el instanceof HTMLElement) return el;
    if (el instanceof SVGSVGElement) return el;
    return el.ownerSVGElement ?? el.parentElement;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragRef.current = {
      active: true,
      didDrag: false,
      startX: e.clientX,
      startY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!stage) return;
    if (drag?.active) {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.didDrag && Math.abs(dx) + Math.abs(dy) < 4) {
        // pre-drag threshold; treat as hover until exceeded
      } else {
        drag.didDrag = true;
        setPan({ x: drag.startPanX + dx, y: drag.startPanY + dy });
        return;
      }
    }
    const sr = stage.getBoundingClientRect();
    const found = hitLayerAt(e.clientX - sr.left, e.clientY - sr.top);
    if (found !== hovered) setHovered(found);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.didDrag) return; // pan completed; suppress pick
    const stage = stageRef.current;
    if (!stage) return;
    const sr = stage.getBoundingClientRect();
    const found = hitLayerAt(e.clientX - sr.left, e.clientY - sr.top);
    if (!found) return;
    const target = toPickTarget(found);
    if (target) onPickHost(target);
  };

  const onPointerLeave = () => setHovered(null);

  // Wheel-to-zoom. With a selection, each zoom snaps the selected element's
  // center to the stage center — so it stays framed as you scrub the zoom.
  // No selection → cursor-anchored zoom (preserves world point under cursor).
  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const stage = stageRef.current;
      if (!stage || !fit) return;
      const sr = stage.getBoundingClientRect();
      const cursorX = e.clientX - sr.left;
      const cursorY = e.clientY - sr.top;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      setZoom((z1) => {
        const z2 = Math.min(Math.max(z1 * factor, 0.25), 8);
        if (z2 === z1) return z1;
        setPan((p) => {
          if (selectedLayer) {
            // Auto-center: solve screen = stageCenter for the selected center
            //   stageCx = fit.offsetX + newPan.x + worldCx * fit.baseScale * z2
            const worldCx = selectedLayer.rect.x + selectedLayer.rect.w / 2;
            const worldCy = selectedLayer.rect.y + selectedLayer.rect.h / 2;
            return {
              x: stageSize.w / 2 - fit.offsetX - worldCx * fit.baseScale * z2,
              y: stageSize.h / 2 - fit.offsetY - worldCy * fit.baseScale * z2,
            };
          }
          // No selection: anchor on cursor (preserve world point under it).
          //   newPan = cursor - off - (z2/z1)*(cursor - off - pan)
          return {
            x: cursorX - fit.offsetX - (z2 / z1) * (cursorX - fit.offsetX - p.x),
            y: cursorY - fit.offsetY - (z2 / z1) * (cursorY - fit.offsetY - p.y),
          };
        });
        return z2;
      });
    },
    [fit, selectedLayer, stageSize],
  );

  // Attach wheel listener manually with passive:false so preventDefault works.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // Reset pan + zoom when the root changes (different prototype subtree).
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [xrayRoot]);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Decide whether to show self-spacing tints (selected, no hover-target) or
  // distance lines (selected + different element hovered).
  const hoverDifferent = hovered && hovered !== node ? hovered : null;
  const hoveredLayer = useMemo(
    () => (hoverDifferent ? layers.find((l) => l.el === hoverDifferent) ?? null : null),
    [hoverDifferent, layers],
  );

  const outlineColor = COLOR_OUTLINE;
  const textColor = COLOR_TEXT;

  return (
    <div
      data-inspector-ui
      style={{
        ...paneStyle,
        right: INSPECTOR_GAP + inspectorWidth + INSPECTOR_GAP,
        width: `min(720px, calc(100vw - ${INSPECTOR_GAP + inspectorWidth + INSPECTOR_GAP + INSPECTOR_GAP}px))`,
      }}
    >
      {/* Header */}
      <div style={headerStyle}>
        <XRayGlyph />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>X-ray</span>
        <span style={subtitleStyle}>
          {visibleLayers.length} visible · {layers.length} total · {Math.round(zoom * 100)}%
        </span>
        <button onClick={() => setLayerVersion((v) => v + 1)} style={pillBtnStyleSm} title="Recompute layout">
          refresh
        </button>
        <button onClick={onClose} title="Close (Esc)" style={closeBtnStyle}>
          ×
        </button>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: dragRef.current?.didDrag ? 'grabbing' : hovered ? 'pointer' : 'grab',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.4) 80%)',
          touchAction: 'none',
        }}
      >
        {fit && orderedLayers.map((l) => (
          <XRayLayer
            key={layerKey(l.el)}
            layer={l}
            fit={fit}
            zoom={zoom}
            pan={pan}
            outlineColor={outlineColor}
            textColor={textColor}
            isHover={hovered === l.el}
            isSelected={node === l.el}
            forceOutline={showWireframes}
            showImages={showImages}
            showSelfSpacing={node === l.el && !hoverDifferent}
            labelMode={labelMode}
          />
        ))}

        {/* Distance lines between selected and hovered (different element). */}
        {fit && selectedLayer && hoveredLayer && (
          <DistanceLines
            selected={selectedLayer.rect}
            hovered={hoveredLayer.rect}
            fit={fit}
            scale={scale}
            pan={pan}
            labelMode={labelMode}
          />
        )}
      </div>

      {/* Footer */}
      <div style={footerStyle}>
        <SegmentedToggle
          label="Detail"
          value={showWireframes ? 'detailed' : 'simple'}
          options={[
            { value: 'simple', label: 'Simple', title: 'Only outline elements that paint pixels' },
            { value: 'detailed', label: 'Detailed', title: 'Also outline invisible wrappers + make them hit-testable' },
          ]}
          onChange={(v) => setShowWireframes(v === 'detailed')}
        />
        <SegmentedToggle
          label="Images"
          value={showImages ? 'on' : 'off'}
          options={[
            { value: 'on', label: 'On', title: 'Render IMG bitmaps inside their clip ancestors' },
            { value: 'off', label: 'Off', title: 'Hide IMG bitmaps — show their boxes only' },
          ]}
          onChange={(v) => setShowImages(v === 'on')}
        />
        <SegmentedToggle
          label="Units"
          value={labelMode}
          options={[
            { value: 'token', label: 'Tok', title: 'Spring spacing tokens (space-3, space-4…) — falls back to px when no match' },
            { value: 'px', label: 'Px', title: 'Raw px values' },
          ]}
          onChange={(v) => setLabelMode(v as 'token' | 'px')}
        />

        <button onClick={resetView} style={pillBtnStyle} title="Reset zoom + pan">
          reset view
        </button>

        <span style={legendStyle}>
          {hoverDifferent ? (
            <>
              <LegendSwatch color={COLOR_DISTANCE} /> distance
            </>
          ) : (
            <>
              <LegendSwatch color={COLOR_MARGIN} /> margin
              <LegendSwatch color={COLOR_PADDING} /> padding
            </>
          )}
        </span>
      </div>
    </div>
  );
}

function XRayLayer({
  layer,
  fit,
  zoom,
  pan,
  outlineColor,
  textColor,
  isHover,
  isSelected,
  forceOutline,
  showImages,
  showSelfSpacing,
  labelMode,
}: {
  layer: LayerEntry;
  fit: Fit;
  zoom: number;
  pan: { x: number; y: number };
  outlineColor: string;
  textColor: string;
  isHover: boolean;
  isSelected: boolean;
  forceOutline: boolean;
  showImages: boolean;
  showSelfSpacing: boolean;
  labelMode: 'token' | 'px';
}) {
  const { rect, padding, margin, radius, text, font, content } = layer;
  const s = fit.baseScale * zoom;
  const offX = fit.offsetX + pan.x;
  const offY = fit.offsetY + pan.y;
  const borderBox = {
    left: offX + rect.x * s,
    top: offY + rect.y * s,
    width: rect.w * s,
    height: rect.h * s,
  };
  const marginBox = {
    left: borderBox.left - margin.l * s,
    top: borderBox.top - margin.t * s,
    width: borderBox.width + (margin.l + margin.r) * s,
    height: borderBox.height + (margin.t + margin.b) * s,
  };

  const hasMargin = margin.l > 0 || margin.r > 0 || margin.t > 0 || margin.b > 0;
  const hasPadding = padding.l > 0 || padding.r > 0 || padding.t > 0 || padding.b > 0;
  // IMG rendering its bitmap replaces the placeholder outline (selection /
  // hover / wireframe strokes still apply on top).
  const showingImageContent = content?.kind === 'img' && showImages;
  const effectiveHasOutline = showingImageContent ? false : layer.hasOutline;
  const drawOutline = effectiveHasOutline || forceOutline || isSelected || isHover;
  // "Wireframe-only" = an outline that's only here because the show-wireframes
  // toggle forced it on. Render dashed + 40% so it reads as supplementary,
  // not as a real visible boundary.
  const isWireframeOnly = forceOutline && !effectiveHasOutline && !isSelected && !isHover;
  const strokeColor = isSelected ? COLOR_SELECTED : isHover ? COLOR_HOVER : outlineColor;
  const strokeWidth = isSelected ? 1.5 : isWireframeOnly ? 1.5 : 1;
  const strokeStyle = isWireframeOnly ? 'dashed' : 'solid';
  const outlineOpacity = isWireframeOnly ? 0.45 : 1;
  const radiusCss = `${radius.tl * s}px ${radius.tr * s}px ${radius.br * s}px ${radius.bl * s}px`;

  return (
    <>
      {showSelfSpacing && hasMargin && (
        <HatchedRing
          outerBox={marginBox}
          spacing={{ t: margin.t * s, r: margin.r * s, b: margin.b * s, l: margin.l * s }}
          pattern={HATCH_MARGIN}
        />
      )}
      {showSelfSpacing && hasPadding && (
        <HatchedRing
          outerBox={borderBox}
          spacing={{ t: padding.t * s, r: padding.r * s, b: padding.b * s, l: padding.l * s }}
          pattern={HATCH_PADDING}
        />
      )}

      {content && (content.kind === 'svg' || showImages) && (
        <ContentLayer
          content={content}
          borderBox={borderBox}
          radiusCss={radiusCss}
          outlineColor={outlineColor}
          clipBox={
            content.kind === 'img' && content.clip
              ? {
                  left: offX + content.clip.rect.x * s,
                  top: offY + content.clip.rect.y * s,
                  width: content.clip.rect.w * s,
                  height: content.clip.rect.h * s,
                }
              : null
          }
          clipRadiusCss={
            content.kind === 'img' && content.clip
              ? `${content.clip.radius.tl * s}px ${content.clip.radius.tr * s}px ${content.clip.radius.br * s}px ${content.clip.radius.bl * s}px`
              : ''
          }
        />
      )}

      {drawOutline && (
        <div
          style={{
            position: 'absolute',
            ...borderBox,
            boxSizing: 'border-box',
            border: `${strokeWidth}px ${strokeStyle} ${strokeColor}`,
            borderRadius: radiusCss,
            opacity: outlineOpacity,
            pointerEvents: 'none',
            ...(isSelected ? { boxShadow: `0 0 14px rgba(154,166,187,0.35)` } : null),
          }}
        />
      )}

      {text !== null && font && (
        // Lay the text out at its NATURAL size in a NATURAL-width box, then
        // scale the whole box geometrically. Scaling font-size / box-width
        // independently breaks wrapping at small zoom (glyph advances don't
        // scale linearly with font-size), so text that fit on one line at 1×
        // would wrap when zoomed out. A single transform keeps wrapping
        // pixel-identical to the source at every zoom level.
        <div
          style={{
            position: 'absolute',
            left: borderBox.left,
            top: borderBox.top,
            width: rect.w,
            height: rect.h,
            transform: `scale(${s})`,
            transformOrigin: 'top left',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            overflow: 'hidden',
            paddingLeft: padding.l,
            paddingRight: padding.r,
            paddingTop: padding.t,
            paddingBottom: padding.b,
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              // Full content-box width so wrapping breaks at the same points
              // as the source element and textAlign positions each line.
              width: '100%',
              fontFamily: font.family,
              fontSize: Math.max(font.size, 1),
              fontWeight: font.weight as React.CSSProperties['fontWeight'],
              fontStyle: font.style,
              lineHeight: font.lineHeightPx != null ? `${font.lineHeightPx}px` : 'normal',
              letterSpacing: font.letterSpacingPx != null ? `${font.letterSpacingPx}px` : 'normal',
              textTransform: font.textTransform as React.CSSProperties['textTransform'],
              textAlign: font.textAlign as React.CSSProperties['textAlign'],
              color: textColor,
              // Replay the source's wrapping mode. nowrap labels keep their
              // ellipsis; everything else wraps like the original.
              whiteSpace: font.whiteSpace as React.CSSProperties['whiteSpace'],
              overflow: 'hidden',
              textOverflow: font.textOverflow as React.CSSProperties['textOverflow'],
              overflowWrap: 'break-word',
            }}
          >
            {text}
          </span>
        </div>
      )}

      {showSelfSpacing && (
        <SpacingLabels padding={padding} margin={margin} borderBox={borderBox} marginBox={marginBox} scale={s} labelMode={labelMode} />
      )}
    </>
  );
}

// 4 strips around an inner rectangle, each filled with the hatch pattern.
// Background-position is anchored to the outer box's top-left so the diagonal
// stripes align across all 4 strips (no visual seam at the corners).
function HatchedRing({
  outerBox,
  spacing,
  pattern,
}: {
  outerBox: { left: number; top: number; width: number; height: number };
  spacing: Box; // already scaled to screen px
  pattern: string;
}) {
  const { left, top, width, height } = outerBox;
  const { t, r, b, l } = spacing;
  const midH = Math.max(0, height - t - b);
  const strip = (offX: number, offY: number, w: number, h: number): CSSProperties => ({
    position: 'absolute',
    left: left + offX,
    top: top + offY,
    width: w,
    height: h,
    background: pattern,
    backgroundPosition: `${-offX}px ${-offY}px`,
    pointerEvents: 'none',
  });
  return (
    <>
      {t > 0 && <div style={strip(0, 0, width, t)} />}
      {b > 0 && <div style={strip(0, height - b, width, b)} />}
      {l > 0 && midH > 0 && <div style={strip(0, t, l, midH)} />}
      {r > 0 && midH > 0 && <div style={strip(width - r, t, r, midH)} />}
    </>
  );
}

// Renders cloned content (SVG icons as hollow strokes, IMGs as bitmaps).
// SVGs go through the imperative ref path so we can transform the clone's
// shapes to stroke-only. IMGs use plain JSX, optionally wrapped in a
// clip-ancestor-shaped div so e.g. avatar circles render as circles.
function ContentLayer({
  content,
  borderBox,
  radiusCss,
  outlineColor,
  clipBox,
  clipRadiusCss,
}: {
  content: NonNullable<LayerEntry['content']>;
  borderBox: { left: number; top: number; width: number; height: number };
  radiusCss: string;
  outlineColor: string;
  clipBox: { left: number; top: number; width: number; height: number } | null;
  clipRadiusCss: string;
}) {
  if (content.kind === 'svg') {
    return <SvgContent content={content} borderBox={borderBox} radiusCss={radiusCss} outlineColor={outlineColor} />;
  }
  return <ImgContent content={content} borderBox={borderBox} radiusCss={radiusCss} clipBox={clipBox} clipRadiusCss={clipRadiusCss} />;
}

function SvgContent({
  content,
  borderBox,
  radiusCss,
  outlineColor,
}: {
  content: Extract<NonNullable<LayerEntry['content']>, { kind: 'svg' }>;
  borderBox: { left: number; top: number; width: number; height: number };
  radiusCss: string;
  outlineColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;
    wrap.innerHTML = '';
    const clone = content.source.cloneNode(true) as SVGSVGElement;
    clone.removeAttribute('width');
    clone.removeAttribute('height');
    clone.style.width = '100%';
    clone.style.height = '100%';
    clone.style.display = 'block';
    const shapes = clone.querySelectorAll('path, circle, rect, ellipse, polygon, polyline, line');
    shapes.forEach((s) => {
      s.setAttribute('fill', 'none');
      s.setAttribute('stroke', 'currentColor');
      s.setAttribute('stroke-width', '1.5');
      s.setAttribute('vector-effect', 'non-scaling-stroke');
      s.removeAttribute('fill-opacity');
    });
    wrap.appendChild(clone);
  }, [content]);
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        ...borderBox,
        color: outlineColor,
        borderRadius: radiusCss,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    />
  );
}

function ImgContent({
  content,
  borderBox,
  radiusCss,
  clipBox,
  clipRadiusCss,
}: {
  content: Extract<NonNullable<LayerEntry['content']>, { kind: 'img' }>;
  borderBox: { left: number; top: number; width: number; height: number };
  radiusCss: string;
  clipBox: { left: number; top: number; width: number; height: number } | null;
  clipRadiusCss: string;
}) {
  const imgStyle: CSSProperties = {
    display: 'block',
    objectFit: content.objectFit as CSSProperties['objectFit'],
    objectPosition: content.objectPosition,
  };

  if (clipBox) {
    // Clip-ancestor-shaped wrapper; IMG positioned inside at its true rect
    // relative to the wrapper. Intersection of ancestor's overflow:hidden +
    // shape gives the visible portion.
    return (
      <div
        style={{
          position: 'absolute',
          ...clipBox,
          borderRadius: clipRadiusCss,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <img
          src={content.src}
          alt=""
          style={{
            ...imgStyle,
            position: 'absolute',
            left: borderBox.left - clipBox.left,
            top: borderBox.top - clipBox.top,
            width: borderBox.width,
            height: borderBox.height,
          }}
        />
      </div>
    );
  }

  // No clip ancestor — render at the IMG's own rect with its own radius.
  return (
    <div
      style={{
        position: 'absolute',
        ...borderBox,
        borderRadius: radiusCss,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <img src={content.src} alt="" style={{ ...imgStyle, width: '100%', height: '100%' }} />
    </div>
  );
}

function DistanceLines({
  selected,
  hovered,
  fit,
  scale,
  pan,
  labelMode,
}: {
  selected: Rect;
  hovered: Rect;
  fit: Fit;
  scale: number;
  pan: { x: number; y: number };
  labelMode: 'token' | 'px';
}) {
  const offX = fit.offsetX + pan.x;
  const offY = fit.offsetY + pan.y;
  const toScreen = (x: number, y: number) => ({
    x: offX + x * scale,
    y: offY + y * scale,
  });

  const sTL = toScreen(selected.x, selected.y);
  const sBR = toScreen(selected.x + selected.w, selected.y + selected.h);
  const hTL = toScreen(hovered.x, hovered.y);
  const hBR = toScreen(hovered.x + hovered.w, hovered.y + hovered.h);

  const vOverlap = !(hovered.y + hovered.h <= selected.y || hovered.y >= selected.y + selected.h);
  const hOverlap = !(hovered.x + hovered.w <= selected.x || hovered.x >= selected.x + selected.w);

  type Tape = { kind: 'v' | 'h'; x1: number; y1: number; x2: number; y2: number; px: number };
  const tapes: Tape[] = [];

  if (vOverlap && hOverlap) {
    // Overlapping/nested: 4 corresponding-edge distances. Anchor each on the
    // midpoint of the overlapping span on the orthogonal axis for readability.
    const midX = (Math.max(sTL.x, hTL.x) + Math.min(sBR.x, hBR.x)) / 2;
    const midY = (Math.max(sTL.y, hTL.y) + Math.min(sBR.y, hBR.y)) / 2;
    if (Math.abs(selected.y - hovered.y) > 0.5) tapes.push({ kind: 'v', x1: midX, x2: midX, y1: sTL.y, y2: hTL.y, px: Math.abs(selected.y - hovered.y) });
    if (Math.abs((selected.y + selected.h) - (hovered.y + hovered.h)) > 0.5) tapes.push({ kind: 'v', x1: midX, x2: midX, y1: sBR.y, y2: hBR.y, px: Math.abs((selected.y + selected.h) - (hovered.y + hovered.h)) });
    if (Math.abs(selected.x - hovered.x) > 0.5) tapes.push({ kind: 'h', x1: sTL.x, x2: hTL.x, y1: midY, y2: midY, px: Math.abs(selected.x - hovered.x) });
    if (Math.abs((selected.x + selected.w) - (hovered.x + hovered.w)) > 0.5) tapes.push({ kind: 'h', x1: sBR.x, x2: hBR.x, y1: midY, y2: midY, px: Math.abs((selected.x + selected.w) - (hovered.x + hovered.w)) });
  } else {
    // Disjoint on at least one axis. Show a gap tape per disjoint axis,
    // anchored at the midpoint of the overlapping span on the other axis (or
    // halfway between the boxes if disjoint on both).
    if (!vOverlap) {
      const above = hovered.y + hovered.h <= selected.y;
      const fromY = above ? hBR.y : sBR.y;
      const toY = above ? sTL.y : hTL.y;
      const overlapL = Math.max(sTL.x, hTL.x);
      const overlapR = Math.min(sBR.x, hBR.x);
      const x = hOverlap ? (overlapL + overlapR) / 2 : (Math.max(sTL.x, hTL.x) + Math.min(sBR.x, hBR.x)) / 2;
      tapes.push({ kind: 'v', x1: x, x2: x, y1: fromY, y2: toY, px: Math.abs(selected.y - hovered.y - (above ? hovered.h : -selected.h)) });
    }
    if (!hOverlap) {
      const left = hovered.x + hovered.w <= selected.x;
      const fromX = left ? hBR.x : sBR.x;
      const toX = left ? sTL.x : hTL.x;
      const overlapT = Math.max(sTL.y, hTL.y);
      const overlapB = Math.min(sBR.y, hBR.y);
      const y = vOverlap ? (overlapT + overlapB) / 2 : (Math.max(sTL.y, hTL.y) + Math.min(sBR.y, hBR.y)) / 2;
      tapes.push({ kind: 'h', x1: fromX, x2: toX, y1: y, y2: y, px: Math.abs(selected.x - hovered.x - (left ? hovered.w : -selected.w)) });
    }
  }

  // Hovered-element stroke so the user sees what they're measuring against.
  const hoverStroke: CSSProperties = {
    position: 'absolute',
    left: hTL.x,
    top: hTL.y,
    width: hBR.x - hTL.x,
    height: hBR.y - hTL.y,
    border: `1px dashed ${COLOR_DISTANCE}`,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  };

  const labelBg = COLOR_LABEL_BG;
  const labelColor = COLOR_LABEL_TEXT;

  return (
    <>
      <div style={hoverStroke} />
      {tapes.map((t, i) => {
        const midX = (t.x1 + t.x2) / 2;
        const midY = (t.y1 + t.y2) / 2;
        const lineStyle: CSSProperties = {
          position: 'absolute',
          background: COLOR_DISTANCE,
          pointerEvents: 'none',
        };
        if (t.kind === 'v') {
          Object.assign(lineStyle, {
            left: t.x1 - 0.5,
            top: Math.min(t.y1, t.y2),
            width: 1,
            height: Math.abs(t.y2 - t.y1),
          });
        } else {
          Object.assign(lineStyle, {
            left: Math.min(t.x1, t.x2),
            top: t.y1 - 0.5,
            width: Math.abs(t.x2 - t.x1),
            height: 1,
          });
        }
        return (
          <span key={i}>
            <div style={lineStyle} />
            <span
              style={{
                position: 'absolute',
                left: midX,
                top: midY,
                transform: 'translate(-50%, -50%)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                fontSize: 10,
                lineHeight: 1,
                padding: '2px 5px',
                borderRadius: 3,
                background: labelBg,
                color: labelColor,
                border: `1px solid ${COLOR_DISTANCE}`,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {fmtSpacing(t.px, labelMode)}
            </span>
          </span>
        );
      })}
    </>
  );
}

function SpacingLabels({
  padding,
  margin,
  borderBox,
  marginBox,
  scale,
  labelMode,
}: {
  padding: Box;
  margin: Box;
  borderBox: { left: number; top: number; width: number; height: number };
  marginBox: { left: number; top: number; width: number; height: number };
  scale: number;
  labelMode: 'token' | 'px';
}) {
  const labelStyle: CSSProperties = {
    position: 'absolute',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 10,
    lineHeight: 1,
    padding: '2px 4px',
    borderRadius: 3,
    background: 'rgba(0,0,0,0.65)',
    color: '#fff',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    transform: 'translate(-50%, -50%)',
  };

  const out: React.ReactElement[] = [];
  const push = (key: string, x: number, y: number, value: number) => {
    out.push(
      <span key={key} style={{ ...labelStyle, left: x, top: y }}>
        {fmtSpacing(value, labelMode)}
      </span>,
    );
  };
  if (padding.t > 0 && padding.t * scale > 8) push('pt', borderBox.left + borderBox.width / 2, borderBox.top + (padding.t * scale) / 2, padding.t);
  if (padding.b > 0 && padding.b * scale > 8) push('pb', borderBox.left + borderBox.width / 2, borderBox.top + borderBox.height - (padding.b * scale) / 2, padding.b);
  if (padding.l > 0 && padding.l * scale > 8) push('pl', borderBox.left + (padding.l * scale) / 2, borderBox.top + borderBox.height / 2, padding.l);
  if (padding.r > 0 && padding.r * scale > 8) push('pr', borderBox.left + borderBox.width - (padding.r * scale) / 2, borderBox.top + borderBox.height / 2, padding.r);
  if (margin.t > 0 && margin.t * scale > 8) push('mt', borderBox.left + borderBox.width / 2, marginBox.top + (margin.t * scale) / 2, margin.t);
  if (margin.b > 0 && margin.b * scale > 8) push('mb', borderBox.left + borderBox.width / 2, marginBox.top + marginBox.height - (margin.b * scale) / 2, margin.b);
  if (margin.l > 0 && margin.l * scale > 8) push('ml', marginBox.left + (margin.l * scale) / 2, borderBox.top + borderBox.height / 2, margin.l);
  if (margin.r > 0 && margin.r * scale > 8) push('mr', marginBox.left + marginBox.width - (margin.r * scale) / 2, borderBox.top + borderBox.height / 2, margin.r);
  return <>{out}</>;
}

// ─── classification helpers ──────────────────────────────────────────────

function shouldDrawOutline(el: HTMLElement | SVGElement, cs: CSSStyleDeclaration, border: Box, radius: Corners): boolean {
  // SVG roots render via cloned, stroked content — no placeholder needed.
  // IMG falls through to the content-leaf check below (placeholder rect),
  // since we don't render the image bitmap in wireframe mode.
  if (el instanceof SVGSVGElement) return false;
  if (CONTENT_LEAF_TAGS.has(el.tagName.toUpperCase())) return true;
  if (anySide(border)) return true;
  if (radius.tl > 0 || radius.tr > 0 || radius.bl > 0 || radius.br > 0) return true;
  if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') return true;
  if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
  return false;
}

function getRenderableContent(el: HTMLElement | SVGElement, cs: CSSStyleDeclaration): LayerEntry['content'] {
  if (el instanceof SVGSVGElement) {
    return { kind: 'svg', source: el, color: cs.color };
  }
  if (el instanceof HTMLImageElement && el.src) {
    return {
      kind: 'img',
      src: el.src,
      objectFit: cs.objectFit,
      objectPosition: cs.objectPosition,
      clip: null, // filled in by the walk
    };
  }
  return null;
}

// Walk up to `maxDepth` ancestors; return the nearest one that clips its
// contents (overflow != visible OR a clip-path). Used to shape the wrapper
// around image content so it matches what the prototype actually shows.
function getClipAncestor(el: HTMLElement | SVGElement, maxDepth: number): { el: HTMLElement; radius: Corners } | null {
  let cur: Element | null = el.parentElement;
  let depth = 0;
  while (cur && depth < maxDepth) {
    if (cur instanceof HTMLElement) {
      const cs = window.getComputedStyle(cur);
      const clipped =
        cs.overflow !== 'visible' ||
        cs.overflowX !== 'visible' ||
        cs.overflowY !== 'visible' ||
        cs.clipPath !== 'none';
      if (clipped) return { el: cur, radius: readCorners(cs) };
    }
    cur = cur.parentElement;
    depth++;
  }
  return null;
}

function anySide(b: Box) {
  return b.t > 0 || b.r > 0 || b.b > 0 || b.l > 0;
}

function getDirectText(el: HTMLElement | SVGElement): string | null {
  let txt = '';
  for (const c of Array.from(el.childNodes)) {
    if (c.nodeType === Node.TEXT_NODE) txt += c.textContent ?? '';
  }
  txt = txt.trim();
  return txt.length > 0 ? txt : null;
}

// Normalize a text run's whitespace the way the browser would, given the
// element's computed `white-space`. `normal`/`nowrap` collapse every run of
// whitespace (incl. newlines from source indentation) to a single space;
// `pre`/`pre-wrap`/`break-spaces` preserve spaces AND newlines verbatim (only
// trimming blank outer lines); `pre-line` collapses spaces/tabs but keeps
// newlines. Preserving the source's line structure is what makes a
// `whitespace-pre-wrap` block (message bodies, etc.) render in x-ray the same
// paragraphs/bullets it shows in the live UI instead of one flattened run.
function normalizeWsForMode(s: string, whiteSpace: string): string {
  if (whiteSpace === 'pre' || whiteSpace === 'pre-wrap' || whiteSpace === 'break-spaces') {
    return s.replace(/^\n+|\n+$/g, '');
  }
  if (whiteSpace === 'pre-line') {
    return s
      .replace(/[^\S\n]+/g, ' ') // collapse spaces/tabs, keep newlines
      .replace(/ *\n */g, '\n')
      .replace(/^\n+|\n+$/g, '');
  }
  return s.replace(/\s+/g, ' ').trim();
}

// True for phrasing/inline children that flow inside a text run (strong, em,
// a, span…). Block-level children, SVGs, and replaced content (img/input/…)
// are NOT — their presence means the element is a structural container, not a
// single text run, so we recurse into it instead of flattening to a string.
function isInlineChild(el: Element): boolean {
  if (CONTENT_LEAF_TAGS.has(el.tagName.toUpperCase())) return false;
  if (el instanceof SVGElement) return false;
  return window.getComputedStyle(el).display === 'inline';
}

// The text to render for this element as ONE run, or null if it isn't a text
// leaf. Two cases qualify:
//   • a leaf element with no element children but visible text, and
//   • an element whose direct text nodes are interleaved with inline children
//     only (e.g. `Tap <strong>Allow</strong> when…`) — render the full string.
// A container with no direct text (e.g. a flex header holding two spans) or
// with any block/replaced child returns null so the walk recurses normally.
function getTextBlock(el: HTMLElement | SVGElement, cs: CSSStyleDeclaration): string | null {
  const full = normalizeWsForMode(el.textContent ?? '', cs.whiteSpace);
  if (!full) return null;
  const children = Array.from(el.children);
  if (children.length === 0) return full; // simple text leaf
  if (getDirectText(el) === null) return null; // structural container, no own text
  for (const c of children) {
    if (!isInlineChild(c)) return null; // a block/replaced child → recurse instead
  }
  return full; // inline text run
}

function readBox(cs: CSSStyleDeclaration, prefix: 'padding' | 'margin'): Box {
  return {
    t: parseFloat(cs.getPropertyValue(`${prefix}-top`)) || 0,
    r: parseFloat(cs.getPropertyValue(`${prefix}-right`)) || 0,
    b: parseFloat(cs.getPropertyValue(`${prefix}-bottom`)) || 0,
    l: parseFloat(cs.getPropertyValue(`${prefix}-left`)) || 0,
  };
}

function readBorderWidth(cs: CSSStyleDeclaration): Box {
  return {
    t: parseFloat(cs.borderTopWidth) || 0,
    r: parseFloat(cs.borderRightWidth) || 0,
    b: parseFloat(cs.borderBottomWidth) || 0,
    l: parseFloat(cs.borderLeftWidth) || 0,
  };
}

function readCorners(cs: CSSStyleDeclaration): Corners {
  return {
    tl: parseFloat(cs.borderTopLeftRadius) || 0,
    tr: parseFloat(cs.borderTopRightRadius) || 0,
    br: parseFloat(cs.borderBottomRightRadius) || 0,
    bl: parseFloat(cs.borderBottomLeftRadius) || 0,
  };
}

function readFont(cs: CSSStyleDeclaration): LayerEntry['font'] {
  const lh = parseFloat(cs.lineHeight); // NaN for "normal"
  const ls = parseFloat(cs.letterSpacing); // NaN for "normal"
  return {
    family: cs.fontFamily,
    size: parseFloat(cs.fontSize) || 14,
    weight: cs.fontWeight,
    style: cs.fontStyle,
    lineHeightPx: Number.isFinite(lh) ? lh : null,
    letterSpacingPx: Number.isFinite(ls) ? ls : null,
    textAlign: cs.textAlign,
    textTransform: cs.textTransform,
    whiteSpace: cs.whiteSpace,
    textOverflow: cs.textOverflow,
  };
}

const layerKeyMap = new WeakMap<HTMLElement | SVGElement, number>();
let layerKeyCounter = 0;
function layerKey(el: HTMLElement | SVGElement) {
  let id = layerKeyMap.get(el);
  if (id == null) {
    id = ++layerKeyCounter;
    layerKeyMap.set(el, id);
  }
  return String(id);
}

function XRayGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="#fff" strokeWidth="1.2" />
      <rect x="5" y="5" width="6" height="6" rx="0.5" stroke="#fff" strokeWidth="1" strokeDasharray="1.5 1.5" />
      <line x1="8" y1="0.5" x2="8" y2="2" stroke="#fff" strokeWidth="1" />
      <line x1="8" y1="14" x2="8" y2="15.5" stroke="#fff" strokeWidth="1" />
      <line x1="0.5" y1="8" x2="2" y2="8" stroke="#fff" strokeWidth="1" />
      <line x1="14" y1="8" x2="15.5" y2="8" stroke="#fff" strokeWidth="1" />
    </svg>
  );
}

function LegendSwatch({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        background: color,
        borderRadius: 2,
        marginRight: 4,
        marginLeft: 8,
        verticalAlign: 'middle',
      }}
    />
  );
}

// Static parts only — `right` and `width` are set inline at render time
// since they depend on the live `inspectorWidth` prop.
const paneStyle: CSSProperties = {
  position: 'fixed',
  top: 16,
  bottom: 16,
  zIndex: 2000,
  background: PANE_BG,
  color: '#f5f1e8',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  fontSize: 13,
  overflow: 'hidden',
};

const headerStyle: CSSProperties = {
  padding: '10px 14px',
  borderBottom: `1px solid ${PANE_BORDER}`,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minWidth: 0,
};

const subtitleStyle: CSSProperties = {
  fontSize: 11,
  color: 'rgba(255,255,255,0.45)',
  marginLeft: 4,
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const footerStyle: CSSProperties = {
  padding: '10px 14px',
  borderTop: `1px solid ${PANE_BORDER}`,
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
};

const controlLabelStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 12,
  color: 'rgba(255,255,255,0.78)',
  cursor: 'pointer',
};

const pillBtnStyle: CSSProperties = {
  background: 'transparent',
  color: 'rgba(255,255,255,0.78)',
  border: '1px solid rgba(255,255,255,0.18)',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const pillBtnStyleSm: CSSProperties = {
  ...pillBtnStyle,
  padding: '2px 8px',
  fontSize: 11,
};

// Labeled 2+ value segmented control — matches the Inspector's Tok / Hex /
// Var segmented control look so the canvas-wide toolbars share one visual
// language. Caption sits to the left of the segment group; active segment
// gets the blue tint.
function SegmentedToggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: T; label: string; title?: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 3,
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: 'inline-flex',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {options.map((o, i) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              title={o.title}
              style={{
                background: active ? 'rgba(154,166,187,0.22)' : 'transparent',
                color: active ? '#cfe0ff' : 'rgba(255,255,255,0.55)',
                border: 0,
                borderLeft: i === 0 ? 0 : '1px solid rgba(255,255,255,0.12)',
                padding: '2px 8px',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const closeBtnStyle: CSSProperties = {
  background: 'transparent',
  color: 'rgba(255,255,255,0.6)',
  border: 'none',
  cursor: 'pointer',
  fontSize: 22,
  lineHeight: 1,
  padding: 0,
  flexShrink: 0,
};

const legendStyle: CSSProperties = {
  marginLeft: 'auto',
  fontSize: 11,
  color: 'rgba(255,255,255,0.6)',
  display: 'inline-flex',
  alignItems: 'center',
};
