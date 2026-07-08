import { useMemo, useState, type KeyboardEvent } from 'react';

import {
    ExpandableHeader,
    ExpandableSection,
    StyledArrowDropDown,
    StyledExpandableNavItem,
    StyledArrowRightRounded,
} from './ExpandableNavItem.styled';
import type { IExpandableNavItem } from './types';
import { KEYBOARD_KEYS } from '../../../../../../../constants/keyboard';
import { TextEclipse } from '../../../../../../TextEclipse';
import type { INavOption } from '../../../../types';
import { getItems } from '../../SubMenuItem';

export const ExpandableNavItem = ({
    menuItem,
    currentRoute,
    isMoreMenu = false,
    popperProps,
}: IExpandableNavItem) => {
    const determineExpanded = useMemo(
        () =>
            menuItem.children.reduce((active: boolean, child: INavOption) => {
                const route = child.route || '';
                return (
                    active || (route.length > 0 && currentRoute.includes(route))
                );
            }, false),
        [menuItem, currentRoute]
    );

    const [expanded, setExpanded] = useState(determineExpanded);

    const handleToggle = () => {
        menuItem.onClick?.();
        setExpanded(!expanded);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (
            event.key === KEYBOARD_KEYS.ENTER ||
            event.key === KEYBOARD_KEYS.SPACE
        ) {
            event.preventDefault();
            handleToggle();
        }
    };

    return (
        <StyledExpandableNavItem>
            <ExpandableHeader
                {...{
                    expanded,
                    onClick: handleToggle,
                    onKeyDown: handleKeyDown,
                    isMoreMenu,
                }}
                role='button'
                tabIndex={0}
                aria-expanded={expanded}
                aria-label={menuItem.label}
            >
                {expanded ? (
                    <StyledArrowDropDown />
                ) : (
                    <StyledArrowRightRounded />
                )}
                <TextEclipse
                    tooltipMsg={menuItem.label}
                    popperProps={popperProps}
                    placement={'right'}
                >
                    {menuItem.label}
                </TextEclipse>
            </ExpandableHeader>
            <ExpandableSection {...{ expanded, isMoreMenu }}>
                {getItems(menuItem.children, currentRoute, false, popperProps)}
            </ExpandableSection>
        </StyledExpandableNavItem>
    );
};
