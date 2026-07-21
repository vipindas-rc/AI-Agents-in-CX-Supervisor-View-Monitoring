/**
 * Rasterise a *frozen* snapshot of the area around the cursor at the moment a
 * comment is created — a true point-in-time record, unlike a live DOM clone
 * which drifts as the design changes.
 *
 * Renders the artboard once standalone (html2canvas reparents the node, so the
 * DesignCanvas viewport zoom transform is ignored and we get natural CSS px),
 * then crops a fixed window centered on the cursor drop point (cx, cy are the
 * pin's artboard-local coords). Returns a PNG data URL, or null on failure.
 *
 * Storage note: a data URL today (in-memory mock store). When the network client
 * lands this is the spot that switches to a Blob upload → a `previewUrl` column
 * on the comment row (see the project_comment_layer memory + BACKEND.md). The
 * capture/crop logic here is unchanged by that swap.
 */
const PREVIEW_W = 360;
const PREVIEW_H = 220;
// 1.5 keeps the ~300px-wide sidebar thumbnail crisp while shaving html2canvas's
// (off-critical-path) render cost vs. 2×.
const SCALE = 1.5;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export async function capturePreviewImage(
  artboardId: string,
  cx: number,
  cy: number,
): Promise<string | null> {
  try {
    const artboard = document.querySelector(
      `[data-dc-slot="${CSS.escape(artboardId)}"]`,
    ) as HTMLElement | null;
    if (!artboard) return null;

    const natW = artboard.offsetWidth;
    const natH = artboard.offsetHeight;
    if (!natW || !natH) return null;

    // Lazy-load so html2canvas (~50kb gz) only enters the bundle when someone
    // actually drops a comment.
    const html2canvas = (await import('html2canvas')).default;
    const full = await html2canvas(artboard, {
      backgroundColor: '#ffffff',
      scale: SCALE,
      logging: false,
      useCORS: true,
      imageTimeout: 1500,
      windowWidth: natW,
      windowHeight: natH,
      onclone: (doc) => {
        // Cross-origin images (e.g. pravatar.cc avatars) can't be read into the
        // capture canvas unless the remote sends CORS headers — html2canvas
        // would spam failed-load + CORS errors and capture them blank anyway.
        // Neutralise them in the clone so the snapshot stays clean and the
        // console stays quiet. Real RC avatars are same-origin and capture fine.
        doc.querySelectorAll('img').forEach((node) => {
          const img = node as HTMLImageElement;
          try {
            if (new URL(img.src, location.href).origin !== location.origin) {
              img.removeAttribute('src');
              img.removeAttribute('srcset');
              if (!img.style.background) img.style.background = '#d4d4d8';
            }
          } catch {
            /* unparseable src — leave it */
          }
        });
      },
    });

    const w = Math.min(PREVIEW_W, natW);
    const h = Math.min(PREVIEW_H, natH);
    const x = clamp(Math.round(cx - w / 2), 0, natW - w);
    const y = clamp(Math.round(cy - h / 2), 0, natH - h);

    const out = document.createElement('canvas');
    out.width = w * SCALE;
    out.height = h * SCALE;
    const ctx = out.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(full, x * SCALE, y * SCALE, w * SCALE, h * SCALE, 0, 0, out.width, out.height);
    return out.toDataURL('image/png');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[CommentLayer] preview capture failed', e);
    return null;
  }
}
