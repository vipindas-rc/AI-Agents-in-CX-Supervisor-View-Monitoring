export const DIALOG_SELECTORS = {
    MATERIAL_DIALOG: 'md-dialog',
    ARIA_DIALOG: '[role="dialog"]',
    COMBINED: 'md-dialog, [role="dialog"]',
} as const;

export const DISPOSITION_DIALOG_SELECTORS = {
    NOTES_ID: '#notes',
    COMBINED_NOTES: '#notes, [data-aid="submit_disposition_note"]',
} as const;

export { FOCUS_DELAY_MS } from '../components/Inputs/constants';
