import type { FC } from 'react';

import { StyledPhoneDetails } from '../../../components/PhoneDetails/PhoneDetails.styled';
import { PhoneDetailsHeader } from '../../../components/PhoneDetails/PhoneDetailsHeader';
import { CallDetails } from '../../../layout/CallDetails/CallDetails';
import { FlyoverPanel } from '../../../layout/CallDetails/components/FlyoverPanel';
import type { ICallPreviewDetail } from '../types/CallPreview';

export const CallPreviewDetail: FC<ICallPreviewDetail> = ({
    details,
    leadDetails,
    $state,
    isScriptAvailable,
    loadFrame,
    contactManagementEnabled,
    LeadDialogFactory,
    CallSvc,
    AgentSvc,
    LeadSvc,
    ProgressiveDialSvc,
    expanded,
    onTogglePanel,
    onPanelToggled,
    CallPreviewSvc,
}) => {
    const useFlyoverPanel = isScriptAvailable;
    const setIsPanelOpen = (value: boolean) => {
        onTogglePanel();
        onPanelToggled(value);
    };

    return (
        <StyledPhoneDetails withoutScript={!isScriptAvailable}>
            <PhoneDetailsHeader
                withScript={isScriptAvailable}
                showExpendBtn={useFlyoverPanel}
                isPanelOpen={expanded}
                setIsPanelOpen={setIsPanelOpen}
            />

            {!isScriptAvailable && (
                <CallDetails
                    details={details}
                    leadDetails={leadDetails}
                    $state={$state}
                    LeadDialogFactory={LeadDialogFactory}
                    CallSvc={CallSvc}
                    AgentSvc={AgentSvc}
                    LeadSvc={LeadSvc}
                    ProgressiveDialSvc={ProgressiveDialSvc}
                    CallPreviewSvc={CallPreviewSvc}
                />
            )}

            {useFlyoverPanel && (
                <FlyoverPanel
                    details={details}
                    isPanelOpen={expanded}
                    setIsPanelOpen={setIsPanelOpen}
                    leadDetails={leadDetails}
                    loadFrame={loadFrame}
                    withScript={isScriptAvailable}
                    shouldShowAgentAssistTab={false}
                    contactManagementEnabled={contactManagementEnabled}
                    $state={$state}
                    LeadDialogFactory={LeadDialogFactory}
                    CallSvc={CallSvc}
                    AgentSvc={AgentSvc}
                    LeadSvc={LeadSvc}
                    ProgressiveDialSvc={ProgressiveDialSvc}
                    CallPreviewSvc={CallPreviewSvc}
                />
            )}
        </StyledPhoneDetails>
    );
};
