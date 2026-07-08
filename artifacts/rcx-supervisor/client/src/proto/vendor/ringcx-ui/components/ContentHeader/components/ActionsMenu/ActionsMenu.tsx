import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    ActionsMenuStyled,
    StyledMenuItem,
    StyledPopper,
} from './ActionsMenu.styled';
import type { ActionMenuType, ActionType } from './types';
import { TEST_AID } from '../../../../constants';
import Tooltip from '../../../Tooltip';
import { ActionsToggle } from '../ActionsToggle';

const ActionsMenu: FC<ActionMenuType> = ({
    actions,
    disabled,
    accessibilityLabels,
}) => {
    const firstItemRef = useRef<HTMLLIElement>(null);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.click();
        }
    }, []);

    const renderMenuItems = useMemo(() => {
        return actions.map(
            (
                {
                    action,
                    label,
                    disabled,
                    color,
                    tooltipMessage,
                    placement = 'bottom',
                }: ActionType,
                index
            ) => {
                const item = (
                    <StyledMenuItem
                        {...{
                            'data-close': true,
                            disabled,
                            ...(action && {
                                onClick: action,
                                onKeyDown: handleKeyDown,
                            }),
                            'data-aid': `${TEST_AID.ACTION_MENU.ACTION_MENU_ITEM}-${index}`,
                            color: color,
                            tabIndex: 0,
                            ref: index ? null : firstItemRef,
                        }}
                        key={label}
                    >
                        {label}
                    </StyledMenuItem>
                );

                if (tooltipMessage) {
                    return (
                        <Tooltip
                            title={tooltipMessage}
                            key={label}
                            placement={placement}
                        >
                            <div>{item}</div>
                        </Tooltip>
                    );
                }

                return item;
            }
        );
    }, [actions]);

    const [isActionsMenuVisible, setIsActionsMenuVisible] = useState(false);

    const toggle = useMemo(
        () => (
            <ActionsToggle
                disabled={disabled}
                title={
                    isActionsMenuVisible
                        ? accessibilityLabels?.close
                        : accessibilityLabels?.open
                }
            />
        ),
        [disabled, isActionsMenuVisible, accessibilityLabels]
    );

    useEffect(() => {
        if (isActionsMenuVisible) {
            const animationId = requestAnimationFrame(() => {
                firstItemRef?.current?.focus();
            });

            return () => cancelAnimationFrame(animationId);
        }
    }, [isActionsMenuVisible]);

    return (
        <ActionsMenuStyled>
            <StyledPopper
                role='menu'
                disabled={disabled}
                toggleComponent={toggle}
                onOpen={() => setIsActionsMenuVisible(true)}
                onClose={() => setIsActionsMenuVisible(false)}
            >
                {renderMenuItems}
            </StyledPopper>
        </ActionsMenuStyled>
    );
};

export default ActionsMenu;
