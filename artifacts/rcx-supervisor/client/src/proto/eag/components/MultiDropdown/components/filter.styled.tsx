import { SearchAlt, Filter } from '@ringcx/ui';
import styled from 'styled-components';

export const StyledSearchIcon = styled(SearchAlt)`
    font-size: 20px;
    vertical-align: text-top;
    color: ${({ theme }) => theme.colors.gray[400]};
`;

export const StyledToggle = styled.div<{ isActive: boolean }>`
    cursor: pointer;
    font-size: 14px;
    font-weight: normal;
    letter-spacing: 0.25px;
    line-height: 20px;
    user-select: none;
    color: ${({ isActive }) =>
        isActive ? 'var(--action-icon-hover)' : 'var(--action-icon)'};
    margin-left: 5px;
    margin-right: 10px;

    &:hover {
        color: var(--action-icon-hover);
    }
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
