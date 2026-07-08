export const SPLASH_STATE = {
    PROGRESSIVE: 'progressive',
    HCI_PACING: 'hciPacing',
    TCPA: 'tcpa',
    PREVIEW_DIAL: 'previewDial',
    LOADING: 'loading',
    NO_LEADS: 'noLeads',
    NO_PROGRESSIVE_LEADS: 'noProgressiveLeads',
};

export const localStorageKeyForSplash = 'emptySplashState';

export enum SPLASH_TYPES {
    SIDE_PANEL = 'sidePanel',
    GRAPHIC_PANEL = 'graphicPanel',
    PLAIN_TEXT_PANEL = 'plainTextPanel',
    START_WORKING = 'startWorking',
    JUST_SUBTEXT = 'justSubtext',
}
