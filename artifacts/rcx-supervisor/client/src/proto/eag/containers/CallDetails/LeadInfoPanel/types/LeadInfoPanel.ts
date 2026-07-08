import type { IDataPairs } from '../../../../components/DataPairs/types/DataPairs';

export interface ILeadInfoPanel {
    dataPairs: Array<IDataPairs> | undefined;
    editLead: () => any;
    editLeadDisabled: boolean;
    CallSvc: any;
    AgentSvc: any;
}

export interface IEditLeadButton {
    editLead: () => any;
    editLeadDisabled: boolean;
}

export interface ILeadInfo {
    dataPairs: Array<IDataPairs>;
}
