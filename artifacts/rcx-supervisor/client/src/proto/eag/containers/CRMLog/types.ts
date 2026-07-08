import type { MatchItem } from '../../components/CRM/types';

export interface CallInfo {
    callName: string;
    callUrl?: Nullable<string>;
    callId?: Nullable<string>;
    callType?: Nullable<string>;
    hyperlink: boolean;
    linkType: string;
}

export interface ICommonPopRecordsProps {
    currentCall?: any;
    isMatched?: boolean;
    matchedNameItems?: MatchItem[];
    matchedRelatedToItems?: MatchItem[];
    shouldPopRecordWhenMatched?: boolean;
    shouldCreateRecordWhenNoMatch?: boolean;
    shouldPopRecordMoreThanOnce?: boolean;
}

export interface ICRMCallLogProps {
    disabled: boolean;
    currentCall: any;
    defaultFormData?: any;
    CallSvc?: any;
    CrmSvc?: any;
    AgentSvc?: any;
    CfAgentScriptSvc?: any;
    SURVEY_POP_TYPE?: { SUPPRESS: string };
    growl: any;
    defaultHyperlinkType?: string;
    shouldPopRecordWhenMatched?: boolean;
    shouldCreateRecordWhenNoMatch?: boolean;
    shouldPopRecordMoreThanOnce?: boolean;
    onSearchDetailClosed?: () => void;
    onCallInfoLoaded: (callInfo: CallInfo) => void;
    onFormDataChanged: (data: any) => void;
}
