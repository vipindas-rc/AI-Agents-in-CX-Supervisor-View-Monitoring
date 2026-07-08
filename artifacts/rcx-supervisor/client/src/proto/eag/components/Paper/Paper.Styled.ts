import { Paper } from '@material-ui/core';
import { alpha } from '@material-ui/core/styles';
import styled from 'styled-components';

export const StyledPaper = styled(Paper)`
    box-shadow: 0 2px 12px 0
        ${({ theme }) => alpha(theme.colors.gray[600], 0.5)} !important;

    .MuiMultiSectionDigitalClock-root {
        &.MuiList-root {
            width: 64px;

            .MuiMenuItem-root {
                width: 56px;

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
            color: ${({ theme }) => theme.colors.primary};
        }
        border: none;
    }

    .MuiDayCalendar-weekDayLabel {
        font-size: 12px;
    }

    .MuiPickersCalendarHeader-root {
        margin-bottom: 12px;
    }

    .MuiPickersDay-root {
        font-size: 14px;
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
    .MuiPickersYear-yearButton,
    .MuiDayCalendar-weekDayLabel {
        color: ${({ theme }) => theme.colors.gray[900]};

        &.Mui-selected{
        color: ${({ theme }) =>
            `var(--menu-item-active-text, ${theme.colors.gray[0]})`};;
    };

    .MuiPickersDay-dayWithMargin,
    .MuiMenuItem-gutters {
        &.Mui-disabled {
            color: ${({ theme }) => theme.colors.gray[400]};
        }

        &:hover {
            background-color: ${({ theme }) =>
                `var(--list-item-hover, ${theme.colors.gray[100]})`};
        }

        &.Mui-selected {
            background-color: ${({ theme }) => theme.colors.primary};

            &:hover {
                background-color: ${({ theme }) => theme.colors.primary};
            }
        }
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
    }

    .MuiDayCalendar-slideTransition {
        min-height: 242px;
    }
`;
