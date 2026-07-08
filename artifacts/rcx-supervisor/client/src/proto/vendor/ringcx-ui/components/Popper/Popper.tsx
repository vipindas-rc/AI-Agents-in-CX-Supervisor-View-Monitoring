import type { FC, MouseEvent, KeyboardEvent, PropsWithChildren } from 'react';
import { useRef, useState, useEffect, useCallback, Fragment } from 'react';

import useOnClickOutside from 'use-onclickoutside';

import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { MenuContainer, StyledPopper, ToggleWrapper } from './Popper.styled';
import type { IPopper } from './types/Popper';
import { isActivationKey } from '../../helpers/keyboard';

/*
    If you need close popper after click in some element
    inside you need add data-close attribute to element
    see storybook
*/

const OPEN_DEBOUNCE = 200;
const CLOSE_DEBOUNCE = 150;

const globalIframeStyle = document.createElement('style');
globalIframeStyle.innerHTML = 'iframe { pointer-events: none; }';

const Popper: FC<PropsWithChildren<IPopper>> = ({
    isOpen: isOpenProp,
    onOpen,
    onClose,
    children,
    toggleComponent,
    showOnHover = false,
    hideOnBlur = false,
    disabled = false,
    enableKeyboardNavigation = false,
    ...restProps
}) => {
    const timer = useRef<number | undefined>();
    const toggleRef = useRef(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isOpen = Boolean(anchorEl);

    const openPopperAction = useCallback(() => {
        if (onOpen) {
            onOpen();
        }

        setAnchorEl(toggleRef.current);
    }, [onOpen]);

    const closePopperAction = useCallback(() => {
        if (onClose) {
            onClose();
        }

        setAnchorEl(null);
    }, [onClose]);

    const openPopover = useCallback(
        (force = true) => {
            if (!disabled && toggleRef && !isOpen) {
                if (force) {
                    openPopperAction();
                } else {
                    timer.current = window.setTimeout(
                        openPopperAction,
                        OPEN_DEBOUNCE
                    );
                }
                document.head.append(globalIframeStyle);
            }
        },
        [disabled, isOpen, openPopperAction]
    );

    const closePopover = useCallback(
        (force = true) => {
            if (!disabled && isOpen) {
                if (force) {
                    closePopperAction();
                } else {
                    timer.current = window.setTimeout(
                        closePopperAction,
                        CLOSE_DEBOUNCE
                    );
                }
                globalIframeStyle.remove();
            }
        },
        [disabled, isOpen, closePopperAction]
    );

    const closePopperClickOutside = (event: MouseEvent | TouchEvent) => {
        if (!disabled && menuRef && menuRef.current && isOpen && event.target) {
            if (!menuRef.current.contains(event.target as Node)) {
                closePopover();
            }
        }
    };

    const handleClick = () => (isOpen ? closePopover() : openPopover());

    const handleToggleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (isActivationKey(event.key)) {
            event.preventDefault();
            handleClick();
        }
    };

    const handlePopperClick = (event: MouseEvent<HTMLElement>) => {
        const { target } = event;

        if (
            target instanceof HTMLElement &&
            (target.hasAttribute('data-close') ||
                target.closest('[data-close]'))
        ) {
            closePopover();
        }
    };

    const handleMouseEnter = () => {
        if (showOnHover) {
            window.clearTimeout(timer.current);

            openPopover(false);
        }
    };

    const handleMouseLeave = () => {
        if (hideOnBlur) {
            window.clearTimeout(timer.current);

            closePopover(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    useOnClickOutside(toggleRef, closePopperClickOutside);

    const { handleKeyDown } = useKeyboardNavigation({
        menuRef,
        toggleRef,
        isOpen,
        closePopover,
        enabled: enableKeyboardNavigation,
    });

    useEffect(() => {
        if (isOpenProp) {
            openPopover();
        } else if (isOpenProp === false) {
            closePopover();
        }
    }, [isOpenProp, openPopover, closePopover, toggleRef]);

    return (
        <Fragment>
            <ToggleWrapper
                {...{
                    ref: toggleRef,
                    onClick: handleClick,
                    onKeyDown: handleToggleKeyDown,
                    onMouseEnter: handleMouseEnter,
                    onMouseLeave: handleMouseLeave,
                    disabled,
                    'data-aid': 'popper-toggle',
                }}
            >
                {toggleComponent}
            </ToggleWrapper>
            <StyledPopper
                {...{
                    anchorEl,
                    open: isOpen,
                    placement: 'bottom-end',
                    modifiers: {
                        flip: {
                            enabled: true,
                        },
                        preventOverflow: {
                            enabled: true,
                            boundariesElement: 'window',
                        },
                    },
                    onClick: handlePopperClick,
                    onMouseEnter: handleMouseEnter,
                    onMouseLeave: handleMouseLeave,
                    ...restProps,
                }}
            >
                <MenuContainer
                    ref={menuRef}
                    onKeyDown={
                        enableKeyboardNavigation ? handleKeyDown : undefined
                    }
                    role={enableKeyboardNavigation ? 'menu' : undefined}
                    tabIndex={enableKeyboardNavigation ? -1 : undefined}
                >
                    {children}
                </MenuContainer>
            </StyledPopper>
        </Fragment>
    );
};

export default Popper;
