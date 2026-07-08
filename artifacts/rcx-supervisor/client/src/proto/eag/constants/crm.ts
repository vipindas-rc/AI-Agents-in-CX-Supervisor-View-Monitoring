export enum CRMPlatform {
    Salesforce = 'Salesforce',
    Zendesk = 'Zendesk',
    ServiceNow = 'ServiceNow',
    HubSpot = 'HubSpot',
    Dynamics365 = 'Dynamics365',
    NetSuite = 'NetSuite',
    Zoho = 'Zoho',
    Freshdesk = 'Freshdesk',
    Freshservice = 'Freshservice',
}

export enum CRMCallTypes {
    Outbound = 'OUTBOUND',
    Inbound = 'INBOUND',
}

export enum CRMDigitalChannelType {
    Whatsapp = 'whats_app',
    DigitalSms = 'digital_sms',
}

export const CRM_EVENT_TYPE = 'CRM';

export const CRM_ERRORS = {
    GET_DATA_TIMEOUT: {
        code: 1000,
        message: 'Timeout: get data from CRM failed',
    },
};

export const CRM_SERVICE_EVENTS = {
    DIAL_LEAD: 'dial_lead',
    UPDATE_CALL_INFO: 'update_callInfo',
};
export const CRM_CHROME_EVENTS = {
    CLICK_TO_DIAL: 'click_to_dial',
    SET_TIMER: 'SET_TIMER',
};

// CRM --> RCX
export const CRM_ACTIONS = {
    SUGGEST_DIAL: 'crm_suggestDial',
    CANCEL_SUGGEST_DIAL: 'crm_cancelSuggestDial',
    DIAL: 'DIAL',
    SEND_METADATA: 'crm_metadata',
    CALL_DISPOSITION_RESULT: 'crm_DispResult',
    SIGN_OUT_AGENT: 'sign_out_agent',
    SHOW_ERROR_BANNER: 'crm_showErrorBanner',
    ANALYTICS_TRACK: 'crm_analyticsTrack',
    UPDATE_STATE: 'crm_update_state',
    UPDATE_MATCHING_RECORDS: 'crm_updateMatchingRecords',
};

// RCX --> RCX/CRM
export const CRM_EVENTS = {
    CALL_BACK: 'CALL_BACK',
    VIEW_CALL_LOG: 'crm_viewCallLog',
    SUBMIT_LOG: 'crm_submitLog',
    CRM_OPEN_RECORD: 'crm_openRecord',
    CRM_POP_RECORDS: 'crm_popRecords',
    SELECT_LEAD: 'crm_selectLead',
    SET_RCX_METADATA: 'crm_rcx_metadata',
    SEND_TO_CPR: 'crm_sendToCpr',
    SET_CHAT_CHANNELS: 'crm_set_chat_channels',
};

