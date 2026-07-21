// ExplodedView.tsx — 3D explode pane for the Inspector.
//
// Renders a left-anchored drawer next to the Inspector. Takes the currently
// selected DOM node, deep-clones the subtree, and pushes each descendant
// outward on Z (translateZ(depth × gap)) inside a preserve-3d scene. The user
// orbits with mouse drag, zooms with scroll, adjusts the depth gap, and can
// isolate a single layer. Clicking a layer in 3D drives the main Inspector
// selection — the pane is a picker + visualization, not a separate info
// surface (single mental model with the Hierarchy tree).

import type { CSSProperties } from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getAncestorScale } from './getAncestorScale';
import { muteClonedMedia } from './muteClonedMedia';
import { inlineCustomProperties, themeScopeHostOf } from './Inspector';

type Props = {
  node: HTMLElement;
  onPickHost: (host: Element) => void;
  onClose: () => void;
  // Live width of the Inspector panel to the right of this pane. The pane's
  // right edge anchors to `INSPECTOR_GAP + inspectorWidth + INSPECTOR_GAP`
  // so dragging the inspector wider/narrower keeps this pane flush.
  inspectorWidth: number;
  // Changes whenever the source DOM's appearance changed for a reason the
  // other deps can't see (e.g. forced hover/active states) — bumps the
  // clone-scene rebuild so the exploded layers re-capture it.
  rebuildKey?: string;
};

const INSPECTOR_GAP = 16;

type StyledElement = HTMLElement | SVGElement;

type CloneEntry = {
  clone: StyledElement;
  origin: StyledElement;
  depth: number;
  // True if the origin has any visible visual property (bg / border / radius
  // / box-shadow / outline / filter / content leaf / direct text). Only
  // significant layers respond to hover + pick — clicking a layout wrapper
  // walks up to the nearest visually-meaningful ancestor.
  significant: boolean;
};

const CONTENT_LEAF_TAGS = new Set([
  'IMG', 'SVG', 'INPUT', 'TEXTAREA', 'CANVAS', 'VIDEO', 'AUDIO', 'PICTURE', 'IFRAME',
]);

function isVisuallySignificant(el: StyledElement, cs: CSSStyleDeclaration): boolean {
  const bg = cs.backgroundColor;
  if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') return true;
  if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
  const bw = (k: string) => parseFloat(cs.getPropertyValue(k)) || 0;
  if (bw('border-top-width') || bw('border-right-width') || bw('border-bottom-width') || bw('border-left-width')) return true;
  if (bw('border-top-left-radius') || bw('border-top-right-radius') || bw('border-bottom-left-radius') || bw('border-bottom-right-radius')) return true;
  if (cs.boxShadow && cs.boxShadow !== 'none') return true;
  if (cs.outlineStyle && cs.outlineStyle !== 'none' && (parseFloat(cs.outlineWidth) || 0) > 0) return true;
  if (cs.filter && cs.filter !== 'none') return true;
  if (cs.backdropFilter && cs.backdropFilter !== 'none') return true;
  if (CONTENT_LEAF_TAGS.has(el.tagName.toUpperCase())) return true;
  for (const c of Array.from(el.childNodes)) {
    if (c.nodeType === Node.TEXT_NODE && (c.textContent ?? '').trim().length > 0) return true;
  }
  return false;
}

const PANE_BG = '#18191b';
const PANE_BORDER = 'rgba(255,255,255,0.08)';

