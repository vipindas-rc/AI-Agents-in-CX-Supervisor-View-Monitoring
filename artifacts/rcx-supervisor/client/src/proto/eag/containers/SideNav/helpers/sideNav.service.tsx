/* eslint @typescript-eslint/no-explicit-any:0 */

import type { Languages } from '@ringcx/shared';
import type { INavGroup } from '@ringcx/ui';
import {
    OutboundDialer,
    ScheduledCallbacks,
    AgentStats,
    Search,
    AgentScripts,
    Folders,
    Supervisor,
    InternalChat,
    DialLead,
    Settings,
} from '@ringcx/ui';

import { StyledCallHistory } from './components/StyledCallHistory';
import { StyledExternalLinkIcon } from './components/StyledExternalLinkIcon.styled';
import {
    isHciGroup,
    isOutboundAgent,
    isPreviewGroup,
    isTcpaGroup,
    shouldShowLeads,
} from './permissions';
import { SUPPORT_LINK_MAP } from '../../../constants/supportLinks';
import translate, { i18next } from '../../../helpers/translate';
import { Logout } from '../../Header/components/Logout/Logout';

export const getNavItems = (
    $state: any,
    AgentSvc: any,
    OutboundSvc: any,
    ChatSvc: any,
    AuthService: any,
    isSmallPage?: boolean,
    isInCRM?: boolean,
    crmFeedbackSetOpen?: (val: boolean) => void,
    PriorityCategoriesNotificationSvc?: any
): INavGroup[] => {
    const isOmni = AgentSvc.newIsOmni();
    const outboundAgent = isOutboundAgent(OutboundSvc, AgentSvc);
    const previewGroup = isPreviewGroup(OutboundSvc);
    const progressiveDialGroup = OutboundSvc.getDialGroup().progressiveEnabled;
    const hciDialGroup = isHciGroup(OutboundSvc);
    const tcpaGroup = isTcpaGroup(OutboundSvc);
    const showLeads = shouldShowLeads(AgentSvc);
    const isSupervisor = AgentSvc.isSupervisor();
    const isHciClicker = OutboundSvc.getDialGroup().hciClicker;
    const allowFolderMode = AgentSvc.isFolderModeEnabled();
    const allowAiWfmAccess = AgentSvc.isAiWfmDashboardEnabled();
    const showMessagesButton = AgentSvc.isMyMessageEnabled();
    const showVoiceDivider = showMessagesButton || allowFolderMode;
    const showDivider = !isSmallPage;

    const CHAT = {
        label: translate('PHONE.MENU_BUTTON_LABEL.CHAT'),
        route: getRouteHref($state, 'chat'),
        icon: <InternalChat />,
        disabled: !showMessagesButton,
        unreadCount: ChatSvc.getTotalWaitingForUserCount(),
    };

    const FOLDER = {
        label: translate('PHONE.MENU_BUTTON_LABEL.FOLDER'),
        route: getRouteHref($state, 'digital.folderMode'),
        icon: <Folders />,
        disabled: !allowFolderMode || isInCRM,
    };

    const DIALPAD = {
        label: translate('PHONE.MENU_BUTTON_LABEL.DIALPAD'),
        icon: <DialLead />,
        route: getRouteHref($state, 'phone.dialpad'),
        divider: showVoiceDivider && showDivider,
    };

    const CALLHISTORY: INavGroup = {
        label: translate('PHONE.MENU_BUTTON_LABEL.CALLHISTORY'),
        route: getRouteHref($state, 'phone.callHistory'),
        icon: <StyledCallHistory />,
        disabled: isOmni,
    };

    const UHISTORY: INavGroup = {
        label: translate('PHONE.MENU_BUTTON_LABEL.HISTORY'),
        route: getRouteHref($state, 'history'),
        icon: <StyledCallHistory />,
        disabled: !isOmni,
    };

    const PROGRESSIVE = {
        label: translate('PHONE.MENU_BUTTON_LABEL.OUTBOUND_DIALER'),
        route: getRouteHref($state, 'phone.progressive'),
        icon: <OutboundDialer />,
        divider: showDivider,
        disabled: !(
            outboundAgent &&
            previewGroup &&
            progressiveDialGroup &&
            !hciDialGroup &&
            !tcpaGroup
        ),
    };

    const PREVIEW_HCIDIALGROUP = {
        label: translate('PHONE.MENU_BUTTON_LABEL.OUTBOUND_DIALER'),
        route: getRouteHref($state, 'phone.preview'),
        icon: <OutboundDialer />,
        divider: showDivider,
        disabled: !(
            outboundAgent &&
            (previewGroup || tcpaGroup) &&
            hciDialGroup &&
            isHciClicker &&
            !progressiveDialGroup
        ),
    };

    const PREVIEW_NON_HCIDIALGROUP = {
        label: translate('PHONE.MENU_BUTTON_LABEL.OUTBOUND_DIALER'),
        route: getRouteHref($state, 'phone.preview'),
        icon: <OutboundDialer />,
        divider: showDivider,
        disabled: !(
            outboundAgent &&
            previewGroup &&
            !progressiveDialGroup &&
            !hciDialGroup &&
            !tcpaGroup
        ),
    };

    const PREVIEW_TCPAGROUP = {
        label: translate('PHONE.MENU_BUTTON_LABEL.OUTBOUND_DIALER'),
        route: getRouteHref($state, 'phone.preview'),
        icon: <OutboundDialer />,
        divider: showDivider,
        disabled: !(
            outboundAgent &&
            tcpaGroup &&
            !progressiveDialGroup &&
            !hciDialGroup &&
            !previewGroup
        ),
    };

    const CALLBACK = {
        label: translate('PHONE.MENU_BUTTON_LABEL.CALLBACK'),
        route: getRouteHref($state, 'phone.callbacks.callbackDetail'),
        icon: <ScheduledCallbacks />,
        divider: !outboundAgent && showDivider,
    };

    const AI_WFM = {
        label: translate('PHONE.MENU_BUTTON_LABEL.AI_WFM'),
        route: getRouteHref($state, 'dashboard.aiWfm'),
        icon: <Folders />,
        disabled: !allowAiWfmAccess,
    };

    const SEARCH = {
        label: translate('PHONE.MENU_BUTTON_LABEL.SEARCH'),
        route: getRouteHref($state, 'phone.leads'),
        icon: <Search />,
        disabled: !showLeads || isInCRM,
    };

    const SCRIPTS = {
        label: translate('PHONE.MENU_BUTTON_LABEL.SCRIPTS'),
        route: getRouteHref($state, 'scripts'),
        icon: <AgentScripts />,
        disabled: isInCRM,
    };

    const STATS = {
        label: translate('PHONE.MENU_BUTTON_LABEL.STATS'),
        route: getRouteHref($state, 'phone.stats.metrics'),
        icon: <AgentStats />,
        divider: showDivider,
    };

    const SUPERVISOR = {
        label: translate('PHONE.MENU_BUTTON_LABEL.SUPERVISOR'),
        route: getRouteHref($state, 'monitoring.agents'),
        icon: <Supervisor />,
        disabled: !isSupervisor,
        unreadCount:
            PriorityCategoriesNotificationSvc?.getSupervisorAlertCount(),
    };

    const SETTING = {
        label: translate('PHONE.MENU_BUTTON_LABEL.SETTING'),
        route: getRouteHref($state, 'updatelogin'),
        icon: <Settings />,
        disabled: !isSmallPage,
    };

    const FEEDBACK = {
        label: translate('PHONE.MENU_BUTTON_LABEL.FEEDBACK'),
        route: '',
        icon: <Settings />,
        disabled: !isInCRM,
        onClick: (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            crmFeedbackSetOpen?.(true);
        },
    };

    const NEED_HELP = {
        iconRight: <StyledExternalLinkIcon />,
        label: translate('NAV.AGENT_MENU.NEED_HELP'),
        disabled: !isInCRM || !isSmallPage,
        route: '',
        onClick: () => {
            window.open(
                SUPPORT_LINK_MAP[i18next.language as Languages] ||
                    SUPPORT_LINK_MAP.default,
                '_blank'
            );
        },
    };

    const SIGN_OUT = {
        label: translate('NAV.SIGN_OUT'),
        disabled: !isSmallPage,
        route: null as any,
        renderMenuItemComponent: () => (
            <Logout AuthService={AuthService} AgentSvc={AgentSvc} />
        ),
    };

    const vertical = [
        CHAT,
        FOLDER,
        DIALPAD,
        CALLHISTORY,
        UHISTORY,
        PROGRESSIVE,
        PREVIEW_HCIDIALGROUP,
        PREVIEW_NON_HCIDIALGROUP,
        PREVIEW_TCPAGROUP,
        CALLBACK,
        AI_WFM,
        SEARCH,
        SCRIPTS,
        STATS,
        SUPERVISOR,
        SETTING,
        SIGN_OUT,
    ];

    const horizontal = [
        CHAT,
        DIALPAD,
        CALLHISTORY,
        UHISTORY,
        PROGRESSIVE,
        PREVIEW_HCIDIALGROUP,
        PREVIEW_NON_HCIDIALGROUP,
        PREVIEW_TCPAGROUP,
        FOLDER,
        SUPERVISOR,
        CALLBACK,
        AI_WFM,
        SEARCH,
        SCRIPTS,
        STATS,
        FEEDBACK,
        SETTING,
        NEED_HELP,
        SIGN_OUT,
    ];

    return isSmallPage ? horizontal : vertical;
};

function getRouteHref($state: any, route: string, params?: any) {
    return $state.href(`base.default.${route}`, params);
}
