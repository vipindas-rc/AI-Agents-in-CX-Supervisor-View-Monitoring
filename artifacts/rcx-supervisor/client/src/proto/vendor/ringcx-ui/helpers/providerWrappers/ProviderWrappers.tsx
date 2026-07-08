import type { FC, PropsWithChildren } from 'react';

import isPropValid from '@emotion/is-prop-valid';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { isSWIframe } from '@ringcx/shared';
import deepmerge from 'deepmerge';
import type { DefaultTheme } from 'styled-components';
import { StyleSheetManager, ThemeProvider } from 'styled-components';

import type { IEngageUiThemeProvider } from './types';
import { OldTopHatProvider } from '../../components/OldTopHat/TopHatProvider';
import { ToastProvider } from '../../components/Toast/ToastProvider';
import { TopHatProvider } from '../../components/TopHat/TopHatProvider';
import type { ITheme } from '../../theme';
import {
    BrandIds,
    swIframeBaseTheme,
    swMaterialTheme,
    theme as defaultTheme,
    materialTheme,
    createMaterialTheme,
    getThemeByBrandId,
    mergeThemes,
} from '../../theme';

const shouldForwardProp = (prop: string, target: unknown) => {
    return typeof target === 'string' ? isPropValid(prop) : true;
};

export const EngageUiThemeProvider: FC<
    PropsWithChildren<IEngageUiThemeProvider>
> = ({
    children,
    theme,
    materialUiTheme = materialTheme,
    topHatContainerId,
}) => {
    let themeToProvide: ITheme = theme
        ? deepmerge<ITheme>(defaultTheme, theme as Partial<ITheme>)
        : defaultTheme;

    if (isSWIframe()) {
        themeToProvide = mergeThemes(themeToProvide, swIframeBaseTheme);
        materialUiTheme = swMaterialTheme;
    }

    return (
        <StyleSheetManager shouldForwardProp={shouldForwardProp}>
            <StylesProvider injectFirst>
                <ThemeProvider theme={themeToProvide as DefaultTheme}>
                    <MuiThemeProvider theme={materialUiTheme}>
                        <TopHatProvider containerId={topHatContainerId}>
                            <ToastProvider>{children}</ToastProvider>
                        </TopHatProvider>
                    </MuiThemeProvider>
                </ThemeProvider>
            </StylesProvider>
        </StyleSheetManager>
    );
};

//Because The portal used in the topHat component will not work with SSR,
//we use this wrapper for our snapshot testing
export const EngageUiThemeProviderNoTopHat: FC<
    PropsWithChildren<IEngageUiThemeProvider>
> = ({ children, theme, materialUiTheme = materialTheme }) => {
    const themeToProvide: DefaultTheme = theme
        ? (deepmerge(defaultTheme, theme) as DefaultTheme)
        : (defaultTheme as DefaultTheme);

    return (
        <StyleSheetManager shouldForwardProp={shouldForwardProp}>
            <StylesProvider injectFirst>
                <ThemeProvider theme={themeToProvide}>
                    <MuiThemeProvider theme={materialUiTheme}>
                        {children}
                    </MuiThemeProvider>
                </ThemeProvider>
            </StylesProvider>
        </StyleSheetManager>
    );
};

export const EngageUiThemeProviderOldTopHat: FC<
    PropsWithChildren<IEngageUiThemeProvider>
> = ({ children, theme, materialUiTheme, brandId = BrandIds.DEFAULT }) => {
    // As of now, brand color supported for UC+CC only.

    // Default colors for ui components based on brandId
    const defaultEngageUiTheme = getThemeByBrandId(brandId);
    const themeToProvide: DefaultTheme = theme
        ? (deepmerge(defaultEngageUiTheme, theme) as DefaultTheme)
        : (defaultEngageUiTheme as DefaultTheme);

    // Default material-ui colors based on brandId
    const materialUiDefaultTheme = materialUiTheme
        ? materialUiTheme
        : createMaterialTheme(brandId);

    return (
        <StyleSheetManager shouldForwardProp={shouldForwardProp}>
            <StylesProvider injectFirst>
                <ThemeProvider theme={themeToProvide}>
                    <MuiThemeProvider theme={materialUiDefaultTheme}>
                        <OldTopHatProvider>
                            <ToastProvider>{children}</ToastProvider>
                        </OldTopHatProvider>
                    </MuiThemeProvider>
                </ThemeProvider>
            </StylesProvider>
        </StyleSheetManager>
    );
};
