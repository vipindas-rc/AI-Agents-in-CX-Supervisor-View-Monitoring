import { Paper } from '@material-ui/core';
import { alpha } from '@material-ui/core/styles';
import styled from 'styled-components';

export const StyledPaper = styled(Paper)`
    box-shadow: 0 2px 12px 0
        ${({ theme }) =>
            `var(--box-shadow-2, ${alpha(
                theme.colors.gray[600],
                0.5
            )})`} !important;

    .MuiMultiSectionDigitalClock-root {
        &.MuiList-root {
            width: 64px;

            .MuiMenuItem-root {
                width: 56px;
                font-size: ${({ theme }) => theme.font.size.base};
                font-family: ${({ theme }) => theme.font.family};
                &:last-child {
                    margin-bottom: 6px;
                }
            }
        }
    }

    .MuiMultiSectionDigitalClock-root:not(:first-of-type) {
        border-left: 1px solid ${({ theme }) => theme.colors.gray[300]};
    }

    .MuiPickersDay-today {
        &:not(.Mui-selected) {
            color: ${({ theme }) =>
                `rgb(var(--neutral-f06-rgb), ${theme.colors.accent.black})`};
            border: 1px solid
                ${({ theme }) =>
                    `var(--button-icon-color, ${theme.colors.gray[0]})`};
            &:focus {
                background-color: ${({ theme }) => theme.colors.gray[100]};
            }
        }
    }

    .Mui-selected {
        background-color: ${({ theme }) => theme.colors.primary};
    }

    .MuiDayCalendar-weekDayLabel {
        font-size: 12px;
        font-family: ${({ theme }) => theme.font.family};
    }

    .MuiPickersCalendarHeader-root {
        margin-bottom: 12px;
        @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
            margin-bottom: 0px;
        }
    }

    .MuiPickersDay-root {
        font-size: ${({ theme }) => theme.font.size.base};
        font-family: ${({ theme }) => theme.font.family};
        width: 32px;
        height: 32px;
        margin: 3px 4px;
        color: ${({ theme }) => theme.colors.gray[900]};

        &.Mui-selected {
            color: ${({ theme }) =>
                `var(--menu-item-active-text, ${theme.colors.gray[0]})`};
        }
    }

    .MuiPickersCalendarHeader-labelContainer,
    .MuiPickersArrowSwitcher-button,
    .MuiDayCalendar-weekDayLabel {
        .MuiPickersCalendarHeader-switchViewButton {
            color: ${({ theme }) => theme.colors.gray[900]};
        }

        color: ${({ theme }) => theme.colors.gray[900]};

        &.Mui-selected {
            color: ${({ theme }) =>
                `var(--menu-item-active-text, ${theme.colors.gray[0]})`};
        }
        font-family: ${({ theme }) => theme.font.family};
    }

    .MuiPickersDay-dayWithMargin,
    .MuiPickersYear-yearButton,
    .MuiMenuItem-gutters {
        &.Mui-disabled {
            color: ${({ theme }) => theme.colors.gray[400]};
        }

        &:hover,
        &:focus {
            background-color: ${({ theme }) =>
                `var(--list-item-hover, ${theme.colors.gray[100]})`};
        }

        &.Mui-selected {
            background-color: ${({ theme }) => theme.colors.primary};

            &:hover,
            &:focus {
                background-color: ${({ theme }) => theme.colors.primary};
            }
        }
        font-family: ${({ theme }) => theme.font.family};
    }
`;

export const StyledTimePaperWrapper = styled(StyledPaper)`
    .MuiMultiSectionDigitalClock-root {
        &.MuiList-root {
            max-height: 250px;
        }
    }
`;

export const StyledDatePaperWrapper = styled(StyledPaper)`
    .MuiDateCalendar-root {
        height: 358px;
        @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
            width: 95%;
            height: 300px;
        }
    }

    .MuiDayCalendar-slideTransition {
        min-height: 242px;
    }
`;
