import { AgentLoginType } from '../../../constants/AgentLoginType';
import { DialMode } from '../../../constants/DialMode';

export function isOutboundAgent(OutboundSvc: any, AgentSvc: any): boolean {
    const dg = OutboundSvc.getDialGroup();
    const agentLogin = AgentSvc.agentSettings.loginType;

    return (
        (agentLogin === AgentLoginType.OUTBOUND ||
            agentLogin === AgentLoginType.BLENDED) &&
        (dg.dialMode === DialMode.PREVIEW ||
            dg.dialMode === DialMode.TCPA_SAFE_MODE)
    );
}

export function isPreviewGroup(OutboundSvc: any): boolean {
    const dg = OutboundSvc.getDialGroup();
    return dg.dialMode === DialMode.PREVIEW;
}

export function isTcpaGroup(OutboundSvc: any): boolean {
    const dg = OutboundSvc.getDialGroup();
    return dg.dialMode === DialMode.TCPA_SAFE_MODE;
}

export function isHciGroup(OutboundSvc: any): boolean {
    return OutboundSvc.hciEnabled() || OutboundSvc.getDialGroup().hciEnabled;
}

export function shouldShowLeads(AgentSvc: any) {
    return (
        AgentSvc.agentPermissions.allowLeadSearch ||
        AgentSvc.agentPermissions.allowLeadInserts
    );
}
