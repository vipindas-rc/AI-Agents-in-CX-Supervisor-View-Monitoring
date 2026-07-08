import colors, { swGrayPalette } from './colors';

const fontBase = 14;
const fontSubtitle1 = 9;

const font = {
    family: "'Roboto', Helvetica, Arial, sans-serif",
    weight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 700,
        bold: 700,
        black: 900,
    },
    color: colors.gray[900],
    lineHeight: {
        content: '24px',
        heading2: '22px',
        heading3: '22px',
        footer: '20px',
    },
    size: {
        base: `${fontBase}px`,
        subtitle1: `${fontSubtitle1}px`,
        small: `${Math.ceil(fontBase * 0.85)}px`,
        large: `${Math.ceil(fontBase * 1.25)}px`,
        heading2: '20px',
        subheading1: '16px',
        label: '12px',
    },
    letterSpacing: {
        content: '0.17px',
        label: '0.4px',
    },
    primaryScreenTitle: {
        fontSize: '20px',
        fontWeight: 500,
    },
    primaryScreenSubtitle: {
        fontSize: '14px',
        fontWeight: 400,
    },
    sectionHeader: {
        fontSize: '16px',
        fontWeight: 500,
    },
    captionRegular: {
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '16px',
    },
    subheader: {
        fontSize: '14px',
        fontWeight: 700,
    },
    gridListHead: {
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '16px',
        letterSpacing: '0.4px',
    },
    contentHeader: {
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '24px',
        letterSpacing: '0.17px',
    },
    modal: {
        headline: {
            fontSize: '20px',
            fontWeight: 500,
            lineHeight: '22px',
            letterSpacing: '0.15px',
        },
    },
};

export const swIframeFont = {
    color: swGrayPalette[900],
    family: 'Helvetica, Arial, sans-serif',
    lineHeight: {
        content: '154%',
        heading2: '22px',
        lh20: '20px',
        heading3: '154%',
        lh22: '22px',
        lh14: '14px',
        lh30: '30px',
        lh154: '154%',
    },
    size: {
        base: '13px',
        heading1: '22px',
        heading2: '18px',
        heading3: '16px',
        subheading1: '14px',
        caption1: '12px',
        caption2: '10px',
        subtitle1: '9px',
        subtitle2: '15px',
        label: '13px',
    },
    letterSpacing: {
        content: '0',
        label: '0',
    },
    primaryScreenTitle: {
        fontSize: '22px',
        fontWeight: 700,
    },
    primaryScreenSubtitle: {
        fontSize: '14px',
        fontWeight: 400,
    },
    sectionHeader: {
        fontSize: '16px',
        fontWeight: 700,
    },
    captionRegular: {
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '16px',
    },
    subheader: {
        fontSize: '14px',
        fontWeight: 700,
    },
    gridListHead: {
        fontSize: '13px',
        fontWeight: 700,
        lineHeight: '154%',
        letterSpacing: '0',
    },
    contentHeader: {
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '154%',
        letterSpacing: '0',
    },
    modal: {
        headline: {
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: '154%',
            letterSpacing: 0,
        },
    },
};

export default font;
