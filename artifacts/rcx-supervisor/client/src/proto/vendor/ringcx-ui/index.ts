/* SLIM @ringcx/ui barrel — re-exports ONLY the symbols the Supervisor render
 * path uses, from their specific source modules. This avoids the full library's
 * `export *` (which in dev eagerly loads all 1,237 files incl. MUI-v4 date
 * pickers / ace-editor and triggers a circular React-interop crash).
 * The original full barrel is preserved at index.full.ts.bak. */

// --- GridList (the table engine) ---
export { GridList } from './components/GridList';
export { GL_CLASSES } from './components/GridList/constants';
export type {
  FiltrationCallback,
  RenderRowGroupData,
  RenderSubRowData,
  RenderRowsOneRowData,
} from './components/GridList/types';

// --- components ---
export { Button } from './components/Button';
export { Dialog } from './components/Dialog';
export { default as IconButton } from './components/IconButton';
export { Menu } from './components/Menu';
export { default as Popper } from './components/Popper';
export { SearchInput } from './components/Inputs/SearchInput';
export { SingleSelect } from './components/DropDown';
export { MultiSelect } from './components/DropDown';
export type { IMenuItem as IMultiSelectItem } from './components/DropDown/types/DropDown';
export type {
  DisplayVariantType,
  IMenuItem,
} from './components/DropDown/types/DropDown';
export { TextEclipse } from './components/TextEclipse';
export { default as TextOverflow } from './components/TextOverflow';
export { default as Tooltip } from './components/Tooltip';
export { TagComponent } from './components/Tag';
export { default as Spinner } from './components/Spinner';
export { default as Checkbox } from './components/Checkbox';
export { KEYBOARD_KEYS } from './constants/keyboard';
export type { TagColor } from './components/Tag/types';
export type { DotColor } from './components/Dot/types';

// --- helpers / utils (small, MUI-free modules: export * to cover the full set) ---
export { SortType } from './helpers/sorting/types';
export * from './helpers/accessibility/accessibility';
export * from './helpers/keyboard';

// --- theme (slim: avoids theme.ts's module-load MUI v4 crash) ---
export { theme } from './theme/theme.slim';
export { digitalColorMap } from './theme/colors';

// --- icons (all SVG components; MUI-free, safe to export *) ---
export * from './icons';
