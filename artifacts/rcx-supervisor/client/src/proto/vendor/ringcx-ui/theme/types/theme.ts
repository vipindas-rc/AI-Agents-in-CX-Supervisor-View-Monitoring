import type { IColors } from './colors';
import type border from '../border';
import type dimensions from '../dimensions';
import type font from '../font';
import type zIndexes from '../zindexes';

export interface ITheme {
    colors: IColors;
    font: typeof font;
    border: typeof border;
    zIndexes: typeof zIndexes;
    dimensions: typeof dimensions;
    isSWIframe: boolean;
}

export type PartialTheme = DeepPartial<ITheme>;

export interface IStyledTheme {
    theme: ITheme;
}
