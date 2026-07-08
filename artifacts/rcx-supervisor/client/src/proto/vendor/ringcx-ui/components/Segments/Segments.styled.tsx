import type { ButtonProps } from '@material-ui/core/Button/Button';
import { alpha } from '@material-ui/core/styles';
import styled, { css } from 'styled-components';

import Button from '../Button/Button';

export const StyledItem = styled((props: ButtonProps) => <Button {...props} />)`
    && {
        background-color: transparent;
        flex-grow: 1;
        margin-right: 5px;
        position: relative;

        ${({ size }) => {
            if (size === 'large') {
                return css`
                    min-width: 100px;
                `;
            }
        }}

        .segment-label {
            font-size: ${({ theme }) => theme.font.size.base};
            font-weight: normal;
            letter-spacing: 0.25px;
            line-height: 20px;
            color: ${({ theme }) =>
                `var(--segments-item-text, ${theme.colors.gray[900]})`};
        }

        ${({ size }) => {
            if (size === 'small') {
                return css`
                    padding-top: 2px;
                    padding-bottom: 2px;
                `;
            } else {
                return css`
                    padding-top: 6px;
                    padding-bottom: 6px;
                `;
            }
        }}

        &:hover {
            background-color: ${({ theme }) =>
                `var(--segments-item-hover, ${alpha(
                    theme.colors.gray[500],
                    0.2
                )})`};
        }

        &:disabled {
            background-color: transparent;
            .segment-label {
                color: ${({ theme }) =>
                    `var(--segments-item-disabled-text, ${theme.colors.gray[700]})`};
            }
        }

        &:after {
            display: block;
            content: '';
            width: 1px;
            height: 18px;
            position: absolute;
            right: -3px;
            background-color: ${({ theme }) =>
                `var(--segments-item-border, ${theme.colors.gray[500]})`};
        }

        &:last-child {
            margin-right: 0;

            &:after {
                display: none;
            }
        }

        &.selected {
            background-color: ${({ theme }) =>
                `var(--segments-item-active, ${theme.colors.gray[0]})`};
            box-shadow: 0 2px 3px 0 ${alpha('#ADADAD', 0.2)};

            .segment-label {
                font-weight: ${({ theme }) =>
                    theme.font.sectionHeader.fontWeight};
                letter-spacing: 0.15px;
                color: ${({ theme }) =>
                    `var(--segments-item-active-text, ${theme.colors.gray[900]})`};
            }

            &:before {
                display: block;
                content: '';
                width: 1px;
                height: 18px;
                position: absolute;
                left: -3px;
            }

            &:before,
            &:after {
                background-color: ${({ theme }) =>
                    `var(--segments-item-active-border, ${theme.colors.gray[50]})`};
            }
        }
    }
`;

export const SegmentsWrapper = styled.div<{
    size: string;
    segmentsSize?: 'auto' | 'equal';
}>`
    display: flex;
    padding: 4px;
    border-radius: 4px;
    background-color: ${({ theme }) =>
        `var(--segments-background, ${theme.colors.gray[50]})`};
    ${({ segmentsSize }) =>
        segmentsSize === 'equal' &&
        css`
            ${StyledItem} {
                flex-basis: 100%;
            }
        `}
`;

export const SegmentBadge = styled.span<{ badgeContent: number }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    margin-left: 8px;
    text-align: center;

    color: white;
    font-family: Inter;
    font-size: 10px;
    font-style: normal;
    font-weight: 700;
    line-height: 10px;
    letter-spacing: 0;

    background-color: ${({ theme }) => theme.colors.accent.orange};
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.background};

    min-width: ${({ badgeContent }) => (badgeContent >= 10 ? '20px' : '16px')};
`;
