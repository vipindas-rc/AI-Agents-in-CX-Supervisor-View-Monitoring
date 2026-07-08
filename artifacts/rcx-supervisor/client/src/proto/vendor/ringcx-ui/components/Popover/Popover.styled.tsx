import type { ComponentType } from 'react';

import MuiPopover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components';

export const PopoverContent = styled.div`
    & > *:not(:last-child) {
        margin-bottom: 14px;
    }
`;

const StyledPopoverWrapper = styled(MuiPopover)`
    pointer-events: none;
`;

const sidePadding = 16;
const popoverStyles = {
    paper: {
        boxShadow: '0px 2px 12px 0px rgba(173, 173, 173, 0.5)',
        marginTop: '14px',
        padding: `18px ${sidePadding}px`,
        margin: '0',
        cursor: 'default',
        maxWidth: `${480 - sidePadding * 2}px`,
        fontSize: '14px',
        fontWeight: 500,
        letterSpacing: '0.18px',
        lineHeight: '16px',
    },
};

export const StyledMuiPopover = withStyles(popoverStyles)(MuiPopover);
// TODO: deal with any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StyledMuiPopoverHover: ComponentType<any> =
    withStyles(popoverStyles)(StyledPopoverWrapper);
