// Walks up the parent chain from `el` and multiplies any CSS `transform`
// scale factors. Used by Inspector / XRay / ExplodedView to compensate for
// the DesignCanvas viewport's `transform: scale(N)` — without this, an
// element's getBoundingClientRect comes back at *visual* size (post-canvas-
// zoom) while its computed paddings / font-sizes stay at natural CSS px,
// and clones look like they were "drag-resized" rather than scaled.
//
// Assumes uniform scaling (a === d in the matrix), which is true for the
// canvas. Returns 1 if no transforming ancestor exists.
export function getAncestorScale(el: Element): number {
  let scale = 1;
  let cur: Element | null = el.parentElement;
  while (cur) {
    const t = window.getComputedStyle(cur).transform;
    if (t && t !== 'none') {
      const m = new DOMMatrix(t);
      if (m.a !== 0) scale *= m.a;
    }
    cur = cur.parentElement;
  }
  return scale || 1;
}
