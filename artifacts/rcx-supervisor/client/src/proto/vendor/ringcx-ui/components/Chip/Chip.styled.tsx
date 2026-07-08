import styled from 'styled-components';

import type { IChipStyled } from './types/ChipProps';
import Button from '../Button/Button';

export const StyledChip = styled((props: IChipStyled) => <Button {...props} />)`
    && {
        border-radius: ${(p) => (p.size === 'medium' ? '16px' : '10px')};
        height: ${(p) => (p.size === 'medium' ? '24px' : '20px')};
        min-width: auto;
        max-width: 280px;
        padding: 0 4px 0 8px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        font-size: ${(p) => (p.size === 'medium' ? '14px' : '12px')};
        font-weight: normal;
        letter-spacing: 0;

        &:active {
            box-shadow: none;
        }

        & > .MuiButton-label {
            min-width: auto;
        }

        /* Hide ripple effect when delete button is focused */
        &:focus-within:not(:focus) {
            .MuiTouchRipple-root,
            .MuiTouchRipple-ripple,
            .MuiTouchRipple-rippleVisible {
                display: none;
            }
        }
    }
`;
export const StyledTitle = styled.p<IChipStyled>`
    text-align: left;
    color: ${(p) => `var(--menu-item-active-text, ${p.theme.colors.gray[0]})`};
    margin: 0;
    line-height: ${(p) => (p.size === 'medium' ? 1.6 : 1)};
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: ${(p) => (p.size === 'medium' ? '0.25px' : '0.4px')};
`;
