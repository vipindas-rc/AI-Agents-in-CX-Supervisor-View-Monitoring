import type { CallbackMode } from '../enums/CallBacks.enum';

export interface ICallBacksPanel {
    LeadDialogFactory: any;
    OutboundSvc: any;
    Dialog: any;
    LeadSvc: any;
    SessionSvc: any;
    E164UtilsSvc: any;
}

export interface ICallBackMode {
    label: string;
    value: CallbackMode;
}

export interface Lead {
    auxData1: string;
    auxData2: string;
    auxData3: string;
    auxData4: string;
    auxData5: string;
    campaignId: string;
    destination: string;
    dialGroupId: string;
    dialGroupName: string;
    dialTime: string;
    externId: string;
    leadId: string;
    firstName: string;
    midName: string;
    lastName: string;
    sufix: string;
    title: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    gateKeeper: string;
    $$hashKey: string;
    isFutureCallback?: boolean;
    leadState?: string;
}
