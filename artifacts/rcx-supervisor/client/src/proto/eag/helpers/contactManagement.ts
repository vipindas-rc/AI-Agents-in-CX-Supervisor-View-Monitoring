import {
    AGENT_ASSIST_DIGITAL_CHANNEL_FLAG,
    NOVA_AGENT_ASSIST_PORTAL_ACCESS_FLAG,
    Session,
} from '@ringcx/shared';

import injector from './injector';
import type { ExternalDataAttributes } from '../common/services/transport/contactManagement';
import {
    multiContactItems,
    externalContactSupportedKinds,
} from '../containers/ContactManagement/ContactProfile/constants';

const isDefaultOrEmbeddedAgentClient = (): boolean =>
    Session.isDefaultClientAppType() || Session.isEmbeddedAgentClientAppType();

export const shouldUseUnifiedWidgetsLayout = (
    FeatureFlagsSvc = injector('FeatureFlagsSvc')
): boolean =>
    isDefaultOrEmbeddedAgentClient() &&
    !!FeatureFlagsSvc.featureFlags.isUnifiedContactManagementAvailable;

export const shouldShowNovaAgentAssist = (
    FeatureFlagsSvc = injector('FeatureFlagsSvc')
): boolean =>
    Session.isEmbeddedAgentClientAppType() &&
    !!FeatureFlagsSvc.featureFlags[NOVA_AGENT_ASSIST_PORTAL_ACCESS_FLAG];

export const isCellPhoneOrEmailMandatoryPredicate = (
    channelType: string
): boolean => {
    const channelTypesWithPhoneOrEmail = [
        'VOICE',
        'EMAIL',
        'DIGITAL_SMS',
        'SMS',
    ];
    return channelTypesWithPhoneOrEmail.includes(channelType);
};

export const formatContactProfileData = (data: any[]) => {
    const result: Record<string, { kind: string; amount?: number }> = {};

    for (const item of data) {
        let key: string;
        if (multiContactItems.includes(item.kind)) {
            key = item.kind === 'Email' ? item.kind : item.label;
            const itemResult = result[key] || {};
            result[key] = {
                kind: item.kind,
                amount: itemResult.amount ? itemResult.amount + 1 : 1,
            };
            continue;
        }

        result[item.kind] = { kind: item.kind };
    }
    return result;
};

export const getExternalContactDataAttributes = ({
    attributes,
}: {
    attributes?: ExternalDataAttributes;
}) =>
    attributes
        ?.filter(
            ({ label, kind }) =>
                label && externalContactSupportedKinds.includes(kind)
        )
        ?.sort((a, b) => a.order - b.order) || [];

export const isAgentAssistDigitalChannelAvailable = (
    agentId: string | undefined,
    FeatureFlagsSvc = injector('FeatureFlagsSvc')
): boolean =>
    isDefaultOrEmbeddedAgentClient() &&
    !!FeatureFlagsSvc.featureFlags[AGENT_ASSIST_DIGITAL_CHANNEL_FLAG] &&
    !shouldShowNovaAgentAssist(FeatureFlagsSvc) &&
    !!agentId;
