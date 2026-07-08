import { parsePhoneNumber } from '@ringcx/shared';
import { useTranslation } from 'react-i18next';

import { getInteractionDetailsInfo } from '../../../components/PhoneDetails/helpers';
import { parseJsonIfValid } from '../../../helpers/utils';
import { type Widget } from '../../../helpers/widgets';
import { CallDetails } from '../../../layout/CallDetails/CallDetails';
import { ContactInfoContainerWidget } from '../../../layout/Widgets/ContactInfoContainerWidget';
import { WidgetsColumnLayout } from '../../../layout/Widgets/WidgetsColumnLayout';
import { ContactManagement, PageType } from '../../ContactManagement';
import { Interaction } from '../../ContactManagement/Interaction';
import type { IUnifiedCallPreviewDetails } from '../types/CallPreview';

export const UnifiedCallPreviewDetails = (
    props: IUnifiedCallPreviewDetails
) => {
    const {
        AgentSvc,
        CallSvc,
        SessionSvc,
        isRcAgent,
        details,
        CallPreviewSvc,
        $state,
        LeadDialogFactory,
        LeadSvc,
        ProgressiveDialSvc,
        leadDetails,
        ...restProps
    } = props;
    const { callInfoData = [], ...restDetails } = details;
    const isOmniAccount = SessionSvc.getMappedWithDigitalStatus();
    const contactManagementEnabled =
        isOmniAccount &&
        isRcAgent &&
        AgentSvc.agentPermissions?.allowContactManagement;

    const { t } = useTranslation();

    const interactionDetailsInfo = getInteractionDetailsInfo({
        details,
    });

    const callPreviewInfo = CallPreviewSvc.callPreviewInfo || {};

    const { aniE164, ani, sessionData } = callPreviewInfo;

    const phoneNumber = aniE164 || ani || '';

    const sessionDataParse = parseJsonIfValid(sessionData);

    const externalData = sessionDataParse?.rcx?.cm ?? {};

    const parsedPhoneNumber = phoneNumber
        ? parsePhoneNumber(phoneNumber)
        : null;

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
                    autoWidth
                    CallPreviewSvc={CallPreviewSvc}
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
                            source={details.source}
                            detailInfoData={interactionDetailsInfo}
                            enableCollapse={enableCollapse}
                            defaultExpanded={!contactManagementEnabled}
                            isVoiceChannel
                            AgentSvc={AgentSvc}
                            CallSvc={CallSvc}
                            enableCallQuality={false}
                            section={PageType.VoicePreview}
                            enableCopyInteractionId={false}
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
                            activityId={''}
                            phoneNumber={parsedPhoneNumber?.e164 ?? ''}
                            section={PageType.VoicePreview}
                            channelType='VOICE'
                            isActivityIdUseless={true}
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

    return <WidgetsColumnLayout widgets={widgets} {...restProps} />;
};
