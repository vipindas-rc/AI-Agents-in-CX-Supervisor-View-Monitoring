import styled from 'styled-components';

import type { ActionsToggleType } from './types';
import IconButton from '../../../IconButton';

export const StyledButton = styled(IconButton)<ActionsToggleType>`
    && {
        padding: 8px;
        width: 40px;
        height: 40px;
        background-color: ${({ theme }) =>
            theme.colors.contentHeader.kebabIcon};
        color: ${({ theme }) => theme.colors.gray[700]};
        &:hover {
            color: ${({ theme }) => theme.colors.gray[900]};
            background-color: ${({ theme }) => theme.colors.gray[100]};
        }
        &:focus {
            background-color: ${({ theme }) => theme.colors.gray[100]};
        }
        &:disabled {
            color: ${({ theme }) => theme.colors.gray[400]};
        }
    }
`;
