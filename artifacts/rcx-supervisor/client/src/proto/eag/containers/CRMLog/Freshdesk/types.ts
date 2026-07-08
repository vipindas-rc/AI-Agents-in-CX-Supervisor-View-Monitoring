import type { DropDownSizes } from '@ringcx/ui';

import type {
    ICRMLogContainerProps,
    ICRMLogFormProps,
} from '../../../components/CRM/types';
import type { MatchItem } from '../../../components/CRMMatchResult/types';

export type FreshdeskTicket = {
    id: string;
    subject: string;
    userId?: string;
    url?: string;
    isManuallyCreated?: boolean;
};

export interface IFreshdeskCallLogFormProps {
    disabled: boolean;
    subject: string;
    selectedUser: MatchItem;
    selectedTicketId: string;
    matchedUsers: MatchItem[];
    matchedTickets: FreshdeskTicket[];
    searchedList: MatchItem[];
    searchSuccessCount: number;
    onChangeSubject: (newValue: string) => void;
    handleCreate: (field: string) => void;
    handleSearch: (searchValue: string) => void;
    handleSelect: (selectedItem: MatchItem) => void;
    handleSelectTicket: (id: string) => void;
    handleCreateTicket: () => void;
    onShowSearchDetail: () => void;
    onSearchDetailClosed?: () => void;
    defaultHyperlinkType?: string;
    selectSize?: DropDownSizes;
    CrmSvc?: any;
    currentUii?: string;
    shouldShowGrayUserMatchResultTip: boolean;
}

export interface IFreshdeskLogFormData {
    subject: string;
    user?: MatchItem;
    user_shouldShowGrayMatchResultTip?: boolean;
    ticket?: FreshdeskTicket;
    phone?: string;
    email?: string;
    isPhoneManualEdited?: boolean;
    isEmailManualEdited?: boolean;
    isPhoneDisabled?: boolean;
    isEmailDisabled?: boolean;
    isTicketManuallyCreated?: boolean;
    hasPhoneError?: boolean;
    hasEmailError?: boolean;
    phoneErrorType?: string;
    emailErrorType?: string;
}

export type FreshdeskCallLogInfo = {
    subject: string;
    ticket: { id: string };
    user: { id?: string; name: string };
    shouldShowGrayUserMatchResultTip?: boolean;
};
export type IFreshdeskPopupData = {
    disabled: boolean;
    isMatched: boolean;
    engageInfo: any;
    matchedUsers: MatchItem[];
    shouldPopRecordWhenMatched: boolean;
    shouldCreateRecordWhenNoMatch: boolean;
    shouldPopRecordMoreThanOnce: boolean;
    afterCreateUser: (user: MatchItem) => void;
};
export interface FreshdeskLogContainerProps
    extends ICRMLogContainerProps<IFreshdeskLogFormData> {
    selectSize?: DropDownSizes;
}
export interface IFreshdeskLogFormProps
    extends ICRMLogFormProps<IFreshdeskLogFormData> {
    matchedUsers: MatchItem[];
    selectSize?: DropDownSizes;
}
export interface CachedTicket extends FreshdeskTicket {
    isManuallyCreated: boolean;
}
