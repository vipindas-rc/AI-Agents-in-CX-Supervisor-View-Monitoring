export const ANALYTICS_EVENTS = {
    SEARCH_INPUT_CLICK: 'RCX_voice_requeueSearchInputClick',
    REQUEUE_SELECTED: 'RCX_voice_requeueSelected',
    REQUEUE_CLICKED: 'RCX_voice_requeueButtonClicked',
    CHOOSE_SKILL_CLICKED: 'RCX_voice_chooseSkillButtonClicked',
    ASK_FIRST_CLICKED: 'RCX_voice_askFirstButtonClicked',
} as const;

export const ANALYTICS_OPTIONS = {
    REQUEUE: 'Requeue',
    CHOOSE_SKILL: 'ChooseSkill',
    REQUEUE_SHORTCUT: 'RequeueShortCut',
    SKILL: 'Skill',
} as const;

export const WAIT_TIME_THRESHOLDS = {
    MEDIUM: 3 * 60,
    LONG: 60 * 60,
} as const;

export const METRICS_POLLING_INTERVAL = 10000;

export enum REQUEUE_TYPE {
    ADVANCED = 'ADVANCED',
    SHORTCUT = 'SHORTCUT',
}

export const VIEW_STATE = {
    QUEUE_LIST: 'queue-list',
    SKILL_SELECTOR: 'skill-selector',
} as const;
