import { USA_COUNTRY_ID, Session } from '@ringcx/shared';

import { DEFAULT_MANUAL_COUNTRY } from '../constants/localStorageKeys';

type ManualOutDialProps = {
    localStorageService: any;
    AgentSvc: any;
    ProgressiveDialSvc: any;
    JupiterService: any;
    CallSvc: any;
    ani: string;
    queueId?: string;
    isCampaign?: boolean;
    /** When set (e.g. from call history), applied to manual dial pad and manual outbound call. */
    campaignId?: string;
    /** When true, only persist destination on dial pad — do not place a call. */
    prepareDialPadOnly?: boolean;
};
export function manualOutDial({
    localStorageService,
    AgentSvc,
    ProgressiveDialSvc,
    JupiterService,
    CallSvc,
    ani,
    queueId,
    isCampaign,
    campaignId,
    prepareDialPadOnly = false,
}: ManualOutDialProps) {
    const ringTime =
        localStorageService.get('defaultManualRingTime') ||
        parseInt(AgentSvc.agentSettings.outboundManualDefaultRingtime, 10) ||
        30;
    const callerId = localStorageService.get('defaultManualCallerId') || '';
    const countryId =
        localStorageService.get(DEFAULT_MANUAL_COUNTRY) || USA_COUNTRY_ID;
    let gateId;

    localStorageService.set('defaultManualDialDest', ani);

    if (queueId && !isCampaign) {
        gateId = queueId;
        localStorageService.set('defaultManualQueue', gateId);
    }

    if (prepareDialPadOnly) {
        CallSvc.dialPad.dialDest = ani;
        CallSvc.dialPad.campaignId = '';
        localStorageService.remove('defaultManualCampaign');
        return;
    }

    const resolvedCampaignId = (campaignId ?? '').trim();
    if (resolvedCampaignId) {
        localStorageService.set('defaultManualCampaign', resolvedCampaignId);
        CallSvc.dialPad.campaignId = resolvedCampaignId;
    }

    // stop all timeouts, make the call now, on history stop progressive
    ProgressiveDialSvc.stopProgressiveDialer(true);

    if (Session.isEmbeddedAgentClientAppType()) {
        JupiterService.initManualCall({
            destination: ani,
            ...(resolvedCampaignId ? { campaignId: resolvedCampaignId } : {}),
        });
    } else {
        CallSvc.manualOutdial(
            ani,
            callerId,
            ringTime,
            countryId,
            gateId,
            resolvedCampaignId
        );
    }
}
