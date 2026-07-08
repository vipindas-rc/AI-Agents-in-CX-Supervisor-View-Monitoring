import { useMemo } from 'react';

import { UNUSED } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import type { IUseJupiterNavItems } from './types';
import { checkUnifiedInboxEnabled } from '../../../helpers/unifiedInbox';
import {
    isHciGroup,
    isOutboundAgent,
    isPreviewGroup,
    isTcpaGroup,
    shouldShowLeads,
    useSideNavScopeWatcher,
} from '../../SideNav';

export const useJupiterNavItems: IUseJupiterNavItems = ({
    $state,
    $rootScope,
    AgentSvc,
    OutboundSvc,
    ChatSvc,
    MonitorSvc,
    CHAT_EVENTS,
    PriorityCategoriesNotificationSvc,
    SUPERVISOR_EVENTS,
}) => {
    const { t } = useTranslation();

    const refreshNav = useSideNavScopeWatcher(
        $rootScope,
        AgentSvc,
        ChatSvc,
        MonitorSvc,
        OutboundSvc,
        CHAT_EVENTS,
        PriorityCategoriesNotificationSvc,
        SUPERVISOR_EVENTS
    );
    const isOmni = AgentSvc.newIsOmni();
    const outboundAgent = isOutboundAgent(OutboundSvc, AgentSvc);
    const previewGroup = isPreviewGroup(OutboundSvc);
    const progressiveDialGroup = OutboundSvc.getDialGroup().progressiveEnabled;
    const hciDialGroup = isHciGroup(OutboundSvc);
    const tcpaGroup = isTcpaGroup(OutboundSvc);
    const showLeads = shouldShowLeads(AgentSvc);
    const isSupervisor = AgentSvc.isSupervisor();
    const isHciClicker = OutboundSvc.getDialGroup().hciClicker;
    const allowChatOnAgent = AgentSvc.agentPermissions.allowChat;
    const allowChatOnAccount = AgentSvc.agentPermissions.enableChat;
    const allowTaskMode = AgentSvc.isTaskModeEnabled();
    const allowFolderMode = AgentSvc.isFolderModeEnabled();
    const allowAiWfmAccess = AgentSvc.isAiWfmDashboardEnabled();
    const showMessagesButton =
        (allowChatOnAccount || allowTaskMode) && allowChatOnAgent;
    const isUnifiedInboxEnabled = checkUnifiedInboxEnabled();

    const items = useMemo(() => {
        UNUSED(refreshNav);

        const INTERACTION = {
            label: t('PHONE.MENU_BUTTON_LABEL.ACTIVE'),
            value: 'interaction',
            route: getRoute($state, 'interaction'),
            disabled: false,
            unreadCount: showMessagesButton
                ? ChatSvc.getTotalWaitingForUserCount()
                : undefined,
        };

        const MY_MESSAGES = {
            label: t('PHONE.JUPITER.MENU_BUTTON_LABEL.CHAT'),
            value: 'my-messages',
            route: getRoute($state, 'chat'),
            disabled: !showMessagesButton,
            unreadCount: ChatSvc.getTotalWaitingForUserCount(),
        };

        const ALL_MESSAGES = {
            label: t('PHONE.MENU_BUTTON_LABEL.FOLDER'),
            value: 'all-messages',
            route: getRoute($state, 'digital.folderMode'),
            disabled: !allowFolderMode,
        };

        const MY_CALLS = {
            label: t('PHONE.JUPITER.MENU_BUTTON_LABEL.DIALPAD'),
            value: 'my-calls',
            route: getRoute($state, 'phone.dialpad'),
            disabled: false,
        };

        const CALL_HISTORY = {
            label: t('PHONE.MENU_BUTTON_LABEL.CALLHISTORY'),
            value: 'call-history',
            route: getRoute($state, 'phone.callHistory'),
            disabled: isOmni,
        };

        const UHISTORY = {
            label: t('PHONE.MENU_BUTTON_LABEL.HISTORY'),
            value: 'history',
            route: getRoute($state, 'history'),
            disabled: !isOmni,
        };

        const DIALING = {
            label: t('PHONE.MENU_BUTTON_LABEL.OUTBOUND_DIALER'),
            value: 'dialing',
            route: getRoute($state, 'phone.progressive'),
            disabled: !(
                outboundAgent &&
                previewGroup &&
                progressiveDialGroup &&
                !hciDialGroup &&
                !tcpaGroup
            ),
        };

        const DIALING_HCI_DIAL_GROUP = {
            label: t('PHONE.MENU_BUTTON_LABEL.OUTBOUND_DIALER'),
            value: 'dialing-hci-group',
            route: getRoute($state, 'phone.preview'),
            disabled: !(
                outboundAgent &&
                (previewGroup || tcpaGroup) &&
                hciDialGroup &&
                isHciClicker &&
                !progressiveDialGroup
            ),
        };

        const DIALING_NON_HCI_DIAL_GROUP = {
            label: t('PHONE.MENU_BUTTON_LABEL.OUTBOUND_DIALER'),
            value: 'dialing-non-hci-group',
            route: getRoute($state, 'phone.preview'),
            disabled: !(
                outboundAgent &&
                previewGroup &&
                !progressiveDialGroup &&
                !hciDialGroup &&
                !tcpaGroup
            ),
        };

        const DIALING_TCPA_GROUP = {
            label: t('PHONE.MENU_BUTTON_LABEL.OUTBOUND_DIALER'),
            value: 'dialing-tcpa-group',
            route: getRoute($state, 'phone.preview'),
            disabled: !(
                outboundAgent &&
                tcpaGroup &&
                !progressiveDialGroup &&
                !hciDialGroup &&
                !previewGroup
            ),
        };

        const CALLBACKS = {
            label: t('PHONE.MENU_BUTTON_LABEL.CALLBACK'),
            value: 'callbacks',
            route: getRoute($state, 'phone.callbacks.callbackDetail'),
            disabled: false,
        };

        const AI_WFM = {
            label: t('PHONE.MENU_BUTTON_LABEL.AI_WFM'),
            value: 'ai_wfm',
            route: getRoute($state, 'dashboard.aiWfm'),
            disabled: !allowAiWfmAccess,
        };

        const SEARCH = {
            label: t('PHONE.MENU_BUTTON_LABEL.SEARCH'),
            value: 'search',
            route: getRoute($state, 'phone.leads'),
            disabled: !showLeads,
        };

        const SCRIPTS = {
            label: t('PHONE.MENU_BUTTON_LABEL.SCRIPTS'),
            value: 'scripts',
            route: getRoute($state, 'scripts'),
            disabled: false,
        };

        const MY_STATS = {
            label: t('PHONE.JUPITER.MENU_BUTTON_LABEL.STATS'),
            value: 'my-stats',
            route: getRoute($state, 'phone.stats.metrics'),
            disabled: false,
        };

        const SUPERVISOR = {
            label: t('PHONE.MENU_BUTTON_LABEL.SUPERVISOR'),
            value: 'supervisor',
            route: getRoute($state, 'monitoring.agents'),
            disabled: !isSupervisor,
            unreadCount:
                PriorityCategoriesNotificationSvc?.getSupervisorAlertCount(),
        };

        return [
            ...(isUnifiedInboxEnabled
                ? [INTERACTION]
                : [MY_CALLS, MY_MESSAGES]),
            ALL_MESSAGES,
            CALL_HISTORY,
            UHISTORY,
            DIALING,
            DIALING_HCI_DIAL_GROUP,
            DIALING_NON_HCI_DIAL_GROUP,
            DIALING_TCPA_GROUP,
            CALLBACKS,
            AI_WFM,
            SEARCH,
            SCRIPTS,
            MY_STATS,
            SUPERVISOR,
        ].filter(({ disabled }) => !disabled);
    }, [
        t,
        $state,
        showMessagesButton,
        allowFolderMode,
        outboundAgent,
        previewGroup,
        progressiveDialGroup,
        hciDialGroup,
        tcpaGroup,
        isHciClicker,
        showLeads,
        isSupervisor,
        isUnifiedInboxEnabled,
        refreshNav,
    ]);

    return { items };
};

function getRoute($state: any, route: string) {
    const name = `base.default.${route}`;
    const href = $state.href(name);

    return {
        name,
        href,
    };
}
