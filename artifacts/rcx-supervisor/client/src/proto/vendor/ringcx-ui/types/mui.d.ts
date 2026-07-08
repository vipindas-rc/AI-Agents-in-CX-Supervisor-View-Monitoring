import '@material-ui/core/styles/createPalette';
import '@mui/material/styles/createPalette';

declare module '@material-ui/core/styles/createPalette' {
    interface PaletteColor {
        50?: string;
        200?: string;
        300?: string;
        400?: string;
        500?: string;
    }
}

declare module '@mui/material/styles/createPalette' {
    interface PaletteColor {
        50?: string;
        200?: string;
        300?: string;
        400?: string;
        500?: string;
    }
}
