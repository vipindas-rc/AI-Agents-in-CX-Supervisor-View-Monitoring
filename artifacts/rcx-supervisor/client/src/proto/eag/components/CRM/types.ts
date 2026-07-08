import type { ReactNode } from 'react';

import type { DropDownSizes } from '@ringcx/ui';

import type { SourceType } from '../../constants/crm';
export interface MatchItem {
    [x: string]: any;
    id?: string;
    name: string;
    type?: string;
    url?: Nullable<string>;
    isCurrent?: boolean;
    isSearchedResult?: boolean;
    customerId?: string;
    accountId?: string;
    contactId?: string;
    phone?: string;
    email?: string;
    recentlyCreated?: boolean;
}

export interface ICRMLogContainerProps<D = any, E = any> {
    disabled?: boolean;
    engageType?: string;
    engageInfo: E;
    hyperlinkType?: string;
    initialFormData?: D;
    matchedRecords?: MatchItem[];
    recordTypeGroups?: RecordTypeGroups;
    sourceType?: SourceType;
    shouldPopRecordWhenMatched?: boolean;
    shouldCreateRecordWhenNoMatch?: boolean;
    shouldPopRecordMoreThanOnce?: boolean;
    onFormDataChanged: (data: D) => void;
    onEngageInfoChanged: (info: any) => void;
    resetHyperlinkType?: () => void;
    reloadMatchedList?: () => void;
}

export interface ICRMLogFormProps<D = any>
    extends ICRMLogContainerProps,
        Omit<CRMFormState<D>, 'onFormDataChanged'> {}

export interface CRMFormState<D = any> {
    isLoading?: boolean;
    disabled?: boolean;
    formData: D;
    onFormDataChanged: (data: Partial<D>) => void;
}

export interface CreateField extends TooltipConfig {
    type: string;
    label?: string;
    labelTranslateKey?: string;
    disabled?: boolean;
    excludeFromCreateMenu?: boolean;
}

export interface ICreateFieldsProps extends TooltipConfig {
    type: string;
    label: string;
    disabled?: boolean;
    excludeFromCreateMenu?: boolean;
    labelTranslateKey?: string;
}

export interface ICRMSearchDetailProps {
    show: boolean;
    matchedItem?: MatchItem;
    selectedItems: MatchItem[];
    createFields: ICreateFieldsProps[];
    CrmSvc: any;
    CRMPlatform: string;
    matchedList: MatchItem[];
    handleClose: () => void;
    handleCreate: (field: string) => void;
    handleMultiSelect: (selectedItems: MatchItem[]) => void;
    iconCreator?: (item: MatchItem) => JSX.Element;
    platFormTranslateKey: string;
    type?: string;
    searchValidation?: (value?: string) => boolean;
    engageType?: string;
    formDataKey: string;
    uii?: string;
    reloadMatchedList?: () => void;
}

export interface ICRMMatchSelectProps {
    platFormTranslateKey: string;
    type: string;
    listData: MatchItem[];
    formDataKey?: string;
    size?: DropDownSizes;
    loading?: boolean;
    disabled?: boolean;
    onOpen?: (type: string) => void;
}

export interface CRMSearchResultProps {
    CrmSvc?: any;
    title: string;
    itemList: MatchItem[];
    selectedItem: MatchItem;
    isExpanded: boolean;
    toggleDataAid: string;
    resultDataAid: string;
    iconCreator?: (item: MatchItem) => ReactNode;
    handleSelect: (selectedItem: MatchItem) => void;
    handleExpanded: (expanded: boolean) => void;
}

export interface TooltipConfig {
    tooltipText?: string;
}

export interface MenuItemWithTooltipProps {
    field: ICreateFieldsProps;
    onClick: () => void;
    dataAid: string;
    disabled?: boolean;
}

export interface RecordTypeGroups {
    name?: string[];
    relatedTo?: string[];
    types?: {
        type: string;
        label: string;
    }[];
    relatedToTypes?: {
        type: string;
        label: string;
    }[];
}

export interface IEngageInfo {
    leadId?: string;
    lead?: {
        leadId?: string;
    };
    uii?: string;
}
