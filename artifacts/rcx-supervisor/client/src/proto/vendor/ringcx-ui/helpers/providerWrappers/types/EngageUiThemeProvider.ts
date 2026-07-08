import type { Theme } from '@material-ui/core/styles';

import type { BrandIds, PartialTheme } from '../../../theme';

export interface IEngageUiThemeProvider {
    theme?: PartialTheme;
    materialUiTheme?: Theme;
    brandId?: BrandIds;
    topHatContainerId?: string;
}
