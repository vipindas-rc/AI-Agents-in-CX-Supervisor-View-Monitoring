import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { StyledPhoneDetails } from './PhoneDetails.styled';
import { PhoneDetailsHeader } from './PhoneDetailsHeader';
import type { IPhoneDetails } from './types/PhoneDetails';
import {
    UIStateKey,
    UIStateService,
} from '../../common/services/UIStateService';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { CallDetails } from '../../layout/CallDetails/CallDetails';
import { FlyoverPanel } from '../../layout/CallDetails/components/FlyoverPanel';

export const PhoneDetails: FC<IPhoneDetails> = ({
    details,
    leadDetails,
    $state,
    isScriptAvailable,
    isAgentPageAvailable,
    selectedTabIndex: vmSelectedTabIndex,
    onTabChange,
    loadFrame,
    shouldShowAgentAssistTab,
    contactManagementEnabled,
    originatedFrom,
    phoneDetailsOnPreview,
    LeadDialogFactory,
    CallSvc,
    AgentSvc,
    LeadSvc,
    ProgressiveDialSvc,
}) => {
    const routeName = $state?.current?.name ?? '';
    const routeContextRef = useRef({
        shouldDefaultOpen: routeName.includes('preview.detail'),
    });
    const { shouldDefaultOpen } = routeContextRef.current;
    const [selectedTab, setSelectedTab] = useState(
        () => vmSelectedTabIndex ?? 0
    );

    useEffect(() => {
        if (typeof vmSelectedTabIndex === 'number') {
            setSelectedTab(vmSelectedTabIndex);
        }
    }, [vmSelectedTabIndex]);
    const [isPanelOpen, setIsPanelOpen] = useState(() => {
        if (shouldDefaultOpen) {
            return (
                UIStateService.restoreState<boolean>(
                    UIStateKey.LEAD_DETAILS_EXPAND_STATE
                ) ?? true
            );
        }

        return (
            UIStateService.restoreState<boolean>(
                UIStateKey.CALL_DETAILS_EXPAND_STATE
            ) ?? false
        );
    });

    const withScript = phoneDetailsOnPreview || isScriptAvailable;
    const hasPageOrScript = withScript || !!isAgentPageAvailable;
    const useFlyoverPanel = hasPageOrScript || shouldShowAgentAssistTab;

    const onPanelOpen = (state: boolean) => {
        setIsPanelOpen(state);

        const uiStateKey = shouldDefaultOpen
            ? UIStateKey.LEAD_DETAILS_EXPAND_STATE
            : UIStateKey.CALL_DETAILS_EXPAND_STATE;

        UIStateService.saveState(uiStateKey, state);
    };

    const handleTabChange = (index: number) => {
        setSelectedTab(index);
        onTabChange?.(index);
    };

    return (
        <StyledPhoneDetails withoutScript={!hasPageOrScript}>
            <PhoneDetailsHeader
                withScript={withScript}
                isAgentPageAvailable={isAgentPageAvailable}
                selectedTabIndex={selectedTab}
                onTabChange={handleTabChange}
                showExpendBtn={useFlyoverPanel}
                isPanelOpen={isPanelOpen}
                setIsPanelOpen={onPanelOpen}
            ></PhoneDetailsHeader>

            {!hasPageOrScript && (
                <CallDetails
                    $state={$state}
                    details={details}
                    leadDetails={leadDetails}
                    LeadDialogFactory={LeadDialogFactory}
                    CallSvc={CallSvc}
                    AgentSvc={AgentSvc}
                    LeadSvc={LeadSvc}
                    ProgressiveDialSvc={ProgressiveDialSvc}
                    originatedFrom={originatedFrom}
                />
            )}
            {useFlyoverPanel && (
                <FlyoverPanel
                    details={details}
                    isPanelOpen={isPanelOpen}
                    setIsPanelOpen={onPanelOpen}
                    leadDetails={leadDetails}
                    loadFrame={loadFrame}
                    withScript={hasPageOrScript}
                    shouldShowAgentAssistTab={shouldShowAgentAssistTab}
                    contactManagementEnabled={contactManagementEnabled}
                    originatedFrom={originatedFrom}
                    $state={$state}
                    LeadDialogFactory={LeadDialogFactory}
                    CallSvc={CallSvc}
                    AgentSvc={AgentSvc}
                    LeadSvc={LeadSvc}
                    ProgressiveDialSvc={ProgressiveDialSvc}
                ></FlyoverPanel>
            )}
        </StyledPhoneDetails>
    );
};
export default CreateAngularModule(
    'phoneDetails',
    PhoneDetails,
    [
        'isScriptAvailable',
        'isAgentPageAvailable',
        'selectedTabIndex',
        'onTabChange',
        'details',
        'leadDetails',
        'loadFrame',
        'shouldShowAgentAssistTab',
        'contactManagementEnabled',
        'originatedFrom',
        'phoneDetailsOnPreview',
    ],
    [
        '$state',
        'LeadDialogFactory',
        'CallSvc',
        'AgentSvc',
        'LeadSvc',
        'ProgressiveDialSvc',
    ]
);