export function ExplodedView({ node, onPickHost, onClose, inspectorWidth, rebuildKey }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  // scaleWrap separates scale (transitioned, for isolate zoom) from rotate
  // (not transitioned, so drag stays 1:1). rootClone lives inside scaleWrap.
  const scaleWrapRef = useRef<HTMLDivElement>(null);
  const clonesRef = useRef<CloneEntry[]>([]);
  const rootCloneRef = useRef<HTMLElement | null>(null);

  // The explode is rooted at whichever element was selected when the pane
  // opened. Picking a sublayer inside the pane updates the right-hand
  // Inspector but does NOT re-root the pane — we only re-root when the
  // selection moves outside the current exploded subtree (e.g. the user
  // clicks somewhere else on the canvas).
  const [explodeRoot, setExplodeRoot] = useState<HTMLElement>(node);
  useEffect(() => {
    if (!explodeRoot.contains(node)) setExplodeRoot(node);
  }, [node, explodeRoot]);

  const [rotX, setRotX] = useState(-18);
  const [rotY, setRotY] = useState(28);
  const [zoom, setZoom] = useState(1);
  const [gap, setGap] = useState(10);
  const [isolate, setIsolate] = useState(false);
  const [bgMode, setBgMode] = useState<'dark' | 'light'>('dark');
  // Lets the user temporarily hide the picked-glow without deselecting.
  // Resets every time isolate toggles or a new layer is picked.
  const [dimGlow, setDimGlow] = useState(false);
  useEffect(() => {
    setDimGlow(false);
  }, [isolate]);
  const [stageSize, setStageSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const [layerCount, setLayerCount] = useState(0);

  // ESC closes the pane (stop propagation so the main Inspector's ESC handler
  // — which exits inspect mode entirely — doesn't also fire).
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

  // Inject the slab/hover/picked stylesheet once per mount. CSS-driven outlines
  // + box-shadow give each clone a slight "thickness" feel without requiring
  // pseudo-elements (which would need position:relative and risk breaking
  // layouts that depend on existing positioning ancestors).
  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-explode-style', '');
    style.textContent = `
      [data-explode-clone].explode-hover {
        outline: 2px solid #9aa6bb !important;
        outline-offset: 0 !important;
        box-shadow: 0 0 22px rgba(154,166,187,0.45) !important;
      }
      [data-explode-clone].explode-picked {
        outline: 2px solid #9aa6bb !important;
        outline-offset: 0 !important;
        box-shadow: 0 0 24px rgba(154,166,187,0.6) !important;
      }
      /* Spring icons set pointer-events:none on .sui-icon-svg so the outer
         button receives clicks. In the exploded scene we want the icon to be
         a pick target, so restore hit-testing on every cloned SVG. */
      [data-explode-clone] svg,
      [data-explode-clone] svg * {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  // Measure stage so we can compute a base scale that fits the selection.
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

  // Build / rebuild the cloned subtree whenever the explode root changes.
  // Note: this is `explodeRoot`, not `node` — picking a sublayer updates the
  // main inspector but does not rebuild this scene.
  useLayoutEffect(() => {
    const scene = sceneRef.current;
    const scaleWrap = scaleWrapRef.current;
    if (!scene || !scaleWrap) return;
    scaleWrap.innerHTML = '';
    clonesRef.current = [];
    rootCloneRef.current = null;

    const rawRect = explodeRoot.getBoundingClientRect();
    if (!rawRect.width || !rawRect.height) {
      setLayerCount(0);
      return;
    }
    // Compensate for DesignCanvas viewport transform so the clone is sized at
    // its natural CSS dimensions, not the post-canvas-zoom visual size.
    const canvasScale = getAncestorScale(explodeRoot);
    const rect = { width: rawRect.width / canvasScale, height: rawRect.height / canvasScale };

    const rootClone = explodeRoot.cloneNode(true) as HTMLElement;
    // cloneNode drops React's property-only `muted` — re-mute or every cloned
    // video tile autoplays with sound.
    muteClonedMedia(rootClone);
    // Re-supply ancestor-defined CSS vars the clone's subtree references
    // (Squircle fills, Button bg vars, …) — the pane is outside them all.
    inlineCustomProperties(explodeRoot, rootClone);

    // Walk original + clone in lockstep so we can build a depth-indexed map.
    // SVG nodes count: they're DOM elements with their own picker semantics
    // (icons are typically the leaf the designer cares about). We don't
    // descend INTO an svg's path/g children — the svg root is the picker
    // unit, same convention X-ray uses.
    const entries: CloneEntry[] = [];
    const walk = (orig: Element, clo: Element, depth: number) => {
      if (
        (orig instanceof HTMLElement || orig instanceof SVGElement) &&
        (clo instanceof HTMLElement || clo instanceof SVGElement)
      ) {
        const significant = isVisuallySignificant(orig, window.getComputedStyle(orig));
        entries.push({ clone: clo, origin: orig, depth, significant });
      }
      if (orig instanceof SVGSVGElement) return;
      const oc = Array.from(orig.children);
      const cc = Array.from(clo.children);
      const n = Math.min(oc.length, cc.length);
      for (let i = 0; i < n; i++) walk(oc[i], cc[i], depth + 1);
    };
    walk(explodeRoot, rootClone, 0);

    // Neutralize properties that would break the 3D context.
    //
    // SVGs are special: they stay in `entries` (so an icon click still picks
    // its host SVG) but they do NOT get their own 3D context or translateZ.
    // Applying `transform-style: preserve-3d` and translateZ to an <svg> forces
    // the browser to promote it to its own compositing layer rasterized at the
    // pre-scale resolution, then scale it up — which turns crisp Spring
    // Squircle shapes into a soft blob in the scene. Letting the SVG stay
    // flat-with-its-HTML-parent keeps the vector crisp at any zoom.
    for (const { clone } of entries) {
      const cs = window.getComputedStyle(clone);
      const isSvg = clone instanceof SVGElement;
      if (!isSvg) {
        clone.style.transformStyle = 'preserve-3d';
      }
      clone.style.transition = 'none';
      clone.style.animation = 'none';
      if (
        cs.overflow !== 'visible' ||
        cs.overflowX !== 'visible' ||
        cs.overflowY !== 'visible'
      ) {
        clone.style.overflow = 'visible';
      }
      if (cs.position === 'fixed') {
        clone.style.position = 'absolute';
      }
      // Strip any baked-in transforms — we'll set our own translateZ below.
      // Keep the root's transform stripped too so it sits flush in the scene.
      clone.style.removeProperty('transform');
      const depth = entries.find((e) => e.clone === clone)?.depth ?? 0;
      clone.setAttribute('data-explode-clone', '');
      clone.setAttribute('data-explode-depth', String(depth));
    }

    // Root sits at the scene origin with its natural size.
    rootClone.style.position = 'relative';
    rootClone.style.margin = '0';
    rootClone.style.width = `${rect.width}px`;
    rootClone.style.height = `${rect.height}px`;
    rootClone.style.flexShrink = '0';
    rootClone.style.boxSizing = 'border-box';

    // The exploded clones live in the inspector pane, outside the source's
    // theme scope, so they'd render in the global (light) theme. Spring's
    // <ThemeProvider scope="…"> injects that scope's token rule globally
    // ([data-sui-theme-scope="…"] { --sui-colors-… }), so re-stamping the
    // source's scope id on the clone root re-applies the scoped (e.g. dark)
    // theme to the whole exploded subtree. Mirrors the standard preview fix.
    // (If explodeRoot is itself the scope host, cloneNode already copied the
    // attribute — re-stamping the same value is a no-op.)
    const scopeHost = themeScopeHostOf(explodeRoot);
    const scopeId = scopeHost?.getAttribute('data-sui-theme-scope');
    if (scopeId) rootClone.setAttribute('data-sui-theme-scope', scopeId);

    scaleWrap.appendChild(rootClone);
    rootCloneRef.current = rootClone;
    clonesRef.current = entries;
    setLayerCount(entries.length);

    // Capture-phase click handler on the scene: walk up from the target to
    // find the first *significant* clone (skip layout-only wrappers), then
    // dispatch onPickHost with its origin.
    const onSceneClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      let picked: CloneEntry | null = null;
      let cur: Element | null = target;
      while (cur) {
        const match = entries.find((entry) => entry.clone === cur);
        if (match && match.significant) {
          picked = match;
          break;
        }
        cur = cur.parentElement;
      }
      if (!picked) return;
      e.stopPropagation();
      e.preventDefault();
      setDimGlow(false);
      onPickHost(picked.origin);
    };
    scene.addEventListener('click', onSceneClick, true);

    return () => {
      scene.removeEventListener('click', onSceneClick, true);
    };
  }, [explodeRoot, onPickHost, rebuildKey]);

  // Empty-stage click: dim the picked glow without deselecting. The scene's
  // capture-phase click handler stops propagation when a clone is hit, so this
  // bubble-phase stage handler only fires for clicks on empty backdrop.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onStageClick = () => setDimGlow(true);
    stage.addEventListener('click', onStageClick);
    return () => stage.removeEventListener('click', onStageClick);
  }, []);

  // Apply translateZ to each clone whenever `gap` changes. Cheap — no re-clone.
  // SVGs intentionally stay flat with their HTML parent — see the cloning
  // loop's comment about Squircle rasterization.
  useEffect(() => {
    for (const { clone, depth } of clonesRef.current) {
      if (clone instanceof SVGElement) continue;
      clone.style.transform = depth === 0 ? '' : `translateZ(${depth * gap}px)`;
    }
  }, [gap, layerCount]);

  // Derive picked clone from the live `node` prop (the right-hand Inspector
  // selection). Highlight the clone whose origin matches; if the selection
  // lives outside this exploded subtree, nothing is picked.
  //
  // When `isolate` is on and a layer is picked, hide everything except the
  // picked layer and its descendants. Uses `visibility` (not `opacity`)
  // because opacity multiplies down the tree — hiding an ancestor with
  // opacity:0 would also hide the picked descendant. Visibility lets a
  // descendant override an ancestor's hidden state. The picked layer stays
  // in its natural 3D position because preserve-3d composition still works
  // on hidden ancestors.
  useEffect(() => {
    const picked = explodeRoot.contains(node) ? node : null;
    const root = rootCloneRef.current;

    // Always reset first so toggling isolate off doesn't leave stale styles.
    for (const { clone } of clonesRef.current) {
      clone.style.visibility = '';
    }

    for (const { clone, origin } of clonesRef.current) {
      clone.classList.toggle(
        'explode-picked',
        origin === picked && !dimGlow,
      );
    }

    if (isolate && picked && root) {
      root.style.visibility = 'hidden';
      const pickedEntry = clonesRef.current.find((e) => e.origin === picked);
      if (pickedEntry) {
        pickedEntry.clone.style.visibility = 'visible';
        // Hide picked's element children so we see just its own box (padding,
        // border, background, and any inline text). Text nodes inherit
        // visibility:visible from picked and still render.
        for (const child of Array.from(pickedEntry.clone.children)) {
          if (child instanceof HTMLElement || child instanceof SVGElement) {
            child.style.visibility = 'hidden';
          }
        }
      }
    }
  }, [node, explodeRoot, isolate, layerCount, dimGlow]);

  // Pointer-driven hover highlight. Tracks the topmost clone under the cursor
  // (e.target respects the 3D stacking) and toggles the `explode-hover` class.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    let hovered: Element | null = null;
    // Significant clones only — layout wrappers don't receive hover glow.
    const significantClones = new Map<Element, CloneEntry>();
    for (const entry of clonesRef.current) {
      if (entry.significant) significantClones.set(entry.clone, entry);
    }

    const setHover = (next: Element | null) => {
      if (hovered === next) return;
      if (hovered) hovered.classList.remove('explode-hover');
      if (next) next.classList.add('explode-hover');
      hovered = next;
    };

    const onMove = (e: PointerEvent) => {
      const target = e.target as Element | null;
      let cur: Element | null = target;
      while (cur && !significantClones.has(cur)) cur = cur.parentElement;
      setHover(cur);
    };
    const onLeave = () => setHover(null);

    scene.addEventListener('pointermove', onMove);
    scene.addEventListener('pointerleave', onLeave);
    return () => {
      scene.removeEventListener('pointermove', onMove);
      scene.removeEventListener('pointerleave', onLeave);
      setHover(null);
    };
  }, [layerCount]);

  // Live mirrors of rotX/rotY so drag handlers can read the latest value
  // without subscribing them as effect dependencies (which would re-run the
  // effect on every rotation update and reset the drag state mid-drag).
  const rotXRef = useRef(rotX);
  const rotYRef = useRef(rotY);
  rotXRef.current = rotX;
  rotYRef.current = rotY;

  // Drag-to-orbit. Pointerdown on stage starts a drag session; move/up are
  // attached to window for the duration so the drag survives the cursor
  // leaving the stage. We deliberately do NOT call setPointerCapture — that
  // interferes with the trailing click event reaching clone elements, which
  // is how layer picking works.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let didDrag = false;
    let startX = 0;
    let startY = 0;
    let startRotX = 0;
    let startRotY = 0;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!didDrag && Math.abs(dx) + Math.abs(dy) < 5) return;
      didDrag = true;
      setRotY(startRotY + dx * 0.5);
      setRotX(clamp(startRotX - dy * 0.5, -89, 89));
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (didDrag) {
        // Block the trailing click so releasing an orbit drag doesn't also
        // pick a layer.
        const swallow = (ev: Event) => {
          ev.stopPropagation();
          ev.preventDefault();
          window.removeEventListener('click', swallow, true);
        };
        window.addEventListener('click', swallow, true);
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      didDrag = false;
      startX = e.clientX;
      startY = e.clientY;
      startRotX = rotXRef.current;
      startRotY = rotYRef.current;
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };

    stage.addEventListener('pointerdown', onDown);
    return () => {
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  // Scroll-to-zoom.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      setZoom((z) => clamp(z * factor, 0.2, 4));
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, []);

  // When isolate is on with a pick, we want the picked layer to become the
  // scene's center of gravity: shift `rootClone` so the picked layer's center
  // sits at the scene's geometric center (which is also the rotation pivot),
  // and swap `baseScale` to fit the picked layer's size instead of the whole
  // exploded subtree.
  const isolateFocus = useMemo(() => {
    if (!isolate) return null;
    const picked = explodeRoot.contains(node) ? node : null;
    if (!picked) return null;
    const rootRect = explodeRoot.getBoundingClientRect();
    const pickedRect = picked.getBoundingClientRect();
    if (!rootRect.width || !pickedRect.width) return null;
    // Divide by canvas scale to keep rects in the same natural CSS px space
    // as the rootClone's width/height (set above).
    const canvasScale = getAncestorScale(explodeRoot);
    const pickedCenterX =
      (pickedRect.left + pickedRect.width / 2 - rootRect.left) / canvasScale;
    const pickedCenterY =
      (pickedRect.top + pickedRect.height / 2 - rootRect.top) / canvasScale;
    return {
      offsetX: rootRect.width / 2 / canvasScale - pickedCenterX,
      offsetY: rootRect.height / 2 / canvasScale - pickedCenterY,
      pickedW: pickedRect.width / canvasScale,
      pickedH: pickedRect.height / canvasScale,
    };
  }, [isolate, node, explodeRoot, layerCount]);

  // Apply / clear the root-clone offset that centers the picked layer.
  // Transitioned so toggling isolate slides the layer to center smoothly.
  useEffect(() => {
    const root = rootCloneRef.current;
    if (!root) return;
    root.style.transition =
      'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)';
    root.style.transform = isolateFocus
      ? `translate(${isolateFocus.offsetX}px, ${isolateFocus.offsetY}px)`
      : '';
  }, [isolateFocus]);

  // Toggling isolate snaps zoom back to 1 so the new baseScale fits the
  // picked layer cleanly (rather than being multiplied by whatever zoom the
  // user dialed for the wider view).
  useEffect(() => {
    setZoom(1);
  }, [isolate]);

  // Base scale fits the original subtree into the stage with a comfortable
  // margin. When isolate is on, we fit the picked layer instead (capped at
  // 4× to avoid extreme zoom-ins on tiny picks).
  const baseScale = useMemo(() => {
    if (!stageSize.w || !stageSize.h) return 1;
    if (isolateFocus) {
      return Math.min(
        (stageSize.w * 0.7) / isolateFocus.pickedW,
        (stageSize.h * 0.7) / isolateFocus.pickedH,
        4,
      );
    }
    const root = rootCloneRef.current;
    if (!root) return 1;
    const w = parseFloat(root.style.width) || 1;
    const h = parseFloat(root.style.height) || 1;
    return Math.min((stageSize.w * 0.7) / w, (stageSize.h * 0.7) / h, 1);
  }, [stageSize, layerCount, isolateFocus]);

  const reset = () => {
    setRotX(-18);
    setRotY(28);
    setZoom(1);
    setGap(10);
    setIsolate(false);
  };

  return (
    <div
      data-inspector-ui
      style={{
        position: 'fixed',
        top: 16,
        right: INSPECTOR_GAP + inspectorWidth + INSPECTOR_GAP,
        bottom: 16,
        width: `min(720px, calc(100vw - ${INSPECTOR_GAP + inspectorWidth + INSPECTOR_GAP + INSPECTOR_GAP}px))`,
        zIndex: 2000,
        background: PANE_BG,
        color: '#f5f1e8',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        fontSize: 13,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: `1px solid ${PANE_BORDER}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 0,
        }}
      >
        <CubeGlyph />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
          3D Explode
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.45)',
            marginLeft: 4,
          }}
        >
          {layerCount} layer{layerCount === 1 ? '' : 's'} · drag to orbit · scroll to zoom
        </span>
        <button
          onClick={onClose}
          title="Close (Esc)"
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 22,
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        data-explode-stage={bgMode}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'grab',
          background:
            bgMode === 'dark'
              ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.4) 80%)'
              : 'radial-gradient(ellipse at center, #fafafa 0%, #d8d8d8 90%)',
          perspective: 1800,
        }}
      >
        <div
          ref={sceneRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transformStyle: 'preserve-3d',
            transform: `translate(-50%, -50%) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            pointerEvents: 'auto',
            willChange: 'transform',
          }}
        >
          <div
            ref={scaleWrapRef}
            style={{
              transformStyle: 'preserve-3d',
              transform: `scale(${baseScale * zoom})`,
              transition: 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
              willChange: 'transform',
            }}
          />
        </div>

        {/* Bottom-left tip about what the colored outline means. */}
        {explodeRoot.contains(node) && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              bottom: 12,
              padding: '4px 8px',
              borderRadius: 4,
              background: bgMode === 'dark' ? 'rgba(154,166,187,0.16)' : 'rgba(154,166,187,0.14)',
              color: bgMode === 'dark' ? '#9bb9ff' : '#1962d4',
              fontSize: 11,
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
              pointerEvents: 'none',
            }}
          >
            depth {depthOf(node, explodeRoot)} · picked
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: `1px solid ${PANE_BORDER}`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <label style={controlLabelStyle}>
          <span style={{ width: 38 }}>depth</span>
          <input
            type="range"
            min={0}
            max={140}
            step={2}
            value={gap}
            onChange={(e) => setGap(Number(e.currentTarget.value))}
            style={{ width: 140, accentColor: '#9aa6bb' }}
          />
          <span style={{ width: 36, textAlign: 'right', color: 'rgba(255,255,255,0.6)' }}>
            {gap}px
          </span>
        </label>

        <label style={controlLabelStyle}>
          <input
            type="checkbox"
            checked={isolate}
            onChange={(e) => setIsolate(e.currentTarget.checked)}
            style={{ accentColor: '#9aa6bb' }}
          />
          isolate picked
        </label>

        <button
          onClick={() => setBgMode((m) => (m === 'dark' ? 'light' : 'dark'))}
          style={pillBtnStyle}
          title="Toggle stage background"
        >
          {bgMode === 'dark' ? 'bg: dark' : 'bg: light'}
        </button>

        <button onClick={reset} style={pillBtnStyle} title="Reset orbit, zoom, depth">
          reset view
        </button>
      </div>
    </div>
  );
}

function CubeGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5l5.5 3v7L8 14.5l-5.5-3v-7L8 1.5zM8 1.5v6m0 0L2.5 4.5M8 7.5l5.5-3M8 7.5v7"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function depthOf(node: HTMLElement, root: HTMLElement): number {
  let depth = 0;
  let cur: HTMLElement | null = node;
  while (cur && cur !== root) {
    cur = cur.parentElement;
    depth++;
  }
  return cur === root ? depth : -1;
}
