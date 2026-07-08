import type { FC, MouseEvent, PropsWithChildren } from 'react';
import { Fragment, useCallback, useMemo, useState } from 'react';

import {
    PopoverContent,
    StyledMuiPopover,
    StyledMuiPopoverHover,
} from './Popover.styled';
import type {
    AnchorElType,
    HandleCloseReason,
    IPopover,
} from './types/Popover';
import { InlineBlock } from '../Menu/Menu.styled';

const Popover: FC<PropsWithChildren<IPopover>> = ({
    toggleComponent,
    openOnHover = false,
    children,
    anchorOrigin = {
        vertical: 'bottom',
        horizontal: 'right',
    },
    transformOrigin = {
        vertical: 'top',
        horizontal: 'right',
    },
    onOpen,
    onClose,
    ...restProps
}) => {
    const [anchorEl, setAnchorEl] = useState<AnchorElType>(null);
    const open = Boolean(anchorEl);

    const handleShow = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            setAnchorEl(event.currentTarget);
            if (typeof onOpen === 'function') {
                onOpen(event);
            }
        },
        [onOpen]
    );

    const handleClose = useCallback(
        (event: MouseEvent<HTMLDivElement>, reason?: HandleCloseReason) => {
            setAnchorEl(null);
            if (typeof onClose === 'function') {
                onClose(event, reason);
            }
        },
        [onClose]
    );

    // determine if we need to use hover listeners, or click
    const popoverToggle = useMemo(() => {
        if (openOnHover) {
            return (
                <InlineBlock
                    onMouseEnter={handleShow}
                    onMouseLeave={handleClose}
                >
                    {toggleComponent}
                </InlineBlock>
            );
        } else {
            return (
                <InlineBlock onClick={handleShow}>
                    {toggleComponent}
                </InlineBlock>
            );
        }
    }, [handleClose, handleShow, openOnHover, toggleComponent]);

    // determine if we need to use a hover specific base class
    const StyledPopover = useMemo(
        () => (openOnHover ? StyledMuiPopoverHover : StyledMuiPopover),
        [openOnHover]
    );

    return (
        <Fragment>
            {popoverToggle}
            <StyledPopover
                {...{
                    anchorOrigin,
                    transformOrigin,
                    anchorEl,
                    open,
                    onClose: handleClose,
                    ...restProps,
                }}
            >
                <PopoverContent>{children}</PopoverContent>
            </StyledPopover>
        </Fragment>
    );
};

export default Popover;
