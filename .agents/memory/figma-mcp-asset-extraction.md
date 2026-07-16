---
name: Figma MCP asset extraction
description: Quirks of mcpFigma_downloadAssets exports and how to get clean icon SVGs
---

# Figma MCP asset extraction

- `mcpFigma_downloadAssets` takes a SINGLE `nodeId` + `fileKey` per call (no nodeIds array). Pass `defaultFormat: "svg"` for icons; response text contains a temporary `https://www.figma.com/api/mcp/asset/...` URL to fetch.
- **Exported SVGs include parent-frame clutter**: full-size background rects (e.g. `<rect ... fill="#F5F5F5"/>`), giant negative-offset window rects, and ancestor tab-bar paths. Rendering looks OK (clipped) but backgrounds leak as gray squares on non-matching surfaces.
- **How to clean**: extract the balanced innermost `<g id="<IconName>">` group (walk `<g`/`</g>` depth) plus the `<defs>` block, re-wrap in the original `<svg>` header. Gradients/patterns/embedded base64 bitmaps live in defs and survive fine.
- Instance nodes named "Select" (or similar opaque component instances) can export `export: null` with no raw images — drill into children via getMetadata, or hand-match from a screenshot of the parent.
- `mcpFigma_getScreenshot` on those same opaque instance nodes returned ~149-byte junk; screenshot a larger parent node instead.
- Recolor variants (active/inactive) by string-replacing hex fills in the extracted group + defs.
