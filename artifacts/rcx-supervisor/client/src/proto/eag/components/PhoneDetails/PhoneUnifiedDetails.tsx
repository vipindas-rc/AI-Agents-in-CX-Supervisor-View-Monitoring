import { useRef } from 'react';

import { parsePhoneNumber, PHONE_DELIMETER } from '@ringcx/shared';
import { useTranslation } from 'react-i18next';

import { AgentAssistWidget } from './agentAssist/AgentAssistWidget';
import { getInteractionDetailsInfo } from './helpers';
import { type IPhoneUnifiedDetails } from './types/PhoneDetails';
import {
    Interaction,
    ContactManagement,
    PageType,
} from '../../containers/ContactManagement';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { parseJsonIfValid } from '../../helpers/utils';
import { type Widget } from '../../helpers/widgets';
import { CallDetails } from '../../layout/CallDetails/CallDetails';
import { DialNumberButton } from '../../layout/CallDetails/components/DialNumberButton';
import type { IPhoneDestination } from '../../layout/CallDetails/types/CallDetails';
import { ContactInfoContainerWidget } from '../../layout/Widgets/ContactInfoContainerWidget';
import { WidgetsColumnLayout } from '../../layout/Widgets/WidgetsColumnLayout';

export const PhoneUnifiedDetails = (props: IPhoneUnifiedDetails) => {
    const {
        details,
        leadDetails,
        $state,
        CallSvc,
        AgentSvc,
        LeadSvc,
        ProgressiveDialSvc,
        SessionSvc,
        loadFrame,
        shouldShowAgentAssistTab,
        LeadDialogFactory,
        originatedFrom,
        isRcAgent,
        E164UtilsSvc,
    } = props;
    const { callInfoData = [], ...restDetails } = details;
    const { currentLeadIndex } = LeadSvc.selectedPreviewLead || {};
    const destinationFromLead = E164UtilsSvc.getProperty(
        LeadSvc.selectedPreviewLead,
        'destination'
    );
    const isOmniAccount = SessionSvc.getMappedWithDigitalStatus();
    const contactManagementEnabled =
        isOmniAccount &&
        isRcAgent &&
        AgentSvc.agentPermissions?.allowContactManagement;
    const phoneNumber =
        restDetails.destination[0]?.destination ||
        destinationFromLead?.split(PHONE_DELIMETER)[currentLeadIndex - 1] ||
        destinationFromLead;
    const { segmentId = '', sessionData } = CallSvc.currentCall;
    const parsedPhoneNumber = phoneNumber
        ? parsePhoneNumber(phoneNumber)
        : null;
    const routeName = $state.current.name;
    const routeContextRef = useRef({
        isCallDetail: ['dialpad.detail', 'interaction.phone.detail'].some(
            (stateName) => routeName.includes(stateName)
        ),
        isCallHistory: routeName.includes('callHistory'),
        isCampaignDetail: routeName.includes('preview.detail'),
    });

    const { isCallDetail, isCallHistory, isCampaignDetail } =
        routeContextRef.current;
    const isActivityIdUseless = isCampaignDetail;
    let section = PageType.Unknown;
    if (isCallDetail) {
        section = PageType.Call;
    } else if (isCampaignDetail) {
        section = PageType.Campaign;
    }
    const { t } = useTranslation();

    const sessionDataParse = parseJsonIfValid(sessionData);

    const externalData = sessionDataParse?.rcx?.cm ?? {};

    const interactionDetailsInfo = getInteractionDetailsInfo({
        details,
    });

    const renderPhoneBlock = () => {
        const { destination, manualOutDial } = restDetails;
        const availableDestination = destination.filter(
            (des) => !!des.displayNumber
        );
        if (!availableDestination.length) {
            return null;
        }
        return (
            <div className='flex flex-wrap gap-1'>
                {availableDestination.map((dest: IPhoneDestination, index) => (
                    <DialNumberButton
                        {...{
                            LeadSvc,
                            ProgressiveDialSvc,
                            dest,
                            isCallHistory,
                        }}
                        manualOutDial={manualOutDial}
                        useSpringUI
                        key={index}
                    />
                ))}
            </div>
        );
    };

    const widgets: Widget[] = [
        {
            name: 'lead',
            title: t('PHONE.FLYOVER.TAB_LEAD'),
            visible: !!leadDetails?.leadId,
            render: () => (
                <CallDetails
                    details={restDetails}
                    leadDetails={leadDetails}
                    $state={$state}
                    LeadDialogFactory={LeadDialogFactory}
                    CallSvc={CallSvc}
                    AgentSvc={AgentSvc}
                    LeadSvc={LeadSvc}
                    ProgressiveDialSvc={ProgressiveDialSvc}
                    originatedFrom={originatedFrom}
                    autoWidth
                />
            ),
        },
        {
            name: 'assist',
            title: t('PHONE.FLYOVER.TAB_AGENT_ASSIST'),
            visible: shouldShowAgentAssistTab,
            render: (_, visible = true) => (
                <AgentAssistWidget
                    id='agentAssistBindingNode'
                    loadFrame={loadFrame}
                    visible={visible}
                />
            ),
        },
        {
            name: 'contact info',
            title: t('PHONE.FLYOVER.TAB_CONTACT_INFO'),
            children: [
                {
                    name: 'details',
                    title: t('PHONE.FLYOVER.TAB_DETAILS'),
                    visible: !!callInfoData.length,
                    render: (enableCollapse: boolean) => (
                        <Interaction
                            uii={details.callUii ?? ''}
                            isCampaign={details?.isCampaign}
                            source={details.source}
                            detailInfoData={interactionDetailsInfo}
                            enableCollapse={enableCollapse}
                            defaultExpanded={!contactManagementEnabled}
                            isVoiceChannel
                            AgentSvc={AgentSvc}
                            CallSvc={CallSvc}
                            origin={'PROGRESS'}
                            renderPhoneBlock={renderPhoneBlock}
                            enableCallQuality={
                                AgentSvc.agentSettings?.enableCallQuality
                            }
                            section={section}
                        />
                    ),
                },
                {
                    name: 'contact info',
                    title: t('PHONE.FLYOVER.TAB_CONTACT_INFO'),
                    visible: contactManagementEnabled,
                    render: () => (
                        <ContactManagement
                            AgentSvc={AgentSvc}
                            activityId={segmentId}
                            phoneNumber={parsedPhoneNumber?.e164 ?? ''}
                            section={section}
                            channelType='VOICE'
                            isActivityIdUseless={isActivityIdUseless}
                            dialogId={details.dialogId}
                            isCallDetail={isCallDetail}
                            externalData={externalData}
                        />
                    ),
                },
            ],
            render: (childrenWidgets: Widget[]) => (
                <ContactInfoContainerWidget childrenWidgets={childrenWidgets} />
            ),
        },
    ];

    return (
        <WidgetsColumnLayout {...props} widgets={widgets} section={section} />
    );
};

export default CreateAngularModule(
    'phoneUnifiedDetails',
    PhoneUnifiedDetails,
    [
        'displayMainColumn',
        'expanded',
        'onTogglePanel',
        'onPanelToggled',
        'details',
        'leadDetails',
        'loadFrame',
        'shouldShowAgentAssistTab',
        'originatedFrom',
        'isRcAgent',
    ],
    [
        '$state',
        'LeadDialogFactory',
        'CallSvc',
        'AgentSvc',
        'LeadSvc',
        'ProgressiveDialSvc',
        'SessionSvc',
        'E164UtilsSvc',
    ],
    true
);
