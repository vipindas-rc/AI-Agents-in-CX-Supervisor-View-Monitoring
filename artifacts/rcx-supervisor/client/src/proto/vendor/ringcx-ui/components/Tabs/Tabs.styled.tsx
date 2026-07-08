import { alpha } from '@material-ui/core/styles';
import MuiTab from '@material-ui/core/Tab';
import MuiTabs from '@material-ui/core/Tabs';
import styled, { css } from 'styled-components';

import type { ITabsLabelsWrapperProps } from './types/TabsLabelsWrapper';

export const StyledTab = styled(MuiTab)`
    && {
        color: ${({ theme }) => theme.colors.gray[800]};
        height: 54px;
        padding: 16px;
        min-height: 0;
        font-size: 18px;
        line-height: 22px;
        min-width: 50px;
        max-width: 332px;
        text-transform: none;
        font-weight: 400;
        letter-spacing: 0;
        &:hover {
            background-color: ${({ theme }) =>
                `var(--list-item-hover, ${alpha(theme.colors.primary, 0.12)})`};
        }
        &.Mui-selected {
            color: ${({ theme }) => theme.colors.primary};
        }
        &.Mui-disabled {
            color: ${({ theme }) => theme.colors.gray[500]};
        }
    }
`;

export const StyledTabs = styled(MuiTabs)`
    && {
        min-height: 0;
        border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
        .MuiTab-textColorInherit {
            opacity: 1;
        }
    }
`;

export const TabsWrapper = styled.div`
    && {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
`;

export const TabsLabelsWrapper = styled.div<ITabsLabelsWrapperProps>`
    && {
        .MuiTabs-indicator {
            ${({ size }) =>
                size === 'headline' &&
                css`
                    height: 3px;
                `}
        }
        height: 54px;

        ${({ size }) =>
            size === 'caption' &&
            css`
                height: 34px;
                ${StyledTab} {
                    height: 34px;
                    padding: 5px 16px;
                    font-size: 16px;
                    line-height: 24px;
                    font-weight: 500;
                }
            `};
    }
`;
