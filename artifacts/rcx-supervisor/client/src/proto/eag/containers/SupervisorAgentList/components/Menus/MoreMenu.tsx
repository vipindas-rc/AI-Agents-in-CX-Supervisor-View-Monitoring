import { forwardRef, useMemo, useState } from 'react';

import { Tooltip, More } from '@ringcx/ui';

import { StyledIconButton, StyledMenu } from './Menus.styled';
import { SUPERVISOR_AGENT_TAB_ACTION } from '../../../../constants/analyticsEvents';
import injector from '../../../../helpers/injector';
import translate from '../../../../helpers/translate';

export const MoreMenu = forwardRef<
    HTMLButtonElement,
    {
        onLogOut: (agentId: string) => void;
        changeAgentState: (agentId: string) => void;
        agentBaseState: string;
        agentState: string;
        agentId: string;
        showLogout: boolean;
        showChangeState: boolean;
        isChangeAgentStateAvailable: boolean;
    }
>(
    (
        {
            onLogOut,
            changeAgentState,
            agentBaseState,
            agentState,
            agentId,
            showLogout,
            showChangeState,
            isChangeAgentStateAvailable,
        },
        ref
    ) => {
        const toolTip = translate('MONITORING.TOOL_TIP.MORE');
        const AnalyticsSvc = injector('AnalyticsSvc');
        const [isOpen, setIsOpen] = useState(false);
        const isPreviewState = agentBaseState === 'PREVIEWING';
        const isChangeAgentStateDisabled =
            agentBaseState === 'BREAK-AFTER-CALL' ||
            agentBaseState === 'TRANSITION' ||
            isPreviewState;
        const agentStateToolTip = isChangeAgentStateDisabled
            ? translate('MONITORING.TOOL_TIP.UPDATE_AGENT_STATE', {
                  agentState: agentState,
              })
            : '';

        const options = useMemo(() => {
            const agentStateOption = {
                id: agentId,
                title: translate('MONITORING.AGENT_OPTIONS.UPDATE_AGENT_STATE'),
                action: () => {
                    changeAgentState(agentId);
                    AnalyticsSvc.track(SUPERVISOR_AGENT_TAB_ACTION, {
                        option: 'update agent state',
                    });
                },
                style: { color: 'var(--primary-text-color)' },
                disabled: isChangeAgentStateDisabled,
                toolTip: agentStateToolTip,
            };

            const logOutOption = {
                id: agentId,
                title: translate('MONITORING.AGENT_OPTIONS.LOGOUT'),
                action: () => {
                    onLogOut(agentId);
                    AnalyticsSvc.track(SUPERVISOR_AGENT_TAB_ACTION, {
                        option: 'logout',
                    });
                },
                style: { color: 'var(--text-danger)' },
                disabled: isPreviewState,
            };

            // The "Update agent state" action is offered for any agent that
            // exposes it (showChangeState) when the feature flag is on. Both
            // AirPro and human agents get it; agents without it only see logout.
            if (isChangeAgentStateAvailable && showChangeState) {
                return [agentStateOption, logOutOption];
            }

            return [logOutOption];
        }, [
            agentId,
            isChangeAgentStateDisabled,
            agentStateToolTip,
            isChangeAgentStateAvailable,
            showChangeState,
            changeAgentState,
            AnalyticsSvc,
            onLogOut,
            isPreviewState,
        ]);

        const toggleComponent = useMemo(() => {
            return (
                <Tooltip title={toolTip} placement='left'>
                    <StyledIconButton
                        {...{
                            ref: ref,
                            disableRipple: true,
                            size: 'medium',
                            disabled: !showLogout && !showChangeState,
                            'aria-label': toolTip,
                            onClick: () => {
                                setIsOpen(true);
                                AnalyticsSvc.track(
                                    SUPERVISOR_AGENT_TAB_ACTION,
                                    {
                                        option: 'more',
                                    }
                                );
                            },
                            // Menu component wrapper already has `tabindex` property for keyboard navigation
                            tabindex: '-1',
                        }}
                    >
                        <More />
                    </StyledIconButton>
                </Tooltip>
            );
        }, [ref, showLogout, toolTip]);

        return (
            <StyledMenu
                {...{
                    options,
                    toggleComponent,
                    isOpen,
                    disableMenu: !showLogout && !showChangeState,
                    onClose: () => setIsOpen(false),
                    // portal to body so the flyout stacks above other rows' hover menus
                    disablePortal: false,
                    disableAutoFocusItem: true,
                }}
            />
        );
    }
);

MoreMenu.displayName = 'MoreMenu';
