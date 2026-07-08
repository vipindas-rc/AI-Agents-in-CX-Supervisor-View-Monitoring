import type { Theme } from '@material-ui/core/styles';
import { createTheme } from '@material-ui/core/styles';
import type { DeprecatedThemeOptions } from '@mui/material';
import { adaptV4Theme } from '@mui/material/styles';
import { Session, isSWIframe } from '@ringcx/shared';
import deepmerge from 'deepmerge';

import border from './border';
import defaultColors, { BrandIds, brandMainColors } from './colors';
import dimensions from './dimensions';
import font from './font';
import { baseTheme as overrideTheme, swIframeBaseTheme } from './sw_themes';
import type { ITheme } from './types/theme';
import zIndexes from './zindexes';

let cachedTheme: Theme | null = null;
let cachedSWBaseTheme: ITheme | null = null;
const tempThemeV4toV5: Partial<Theme> = {};

export const theme: ITheme = {
    colors: defaultColors,
    font,
    border,
    zIndexes,
    dimensions,
    isSWIframe: false,
};

export function mergeThemes<T1 extends object, T2 extends object>(
    baseTheme: Partial<T1>,
    overrideTheme: Partial<T2>
): T1 & T2 {
    const isObject = (val: any): val is object =>
        typeof val === 'object' && val !== null && !Array.isArray(val);

    return deepmerge(baseTheme, overrideTheme, {
        customMerge: () => {
            return (original, override) => {
                if (!isObject(original) || !isObject(override)) {
                    return override;
                }

                return deepmerge(original, override);
            };
        },
    }) as T1 & T2;
}

export const getBrandId = (): BrandIds => {
    if (Session.isEmbeddedAgentClientAppType()) {
        return BrandIds.JUPITER;
    }

    return BrandIds.DEFAULT;
};

export const getThemeByBrandId = (brandId: BrandIds) => {
    const colors = getBrandColors(brandId);

    const baseTheme: ITheme = {
        colors,
        font: { ...font, color: colors.gray[900] },
        border,
        zIndexes,
        dimensions,
        isSWIframe: isSWIframe(),
    };

    if (Session.isEmbeddedServiceWebAdminClientAppType()) {
        if (!cachedSWBaseTheme) {
            cachedSWBaseTheme = mergeThemes(baseTheme, overrideTheme);
        }
        return cachedSWBaseTheme;
    } else if (isSWIframe()) {
        if (!cachedSWBaseTheme) {
            cachedSWBaseTheme = mergeThemes(baseTheme, swIframeBaseTheme);
        }
        return cachedSWBaseTheme;
    }
    return baseTheme;
};

export const getBrandColors = (brandID = BrandIds.DEFAULT) => {
    const colors = brandMainColors[brandID];
    return {
        primary: colors.mainColors[500],
        secondary: colors.firetrunkColors[500],
        main: colors.mainColors,
        firetruck: colors.firetrunkColors,
        gray: colors.grayColors,
        accent: colors.accentColors,
        semitransparent: colors.semitransparentColors,
        success: colors.accentColors.olive,
        error: colors.accentColors.firetruck,
        info: colors.grayColors[850],
        warning: colors.accentColors.orange,
        background: colors.grayColors[0],
        select: colors.mainColors[50],
        chip: colors.chipColors,
        contentBackground: colors.grayColors[0],
        listBackground: colors.grayColors[0],
        linkButton: colors.grayColors[900],
        pillColors: {
            active: colors.accentColors.emerald,
        },
        contentHeader: {
            kebabIcon: colors.grayColors[100],
        },
    };
};

// default material library theme colors
export const materialTheme: Theme = createMaterialTheme();

// allow overriding of theme settings
export function setTheme(newTheme: ITheme) {
    Object.assign(theme, newTheme);
    createMaterialTheme();
}

export function createMaterialTheme(brandId = BrandIds.DEFAULT): Theme {
    const colors = getBrandColors(brandId);
    return createTheme({
        palette: {
            primary: {
                ...colors.main,
                main: colors.primary,
            },
            secondary: {
                ...colors.firetruck,
                main: colors.accent.firetruck,
            },
            success: {
                main: colors.accent.emerald,
            },
            action: {
                disabled: colors.gray[300],
            },
            background: {
                paper: colors.gray[0],
                default: colors.gray[0],
            },
        },
        typography: {
            fontSize: 16,
        },
        // TODO: EVAA-16489 we should have only one place for zindexes
        zIndex: {
            modal: 9999,
        },
        overrides: {
            MuiTouchRipple: {
                rippleVisible: {
                    opacity: 0.24,
                },
            },
        },
    });
}

function createDynamicTheme(): Theme {
    const base = Session.isEmbeddedServiceWebAdminClientAppType()
        ? mergeThemes(theme, overrideTheme)
        : isSWIframe()
          ? mergeThemes(theme, swIframeBaseTheme)
          : theme;

    return createTheme(
        // @ts-ignore
        adaptV4Theme(base as DeprecatedThemeOptions)
    );
}

const baseThemeForKeys = createDynamicTheme();

for (const key of Object.keys(baseThemeForKeys) as (keyof Theme)[]) {
    Object.defineProperty(tempThemeV4toV5, key, {
        get() {
            if (!cachedTheme) {
                cachedTheme = createDynamicTheme();
            }
            return cachedTheme[key];
        },
        enumerable: true,
        configurable: false,
    });
}

export const themeV4toV5 = tempThemeV4toV5 as Theme;
