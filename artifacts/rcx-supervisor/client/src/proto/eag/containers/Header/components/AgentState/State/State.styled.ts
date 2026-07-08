import { MenuItem } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components';

import { RESPONSIVE_BREAKPOINT } from '../../../../../constants/app';

interface ListItemProps {
    statusColor: string;
}

export const StyledMenuItem = withStyles({
    root: {
        '@media (max-width: 360px)': {
            minHeight: '28px',
            paddingTop: '2px',
            paddingBottom: '2px',
        },
    },
})(MenuItem);

export const Row = styled.div`
    max-width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    span {
        flex: 1;
        font-weight: normal;
        line-height: 1.42857143;
        color: ${({ theme }) => theme.colors.gray[900]};
        white-space: nowrap;
        font-size: 14px !important;
        @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
            font-size: 12px !important;
        }
    }
`;

export const ListItemCircle = styled.div<ListItemProps>`
    width: 11px;
    position: relative;
    height: 11px;
    margin-right: 8px;
    border-radius: 25px;
    background-color: ${(props) => props.statusColor};
`;
