import type { SyntheticEvent, FC } from 'react';
import { useMemo, useState, useCallback, useEffect } from 'react';

import type { MenuProps } from '@material-ui/core/Menu';
import Menu from '@material-ui/core/Menu';
import { TextEclipse } from '@ringcx/ui';

import {
    StateButton,
    StateColor,
    StateLabel,
    DropDownIcon,
    StateTimer,
    StateWrapper,
    useStyle,
    StyleMenu,
    StyledScreenRecordingStatus,
} from './AgentState.styled';
import { State } from './State';
import type { IAgentState, IStates } from './types/AgentState';
import {
    AGENT_CURRENT_STATE_ID,
    AGENT_STATE_TIMER_ID,
    AGENT_STATES_LIST_ID,
} from '../../../../constants/testIds';
import { formatStateLabel } from '../../helpers/header.service';

const StateMenu = StyleMenu((props: MenuProps) => (
    <Menu
        id='stateMenu'
        getContentAnchorEl={null}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
        }}
        {...props}
    />
));

const AgentState: FC<IAgentState> = ({ AgentSvc, children }) => {
    const classes = useStyle();
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const [stateCol, setStateCol] = useState<string>('');
    const [currentAgentState, setCurrentAgentState] = useState<any>({});
    const availableAgentStates: Array<IStates> = useMemo(
        () => AgentSvc.getAvailableAgentStates(),
        []
    );
    useEffect(() => {
        setStateCol(AgentSvc.agentColor);
        setCurrentAgentState(AgentSvc.currentAgentState);
    }, [AgentSvc.agentColor, AgentSvc.currentAgentState]);
    const handleClick = useCallback((event: SyntheticEvent) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const onAgentStatusSelect = useCallback((state: IStates) => {
        setAnchorEl(null);
        const agentState = formatStateLabel(AgentSvc.currentAgentState);
        if (
            !agentState ||
            (agentState &&
                agentState.toUpperCase() !== state.label.toUpperCase())
        ) {
            AgentSvc.setAgentState(state.value, state.label, state.color);
        }
    }, []);

    const { translatedStateLabel } =
        AgentSvc.getAgentStatesWithTranslatedLabels(currentAgentState)[0];

    const translatedAvailableStates =
        AgentSvc.getAgentStatesWithTranslatedLabels(availableAgentStates);

    const States = useMemo(
        () =>
            translatedAvailableStates &&
            translatedAvailableStates.map((state: IStates, index: number) => (
                <State
                    key={state.label}
                    {...{
                        color: state.color,
                        label: state.label,
                        translatedStateLabel: state.translatedStateLabel,
                        value: state.value,
                        onAgentStateSelect: onAgentStatusSelect,
                        tabIndex: index,
                    }}
                />
            )),
        []
    );
    return (
        <StateWrapper className='styled-agent-state'>
            <StateButton
                {...{
                    variant: 'contained',
                    onClick: handleClick,
                    disableRipple: true,
                    disableElevation: true,
                    className: 'agent-status-button',
                }}
            >
                <StateColor
                    {...{
                        stateColor: stateCol,
                    }}
                />
                <StateLabel data-aid={AGENT_CURRENT_STATE_ID}>
                    <TextEclipse tooltipMsg={translatedStateLabel}>
                        {translatedStateLabel}
                    </TextEclipse>
                    <DropDownIcon open={Boolean(anchorEl)}></DropDownIcon>
                </StateLabel>
                <StateTimer data-aid={AGENT_STATE_TIMER_ID}>
                    {children}
                </StateTimer>
            </StateButton>
            <StateMenu
                {...{
                    id: 'agentStates',
                    anchorEl: anchorEl,
                    className: classes.wrapper,
                    keepMounted: true,
                    open: Boolean(anchorEl),
                    onClose: handleClose,
                    'data-aid': AGENT_STATES_LIST_ID,
                }}
            >
                {States}
            </StateMenu>
            <StyledScreenRecordingStatus />
        </StateWrapper>
    );
};

export default AgentState;
