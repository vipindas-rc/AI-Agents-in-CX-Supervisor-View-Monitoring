import { checkUnifiedInboxEnabled } from './unifiedInbox';

export const SOURCE_ROUTES = {
    PHONE: 'base.default.phone',
    PHONE_DIALPAD: 'base.default.phone.dialpad',
    PHONE_DIALPAD_DETAIL: 'base.default.phone.dialpad.detail',
    PHONE_DIALPAD_PREVIEW: 'base.default.phone.dialpad.preview',
    CHAT: 'base.default.chat',
    CHAT_DETAIL: 'base.default.chat.detail',
    CHAT_TASK: 'base.default.chat.task',
    CHAT_OUTBOUND: 'base.default.chat.outbound',
} as const;

const INTERACTION_ROUTES = {
    BASE: 'base.default.interaction',
    CHAT_DETAIL: 'base.default.interaction.chat.detail',
    CHAT_TASK: 'base.default.interaction.chat.task',
    CHAT_OUTBOUND: 'base.default.interaction.chat.outbound',
    PHONE_DETAIL: 'base.default.interaction.phone.detail',
    PHONE_PREVIEW: 'base.default.interaction.phone.preview',
} as const;

const UNIFIED_INTERACTION_ROUTE_REDIRECTS: Record<string, string> = {
    [SOURCE_ROUTES.PHONE]: INTERACTION_ROUTES.BASE,
    [SOURCE_ROUTES.PHONE_DIALPAD]: INTERACTION_ROUTES.BASE,
    [SOURCE_ROUTES.PHONE_DIALPAD_DETAIL]: INTERACTION_ROUTES.PHONE_DETAIL,
    [SOURCE_ROUTES.PHONE_DIALPAD_PREVIEW]: INTERACTION_ROUTES.PHONE_PREVIEW,
    [SOURCE_ROUTES.CHAT]: INTERACTION_ROUTES.BASE,
    [SOURCE_ROUTES.CHAT_DETAIL]: INTERACTION_ROUTES.CHAT_DETAIL,
    [SOURCE_ROUTES.CHAT_TASK]: INTERACTION_ROUTES.CHAT_TASK,
    [SOURCE_ROUTES.CHAT_OUTBOUND]: INTERACTION_ROUTES.CHAT_OUTBOUND,
};

export const isInteractionChatTaskState = (stateName = ''): boolean =>
    stateName === INTERACTION_ROUTES.CHAT_TASK;

export const isInteractionChatOutboundState = (stateName = ''): boolean =>
    stateName === INTERACTION_ROUTES.CHAT_OUTBOUND;

export const isInteractionPhoneWorkspaceState = (stateName = ''): boolean =>
    stateName === INTERACTION_ROUTES.PHONE_DETAIL ||
    stateName === INTERACTION_ROUTES.PHONE_PREVIEW;

export const isInteractionSplitWorkspaceState = (stateName = ''): boolean =>
    isInteractionChatTaskState(stateName) ||
    isInteractionChatOutboundState(stateName) ||
    isInteractionPhoneWorkspaceState(stateName);

export function getUnifiedInteractionRouteRedirect(
    stateName: string
): string | null {
    if (!checkUnifiedInboxEnabled()) {
        return null;
    }

    return UNIFIED_INTERACTION_ROUTE_REDIRECTS[stateName] || null;
}