// RCX <--> CRM
export const CRM_REQUESTS = {
    SET_MATCHING_TICKETS: 'crm_setMatchingTickets',
    GET_MATCHING_TICKETS: 'crm_getMatchingTickets',
    SET_MATCHING_RECORDS: 'crm_setMatchingRecords',
    GET_MATCHING_RECORDS: 'crm_getMatchingRecords',
    SET_SEARCH_RECORDS: 'crm_setSearchRecords',
    GET_SEARCH_RECORDS: 'crm_getSearchRecords',
    SET_CALL_LINK: 'crm_setCallLink',
    GET_CALL_LINK: 'crm_getCallLink',
    SET_CHAT_LINK: 'crm_setChatLink',
    GET_CHAT_LINK: 'crm_getChatLink',
    SCRIPT_CALLBACK: 'crm_scriptCallback',
    DNC_CHECK: 'crm_DNC_check',
    DNC_CHECK_RESULT: 'crm_DNC_check_result',

    CRM_CREATE_RECORD: 'crm_createRecord',
    CRM_CREATE_RECORD_RESULT: 'crm_createRecordResult',
    CRM_SUBMIT_LOG_RESULT: 'crm_submitLogResult',
    START_RENDER: 'crm_startRender',
    START_RENDER_RESULT: 'crm_startRenderResult',
    UPDATE_RENDER: 'crm_updateRender',
    STOP_RENDER: 'crm_stopRender',
    SET_CRM_LOCALE: 'crm_set_locale',
    GET_CRM_LOCALE: 'crm_get_locale',
    AGENT_STATUS_ACK: 'crm_agent_status_ack',
};
export const CRM_STORAGE = {
    CURRENT_SCRIPT: 'engage-admin.script:currentScript',
    CURRENT_SCRIPT_DATA: 'engage-admin.script:currentScriptData',
    SCRIPT_ID: 'engage-admin.scriptId',
    SCRIPT_UII: 'engage-admin.scriptUII',
    SCRIPT_LEAD_ID: 'engage-admin.scriptLeadId',
    SCRIPT_RESULT: 'script:scriptResult',
    SCRIPT_PREVIEW: 'script:preview',
};
export const CRM_SCRIPT = {
    SCRIPT_ON_STORAGE_ERROR: 'crm_OnStorageError',
    GET_SCRIPT_DATA: 'crm_getScriptData',
    SET_SCRIPT_DATA: 'crm_setScriptData',
    SET_SCRIPT_RESULT: 'crm_setScriptResult',
    REQUEST_DISPOSITION: 'crm_requestDisposition',
    REQUEST_DISPOSITION_RESULT: 'crm_requestDispositionResult',
    CHANGE_CALL_SCRIPT: 'crm_changeCallScript',
    SET_RECORDING_STATE: 'crm_setRecordingState',
    SET_RECORDING_STATE_RESULT: 'crm_setRecordingStateResult',
    SET_HOLD_STATE: 'crm_setHoldState',
    SET_HOLD_STATE_RESULT: 'crm_setHoldStateResult',
    REQUEST_COLD_REQUEUE: 'crm_requestColdRequeue',
    REQUEST_COLD_REQUEUE_RESULT: 'crm_requestColdRequeueResult',
    REQUEST_WARM_REQUEUE: 'crm_requestWarmRequeue',
    REQUEST_WARM_REQUEUE_RESULT: 'crm_requestWarmRequeueResult',
    REQUEST_HANG_UP: 'crm_requestHangup',
    REQUEST_HANG_UP_RESULT: 'crm_requestHangupResult',
    REQUEST_COLD_TRANSFER_RESULT: 'crm_requestColdTransferResult',
    REQUEST_COLD_TRANSFER: 'crm_requestColdTransfer',
    REQUEST_WARM_TRANSFER: 'crm_requestWarmTransfer',
    REQUEST_WARM_TRANSFER_RESULT: 'crm_requestWarmTransferResult',
    GET_KNOWLEDGE_BASE_ARTICLES: 'crm_knowledgeBaseArticles',
    GET_KNOWLEDGE_BASE_ARTICLES_RESULT: 'crm_knowledgeBaseArticlesResult',
    GET_CATEGORIES: 'crm_getCategories',
    GET_CATEGORIES_RESULT: 'crm_getCategoriesResult',
    GET_CATEGORY_OPTIONS_BY_IDS: 'crm_getCategoryOptionsByIds',
    GET_CATEGORY_OPTIONS_BY_IDS_RESULT: 'crm_getCategoryOptionsByIdsResult',
    FORMAT_CATEGORY_STRING_VALUE: 'crm_formatCategoryStringValue',
    FORMAT_CATEGORY_STRING_VALUE_RESULT: 'crm_formatCategoryStringValueResult',
    VALIDATE_MANDATORY_CATEGORIES: 'crm_validateMandatoryCategories',
    VALIDATE_MANDATORY_CATEGORIES_RESULT:
        'crm_validateMandatoryCategoriesResult',
    HAS_OUTDATED_CATEGORIES: 'crm_hasOutdatedCategories',
    HAS_OUTDATED_CATEGORIES_RESULT: 'crm_hasOutdatedCategoriesResult',
    CREATE_CATEGORIES_PATCH: 'crm_createCategoriesPatch',
    CREATE_CATEGORIES_PATCH_RESULT: 'crm_createCategoriesPatchResult',
    GET_CATEGORIES_TRACKING_DATA: 'crm_getCategoriesTrackingData',
    GET_CATEGORIES_TRACKING_DATA_RESULT: 'crm_getCategoriesTrackingDataResult',
    TRACKING_DISPOSITION_SUBMIT_DATA: 'crm_trackingDispositionSubmitData',
    GET_E164_NUMBER: 'crm_getE164FormattedNumber',
    GET_E164_NUMBER_RESULT: 'crm_getE164NumberResult',
    GET_PHONE_FILTER: 'crm_phoneFilter',
    GET_PHONE_FILTER_RESULT: 'crm_phoneFilterResult',

    REQUEST_START_SECURE_CALL: 'crm_requestStartSecureCall',
    REQUEST_START_SECURE_CALL_RESULT: 'crm_requestStartSecureCallResult',
    REQUEST_END_SECURE_CALL: 'crm_requestEndSecureCall',
    REQUEST_END_SECURE_CALL_RESULT: 'crm_requestEndSecureCallResult',

    REQUEST_GENERATE_SUMMARY: 'crm_requestGenerateSummary',
    REQUEST_GENERATE_SUMMARY_RESULT: 'crm_requestGenerateSummaryResult',

    REQUEST_DISPOSITION_SUMMARY: 'crm_requestDispositionSummary',
    REQUEST_DISPOSITION_SUMMARY_RESULT: 'crm_requestDispositionSummaryResult',

    REQUEST_IS_PREVIEW: 'crm_isPreview',
    REQUEST_IS_PREVIEW_RESULT: 'crm_isPreviewResult',

    ROOT_SCOPE_EVENT: 'crm_rootScopeEvent',
    SCRIPT_ON_ERROR: 'crm_scriptOnError',
};

