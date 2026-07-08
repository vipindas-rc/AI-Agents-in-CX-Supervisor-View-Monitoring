import type { ReactNode } from 'react';

import type { MatchItem } from '../../../types';

export interface CRMSearchDetailProps {
    show?: boolean;
    // example ['contact','lead']
    searchFields: string[];
    // example translation of['contact','lead']
    searchFieldsTranslation: string[];
    // example ['Salesforce']
    CRMPlatform: string;
    // example 'Name','Related to','User'
    matchType: string;
    // matched result from CRM
    matchKind: string;
    // matched if people (Name) or event (Related to)
    matchedList: MatchItem[];
    // please +1 when the search results are successfully returned every time, used to expand search results
    searchSuccessCount: number;
    // searched result from CRM
    searchedList: MatchItem[];
    // selected item
    selectedItem: MatchItem;
    placeHolder?: string;
    iconCreator?: (item: MatchItem) => ReactNode;
    handleClose: () => void;
    handleCreate: (field: string) => void;
    handleSearch: (searchValue: string) => void;
    handleSelect: (selectedItem: MatchItem) => void;
}
