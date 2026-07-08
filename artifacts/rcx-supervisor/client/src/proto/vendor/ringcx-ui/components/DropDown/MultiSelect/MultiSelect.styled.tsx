import styled, { css } from 'styled-components';

import { DropDownBorder } from '../DropDown.styled';
import type { OpenDirection } from '../types';
import { ActionsWrapper } from './Components/ActionsArea/ActionsArea.styled';

export const MultiSelectBorder = styled(DropDownBorder)<{
    isOpen: boolean;
    openDirection: OpenDirection;
}>`
    && {
        ${({ isOpen, theme }) =>
            isOpen &&
            css`
                &,
                &:focus,
                &:hover {
                    border-color: ${theme.colors.gray[0]};
                }
            `}
        ${({ openDirection }) =>
            openDirection === 'up' &&
            css`
                ${ActionsWrapper} {
                    border-bottom: 1px solid
                        ${({ theme }) => theme.colors.gray[100]};
                    border-top: none;
                }
            `};
    }
`;
