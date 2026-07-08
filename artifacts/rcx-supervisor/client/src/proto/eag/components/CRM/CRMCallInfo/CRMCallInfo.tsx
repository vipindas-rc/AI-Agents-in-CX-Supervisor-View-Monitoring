import type { FC } from 'react';

import { AgentMd, NotesMd } from '@ringcentral/spring-icon';
import { Icon, Tooltip, IconButton } from '@ringcentral/spring-ui';
import { useTranslation } from 'react-i18next';

import {
    CRMCallInfoWrapper,
    StyledScriptButton,
    StyledDestination,
    StyledExternalLink,
    StyledPhoneTitle,
    StyledPhoneTitleText,
    ArrowRight,
    StyledQueueName,
    StyledQueueNameText,
    StyledQueueNameIcon,
} from './CRMCallInfo.styled';
import { StartRenderType } from '../../../constants/crm';
import {
    CRM_CALL_INFO_NAME,
    CRM_CALL_INFO_DESTINATION,
    CRM_CALL_INFO_QUEUE_NAME,
    CRM_CALL_INFO_SCRIPT_BUTTON,
} from '../../../constants/testIds';

export interface CallInfo {
    callName: string;
    callUrl?: Nullable<string>;
    callId?: Nullable<string>;
    callType?: Nullable<string>;
    hyperlink: boolean;
    linkType: string;
}
export interface ICRMCallInfoProps {
    CrmSvc: any;
    crmCallInfo: Nullable<CallInfo>;
    call: any;
    destination: string;
    queueName: string;
    showCRMSearchDetail: () => void;
}
export const CRMCallInfo: FC<ICRMCallInfoProps> = ({
    CrmSvc,
    crmCallInfo,
    call,
    destination,
    queueName,
    showCRMSearchDetail,
}) => {
    const { t } = useTranslation();
    if (!crmCallInfo) {
        return null;
    }
    const canOpenRecord = !!(
        (CrmSvc?.canOpenRecord() &&
            crmCallInfo &&
            crmCallInfo.callId &&
            crmCallInfo.callType) ||
        crmCallInfo.callUrl
    );

    const openExternalLink = () => {
        CrmSvc.openRecord({
            type: crmCallInfo.callType,
            params: crmCallInfo.callId,
            url: crmCallInfo.callUrl,
        });
    };

    const scriptEnabled = CrmSvc.isShowScriptIcon(call);

    const showScript = () => {
        CrmSvc.checkAndResetScript(call);
        const enableSummary = CrmSvc.hasAISummaryInScript(call);
        CrmSvc.startRender({
            type: StartRenderType.SCRIPT,
            url: CrmSvc.integrateInfo?.scriptUrl,
            renderId: CrmSvc.getScriptRenderId(call),
            params: {
                scriptId: call.script?.scriptId,
                uii: call.uii,
                enableSummary: enableSummary,
                type: call.type,
            },
        });
    };

    return (
        <CRMCallInfoWrapper data-sui-theme-scope>
            {scriptEnabled && (
                <StyledScriptButton>
                    <Tooltip title={t('SCRIPT.SCRIPT')} color='neutral'>
                        <IconButton
                            symbol={NotesMd}
                            color='neutral'
                            size='medium'
                            variant='inverted'
                            background={false}
                            onClick={showScript}
                            data-aid={CRM_CALL_INFO_SCRIPT_BUTTON}
                        ></IconButton>
                    </Tooltip>
                </StyledScriptButton>
            )}
            <StyledPhoneTitle
                $clickable={!!crmCallInfo.hyperlink}
                onClick={showCRMSearchDetail}
                aria-label={crmCallInfo.callName}
                data-aid={CRM_CALL_INFO_NAME}
            >
                <Tooltip title={crmCallInfo.callName} color='neutral'>
                    <StyledPhoneTitleText>
                        {crmCallInfo.callName}
                    </StyledPhoneTitleText>
                </Tooltip>
                {canOpenRecord && (
                    <StyledExternalLink
                        className='icon-external-link'
                        onClick={(e) => {
                            e.stopPropagation();
                            openExternalLink();
                        }}
                    ></StyledExternalLink>
                )}
                {crmCallInfo.hyperlink && <ArrowRight />}
            </StyledPhoneTitle>
            <StyledDestination data-aid={CRM_CALL_INFO_DESTINATION}>
                {destination}
            </StyledDestination>
            {queueName && (
                <StyledQueueName>
                    <Tooltip title={queueName} color='neutral'>
                        <StyledQueueNameText
                            data-aid={CRM_CALL_INFO_QUEUE_NAME}
                        >
                            {queueName}
                        </StyledQueueNameText>
                    </Tooltip>
                    <StyledQueueNameIcon>
                        <Icon color='neutral' size='small' symbol={AgentMd} />
                    </StyledQueueNameIcon>
                </StyledQueueName>
            )}
        </CRMCallInfoWrapper>
    );
};
