import type { ITextInput } from '../../TextInput/types';

export type ISearchInput = {
    enableFilter?: boolean;
    filterInitState?: boolean;
    filterLabel?: string;
    filterCount?: number;
    onFilterToggle?: (isActive: boolean) => void;
    onClean?(): void;
    showLeftDropDown?: boolean;
    ariaLabel?: string;
} & ITextInput;
