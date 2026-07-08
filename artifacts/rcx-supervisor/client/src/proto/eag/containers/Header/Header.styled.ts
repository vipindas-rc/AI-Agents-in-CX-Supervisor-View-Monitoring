import { Switch, TopPanel } from '@ringcx/ui';
import styled from 'styled-components';

import { RESPONSIVE_BREAKPOINT } from '../../constants/app';

export const StyledTopPanel = styled(TopPanel)`
    @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
        height: 28px;
    }
`;

export const SubMenuItemContent = styled.div<{ showSubMenu: boolean }>`
    position: absolute;
    right: 100%;
    min-width: 270px;
    max-width: 350px;
    border-radius: 4px;
    padding: 16px 12px;
    top: 0;
    box-shadow:
        0 2px 4px 0 rgba(208, 208, 208, 0.5),
        0 2px 12px 0 rgba(173, 173, 173, 0.5);
    margin-right: 0;
    background-color: ${({ theme }) => theme.colors.gray[0]};
    z-index: 1;
    display: ${({ showSubMenu }) => (showSubMenu ? 'block' : 'none')};
`;

export const Row = styled.div`
    padding: 0 16px;
    width: 100%;
    line-height: 36px;
    font-weight: 500;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.gray[850]};
`;
export const SessionInfoText = styled.div`
    padding: 0 16px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    line-height: 48px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.gray[850]};
    &:active,
    &:hover {
        background-color: ${({ theme }) => theme.colors.gray[200]};
    }

    &:focus-visible {
        background-color: ${({ theme }) => theme.colors.gray[200]};
    }

    i {
        color: ${({ theme }) => theme.colors.gray[600]};
        font-size: 11px;
    }
`;

export const TopPanelDivider = styled.div`
    width: 1px;
    height: 14px;
    background-color: ${({ theme }) => theme.colors.gray[300]};
`;

export const StyledSwitch = styled(Switch)`
    .MuiSwitch-input {
        width: 250%;
    }
`;
