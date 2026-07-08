import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import {
    SingleSelect,
    SearchInput,
    GearOutlined,
    Button,
    Dialog,
    Dropdown as DropdownIcon,
    theme,
} from '@ringcx/ui';
import styled, { css, createGlobalStyle } from 'styled-components';
const buleish_gray = '#dddfe5';
const buleish_gray_50 = '#dddfe550';
const mild_gray = '#939393';
const dark_charcoal = '#2b2b2b';
const blackOpacity10 = 'rgba(0, 0, 0, 0.1)';
const blackOpacity15 = 'rgba(0, 0, 0, 0.15)';
const blackOpacity20 = 'rgba(0, 0, 0, 0.20)';
const dark_gray = '#121212';
const light_gray = '#e7e7e7';
const crimson_red = '#EA1A1A';

interface IFilterDropdown {
    isChannelDropdown?: boolean;
}

export const FilterDropdown = styled(SingleSelect)<IFilterDropdown>`
    margin-left: ${({ isChannelDropdown }) =>
        isChannelDropdown ? '0' : '10px'};
    width: 135px;
    height: 26px;
    margin-right: 10px;
    position: relative;
    .eui-dropdown-toggle {
        height: 26px;
        span {
            color: ${({ theme }) => theme.colors.accent.black};
            font-size: 13px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
        }
    }
    [data-aid='options-list'] {
        & > div {
            right: ${({ isChannelDropdown }) =>
                isChannelDropdown ? '8px' : 'auto'};
            border-radius: 4px;
            max-height: 250px;
            z-index: 999;
            position: fixed;
            width: 200px;
            box-shadow: 0px 10px 20px -10px ${buleish_gray};
            border: 1px solid ${buleish_gray};
            background-color: ${({ theme }) => theme.colors.gray[0]};
            li {
                padding-left: 10px;
                min-height: 30px;
                color: ${dark_charcoal};

                font-size: 13px;
                font-style: normal;
                font-weight: 400;
                line-height: normal;
            }
        }
    }
    .eui-dropdown-list-item {
        background-color: ${({ theme }) => theme.colors.gray[0]};
        padding: 0px;
        height: 10px;
    }
`;
export const FilterColumn = styled.div`
    position: relative;
    display: flex;
`;
export const SupervisorHeaderContainer = styled.div<{ agentFilter: boolean }>`
    background-color: ${({ theme }) => theme.colors.gray[0]};
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;
    height: ${({ agentFilter }) => (agentFilter ? '85px' : '44px')};
    transition: height 0.3s ease-in-out;
`;
export const AgentList = styled.div`
    background-color: ${({ theme }) => theme.colors.gray[0]};
    padding: 10px;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: row;
`;
export const Dropdown = styled(SingleSelect)`
    background-color: ${({ theme }) => theme.colors.gray[0]};
    width: 120px;
    height: 26px;
    margin-right: 10px;
    position: relative;
    &:hover,
    &:focus,
    &:focus-within {
        z-index: 5;
    }

    .eui-dropdown-toggle {
        height: 26px;
        span {
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            display: flex;
            align-items: center;
        }
    }
    [data-aid='options-list'] {
        & > div {
            border-radius: 4px;
            height: 85px;
            z-index: 999;
            position: fixed;
            width: 180px;
            box-shadow: 0px 10px 20px -10px ${buleish_gray};
            border: 1px solid ${buleish_gray};
            background-color: ${({ theme }) => theme.colors.gray[0]};
            li {
                padding-left: 10px;
                font-size: 13px;
                font-style: normal;
                font-weight: 400;
                line-height: normal;
                min-height: 30px;
            }
        }
    }
    .eui-dropdown-list-item {
        background-color: ${({ theme }) => theme.colors.gray[0]};
        padding: 0px;
        min-height: 20px;
    }
`;
export const SearchBarSup = styled(SearchInput)`
    height: 28px;
    color: rgba(0, 0, 0, 0.5);
    & div {
        color: rgba(0, 0, 0, 0.5);
        margin: 0px;
    }
    & > div {
        padding: 0 8px;
    }
    & i {
        font-size: 14px;
        margin: 0;
        color: rgba(0, 0, 0, 0.5);
    }
    & input {
        padding: 0px;
    }
    &:focus-within {
        width: 100%;
    }
`;
export const SettingIcon = styled(GearOutlined)`
    margin: 8px 0 0 10px;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.5);
    &:hover {
        cursor: pointer;
    }
`;

export const StyledSupervisorCard = styled.div<{ isFullHeight: boolean }>`
    box-shadow: 0px 2px 2px 0px ${blackOpacity10};
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.gray[0]};
    height: ${({ isFullHeight }) => (isFullHeight ? '88px' : '64px')};
    margin: 10px 10px 0 10px;
    top: 10px;
    border-radius: 4px;
    padding: 12px;
    &:hover {
        cursor: pointer;
        box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.25);
    }
`;

export const CardTitle = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 16px;
    margin-bottom: 8px;
    & span:first-child {
        flex: 1;
    }
    & > span {
        color: ${dark_gray};
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
    }
