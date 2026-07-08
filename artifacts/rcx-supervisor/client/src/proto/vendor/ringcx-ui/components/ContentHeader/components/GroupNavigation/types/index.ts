import type {
    IDropDownData,
    IMenuItem,
    ISingleSelectProps,
} from '../../../../DropDown';

export type GroupNavigationType = {
    groupItems: IDropDownData;
    currentEntityId: IMenuItem['id'];
    disabled: boolean;
    width?: number;
    onChange: ISingleSelectProps['onChange'];
    noResultsFoundText?: string;
};
