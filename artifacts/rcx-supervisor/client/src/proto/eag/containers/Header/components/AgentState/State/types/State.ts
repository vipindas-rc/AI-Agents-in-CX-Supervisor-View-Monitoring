import type { IStates } from '../../types/AgentState';
export interface IState {
    onAgentStateSelect(value: IStates): void;
    value: string;
    label: string;
    translatedStateLabel?: string;
    color: string;
}
