import styled from 'styled-components';

import { focusVisibleStyles } from '../../../../../helpers/accessibility';
import { Filter } from '../../../../../icons';

export const StyledToggle = styled.div<{ isActive: boolean }>`
    cursor: pointer;
    font-size: ${({ theme }) => theme.font.size.base};
    font-weight: normal;
    letter-spacing: 0.25px;
    line-height: 20px;
    user-select: none;
    color: ${({ isActive, theme }) =>
        isActive
            ? `var(--action-icon-hover, ${theme.colors.primary})`
            : `var(--action-icon, ${theme.colors.gray[700]})`};
    margin-left: 5px;
    margin-right: 10px;

    &:hover {
        color: ${({ theme }) =>
            `var(--action-icon-hover, ${theme.colors.primary})`};
    }
    ${focusVisibleStyles};
`;

export const FilterIcon = styled(Filter)`
    color: inherit !important;
    margin-right: 5px;
    font-size: 16px;
    font-weight: 600;
    vertical-align: middle;
`;

export const Label = styled.span`
    color: inherit;
    vertical-align: text-top;
`;
