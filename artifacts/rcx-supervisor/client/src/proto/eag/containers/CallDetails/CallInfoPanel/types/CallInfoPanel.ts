import type { IDataPairs } from '../../../../components/DataPairs/types/DataPairs';

export interface ICallInfoPanel {
    callType: string | undefined;
    dataPairs: Array<IDataPairs> | undefined;
    duration: number | undefined;
    callUii: string;
    confirmationFunction: any;
    CallSvc: any;
    AgentSvc: any;
    originatedFrom?: string;
    $state: any;
}

export interface ICallTimer {
    callType: string;
    duration: number;
}

export interface ICallInfo {
    dataPairs: Array<IDataPairs>;
}
