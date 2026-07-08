import type { AngularLikeState, VoiceCallInput } from './helper.type';
import translate from '../../../helpers/translate';

export const VOICE_CALL_TYPE = {
    INBOUND: 'INBOUND',
    OUTBOUND: 'OUTBOUND',
} as const;

export const ACTIVE_CALL_INTERACTION_STATE_NAME =
    'base.default.interaction.phone.detail';

export const VOICE_PREVIEW_INTERACTION_STATE_NAME =
    'base.default.interaction.phone.preview';

export const CALL_SOURCE_I18N_KEYS = {
    QUEUE: 'CHAT.CHAT_PREVIEW.QUEUE',
    CAMPAIGN: 'CHAT.CHAT_PREVIEW.CAMPAIGN',
    OUTBOUND_ONLY: 'DASHBOARD.TYPES.OUTBOUNDMETRICS',
} as const;

export function isVoiceInteractionDetailActive(
    $state: AngularLikeState
): boolean {
    return $state?.current?.name === ACTIVE_CALL_INTERACTION_STATE_NAME;
}

export function isVoicePreviewUiState(stateName: string) {
    return stateName === VOICE_PREVIEW_INTERACTION_STATE_NAME;
}

function formatLabeledSource(labelKey: string, name?: string): string | null {
    if (!name) {
        return null;
    }
    return `${translate(labelKey)} ${name}`;
}

export function getCallSourceDescription(input: VoiceCallInput): string | null {
    const { callType } = input;
    const queue = input.queue ?? {};
    const name = queue.name;

    if (callType === VOICE_CALL_TYPE.INBOUND) {
        return formatLabeledSource(CALL_SOURCE_I18N_KEYS.QUEUE, name);
    }

    if (callType === VOICE_CALL_TYPE.OUTBOUND) {
        if (queue.isCampaign) {
            return formatLabeledSource(CALL_SOURCE_I18N_KEYS.CAMPAIGN, name);
        }
        if (queue.number) {
            return formatLabeledSource(CALL_SOURCE_I18N_KEYS.QUEUE, name);
        }
        return translate(CALL_SOURCE_I18N_KEYS.OUTBOUND_ONLY);
    }

    return null;
}
