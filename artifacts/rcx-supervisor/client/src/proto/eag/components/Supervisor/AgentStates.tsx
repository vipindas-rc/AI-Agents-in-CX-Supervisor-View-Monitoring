import type {
    SyntheticEvent,
    FC,
    ReactNode,
    Dispatch,
    SetStateAction,
} from 'react';
import { useMemo, useState, useCallback, Fragment } from 'react';

import type { MenuProps } from '@material-ui/core/Menu';
import Menu from '@material-ui/core/Menu';
import { Tooltip } from '@ringcx/ui';

import { PopUpItemsMemoized } from './PopUpItems';
import {
    AgentStatus,
    StatusMenu,
    AgentStatesPopoverStyle,
} from './Supervisor.styled';
import type { ICurrentAgentState } from './types/Supervisor';
import { SupervisorDataId } from '../../constants/testIds';
import translate from '../../helpers/translate';

const StateMenu = StatusMenu((props: MenuProps) => (
    <Menu
        getContentAnchorEl={null}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }}
        {...props}
    />
));

const AgentStates: FC<{
    AgentSvc: any;
    currentAgentStateList: ICurrentAgentState[];
    children?: ReactNode;
    agentStatusValue: () => JSX.Element;
    isCurrentAgent: boolean;
    isChangeAgentStateDisabled: boolean;
    agentBaseState: string;
    agentId: string;
    setIsAgentState: Dispatch<SetStateAction<boolean>>;
    currentAgentAuxState?: string;
    currentAgentState?: string;
}> = ({
    AgentSvc,
    currentAgentStateList,
    agentStatusValue,
    isCurrentAgent,
    isChangeAgentStateDisabled,
    agentBaseState,
    agentId,
    setIsAgentState,
    currentAgentAuxState,
    currentAgentState,
}) => {
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);

    const handleClick = useCallback(
        (event: SyntheticEvent) => {
            event.stopPropagation();
            if (isChangeAgentStateDisabled || isCurrentAgent) return;
            setAnchorEl(event.currentTarget);
            setIsAgentState(true);
        },
        [isChangeAgentStateDisabled, isCurrentAgent]
    );

    const handleClose = useCallback((event: SyntheticEvent) => {
        event.stopPropagation();
        setAnchorEl(null);
        setIsAgentState(false);
    }, []);

    const save = useCallback(
        (
            e: React.MouseEvent<HTMLLIElement>,
            agentStateToChange: ICurrentAgentState
        ) => {
            const { value, label } = agentStateToChange;
            const agentIdChangedBySupervisor = agentId;
            AgentSvc?.setAgentStateBySupervisor?.(
                value,
                label,
                agentIdChangedBySupervisor,
                currentAgentAuxState,
                currentAgentState
            );
            handleClose(e);
        },
        []
    );

    const States = useMemo(
        () =>
            currentAgentStateList &&
            currentAgentStateList.map(
                (state: ICurrentAgentState, index: number) => (
                    <PopUpItemsMemoized
                        key={`option_${state.label}`}
                        data={state}
                        onClickHandler={save}
                        tabIndex={index}
                    />
                )
            ),
        [currentAgentStateList]
    );

    return (
        <Fragment>
            <AgentStatesPopoverStyle />
            <AgentStatus
                data-aid={`${SupervisorDataId.AGENT_LIST_ITEM}_agent_state`}
                disabled={isChangeAgentStateDisabled}
                className={`agent-text`}
                onClick={handleClick}
            >
                <Tooltip
                    hidden={isCurrentAgent}
                    PopperProps={{
                        style: { maxWidth: '280px' },
                    }}
                    title={
                        !isChangeAgentStateDisabled
                            ? translate('SUPERVISOR.TOOLTIP.AGENT_STATE')
                            : translate(
                                  'SUPERVISOR.TOOLTIP.AGENT_STATE_DISABLE',
                                  {
                                      agentBaseState: agentBaseState,
                                  }
                              )
                    }
                    placement='bottom'
                >
                    {agentStatusValue()}
                </Tooltip>
                {isCurrentAgent && agentStatusValue()}
            </AgentStatus>
            <StateMenu
                {...{
                    id: 'agent-states-in-supervisor',
                    anchorEl: anchorEl,
                    keepMounted: true,
                    open: Boolean(anchorEl),
                    onClose: handleClose,
                }}
            >
                {States}
            </StateMenu>
        </Fragment>
    );
};

export default AgentStates;
