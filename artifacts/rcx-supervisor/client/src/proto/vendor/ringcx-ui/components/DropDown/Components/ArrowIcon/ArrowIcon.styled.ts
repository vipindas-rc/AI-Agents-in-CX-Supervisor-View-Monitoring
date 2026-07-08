import styled, { css } from 'styled-components';

import type IArrowIcon from './types';
import { Arrow } from '../../../../icons';

export const StyledArrow = styled(Arrow)<IArrowIcon>`
    && {
        width: ${({ width }) => width}px;
        height: ${({ height }) => height}px;
        margin-left: 8px;
        flex-shrink: 0;
        cursor: pointer;

        path {
            fill: ${(p) => p.theme.colors.gray[700]};

            ${({ disabled, theme }) =>
                disabled &&
                css`
                    fill: ${theme.colors.gray[500]};
                `}
        }
        ${({ disabled }) =>
            disabled &&
            css`
                cursor: not-allowed;
            `}
        }
    }
`;
