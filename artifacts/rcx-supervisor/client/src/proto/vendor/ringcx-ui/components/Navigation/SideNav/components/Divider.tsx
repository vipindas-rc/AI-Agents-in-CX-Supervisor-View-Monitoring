import { alpha } from '@material-ui/core/styles';
import styled, { css } from 'styled-components';

import type { ISideNav } from '../types';

export const Divider = styled.div<{ layout?: ISideNav['layout'] }>`
    ${({ layout, theme }) => {
        if (layout === 'horizontal') {
            return css`
                border-left: 1px solid ${`var(
                        --divider-color,
                        ${alpha(theme.colors.gray[0], 0.8)}
                    )`};
                margin: 20px 24px;
            `;
        }

        return css`
            border-bottom: 1px solid ${`var(
                        --divider-color,
                        ${alpha(theme.colors.gray[0], 0.8)}
                    )`};
            margin: 24px 20px;
        `;
    }}
`;
