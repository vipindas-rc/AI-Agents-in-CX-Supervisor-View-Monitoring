import type { MouseEventHandler } from 'react';

import type { PopperProps } from '@material-ui/core/Popper';

import { ExpandableNavItem } from './components/ExpandableNavItem';
import { GroupNavItem } from './components/GroupNavItem';
import { MenuItem } from './components/MenuItem';
import { isMenuItem, isSubGroup, isSubMenu } from './SubMenu.helpers';
import { StyledIconRight } from './SubMenuItem.styled';
import { TEST_AID } from '../../../../../constants/index';
import { TextEclipse } from '../../../../TextEclipse';
import type { INavChild, INavOption, ISideNav } from '../../types';
export const getItems = (
    children: INavChild[],
    currentRoute: string,
    isMoreMenu = false,
    popperProps: Partial<PopperProps>,
    layout?: ISideNav['layout']
) =>
    children.map((child, index) => (
        <Item
            key={index}
            section={child}
            onClick={child.onClick}
            index={index}
            currentRoute={currentRoute}
            isMoreMenu={isMoreMenu}
            popperProps={popperProps}
            layout={layout}
        />
    ));

export const Item = (props: {
    section: INavChild;
    index: number;
    currentRoute: string;
    isMoreMenu: boolean;
    expandCallback?: () => void;
    popperProps: Partial<PopperProps>;
    layout?: ISideNav['layout'];
    onClick?: MouseEventHandler<HTMLDivElement>;
}) => {
    const {
        section,
        index,
        currentRoute,
        isMoreMenu = false,
        popperProps,
        layout,
    } = props;

    const {
        disabled,
        route,
        label,
        iconRight,
        renderMenuItemComponent: RenderMenuItemComponent,
    } = section as INavOption;

    if (!disabled && isSubGroup(section)) {
        return (
            <GroupNavItem
                {...{
                    currentRoute,
                    key: index,
                    menuItem: section,
                    popperProps,
                }}
            />
        );
    }

    if (!disabled && isSubMenu(section)) {
        return (
            <ExpandableNavItem
                {...{
                    currentRoute,
                    key: index,
                    menuItem: section,
                    isMoreMenu,
                    popperProps,
                }}
            />
        );
    }

    if (!disabled && isMenuItem(section)) {
        const itemContent = (
            <div>
                <TextEclipse
                    tooltipMsg={label}
                    placement={'right'}
                    popperProps={popperProps}
                >
                    {label}
                </TextEclipse>
                {iconRight && <StyledIconRight>{iconRight}</StyledIconRight>}
            </div>
        );

        return (
            <MenuItem
                {...{
                    selected: (route && currentRoute === route) || false,
                    key: index,
                    href: route,
                    layout: layout,
                    'data-aid': `${TEST_AID.MENU_LINK_DTID}${label}`,
                    onClick: props.onClick,
                }}
            >
                {RenderMenuItemComponent ? (
                    <RenderMenuItemComponent>
                        {itemContent}
                    </RenderMenuItemComponent>
                ) : (
                    itemContent
                )}
            </MenuItem>
        );
    }

    return null;
};
