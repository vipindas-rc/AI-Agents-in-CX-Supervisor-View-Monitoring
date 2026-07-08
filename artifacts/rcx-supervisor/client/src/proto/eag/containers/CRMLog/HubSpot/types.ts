import type {
    ICRMLogContainerProps,
    ICRMLogFormProps,
    MatchItem,
    RecordTypeGroups,
} from '../../../components/CRM/types';

export type HubSpotLogContainerProps =
    ICRMLogContainerProps<IHubSpotLogFormData>;

export type HubSpotCallLogContainerProps = HubSpotLogContainerProps;

export type HubSpotMessageLogContainerProps = HubSpotLogContainerProps;

export interface IHubSpotLogFormProps
    extends ICRMLogFormProps<IHubSpotLogFormData> {
    matchedAssociations?: MatchItem[];
    outcomeList?: MatchItem[];
    typeGroups: RecordTypeGroups;
}

export interface IHubSpotLogFormData {
    subject: string;
    outcomeId?: string;
    associations?: MatchItem[];
    displayName: string;
    associations_shouldShowGrayMatchResultTip?: boolean;
}