`;

export const CardBody = styled.div`
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    font-size: 12px;
    gap: 8px;
    & > div {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    & .digital-card-value {
        gap: 8px;
    }
    & .agent-card-value {
        gap: 0;
    }
    & > div:nth-child(2) {
        align-items: end;
    }
    & .active-interaction {
        color: ${mild_gray};
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
    }
    & .agent-status {
        color: ${dark_charcoal};
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        min-width: 80px;
    }
    & .digital-card-body {
        color: ${mild_gray};
    }
    & .card-icons {
        & > div {
            & > div {
                height: 16px;
                padding-top: 0;
                & i {
                    font-size: 10px !important;
                }
            }
        }
    }
`;

export const StyledAgentDetails = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.gray[0]};
    min-height: 100%;
    padding-bottom: 30px;
`;

export const AgentPreview = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    background-color: ${({ theme }) => theme.colors.gray[0]};
    min-height: 100%;
    justify-content: flex-start;
    align-items: center;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
    padding: 8px 12px;
    gap: 40px;
    & .agent-text {
        color: ${mild_gray};
        font-size: 13px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
        width: 125px;
    }
    .agent-text-wrapper,
    .agent-status-text {
        font-size: 12px;
        font-weight: 500;
        color: ${dark_charcoal};
        max-width: 125px;
    }
    .agent-text-dropdown {
        display: inline-block;
        margin-left: 4px;
    }
`;

export const AgentMonitor = styled.div`
    display: flex;
    justify-content: center;
`;

export const AgentMonitorButton = styled.div<{ disabled: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid ${buleish_gray};
    width: calc(100% - 24px);
    border-radius: 4px;
    height: 24px;
    margin-top: 10px;
    color: ${({ disabled, theme }) =>
        disabled ? theme.colors.gray[400] : 'black'};
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    & button {
        width: 12px;
        height: 12px;
    }
    & span {
        color: ${({ disabled, theme }) =>
            disabled ? theme.colors.gray[400] : 'black'};
        font-size: 12px;
        cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    }
`;

interface GridListLinkProps {
    showAsLink?: boolean;
}

export const StyledGridListLink = styled.span<GridListLinkProps>`
    ${({ showAsLink }) =>
        showAsLink &&
        css`
            color: ${({ theme }) => theme.colors['primary']};
            cursor: pointer;
        `}
    font-weight: 500;
`;

export const AgentNameContainor = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: ${({ theme }) => theme.colors.gray[0]};
    box-shadow: 0px 2px 6px 0px ${blackOpacity15};
    height: 36px;
    & span {
        cursor: pointer;
    }
`;

export const AgentStatus = styled.button<{ disabled: boolean }>`
    position: relative;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    border: none;
    background-color: transparent;
`;

export const StatusColor = styled.div<{ color: string }>`
    width: 10px;
    height: 10px;
    border-radius: 100%;
    flex-shrink: 0;
    display: inline-block;
    margin-right: 5px;
    background-color: ${({ color, theme }) =>
        color ? color : theme.colors.gray[500]};
`;

export const SupervisorCardContainer = styled.div<{ isSelected: boolean }>`
    background-color: ${({ theme }) => theme.colors.gray[300]};
    min-height: ${({ isSelected }) => (isSelected ? '' : '80vh')};
    padding-bottom: ${({ isSelected }) => (isSelected ? '' : '20px')};
    & .no-result {
        color: ${({ theme }) => theme.colors.gray[800]};
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
        letter-spacing: 0.4px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 50%;
        right: 50%;
        transform: translate(50%, -50%);
    }
`;

export const DigitalMonitorButtonContainer = styled.div`
    width: 100%;
    padding: 8px 12px;
    display: flex;
    gap: 8px;
`;

export const DigitalMonitorButton = styled.div<{ disabled: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid ${buleish_gray};
    border-radius: 4px;
    width: 100%;
    height: 28px;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

    & button {
        width: 12px;
        height: 12px;
        color: ${({ disabled, theme }) =>
            disabled ? theme.colors.gray[400] : 'black'};

        & i {
            color: ${({ disabled, theme }) =>
                disabled ? theme.colors.gray[400] : 'black'};
        }
    }
    & span {
        font-size: 12px;
        color: ${({ disabled, theme }) =>
            disabled ? theme.colors.gray[400] : 'black'};

        cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    }
`;

export const MonitorAgentCrmContainer = styled.div`
    background-color: ${({ theme }) => theme.colors.gray[0]};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
`;
export const MonitorWrapper = styled.div`
    box-shadow: '0px 2px 6px 0px ${blackOpacity20}';
`;
export const MonitorAgentDetailsBargeInContainer = styled.div`
    box-shadow: 0 4px 6px ${blackOpacity20};
    position: relative;
    .border-in {
        border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
    }
`;
export const MonitorCallTime = styled.div`
    background-color: ${({ theme }) => theme.colors.gray[0]};
    border-radius: 4px;
    border: 1px solid ${buleish_gray};
    padding: 12px 8px;
    height: 28px;
    width: 72px;
    font-size: 12px;
    align-items: center;
    display: flex;
`;

export const MonitorButton = styled(Button)<{
    disable: boolean;
    isBargeIn?: boolean;
}>`
    background-color: ${({ disable }) =>
        disable ? buleish_gray : crimson_red};
    width: ${({ isBargeIn, disable }) =>
        isBargeIn || disable ? '180px' : '140px'};
    text-align: center;
    color: ${({ theme }) => theme.colors.gray[0]};
    &:hover {
        background-color: ${({ disable }) =>
            disable ? buleish_gray : crimson_red};
    }
    & .MuiButton-label {
        font-size: 12px;
    }
    &.MuiButtonBase-root.MuiButton-root.MuiButton-contained {
        height: 28px;
    }
`;

export const MonitorAgentDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 8px 12px;
    position: relative;
    box-shadow: 0 4px 6px ${blackOpacity20};
    & span:first-child {
        border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
        padding-bottom: 5px;
    }
    & span {
        & i {
            padding-right: 10px;
        }
    }
`;

export const MonitorAgentDetailsBargeIn = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    & span {
        & i {
            padding-right: 10px;
        }
    }
`;

export const HoldContainor = styled.div<{ onHold: boolean }>`
    &:hover {
        background-color: ${({ onHold, theme }) =>
            onHold
                ? 'var(--action-primary-transparent)'
                : theme.colors.gray[100]};
        cursor: pointer;
    }
    cursor: pointer;
    background-color: ${({ onHold }) =>
        onHold ? 'var(--action-primary-transparent)' : ''};
    height: 32px;
    width: 32px;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    & i {
        color: ${({ onHold, theme }) =>
            onHold ? theme.colors.primary : theme.colors.gray[900]};
        font-size: 12px;
    }
`;

export const SwitchMenuContainer = styled.div<{ shouldHide: boolean }>`
    display: ${({ shouldHide }) => (shouldHide ? 'none' : 'block')};
    position: relative;
`;

export const SwitchItems = styled(MenuItem)<{ disabled: boolean }>`
    &.logout-agent {
        color: ${({ disabled }) =>
            disabled ? theme.colors.gray[400] : crimson_red};
    }
    padding: 6px 12px;
    min-height: 28px;
    font-size: 12px;
    border-radius: 4px;
    color: ${({ disabled }) => (disabled ? theme.colors.gray[400] : '')};
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    &:hover {
        border-radius: 4px;
        background-color: ${buleish_gray};
    }
    .agent-status-list {
        max-width: 100%;
        display: flex;
        align-items: center;
        span {
            flex: 1;
        }
    }
    && {
        opacity: 1;
    }
`;

export const MenuButton = styled.button`
    background-color: ${buleish_gray_50};
    padding: 4px 7px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
`;

export const InteractionHeaderContainor = styled.div`
    background-color: ${({ theme }) => theme.colors.gray[0]};
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
    align-items: center;
    padding: 10px;
    box-shadow: 0px 2px 6px 0px
        ${({ theme }) => theme.colors.semitransparent.gray};
    & i {
        cursor: pointer;
    }
    & div {
        display: flex;
        flex-direction: column;
        & span:first-child {
            overflow: hidden;
            color: ${dark_charcoal};
            text-overflow: ellipsis;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
        }
        & span {
            color: ${({ theme }) => theme.colors.gray[800]};
            font-size: 10px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            letter-spacing: 0.25px;
        }
    }
`;

export const MonitorDialogContainer = styled.div``;
export const DialogModal = styled(Dialog)`
    margin: 0;
    .MuiPaper-root.MuiDialog-paper {
        margin: 0;
        top: 50%;
        transform: translate(0, -50%);
    }
    .MuiDialogTitle-root {
        padding: 12px;
        h2 {
            font-size: 16px;
        }
    }
    .MuiDialogContent-root {
        padding: 12px;
        div {
            font-size: 14px;
        }
    }
    .MuiButton-label {
        font-size: 15px;
    }
`;

export const StyledDropdownIcon = styled(DropdownIcon)<{ isActive: boolean }>`
    display: inline-block;
    transform: ${({ isActive }) =>
        isActive ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.3s ease-in-out;
`;

export const StatusMenu = withStyles({
    paper: {
        width: '160px',
        borderRadius: 4,
        marginTop: 3,
        color: `${theme.colors.gray[900]}`,
        whiteSpace: 'nowrap',
        height: '200px',
        '&:focus,&:active': {
            boxShadow: `0px 4px 8px 0px ${blackOpacity15} !important`, //overide boxShadow in app.less
        },
    },
});

export const IconButton = styled.button`
    background-color: transparent;
    border: none;
    cursor: pointer;
`;

// Global style to override Popover zIndex (since Popover is rendered in body via Portal)
export const AgentStatesPopoverStyle = createGlobalStyle`
    #agent-states-in-supervisor {
        z-index: ${theme.zIndexes.popover} !important;
    }
`;
