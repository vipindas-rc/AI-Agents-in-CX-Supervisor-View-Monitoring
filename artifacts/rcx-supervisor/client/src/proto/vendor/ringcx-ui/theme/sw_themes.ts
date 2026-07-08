import { createTheme } from '@material-ui/core/styles';
import deepmerge from 'deepmerge';

import { swColorPalette, swGrayPalette } from './colors';
import { swIframeFont } from './font';

export const baseTheme = {
    border: {
        radius: '2px',
    },
    font: {
        color: '#666666',
        weight: {
            medium: 700,
        },
    },
    colors: {
        primary: '#0679BA',
        main: {
            200: '#E6F2F8',
            300: '#045989',
            400: '#045989',
            500: '#0679BA',
        },
        gray: {
            0: '#FFFFFF',
            100: '#FBFBFB',
            200: '#F9F9F9',
            250: '#EEEEEE',
            300: '#E2E2E2',
            500: '#C7C7C7',
            700: '#999999',
            800: '#666666',
            900: '#2F2F2F',
            950: '#212121',
        },
        warning: '#FFBF2A',
        error: '#E61E1E',
        success: '#1A8517',
        accent: {
            mango: '#FF8800',
        },
        warningPalette: {
            0: '#FFBF2A',
            50: '#FCF8E3',
            300: '#CC9922',
            400: '#805F15',
        },
        dangerPalette: {
            600: '#E61E1E',
        },
    },
};

export const muiTheme = {
    shape: {
        borderRadius: 2,
    },
    palette: {
        primary: {
            200: '#E6F2F8',
            300: '#045989',
            400: '#045989',
            500: '#0679BA',
            main: '#0679BA',
            light: '#045989',
        },
        error: {
            main: '#E61E1E',
        },
        warning: {
            main: '#FFBF2A',
        },
        success: {
            main: '#1A8517',
        },
        grey: {
            400: '#C7C7C7',
            600: '#666666',
            900: '#272727',
        },
    },
    typography: {
        fontSize: 13,
    },
};

const swMuiTypography = {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 13,
    h6: {
        fontSize: 18,
        fontWeight: 400,
        lineHeight: '22px',
    },
};

const swMuiTheme = {
    shape: {
        borderRadius: 4,
    },
    palette: {
        gray: swGrayPalette,
        secondary: {
            main: '#E61E1E',
        },
    },
    typography: swMuiTypography,
    zIndex: {
        modal: 9999,
    },
    overrides: {
        MuiTouchRipple: {
            rippleVisible: {
                opacity: 0.24,
            },
        },
        MuiDialogContent: {
            root: {
                color: swGrayPalette[900],
            },
        },
    },
    isSWIframe: true,
};

export const swIframeMuiTheme = deepmerge(muiTheme, swMuiTheme);
export const swIframeBaseTheme = deepmerge(baseTheme, {
    colors: swColorPalette,
    font: swIframeFont,
    zIndexes: { toast: 999999 },
    isSWIframe: true,
});

export const swMaterialTheme = createTheme(swIframeMuiTheme);
