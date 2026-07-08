import { alpha } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import styled from 'styled-components';

export const StyledSwitch = styled(Switch)<{
    width: number;
    height: number;
}>`
    && {
        width: ${({ width }) => width}px;
        height: ${({ height }) => height}px;
        padding: 0;
        margin: 0;
        overflow: unset;

        &.inProgress {
            .MuiSwitch-switchBase.checked.disabled + .MuiSwitch-track {
                background-color: ${({ theme }) => theme.colors.gray[400]};
            }
        }

        .MuiSwitch-switchBase {
            padding: 1px;

            &.checked {
                transform: ${({ size }) =>
                    `translateX(${size === 'medium' ? 17 : 10}px)`};
                color: ${({ theme }) => theme.colors.background};
                & + .MuiSwitch-track {
                    background-color: ${({ theme }) =>
                        theme.colors.accent.emerald};
                    opacity: 1;
                    border: none;
                }

                &.disabled + .MuiSwitch-track {
                    background-color: ${({ theme }) =>
                        alpha(theme.colors.accent.emerald, 0.6)};
                    opacity: 1;
                }
            }

            &.disabled {
                color: ${({ theme }) => theme.colors.gray[50]};

                & + .MuiSwitch-track {
                    background-color: ${({ theme }) => theme.colors.gray[100]};
                    opacity: 1;
                }
            }
        }

        .MuiSwitch-thumb {
            width: ${({ height }) => height - 2}px;
            height: ${({ height }) => height - 2}px;
            box-shadow:
                0 3px 8px 0 rgba(0, 0, 0, 0.15),
                0 1px 1px 0 rgba(0, 0, 0, 0.16),
                0 3px 1px 0 rgba(0, 0, 0, 0.1);
        }

        .MuiSwitch-track {
            border-radius: ${({ height }) => height / 2}px;
            background-color: ${({ theme }) => theme.colors.gray[400]};
            opacity: 1;
        }
    }
`;

export const StyledSpinnerWrapper = styled.div<{
    width: number;
    height: number;
}>`
    box-sizing: border-box;
    padding: 1px;
    width: ${({ width }) => `${width}px`};
    height: ${({ height }) => `${height}px`};
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.background};
`;
