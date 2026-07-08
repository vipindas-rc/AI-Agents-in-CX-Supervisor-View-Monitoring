import type {
    ICallDetails,
    ILeadDetails,
} from '../../../layout/CallDetails/types/CallDetails';

export interface IPhoneDetails {
    details: ICallDetails;
    $state: any;
    LeadDialogFactory: any;
    CallSvc: any;
    AgentSvc: any;
    LeadSvc: any;
    ProgressiveDialSvc: any;
    leadDetails: ILeadDetails;
    loadFrame: (id: string) => any;
    shouldShowAgentAssistTab: boolean;
    contactManagementEnabled: boolean;
    isScriptAvailable: boolean;
    isAgentPageAvailable?: boolean;
    selectedTabIndex?: number;
    onTabChange?: (index: number) => void;
    originatedFrom?: string;
    phoneDetailsOnPreview: boolean;
}
export interface IPhoneDetailsHeader {
    withScript: boolean;
    isAgentPageAvailable?: boolean;
    selectedTabIndex?: number;
    onTabChange?: (index: number) => void;
    showExpendBtn: boolean;
    isPanelOpen: boolean;
    setIsPanelOpen: any;
}

export type IUnifiedWidgetHeader = {
    widgetTitle?: string;
    expanded: boolean;
    onTogglePanel: () => void;
    onPanelToggled?: (isExpanded: boolean) => void;
    showToggleButton: boolean;
    isScriptAvailable?: boolean;
    isAgentPageAvailable?: boolean;
    selectedTabIndex?: number;
    onTabChange?: (index: number) => void;
};

export type IPhoneUnifiedDetails = {
    displayMainColumn: boolean;
    SessionSvc: any;
    isRcAgent: boolean;
    E164UtilsSvc: any;
} & Omit<
    IPhoneDetails,
    'isScriptAvailable' | 'phoneDetailsOnPreview' | 'contactManagementEnabled'
> &
    Pick<IUnifiedWidgetHeader, 'expanded' | 'onTogglePanel' | 'onPanelToggled'>;

export type GetInteractionDetailsParams = Pick<IPhoneDetails, 'details'>;
