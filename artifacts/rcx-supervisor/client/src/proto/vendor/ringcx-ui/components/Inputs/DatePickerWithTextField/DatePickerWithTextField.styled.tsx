import { Popover } from '@mui/material';
import styled from 'styled-components';

export const StyledPopper = styled(Popover)`
    .MuiDateCalendar-root {
        .MuiPickersCalendarHeader-labelContainer,
        .MuiPickersYear-yearButton,
        .MuiDayCalendar-weekDayLabel,
        .MuiButtonBase-root {
            font-size: 14px;
            color: ${({ theme }) =>
                `var(--primary-text-color, ${theme.colors.gray[900]})`};

            &:hover,
            &:focus {
                background-color: ${({ theme }) =>
                    `var(--text-button-background-hover, ${theme.colors.main[50]})`};
            }

            &.Mui-selected {
                color: ${({ theme }) =>
                    `var(--menu-item-active-text, ${theme.colors.gray[0]})`};
            }
        }

        .Mui-selected {
            background-color: ${({ theme }) =>
                `var(--button-primary, ${theme.colors.main[500]})`};
            color: ${({ theme }) =>
                `var(--menu-item-active-text, ${theme.colors.gray[0]})`};

            &:hover,
            &:focus {
                background-color: ${({ theme }) =>
                    `var(--button-primary, ${theme.colors.main[500]})`};
            }
        }
    }
`;
