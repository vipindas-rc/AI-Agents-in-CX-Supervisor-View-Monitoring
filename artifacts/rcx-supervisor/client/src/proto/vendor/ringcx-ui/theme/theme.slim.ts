/* Slim theme — the SAME plain `theme` object the real theme.ts exports
 * (theme.ts lines 20-27), but WITHOUT its module-load MUI v4 calls
 * (createMaterialTheme / createDynamicTheme) that pull @mui/@material-ui and
 * crash with a circular React-interop (import_react3). All pieces below are
 * MUI-free. */
import border from './border';
import defaultColors from './colors';
import dimensions from './dimensions';
import font from './font';
import zIndexes from './zindexes';

export const theme = {
  colors: defaultColors,
  font,
  border,
  zIndexes,
  dimensions,
  isSWIframe: false,
} as any;
