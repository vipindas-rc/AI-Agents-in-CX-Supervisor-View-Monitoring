import MuiButton from '@material-ui/core/Button';
import type { Theme } from '@material-ui/core/styles';
import { alpha, createStyles } from '@material-ui/core/styles';
import styled, { css } from 'styled-components';

import type { IStyledButtonProps } from './types/Button';
import { theme } from '../../theme';

// prettier-ignore
export const ButtonWrapper = styled(MuiButton)<IStyledButtonProps>`
    && {
        &:hover, &:focus {
            text-decoration: none;
        }
        box-sizing: border-box;
        ${({ size }) => size === 'small'
            ? css`
                padding: 0 12px;
                height: 32px;
            ` : css`
                padding: 0 16px;
                height: 40px;
            `}
    }
`;

export const ButtonTheme = (muiTheme: Theme) => {
    return createStyles({
        label: {
            textTransform: 'initial',
            letterSpacing: '.15px',
            lineHeight: '16px',
            minWidth: '64px',
        },
        disabled: {},
        contained: {
            '&$disabled': {
                color: theme.colors.gray[0],
                backgroundColor: muiTheme.palette.action.disabled,
            },
        },
        textPrimary: {
            '&:hover, &.Mui-focusVisible': {
                backgroundColor: `var(--text-button-background-hover, ${alpha(
                    muiTheme.palette.primary.main,
                    0.08
                )})`,
            },
            '&$disabled': {
                color: theme.colors.gray[500],
            },
        },
        textSecondary: {
            '&:hover, &.Mui-focusVisible': {
                backgroundColor: alpha(muiTheme.palette.secondary.main, 0.08),
            },
            '&$disabled': {
                color: theme.colors.gray[500],
            },
        },
        containedPrimary: {
            '&:hover, &.Mui-focusVisible': {
                backgroundColor: muiTheme.palette.primary[400],
            },
            '&:active': {
                backgroundColor: muiTheme.palette.primary[300],
            },
        },
        outlinedPrimary: {
            borderColor: muiTheme.palette.primary.main,
            '&:hover, &.Mui-focusVisible': {
                color: muiTheme.palette.primary.main,
                borderColor: muiTheme.palette.primary.main,
                backgroundColor: `var(--text-button-background-hover, ${alpha(
                    muiTheme.palette.primary.main,
                    0.08
                )})`,
            },
            '&$disabled': {
                color: theme.colors.gray[500],
            },
        },
        containedSecondary: {
            '&:hover, &.Mui-focusVisible': {
                backgroundColor: muiTheme.palette.secondary[400],
            },
            '&:active': {
                backgroundColor: muiTheme.palette.secondary[300],
            },
        },
        outlinedSecondary: {
            borderColor: muiTheme.palette.secondary.main,
            '&:hover, &.Mui-focusVisible': {
                color: muiTheme.palette.secondary.main,
                borderColor: muiTheme.palette.secondary.main,
                backgroundColor: alpha(muiTheme.palette.secondary.main, 0.08),
            },
            '&$disabled': {
                color: theme.colors.gray[500],
            },
        },
    });
};

export const StyledSpinnerWrap = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: absolute;
`;

export const HiddenLabel = styled.span`
    opacity: 0;
`;
