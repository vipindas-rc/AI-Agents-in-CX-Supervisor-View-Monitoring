import type { MouseEvent, KeyboardEvent } from 'react';
import { Fragment, useState, useEffect, useRef, useMemo } from 'react';

import { InlineBlock, StyledMenu, StyledMenuItem } from './Menu.styled';
import type { IMenu } from './types';
import { isActivationKey, isSpaceKey } from '../../helpers/keyboard';
import Tooltip from '../Tooltip';

const Menu = ({
    toggleComponent,
    options,
    selectedItemId = null,
    isOpen = false,
    autoFocus = true,
    disableAutoFocusItem = false,
    disableMenu = false,
    onClose,
    ...rest
}: IMenu) => {
    const toggleRef = useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [disableAutoFocus, setDisableAutoFocus] = useState(false);

    const open = Boolean(anchorEl);

    const ariaLabel = useMemo(
        () =>
            options?.find((opt) => opt.id === selectedItemId)?.title ??
            options?.[0]?.title,
        [options, selectedItemId]
    );

    useEffect(() => {
        const nextAnchorEl = isOpen ? toggleRef.current || null : null;
        setAnchorEl(nextAnchorEl);
    }, [isOpen, toggleRef]);

    const handleToggleClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!open) {
            setDisableAutoFocus(false);
            setAnchorEl(event.currentTarget);
        }
    };

    const handleToggleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (isActivationKey(event.key)) {
            event.preventDefault();
            event.stopPropagation();

            if (!open) {
                setDisableAutoFocus(isSpaceKey(event.key));
                setAnchorEl(event.currentTarget);
            }
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
        onClose?.();
    };

    return (
        <Fragment>
            <InlineBlock
                onClick={handleToggleClick}
                onKeyDown={handleToggleKeyDown}
                ref={toggleRef}
                disableMenu={disableMenu}
                role='button'
                tabIndex={disableMenu ? -1 : 0}
                aria-expanded={open}
                aria-haspopup='menu'
                aria-label={ariaLabel}
            >
                {toggleComponent}
            </InlineBlock>
            <StyledMenu
                {...{
                    autoFocus: autoFocus && !disableAutoFocus,
                    disableAutoFocusItem,
                    disableRestoreFocus: true,
                    anchorEl,
                    open,
                    onClose: handleClose,
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'right',
                    },
                    transformOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    },
                    getContentAnchorEl: null,
                    ...rest,
                }}
            >
                {options?.map(
                    ({
                        id,
                        title,
                        action,
                        style = {},
                        disabled = false,
                        toolTip = '',
                    }) => {
                        const option = (
                            <StyledMenuItem
                                style={style}
                                key={`option_${title}`}
                                disableRipple
                                selected={id === selectedItemId}
                                onClick={() => {
                                    if (action) {
                                        action();
                                        handleClose();
                                    }
                                }}
                                disabled={disabled}
                            >
                                {title}
                            </StyledMenuItem>
                        );

                        if (toolTip) {
                            return (
                                <Tooltip
                                    title={toolTip}
                                    key={`option_${title}`}
                                    placement='bottom'
                                >
                                    <div>{option}</div>
                                </Tooltip>
                            );
                        }
                        return option;
                    }
                )}
            </StyledMenu>
        </Fragment>
    );
};

export default Menu;
