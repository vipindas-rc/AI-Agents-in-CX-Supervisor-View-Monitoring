import Button from '@material-ui/core/Button';
import {
    styled as muistyled,
    withStyles,
    makeStyles,
} from '@material-ui/core/styles';
import { theme } from '@ringcx/ui';
import styled, { css } from 'styled-components';

import { ScreenRecordingStatus } from '../../../../components/ScreenRecording/ScreenRecordingStatus/ScreenRecordingStatus';
import { RESPONSIVE_BREAKPOINT } from '../../../../constants/app';

export const StateButton = muistyled(Button)({
    height: '36px',
    width: '234px',
    border: `1px solid ${theme.colors.gray[400]}`,
    borderRadius: '18px',
    display: 'flex',
    backgroundColor: `${theme.colors.background}`,
    padding: '0',
    color: `${theme.colors.gray[900]}`,
    '&&:hover': {
        backgroundColor: `${theme.colors.background}`,
        borderColor: `${theme.colors.gray[900]}`,
    },
    textTransform: 'none',
    '&& > .MuiButton-label': {
        height: 'inherit',
    },
});

interface StateColorProps {
    stateColor: string;
}

export const StateColor = styled.div<StateColorProps>`
    width: 12px;
    height: 12px;
    margin: auto 0 auto 12px;
    border-radius: 25px;
    background-color: ${({ stateColor }) => stateColor};
    @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
        margin: 8px 0;
        align-self: flex-start;
    }
`;

export const StateLabel = styled.div`
    font-weight: 500;
    margin-left: 8px;
    width: 108px;
    text-align: left;
    margin-right: 16px;
    @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
        display: flex;
        margin-left: 4px;
        width: 150px;
        align-items: center;
    }
`;

export const DropDownIcon = styled.div<{ open: boolean }>`
    display: none;
    @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
        width: 0;
        height: 0;
        display: flex;
        margin-left: 6px;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-radius: 2px;
        ${({ open }) =>
            open
                ? css`
                      border-bottom: 7px solid ${theme.colors.gray[700]};
                  `
                : css`
                      border-top: 7px solid ${theme.colors.gray[700]};
                  `};
    }
`;

export const StateTimer = styled.div`
    width: 63px;
    margin-right: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
        width: 50px;
        margin-right: 0;
        font-weight: 400;
    }
`;

export const StateWrapper = styled.div`
    position: relative;
    margin: 0;
    padding: 0;
    @media (max-width: 768px) {
        display: none;
    }
    @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
        display: initial;
    }
`;

export const StyledScreenRecordingStatus = styled(ScreenRecordingStatus)`
    position: absolute;
    top: -6px;
    right: -6px;
`;

export const useStyle = makeStyles(() => ({
    wrapper: {
        zIndex: '5102 !important' as any, // Changing to @zindex-popover from variables.less
    },
}));

export const StyleMenu = withStyles({
    paper: {
        width: '234px',
        boxShadow: '0 15px 30px 0 rgba(63, 63, 63, 0.15)',
        borderRadius: 4,
        border: '1px solid #eeeeee',
        marginTop: 3,
        minWidth: 160,
        color: `${theme.colors.gray[900]}`,
        whiteSpace: 'nowrap',
        [`@media (max-width: ${RESPONSIVE_BREAKPOINT}px)`]: {
            width: '254px',
            left: '0 !important',
            marginTop: 0,
            minHeight: '28px',
        },

        '&:focus,&:active': {
            boxShadow: '0 15px 30px 0 rgba(63, 63, 63, 0.15) !important',
        },
    },
    list: {
        [`@media (max-width: ${RESPONSIVE_BREAKPOINT}px)`]: {
            padding: '2px 0',
        },
    },
});
