import type { RecordType, LinkedRecordType } from './constants';
import type {
    ICRMLogContainerProps,
    ICRMLogFormProps,
    MatchItem,
    CreateField,
} from '../../../components/CRM/types';

export interface FormData {
    subject: string;
    company?: MatchItem | null;
    contact?: MatchItem | null;
    supportCase?: MatchItem | null;
    transaction?: MatchItem | null;
    shouldShowGrayCompanyMatchResultTip?: boolean;
}

export interface INetSuiteLogFormProps extends ICRMLogFormProps<FormData> {
    fields: CreateField[];
    matchedCompanies?: MatchItem[];
    selectedContact?: MatchItem | null;
    selectedSupportCase?: MatchItem | null;
    selectedTransaction?: MatchItem | null;
}

export type NetSuiteLogContainerProps = ICRMLogContainerProps<FormData>;

export type NetSuiteCallLogContainerProps = NetSuiteLogContainerProps;

export type NetSuiteMessageLogContainerProps = NetSuiteLogContainerProps;

export interface INetSuiteLinkedRecordFormProps {
    disabled?: boolean;
    handleCreateRecord: (
        field: string,
        options: { company: MatchItem }
    ) => void;
}

export interface NetSuiteMatchResultLabelProps {
    type: string;
    createType?: string;
    onCreate: () => void;
}

export interface INetSuiteLinkedRecordProps {
    type: RecordType;
    selectedItem?: MatchItem | null;
    formDataKey: LinkedRecordType;
    createType?: string;
    handleCreateRecord: (
        field: string,
        options: { company: MatchItem }
    ) => void;
}
