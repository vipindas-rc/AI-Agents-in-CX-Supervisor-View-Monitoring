import 'styled-components';
import type { Theme } from '@mui/material/styles';

import type { ITheme } from '../theme/types/theme';

declare module 'styled-components' {
    export interface DefaultTheme extends ITheme, Theme {}
}
