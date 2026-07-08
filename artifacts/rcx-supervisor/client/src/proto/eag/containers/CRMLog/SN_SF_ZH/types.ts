import type {
    ICRMLogContainerProps,
    ICRMLogFormProps,
    MatchItem,
    CreateField,
} from '../../../components/CRM/types';
import type { CRMPlatform } from '../../../constants/crm';

export enum MatchType {
    NAME = 'name',
    RELATED = 'related',
}

export interface FormData {
    subject: string;
    name?: MatchItem;
    relatedTo?: MatchItem;
    name_shouldShowGrayMatchResultTip?: boolean;
    relatedTo_shouldShowGrayMatchResultTip?: boolean;
}

export type CommonCRMPlatform =
    | CRMPlatform.ServiceNow
    | CRMPlatform.Salesforce
    | CRMPlatform.Zoho
    | CRMPlatform.Dynamics365;

export interface CommonLogContainerProps
    extends ICRMLogContainerProps<FormData> {
    isScreenPopInHistory?: boolean;
    customNameFields?: Nullable<CreateField[]>;
    customRelatedToFields?: Nullable<CreateField[]>;
}

export interface CommonCallLogContainerProps extends CommonLogContainerProps {
    isMatched: boolean;
    matchedNameItems: MatchItem[];
    matchedRelatedToItems: MatchItem[];
    platform: CommonCRMPlatform;
    usePopRecords?: any;
}

export interface CommonMessageLogContainerProps
    extends CommonLogContainerProps {
    isMatched: boolean;
    matchedNameItems: MatchItem[];
    matchedRelatedToItems: MatchItem[];
    platform: CommonCRMPlatform;
}

export interface ICommonLogFormProps extends ICRMLogFormProps<FormData> {
    nameItems?: MatchItem[];
    relatedToItems?: MatchItem[];
    platform: CommonCRMPlatform;
    useIconCreator?: any;
    customNameFields?: Nullable<CreateField[]>;
    customRelatedToFields?: Nullable<CreateField[]>;
}
