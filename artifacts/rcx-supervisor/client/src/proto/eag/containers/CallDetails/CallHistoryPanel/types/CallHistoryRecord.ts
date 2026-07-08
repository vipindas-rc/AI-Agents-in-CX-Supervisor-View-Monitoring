import type { ReactNode } from 'react';

export interface ICallHistoryRecord {
    historyRecord: IHistoryRecord;
    key: number;
}

export interface ICallHistoryPanel {
    leadSvc: any;
    leadId: string;
    CallSvc: any;
    AgentSvc: any;
    className?: string;
}

export interface ILoadHistoryButton {
    leadSvc: any;
    updateHistoryList: any;
    leadId: string;
}

export interface IHistoryState {
    title: string;
    icon: ReactNode;
    position?: any;
    disabled: boolean;
}

export type IHistoryComponentArray = {};

export interface IHistoryRecord {
    passNumber: string;
    passDts: string;
    agentName: string;
    agentDisposition: string;
    agentNotes: string;
    passDisposition: string;
    passUii: string;
}
