import {
    Fragment,
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
} from 'react';

import { StyledBadge } from './components/NavIconBadge';
import {
    StyledNavItem,
    StyledNavItemText,
    StyledNavItemWrapper,
    IconWrapper,
} from './NavIconButton.styled';
import { TEST_AID } from '../../../../../constants';
import { KEYBOARD_KEYS } from '../../../../../constants/keyboard';
import { EMPTY_CALLBACK } from '../../../../../helpers/usage';
import Tooltip from '../../../../Tooltip';
import type { INavIconButton } from '../../types';

export const NavIconButton = ({
    onKeyDown = EMPTY_CALLBACK,
    onMouseEnter = EMPTY_CALLBACK,
    onMouseLeave = EMPTY_CALLBACK,
    onShowTooltip = EMPTY_CALLBACK,
    selected,
    expanded,
    showItemTooltip,
    viewing,
    icon,
    label,
    href,
    renderMenuItemComponent: RenderMenuItemComponent,
    onClick,
    badgeContent,
    layout,
}: INavIconButton) => {
    const textRef = useRef<HTMLSpanElement>(null);
    const navItemRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isLabelOverflow, setIsLabelOverflow] = useState(false);
    const showTooltip = useMemo(() => {
        if (!showItemTooltip) {
            return false;
        }

        if (!expanded) {
            return true;
        }

        return expanded && isLabelOverflow;
    }, [expanded, isLabelOverflow, showItemTooltip]);
    const canShowTooltip = useMemo(() => {
        if (showTooltip) {
            const eventResult = onShowTooltip();

            return typeof eventResult === 'undefined'
                ? showTooltip
                : eventResult;
        }

        return showTooltip;
    }, [showTooltip, onShowTooltip]);

    useEffect(() => {
        if (!selected && navItemRef.current && navItemRef.current.childNodes) {
            const innerElemToBlur = navItemRef.current.firstElementChild;
            if (innerElemToBlur && innerElemToBlur instanceof HTMLElement) {
                innerElemToBlur.blur();
            }
        }
    }, [selected]);

    useEffect(() => {
        if (!expanded || !textRef || !textRef.current) {
            return;
        }

        setIsLabelOverflow(
            textRef.current.scrollWidth > textRef.current.offsetWidth
        );
    }, [expanded]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown(event);

        switch (event.key) {
            case KEYBOARD_KEYS.ENTER:
            case KEYBOARD_KEYS.SPACE:
                event.preventDefault();

                if (href) {
                    window.location.href = href;
                } else if (onClick) {
                    const mouseEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                    });
                    const syntheticMouseEvent = {
                        ...mouseEvent,
                        currentTarget: navItemRef.current,
                        target: navItemRef.current,
                        preventDefault: () => mouseEvent.preventDefault(),
                        stopPropagation: () => mouseEvent.stopPropagation(),
                    } as unknown as React.MouseEvent<HTMLDivElement>;
                    onClick(syntheticMouseEvent);
                } else {
                    const linkElement = navItemRef.current?.querySelector('a');
                    if (linkElement) {
                        linkElement.click();
                    } else {
                        const syntheticEvent = {
                            currentTarget: navItemRef.current,
                            target: navItemRef.current,
                        } as unknown as React.SyntheticEvent;
                        onMouseEnter(syntheticEvent);
                    }
                }
                break;
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const renderBadge =
        badgeContent && Number.isInteger(badgeContent as number) ? (
            <StyledBadge {...{ badgeContent, verticalCenter: expanded }} />
        ) : null;

    const linkContent = (
        <Fragment>
            <IconWrapper layout={layout}>{icon}</IconWrapper>
            {expanded && (
                <StyledNavItemText
                    ref={textRef}
                    {...{ useBadge: !!renderBadge }}
                >
                    {label}
                </StyledNavItemText>
            )}
        </Fragment>
    );
    const renderLink = RenderMenuItemComponent ? (
        <RenderMenuItemComponent>{linkContent}</RenderMenuItemComponent>
    ) : (
        <a href={href} aria-label={label} tabIndex={-1}>
            {linkContent}
        </a>
    );

    const ButtonContent = (
        <StyledNavItem
            layout={layout}
            ref={navItemRef}
            data-aid={TEST_AID.NAV_MENU_ITEM}
            role='menuitem'
            tabIndex={0}
            aria-label={label}
            aria-current={selected ? 'page' : undefined}
            aria-expanded={viewing ? 'true' : 'false'}
            {...{
                selected: selected || isFocused,
                viewing,
                onMouseEnter,
                onMouseLeave,
                onClick,
                onKeyDown: handleKeyDown,
                onFocus: handleFocus,
                onBlur: handleBlur,
            }}
        >
            {renderLink}
            {renderBadge}
        </StyledNavItem>
    );

    return (
        <StyledNavItemWrapper layout={layout}>
            {canShowTooltip ? (
                <Tooltip
                    {...{
                        title: label,
                        placement: layout === 'horizontal' ? 'bottom' : 'right',
                        PopperProps: {
                            modifiers: {
                                offset: {
                                    offset: '0, 4px',
                                },
                            },
                        },
                    }}
                >
                    {ButtonContent}
                </Tooltip>
            ) : (
                ButtonContent
            )}
        </StyledNavItemWrapper>
    );
};
