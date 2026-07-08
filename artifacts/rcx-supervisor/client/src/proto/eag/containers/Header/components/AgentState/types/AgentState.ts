import type { ReactNode } from 'react';

export interface IAgentState {
    AgentSvc: any;
    children?: ReactNode;
}
export interface IStates {
    value: string;
    label: string;
    color: string;
    translatedStateLabel?: string;
}
export interface ICurrentAgentState {
    baseState?: string;
    prevBaseState?: string;
    prevStateLabel?: string;
    stateLabel?: string;
    status?: string;
}
