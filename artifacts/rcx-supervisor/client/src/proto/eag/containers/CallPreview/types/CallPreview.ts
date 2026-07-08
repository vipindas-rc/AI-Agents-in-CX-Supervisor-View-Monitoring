import type {
    ICallDetails,
    ILeadDetails,
} from '../../../layout/CallDetails/types/CallDetails';

export interface ICallPreviewDetail {
    details: ICallDetails;
    $state: any;
    LeadDialogFactory: any;
    CallSvc: any;
    AgentSvc: any;
    LeadSvc: any;
    ProgressiveDialSvc: any;
    CallPreviewSvc: any;
    leadDetails: ILeadDetails;
    loadFrame: (id: string) => any;
    isScriptAvailable: boolean;
    contactManagementEnabled: boolean;
    expanded: boolean;
    onTogglePanel: () => void;
    onPanelToggled: (isExpanded: boolean) => void;
}

export interface IUnifiedCallPreviewDetails {
    displayMainColumn: boolean;
    expanded: boolean;
    onPanelToggled: (isExpanded: boolean) => void;
    onTogglePanel: () => void;
    leadDetails: ILeadDetails;
    AgentSvc: any;
    CallSvc: any;
    SessionSvc: any;
    CallPreviewSvc: any;
    isRcAgent: boolean;
    details: ICallDetails;
    $state: any;
    LeadDialogFactory: any;
    LeadSvc: any;
    ProgressiveDialSvc: any;
}
