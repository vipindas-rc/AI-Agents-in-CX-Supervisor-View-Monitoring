import type { DropDownSizes } from '@ringcx/ui';

import type {
    ICRMLogContainerProps,
    ICRMLogFormProps,
    MatchItem,
} from '../../../components/CRM/types';

export interface ZendeskLogContainerProps
    extends ICRMLogContainerProps<IZendeskLogFormData> {
    selectSize?: DropDownSizes;
}

export interface IZendeskLogFormProps
    extends ICRMLogFormProps<IZendeskLogFormData> {
    matchedUsers: MatchItem[];
    selectedTicket?: ZendeskTicket;
    selectSize?: DropDownSizes;
}

export interface IZendeskLogFormData {
    subject: string;
    user?: MatchItem;
    user_shouldShowGrayMatchResultTip?: boolean;
    ticket?: ZendeskTicket;
}

export type ZendeskTicket = {
    id: string;
    subject: string;
    userId?: string;
    url?: string;
};

export type IZendeskPopupData = {
    disabled: boolean;
    isMatched: boolean;
    engageInfo: any;
    matchedUsers: MatchItem[];
    afterCreateUser: (newUsers: MatchItem) => void;
    shouldPopRecordWhenMatched: boolean;
    shouldCreateRecordWhenNoMatch: boolean;
    shouldPopRecordMoreThanOnce: boolean;
};
