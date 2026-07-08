export const TRACKING_SOURCE = {
    MANUAL: 'manual',
    CLICK_TO_SMS: 'click to sms',
    TEXT_BACK_FROM_HISTORY: 'text back from history',
} as const;

export type TrackingSource =
    (typeof TRACKING_SOURCE)[keyof typeof TRACKING_SOURCE];
