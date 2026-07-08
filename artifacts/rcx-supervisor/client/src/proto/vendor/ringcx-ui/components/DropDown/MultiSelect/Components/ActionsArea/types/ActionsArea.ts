import type { SyntheticEvent } from 'react';

export default interface IActionsArea {
    allSelected: boolean;
    nothingSelected: boolean;
    selectAllText: string;
    deselectAllText: string;
    onSelectAll: (e: SyntheticEvent) => void;
    onDeselectAll: (e: SyntheticEvent) => void;
}
