import styled, { css } from 'styled-components';

import type { IExpandIcon } from './types';
import { Arrow } from '../../../../../../icons';

export const ArrowIcon = styled(Arrow)<IExpandIcon>`
    position: absolute;
    color: ${({ isExpanded, theme }) =>
        isExpanded ? 'currentColor' : theme.colors.gray[700]};
    vertical-align: middle;
    margin-top: 13px;
    margin-left: 6px;
    width: 12px;
    height: 12px;
    transition: transform 250ms ease;
    transform: rotate(-90deg) !important;
    ${({ isExpanded }) =>
        isExpanded &&
        css`
            transform: rotate(0) !important;
        `}
`;
