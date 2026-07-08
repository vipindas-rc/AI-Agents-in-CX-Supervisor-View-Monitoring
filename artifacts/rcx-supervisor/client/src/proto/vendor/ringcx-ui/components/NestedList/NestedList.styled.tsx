import { List } from '@material-ui/core';
import styled from 'styled-components';

export const NestedListWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: auto;
    width: 190px;
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    border-radius: 4px;
`;

export const StyledList = styled(List)`
    flex: 1;
    overflow-y: auto;

    &.MuiList-padding {
        padding: 0;
    }

    & .MuiListItem-button {
        padding: 0;
        .Mui-selected {
            padding: 0;
            color: ${({ theme }) => theme.colors.primary};
            background: ${({ theme }) => theme.colors.gray[150]};
        }
    }

    .MuiListItemIcon-root {
        min-width: 16px;
        width: 16px;
        margin-right: 10px;
    }
`;
