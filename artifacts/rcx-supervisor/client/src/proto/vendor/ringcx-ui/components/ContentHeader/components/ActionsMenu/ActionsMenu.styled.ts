import { MenuItem } from '@material-ui/core';
import styled from 'styled-components';

import Popper from '../../../Popper';

export const ActionsMenuStyled = styled.div`
    margin-right: -12px;
`;

export const StyledPopper = styled(Popper)`
    z-index: ${({ theme }) => theme.zIndexes.popper};
`;

export const StyledMenuItem = styled(MenuItem)`
    && {
        color: ${({ color, theme }) => color || theme.colors.gray[900]};
        font-size: 14px;
        font-weight: 500;
        line-height: 16px;
        min-height: 40px;
        min-width: 126px;
    }
`;
