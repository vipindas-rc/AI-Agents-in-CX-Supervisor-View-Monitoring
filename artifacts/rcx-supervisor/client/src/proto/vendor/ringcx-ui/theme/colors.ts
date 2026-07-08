import styled from 'styled-components';

export enum BrandIds {
    DEFAULT = '1210',
    // Dynamic theme for UC+CC
    JUPITER = '0000',
}

const grayColors = {
    900: '#212121',
    850: '#666666',
    800: '#757575',
    750: '#898989',
    700: '#A1A1A1',
    600: '#ABABAB',
    550: '#ADADAD',
    500: '#BDBDBD',
    450: '#B0B0B0',
    430: '#D0D0D0',
    400: '#D1D1D1',
    300: '#E0E0E0',
    200: '#E7E7E7',
    100: '#EFEFF0',
    150: '#F4F4F4',
    50: '#F9F9F9',
    0: '#FFFFFF',
};

const junoMainColors = {
    500: '#066FAC',
    400: '#1A7AB3',
    300: '#2E86B9',
    200: '#509AC4',
    50: '#E9F2F8',
};

const junoFiretruckColors = {
    500: '#D63E39',
    400: '#D94E49',
    300: '#DD5D59',
};

const accentColors = {
    amethyst: '#9C74FF',
    azure: '#23A1F5',
    denim: '#4481EB',
    darkLake: '#005488',
    darkNight: '#0A4569',
    emerald: '#25A73C',
    firetruck: '#D63E39',
    mango: '#F7B500',
    olive: '#368541',
    orange: '#FF8800',
    oyster: '#FFEBD4',
    scarlet: '#F0512A',
    tangerine: '#F6852E',
    tiffany: '#22C2D6',
    black: '#000000',
    lightGreen: '#F7F8F6',
};

const semitransparentColors = {
    gray: 'rgba(0, 0, 0, 0.2)',
};

const junoChipColors = {
    selected: '#0065B2',
};

const junoColors = {
    mainColors: junoMainColors,
    firetrunkColors: junoFiretruckColors,
    grayColors,
    accentColors,
    semitransparentColors,
    chipColors: junoChipColors,
};

const jupiterGrayColors = {
    900: 'rgb(var(--neutral-f06-rgb))',
    850: 'rgb(var(--neutral-b04-rgb))',
    800: 'rgb(var(--neutral-f03-rgb))',
    750: 'rgb(var(--neutral-f02-rgb))',
    700: 'rgb(var(--neutral-f02-rgb), 0.9)',
    600: 'rgb(var(--neutral-f02-rgb), 0.85)',
    550: 'rgb(var(--neutral-f02-rgb), 0.8)',
    500: 'rgb(var(--neutral-f02-rgb), 0.75)',
    450: 'rgb(var(--neutral-f02-rgb), 0.65)',
    430: 'rgb(var(--neutral-l03-rgb))',
    400: 'rgb(var(--neutral-l03-rgb), 0.8)',
    300: 'rgb(var(--neutral-l03-rgb), 0.6)',
    200: 'rgb(var(--neutral-l02-rgb))',
    150: 'rgb(var(--nav-b02-rgb))',
    100: 'rgb(var(--neutral-l02-rgb), 0.6)',
    50: 'rgb(var(--nav-b02-rgb))',
    0: 'rgb(var(--nav-b01-rgb))',
};

export const jupiterMainColors = {
    500: 'rgb(var(--interactive-b02-rgb))',
    400: 'rgb(var(--interactive-f01-rgb))',
    300: 'rgb(var(--interactive-b02-rgb), 0.85)',
    200: 'rgb(var(--interactive-b02-rgb), 0.7)',
    50: 'rgb(var(--interactive-b01-rgb))',
};

const jupiterChipColors = {
    selected: 'rgb(var(--interactive-b01-rgb))',
};

const jupiterFiretruckColors = {
    500: 'rgb(var(--danger-b03-rgb))',
    400: 'rgb(var(--danger-b04-rgb))',
    300: 'rgb(var(--danger-f02-rgb))',
};

const colors = {
    primary: junoMainColors[500],
    secondary: junoFiretruckColors[500],
    main: junoMainColors,
    firetruck: junoFiretruckColors,
    gray: grayColors,
    accent: accentColors,
    semitransparent: semitransparentColors,
    success: accentColors.olive,
    error: accentColors.firetruck,
    info: grayColors[850],
    warning: accentColors.orange,
    background: grayColors[0],
    select: junoMainColors[50],
    chip: junoChipColors,
    contentBackground: grayColors[0],
    listBackground: grayColors[0],
    linkButton: grayColors[900],
    pillColors: {
        active: accentColors.emerald,
    },
    contentHeader: {
        kebabIcon: grayColors[0],
    },
};

export const digitalColorMap = {
    0: grayColors[700],
    1: accentColors.denim,
    2: accentColors.emerald,
    3: accentColors.tiffany,
    4: accentColors.amethyst,
    5: accentColors.mango,
    6: accentColors.tangerine,
    7: accentColors.scarlet,
    8: grayColors[900],
    9: grayColors[700],
};

export const AppGradient = styled.div`
    background-image: linear-gradient(
        180deg,
        ${(p) => p.theme.colors.main[500]} 0%,
        ${(p) => p.theme.colors.main[200]} 100%
    );
`;

// Overriding colors for UC+CC themes using CSS variables
// TODO: Fix the issue with the `alpha` method calls (can't pass CSS variable value directly as an argument to that method)
export const jupiterColors = {
    mainColors: jupiterMainColors,
    firetrunkColors: jupiterFiretruckColors,
    grayColors: jupiterGrayColors,
    accentColors,
    semitransparentColors,
    chipColors: jupiterChipColors,
};

export const brandMainColors = {
    [BrandIds.DEFAULT]: junoColors, // default juno theme
    [BrandIds.JUPITER]: jupiterColors, // dynamic theme obtained from UC+CC
};

/* SW Theme colors */
export const swGrayPalette = {
    50: '#FBFBFB',
    150: '#F4F4F4',
    100: '#FBFBFB',
    200: '#F9F9F9',
    250: '#EEEEEE',
    300: '#E2E2E2',
    500: '#C7C7C7',
    600: '#C5C7CD',
    700: '#999999',
    800: '#666666',
    900: '#2F2F2F',
    930: '#323439',
    950: '#212121',
};

export const swColorPalette = {
    gray: swGrayPalette,
    accent: {
        emerald: '#1A8517',
        firetruck: '#E61E1E',
    },
    linkButton: swGrayPalette[800],
    listBackground: swGrayPalette[150],
    contentBackground: swGrayPalette[100],
    pillColors: {
        active: '#1A8517',
    },
    contentHeader: {
        kebabIcon: swGrayPalette[100],
    },
};

export default colors;
