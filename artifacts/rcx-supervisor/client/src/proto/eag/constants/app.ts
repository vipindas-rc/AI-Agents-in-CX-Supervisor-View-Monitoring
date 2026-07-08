export const COMPONENT_NAME = 'EAG';

export const OMNI_ACCOUNT_TYPE = 'OMNICHANNEL';

export enum INTERACTION_SOURCES {
    VOICE = 'VOICE',
    LEGACY = 'WEB_CHAT',
    EMAIL = 'EMAIL',
}
export enum MONITOR_TYPES {
    MONITOR = 'monitor',
    BARGE_IN = 'bargeIn',
    COACH = 'coach',
    JOIN = 'join',
}

export const MVP = 'MVP';

export const HOVERED_ICONS = {
    MONITOR: 'showMonitor',
    BARGE_IN: 'showBargeIn',
    COACH: 'showCoach',
    LOG_OUT: 'showLogout',
    CHANGE_STATE: 'showChangeState',
    VIEW_INSIGHTS: 'showViewInsights',
};

export enum CSS_CLASS_TYPES {
    DESELECTED = 'deselected',
    DISABLED = 'disabled',
    EMPTY = '',
}

export enum RCX_HEADERS {
    CLIENT_APP_TYPE = 'X-RCX-Client-App-Type',
    CLIENT_APP_VERSION = 'X-RCX-Client-App-Version',
}

export enum SWITCH_SIZE {
    SMALL = 'small',
    MEDIUM = 'medium',
}

export const MAX_INTERACTIONS = 4;

export const RC_SUPPORT_DOMAIN = 'https://support.ringcentral.com';
export const RC_SUPPORT_LINK = {
    SYSTEM_REQUIREMENT:
        '/engagevoice/overview/voice-admin-system-requirement-specifications.html',
    DIGITAL_ENABLE_SUPERVISOR:
        '/article-v2/Importing-an-agent-from-RingCentral-MVP.html?brand=RingCentral&product=ED&language=en_US',
};

// iframe size: 300*500 and byot size is 338*474, so change the breakpoint to 360
export const RESPONSIVE_BREAKPOINT = 360;

export const API_HOST = '/';
export const API_PATH = 'voice/api/v1/agent/';

export const ASSETS_URL = '/voice/agent/';

export enum PESPECTIVE_STATE {
    ALL_AGENT_LEGS = 'ALL_AGENT_LEGS',
    DISABLED = 'DISABLED',
}
