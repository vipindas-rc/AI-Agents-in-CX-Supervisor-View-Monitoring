import { type FC, useEffect, useCallback } from 'react';

import type { ICRMLogContainerProps } from '../../components/CRM/types';
import {
    CRMPlatform,
    CRMCallTypes,
    ParamsType,
    SourceType,
} from '../../constants/crm';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { LogKindContext, LogKindType } from '../../helpers/logKind';
import { DynamicsLogContainer } from '../CRMLog/Dynamics365/DynamicsLogContainer';
import { FreshdeskLogContainer } from '../CRMLog/Freshdesk/FreshdeskLogContainer';
import { HubSpotLogContainer } from '../CRMLog/HubSpot/HubSpotLogContainer';
import { NetSuiteLogContainer } from '../CRMLog/NetSuite/NetSuiteLogContainer';
import { SalesforceLogContainer } from '../CRMLog/Salesforce/SalesforceLogContainer';
import { ServiceNowLogContainer } from '../CRMLog/ServiceNow/ServiceNowLogContainer';
import type { ICRMCallLogProps } from '../CRMLog/types';
import { ZendeskLogContainer } from '../CRMLog/Zendesk/ZendeskLogContainer';
import { ZohoLogContainer } from '../CRMLog/Zoho/ZohoLogContainer';

const containerMap: Record<
    string,
    React.ComponentType<ICRMLogContainerProps>
> = {
    [CRMPlatform.Salesforce]: SalesforceLogContainer,
    [CRMPlatform.Zendesk]: ZendeskLogContainer,
    [CRMPlatform.HubSpot]: HubSpotLogContainer,
    [CRMPlatform.Dynamics365]: DynamicsLogContainer,
    [CRMPlatform.ServiceNow]: ServiceNowLogContainer,
    [CRMPlatform.NetSuite]: NetSuiteLogContainer,
    [CRMPlatform.Zoho]: ZohoLogContainer,
    [CRMPlatform.Freshdesk]: FreshdeskLogContainer,
    [CRMPlatform.Freshservice]: FreshdeskLogContainer,
};

export const CRMCallLog: FC<ICRMCallLogProps> = (props) => {
    const {
        CrmSvc,
        currentCall,
        onCallInfoLoaded,
        onSearchDetailClosed,
        defaultFormData,
        defaultHyperlinkType,
        ...restProps
    } = props;
    const CallLogContainer = containerMap[CrmSvc.integrateInfo?.platform];
    const isPredictiveOutbound = CrmSvc.isPredictiveOutbound(currentCall || {});
    // it should clear call info when unmount this component.
    const componentWillUnmount = useCallback(() => {
        onCallInfoLoaded({
            callName: '',
            hyperlink: false,
            linkType: '',
            callUrl: '',
            callId: '',
            callType: '',
        });
    }, [onCallInfoLoaded]);

    useEffect(() => {
        return componentWillUnmount;
    }, []);

    if (!CallLogContainer) {
        return null;
    }
    // Predictive Outbound: below props are used to all CRM platforms except for Salesforce
    let extendedProps = {};
    if (CrmSvc.integrateInfo?.platform === CRMPlatform.Dynamics365) {
        extendedProps = {
            shouldPopRecordWhenMatched: true,
            shouldCreateRecordWhenNoMatch: isPredictiveOutbound,
        };
    } else if (CrmSvc.integrateInfo?.platform !== CRMPlatform.Salesforce) {
        extendedProps = {
            shouldPopRecordWhenMatched:
                currentCall?.callType === CRMCallTypes.Inbound ||
                isPredictiveOutbound,
            shouldCreateRecordWhenNoMatch: isPredictiveOutbound,
        };
    }

    return (
        <LogKindContext.Provider
            value={{ logKindType: LogKindType.VOICE, visible: false }}
        >
            {currentCall && (
                <CallLogContainer
                    engageInfo={currentCall}
                    hyperlinkType={defaultHyperlinkType}
                    initialFormData={defaultFormData}
                    onEngageInfoChanged={onCallInfoLoaded}
                    resetHyperlinkType={onSearchDetailClosed}
                    engageType={ParamsType.Call}
                    // Used to distinguish active-call log page from other log pages;
                    // only active-call log page should trigger auto link.
                    sourceType={SourceType.CALL_PAGE}
                    {...restProps}
                    {...extendedProps}
                />
            )}
        </LogKindContext.Provider>
    );
};

export default CreateAngularModule(
    'crmCallLog',
    CRMCallLog,
    [
        'currentCall',
        'defaultFormData',
        'disabled',
        'defaultHyperlinkType',
        'onSearchDetailClosed',
        'onCallInfoLoaded',
        'onFormDataChanged',
    ],
    [
        'CallSvc',
        'CrmSvc',
        'growl',
        'CfAgentScriptSvc',
        'AgentSvc',
        'SURVEY_POP_TYPE',
    ]
);