export const ParamsType = {
    DIGITAL: 'Digital',
    Call: 'Call',
};

export enum StartRenderType {
    DIGITAL = 'Digital',
    SCRIPT = 'Script',
    CALL_AGENT_ASSIST = 'CallAgentAssist',
}

export enum ScriptStatus {
    PENDING = 'pending',
    RUNNING = 'running',
}

export enum SourceType {
    CALL_PAGE = 'callPage',
    HISTORY_PAGE = 'historyPage',
}

export enum DialType {
    ALL = 'All',
    CALL = 'Call',
    SMS = 'SMS',
}

export const ERROR_CODE_MAP = {
    COMMON: 10000,
    CALL_LOG_FAILED: 10001,
    DIGITAL_LOG_FAILED: 10002,
    DIGITAL_NO_DISPOSITION: 10004,
    //SFDC Specific
    SF_SIDECAR_FAILED: 10005,
    //Zendesk Specific
    ZD_CREATE_USER_FAILED_FOR_DUPLICATE: 10006,
    ZD_CREATE_USER_FAILED_FOR_COMMON: 10007,
    ZH_API_RATE_LIMIT: 10010,
    SF_PLATFORM_EVENT_LIMIT: 10013,
};

export const LOG_INFO_KEY = {
    [CRMPlatform.ServiceNow]: 'serviceNowLogInfo',
    [CRMPlatform.Salesforce]: 'salesforceLogInfo',
    [CRMPlatform.Zoho]: 'zohoLogInfo',
    [CRMPlatform.Dynamics365]: 'dynamicsLogInfo',
    [CRMPlatform.HubSpot]: 'hubSpotLogInfo',
    [CRMPlatform.Zendesk]: 'zendeskLogInfo',
    [CRMPlatform.NetSuite]: 'netSuiteLogInfo',
    [CRMPlatform.Freshdesk]: 'freshdeskLogInfo',
    [CRMPlatform.Freshservice]: 'freshdeskLogInfo',
};

export const ENABLE_CRM_EVENT_LOG = 'enable_crm_event_log';

export const SCRIPT_STUDIO = '/voice/script-studio/render/?crm=';

export const TRACKING_DELAY_MS = 20000;
export const START_SESSION_PAGE_TRACKING_DELAY_MS = 3000;

export const HEALTH_CHECK_INTERVAL_MS = 180000;
export const RECONNECTION_INTERVAL_MS = 5000;

export const CHROME_PLUGIN_CONSTANTS = {
    POP_URL: 'pop_url',
    OPEN_URL_OUTBOUND: 'OPEN_URL_OUTBOUND',
    OPEN_URL_DIGITAL: 'OPEN_URL_DIGITAL',
    PORT_MESSAGE: 'PORT_MESSAGE',
    BROWSER_EXTENSION_PORT: 'BROWSER_EXTENSION_PORT',
    PLUGIN: 'PLUGIN',
    BEARER: 'BEARER',
    BRIDGE: 'BRIDGE',
    AGENT: 'AGENT',
    GET_CHROME_CONFIG: 'GET_CHROME_CONFIG',
    CHECK_AGENT_STATUS: 'CHECK_AGENT_STATUS',
    AGENT_CONNECTED: 'AGENT_CONNECTED',
    CLICK_TO_DIAL: 'CLICK_TO_DIAL',
    SET_AGENT_STATE: 'SET_AGENT_STATE',
    GET_AVAILABLE_AGENT_STATES: 'GET_AVAILABLE_AGENT_STATES',
    UPDATE_AVAILABLE_AGENT_STATES: 'UPDATE_AVAILABLE_AGENT_STATES',
    BRIDGE_CONTROL_MESSAGE: 'BridgeControlMessage',
    BRIDGE_DATA_MESSAGE: 'BridgeDataMessage',
    CONNECT_REQUEST: 'ConnectRequest',
    TIMER_REQUEST: 'TIMER_REQUEST',
    CURRENT_AGENT_STATE: 'CURRENT_AGENT_STATE',
    CALL_ANSWERED: 'CALL_ANSWERED',
    CALL_ENDED: 'CALL_ENDED',
    OPEN_URL: 'OPEN_URL',
    CALL_RECIVE: 'CALL_RECIVE',
    SPOG_PUBLIC_KEY: 'spog_public_key',
    SPOG_PUBLIC_KEY_AGENT_ID: 'spog_public_key_agent_id',
    MODE: 'mode',
    ANI_VALUE: 'aniValue',
    HEALTH_CHECK: 'HEALTH_CHECK',
    NOTIFY_USERS: 'SEND_USER_NOTIFICATION',
    CHROME_AGENT_STATE: 'CHROME_AGENT_STATE',
};

export const CRM_CURRENT_CALL_TYPE = {
    INTERACTION_PREVIEW: 'INTERACTION-PREVIEW',
    NEW_CALL: 'NEW-CALL',
};
